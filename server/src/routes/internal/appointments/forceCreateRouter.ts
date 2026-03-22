/**
 * Phase 6.8 — Admin force-create appointment endpoint.
 * Creates an appointment on a chosen slot and records overridden constraint violations
 * in constraint_overrides. Admin-only; requires auth + requireRole('admin').
 */

import { Request, Response, Router } from 'express'
import type { InferCreationAttributes } from 'sequelize'
import type { MakeNullishOptional } from 'sequelize/types/utils.js'
import type { Appointment as AppointmentModel } from '../../../db/models/booking/appointment.js'
import { Appointment, ConstraintOverride } from '../../../config/app.js'
import { requireAuth, requireRole, csrfProtection } from '../../../middlewares/security.js'
import { getForceCreateSlotContext } from '../../../services/computedAvailabilityService.js'
import { computeViolationsForSlot } from '../../../services/slotComputationService.js'
import {
  appointmentIncludes,
  createAttendeeRecords,
  createFeeRecordsForAppointment,
  shouldCreateCalendarEvent,
  getCalendarIdForAppointment,
  getAutoConfirmEnabledFromSettings,
  validateAppointmentLineSnapshots,
} from './appointmentHelpers.js'
import { stripSelectionFieldsFromPlainObject } from '../../../repositories/appointmentSelectionCodec.js'
import {
  stripPropertyDetailsFromPlainObject,
  syncPropertyDetailsFromWizardBlob,
} from '../../../repositories/appointmentPropertyDetailsSync.js'
import { stripSelectedTimeSlotsFromPlainObject } from '../../../repositories/appointmentTimeSlotCodec.js'
import { replaceTimeSlotsFromBody } from '../../../repositories/appointmentTimeSlotRepository.js'
import { applyOverrideConstraintsFromBodyToPayload } from '../../../repositories/appointmentOverrideConstraintsCodec.js'
import { syncSelectionsAndSnapshotsFromBody } from '../../../repositories/appointmentSelectionRepository.js'
import type { AttendeeRequest } from '@shared/types/appointmentTypes'
import type { AppointmentFeeBreakdownPayload } from '../../../../../shared/types/appointmentFeeTypes.js'
import { createInvitesForAppointment } from '../../../services/invites/inviteOrchestrationService.js'
import { onStatusChange } from '../../../services/notificationService.js'
import { handleRouteError } from '../../helpers/routerErrorHandler.js'
import { HTTP_STATUS_CODES } from '../../../constants/router.js'
import { createLogger } from '../../../utils/logger.js'
import type { AppointmentStatus } from './appointmentConstants.js'
import { ERROR_MESSAGES } from './appointmentConstants.js'

const logger = createLogger('ForceCreateRouter')

const REASON_MAX_LENGTH = 500

/** Request body: slot + optional reason + same fields as POST /appointments. */
interface ForceCreateBody {
  slotStart: string
  slotEnd: string
  reason?: string | null
  attendees?: AttendeeRequest[]
  feeBreakdown?: AppointmentFeeBreakdownPayload | null
  [key: string]: unknown
}

/** Validation result. */
type ValidateResult =
  | { valid: true; slotStart: Date; slotEnd: Date; durationMinutes: number; reason: string | null; appointmentBody: ForceCreateBody }
  | { valid: false; status: number; message: string }

function validateForceCreateBody(body: unknown): ValidateResult {
  if (body == null || typeof body !== 'object') {
    return { valid: false, status: 400, message: 'Request body must be an object' }
  }
  const b = body as Record<string, unknown>
  const slotStartRaw = b.slotStart
  const slotEndRaw = b.slotEnd
  if (typeof slotStartRaw !== 'string' || typeof slotEndRaw !== 'string') {
    return { valid: false, status: 400, message: 'slotStart and slotEnd are required (ISO date-time strings)' }
  }
  const slotStart = new Date(slotStartRaw)
  const slotEnd = new Date(slotEndRaw)
  if (Number.isNaN(slotStart.getTime()) || Number.isNaN(slotEnd.getTime())) {
    return { valid: false, status: 400, message: 'slotStart and slotEnd must be valid ISO date-time strings' }
  }
  if (slotEnd.getTime() <= slotStart.getTime()) {
    return { valid: false, status: 400, message: 'slotEnd must be after slotStart' }
  }
  const durationMs = slotEnd.getTime() - slotStart.getTime()
  const durationMinutes = Math.round(durationMs / 60_000)
  if (durationMinutes < 1) {
    return { valid: false, status: 400, message: 'Slot duration must be at least 1 minute' }
  }
  let reason: string | null = null
  if (b.reason !== undefined && b.reason !== null) {
    if (typeof b.reason !== 'string') {
      return { valid: false, status: 400, message: 'reason must be a string' }
    }
    if (b.reason.length > REASON_MAX_LENGTH) {
      return { valid: false, status: 400, message: `reason must be at most ${REASON_MAX_LENGTH} characters` }
    }
    reason = b.reason
  }
  const { slotStart: _s, slotEnd: _e, reason: _r, overrideConstraints: _o, ...rest } = b
  const appointmentBody: ForceCreateBody = {
    ...rest,
    slotStart: slotStartRaw,
    slotEnd: slotEndRaw,
    reason: reason ?? undefined,
  }
  return {
    valid: true,
    slotStart,
    slotEnd,
    durationMinutes,
    reason,
    appointmentBody,
  }
}

/** Build appointment create payload from validated body and slot; set scheduledById from req.user. */
function buildAppointmentPayload(
  appointmentBody: ForceCreateBody,
  slotStart: Date,
  slotEnd: Date,
  durationMinutes: number,
  scheduledById: string | null
): Record<string, unknown> {
  const {
    slotStart: _s,
    slotEnd: _e,
    reason: _r,
    overrideConstraints: _o,
    attendees: _a,
    feeBreakdown: _f,
    holdDurationMinutes: _h,
    ...fields
  } = appointmentBody
  const selectedDate = slotStart.toISOString().slice(0, 10)
  const selectedTimeSlots = [
    {
      startTime: slotStart.toISOString(),
      endTime: slotEnd.toISOString(),
      duration: durationMinutes,
    },
  ]
  const payload: Record<string, unknown> = {
    ...fields,
    selectedDate,
    selectedTimeSlots,
    scheduledById,
  }
  const status = payload.status as AppointmentStatus | undefined
  if (status === 'submitted') {
    payload.submittedAt = new Date()
  }
  if (status === 'confirmed') {
    payload.confirmedAt = new Date()
    payload.confirmedBy = null
  }
  if (status !== undefined && status !== 'held') {
    payload.heldBy = null
    payload.heldUntil = null
  }
  return payload
}

/** POST /force-create — admin-only; creates appointment + constraint override in one transaction, then runs after-create steps. */
async function forceCreateHandler(req: Request, res: Response): Promise<void> {
  const authReq = req as Request & { user?: { id: string } }
  const userId = authReq.user?.id ?? null

  const validation = validateForceCreateBody(req.body)
  if (!validation.valid) {
    // @audit-allow:hardcoding:fieldMapping - Standard Express error response shape; 'error' key is conventional (RFC 7807-style)
    res.status(validation.status).json({ error: validation.message })
    return
  }

  const { slotStart, slotEnd, durationMinutes, reason, appointmentBody } = validation

  try {
    const context = await getForceCreateSlotContext(
      slotStart,
      slotEnd,
      durationMinutes
    )
    const now = new Date()
    const report = computeViolationsForSlot(
      slotStart,
      slotEnd,
      durationMinutes,
      context.rangeConstraints,
      context.overlapConstraints,
      context.capacityConstraints,
      context.eventsWithDrive,
      now
    )

    const appointmentPayload = buildAppointmentPayload(
      appointmentBody,
      slotStart,
      slotEnd,
      durationMinutes,
      userId
    )
    applyOverrideConstraintsFromBodyToPayload(appointmentPayload)
    stripSelectionFieldsFromPlainObject(appointmentPayload)
    const slotsForPersist = appointmentPayload.selectedTimeSlots
    const propertyDetailsForPersist = appointmentPayload.propertyDetails
    stripSelectedTimeSlotsFromPlainObject(appointmentPayload)
    stripPropertyDetailsFromPlainObject(appointmentPayload)

    const sequelize = Appointment.sequelize
    if (!sequelize) {
      res.status(500).json({ error: ERROR_MESSAGES.CREATE_APPOINTMENT })
      return
    }

    const [appointment] = await sequelize.transaction(async (transaction) => {
      type CreationAttrs = MakeNullishOptional<InferCreationAttributes<AppointmentModel>>
      const created = await Appointment.create(
        appointmentPayload as CreationAttrs,
        { transaction }
      )
      await ConstraintOverride.create(
        {
          appointmentId: created.id,
          overriddenViolations: report.violations,
          authorizedById: userId,
          reason,
          slotStart,
          slotEnd,
        },
        { transaction }
      )
      await replaceTimeSlotsFromBody(created.id, slotsForPersist, transaction)
      await syncPropertyDetailsFromWizardBlob(created.propertyVersionId, propertyDetailsForPersist, transaction)
      return [created]
    })

    const record = appointment!

    await syncSelectionsAndSnapshotsFromBody(record.id, appointmentBody as Record<string, unknown>)
    await validateAppointmentLineSnapshots(record.id)

    const rawAttendees = appointmentBody.attendees
    const attendeesData = Array.isArray(rawAttendees) ? rawAttendees : []
    await createAttendeeRecords(record.id, attendeesData as AttendeeRequest[])
    await createFeeRecordsForAppointment(record.id, appointmentBody.feeBreakdown ?? null)

    if (record.status === 'submitted') {
      const autoConfirmEnabled = await getAutoConfirmEnabledFromSettings()
      if (autoConfirmEnabled) {
        await record.update({
          status: 'confirmed',
          confirmedAt: new Date(),
          confirmedBy: null,
        })
        logger.info(`Auto-confirmed appointment ${record.id} (submitted → confirmed)`)
        onStatusChange({
          appointmentId: record.id,
          oldStatus: 'submitted',
          newStatus: 'confirmed',
        }).catch((err) => {
          logger.error('Notification hook failed on auto-confirm (non-blocking)', {
            error: err,
            appointmentId: record.id,
          })
        })
      }
    }

    if (shouldCreateCalendarEvent(record.status)) {
      try {
        const calendarId = await getCalendarIdForAppointment()
        await createInvitesForAppointment(record.id, calendarId)
      } catch (calendarError) {
        logger.error('Calendar invite creation error:', calendarError)
      }
    }

    const appointmentWithRelations = await Appointment.findByPk(record.id, {
      include: appointmentIncludes,
    })
    res.status(HTTP_STATUS_CODES.CREATED).json(appointmentWithRelations)
  } catch (error) {
    handleRouteError(
      error,
      res,
      ERROR_MESSAGES.CREATE_APPOINTMENT,
      'force-creating appointment'
    )
  }
}

const router = Router()
router.post('/', csrfProtection, requireAuth, requireRole('admin'), forceCreateHandler)

export { router as forceCreateRouter }
