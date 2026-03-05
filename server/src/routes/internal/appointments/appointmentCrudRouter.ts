import { Request, Response } from 'express'
import { Appointment, AppointmentAttendee } from '../../../config/app.js'
import { checkOwnership } from '../../../middlewares/security.js'
import { createCrudRouter } from '../../helpers/createCrudRouter.js'
import { loadAllAppointmentVersions } from '../../../services/appointmentSnapshotLoader.js'
import { createInvitesForAppointment } from '../../../services/invites/inviteOrchestrationService.js'
import {
  ERROR_MESSAGES,
  ALLOWED_OVERRIDE_CONSTRAINTS,
  isValidTransition,
  type AppointmentStatus,
} from './appointmentConstants.js'
import { handleRouteError } from '../../helpers/routerErrorHandler.js'
import type { AppointmentFeeBreakdownPayload } from '../../../../../shared/types/appointmentFeeTypes.js'
import {
  appointmentIncludes,
  createSnapshotsForAppointment,
  validateSnapshotIds,
  createAttendeeRecords,
  createFeeRecordsForAppointment,
  shouldCreateCalendarEvent,
  getCalendarIdForAppointment,
  getHoldDurationFromSettings,
  getAutoConfirmEnabledFromSettings,
  type HoldDurationBounds,
  type AttendeeRequest,
} from './appointmentHelpers.js'
import { sendSuccess, sendNotFound } from '../../helpers/routerResponseHelpers.js'
import { paramString } from '../../helpers/requestHelpers.js'
import { HTTP_STATUS_CODES } from '../../../constants/router.js'
import { INVITATION_STATUS_SENT } from '@shared/constants/inviteStatusConstants.js'
import { onStatusChange } from '../../../services/notificationService.js'
import { createLogger } from '../../../utils/logger.js'

const logger = createLogger('AppointmentRouter')

const router = createCrudRouter({
  model: Appointment,
  resourceName: 'appointment',
  errorMessages: {
    FETCH_ALL: ERROR_MESSAGES.FETCH_APPOINTMENTS,
    FETCH_ONE: ERROR_MESSAGES.FETCH_APPOINTMENT,
    NOT_FOUND: ERROR_MESSAGES.APPOINTMENT_NOT_FOUND,
    CREATE: ERROR_MESSAGES.CREATE_APPOINTMENT,
    UPDATE: ERROR_MESSAGES.UPDATE_APPOINTMENT,
    PATCH: ERROR_MESSAGES.PATCH_APPOINTMENT,
    DELETE: ERROR_MESSAGES.DELETE_APPOINTMENT,
  },
  defaultIncludes: appointmentIncludes,
  /** IDOR: GET by id runs same ownership check as mutations (policy: user can only read own org's appointments when auth is implemented). */
  getByIdMiddleware: [checkOwnership('appointment', 'id')],
  customGetAllHandler: async (req: Request, res: Response): Promise<void> => {
    try {
      const appointments = await Appointment.findAll({
        include: appointmentIncludes,
      })
      sendSuccess(res, appointments)
    } catch (error) {
      handleRouteError(error, res, ERROR_MESSAGES.FETCH_APPOINTMENTS, 'fetching appointments')
    }
  },
  customGetByIdHandler: async (req: Request, res: Response): Promise<void> => {
    try {
      const id = paramString(req, 'id')
      const appointment = await Appointment.findByPk(id, {
        include: appointmentIncludes,
      })
      
      if (!appointment) {
        sendNotFound(res, ERROR_MESSAGES.APPOINTMENT_NOT_FOUND, id)
        return
      }
      
      sendSuccess(res, appointment)
    } catch (error) {
      handleRouteError(error, res, ERROR_MESSAGES.FETCH_APPOINTMENT, 'fetching appointment')
    }
  },
  /** Set scheduledById from authenticated user on create; client cannot override (Phase 6.7 / Feature 7). */
  beforeCreate: async (req: Request, _res: Response): Promise<void> => {
    const authReq = req as Request & { user?: { id: string } }
    const userId = authReq.user?.id ?? null
    if (req.body && typeof req.body === 'object') {
      (req.body as Record<string, unknown>).scheduledById = userId
    }
  },
  beforeUpdate: async (req, res): Promise<void> => {
    const body = req.body as {
      status?: string
      _holdDurationDefaultFromSettings?: number
      _holdDurationBoundsFromSettings?: HoldDurationBounds
      _currentStatus?: AppointmentStatus
    }

    if (body?.status !== undefined) {
      const id = paramString(req, 'id')
      const existing = await Appointment.findByPk(id, { attributes: ['status'] })
      if (existing) {
        body._currentStatus = existing.status

        const newStatus = body.status as AppointmentStatus
        if (!isValidTransition(existing.status, newStatus)) {
          res.status(400).json({
            error: ERROR_MESSAGES.INVALID_STATUS_TRANSITION,
            details: `Cannot transition from '${existing.status}' to '${newStatus}'`,
          })
          return
        }
      }
    }

    if (body?.status === 'held') {
      const { bounds, defaultMinutes } = await getHoldDurationFromSettings()
      body._holdDurationDefaultFromSettings = defaultMinutes
      body._holdDurationBoundsFromSettings = bounds
    }
  },
  sanitizeInput: (data: unknown, method?: 'create' | 'update' | 'patch'): unknown => {
    const appointmentData = data as {
      attendees?: AttendeeRequest[]
      feeBreakdown?: unknown
      holdDurationMinutes?: unknown
      overrideConstraints?: unknown
      _holdDurationDefaultFromSettings?: number
      _holdDurationBoundsFromSettings?: HoldDurationBounds
      _currentStatus?: AppointmentStatus
      status?: string
      scheduledById?: string | null
      [key: string]: unknown
    }
    const {
      attendees: _,
      feeBreakdown: __,
      holdDurationMinutes: rawDuration,
      overrideConstraints: rawOverrides,
      _holdDurationDefaultFromSettings: defaultFromSettings,
      _holdDurationBoundsFromSettings: boundsFromSettings,
      _currentStatus: _currentStatusStripped,
      scheduledById: _scheduledByIdStripped,
      ...appointmentFields
    } = appointmentData
    if (method === 'update' || method === 'patch') {
      delete (appointmentFields as Record<string, unknown>).scheduledById
    }

    const newStatus = appointmentFields.status as AppointmentStatus | undefined

    if (newStatus === 'submitted') {
      appointmentFields.submittedAt = new Date()
    }

    if (newStatus === 'confirmed') {
      appointmentFields.confirmedAt = new Date()
      appointmentFields.confirmedBy = null
    }

    if (appointmentFields.status === 'held') {
      const bounds = boundsFromSettings ?? { min: 1, max: 60, fallback: 15 }
      const parsed = Number(rawDuration)
      const fromRequest = (!Number.isNaN(parsed) && parsed >= bounds.min && parsed <= bounds.max)
        ? Math.floor(parsed)
        : undefined
      const durationMinutes = fromRequest ?? (typeof defaultFromSettings === 'number' ? defaultFromSettings : bounds.fallback)

      appointmentFields.heldUntil = new Date(Date.now() + durationMinutes * 60_000)
      appointmentFields.heldBy = null
    }

    if (appointmentFields.status !== undefined && appointmentFields.status !== 'held') {
      appointmentFields.heldBy = null
      appointmentFields.heldUntil = null
    }

    // ENACTMENT(Feature 7): requireRole('admin') will gate this — only admins can set overrides
    if (rawOverrides !== undefined) {
      if (rawOverrides === null || (typeof rawOverrides === 'object' && Object.keys(rawOverrides as object).length === 0)) {
        appointmentFields.overrideConstraints = null
      } else if (typeof rawOverrides === 'object' && rawOverrides !== null) {
        const allowedSet = new Set<string>(ALLOWED_OVERRIDE_CONSTRAINTS)
        const validated = Object.entries(rawOverrides as Record<string, unknown>)
          .filter(([key]) => allowedSet.has(key))
          .reduce<Record<string, boolean>>((acc, [key, value]) => {
            acc[key] = Boolean(value)
            return acc
          }, {})

        appointmentFields.overrideConstraints = Object.keys(validated).length > 0 ? validated : null
      }
    }

    return appointmentFields
  },
  afterCreate: async (record, req, res) => {
    // WHY: Keeps factory pattern clean while allowing domain-specific behavior
    // PATTERN: Hook runs after record creation, handles side effects

    const appointmentData = req.body as {
      attendees?: AttendeeRequest[]
      feeBreakdown?: AppointmentFeeBreakdownPayload | null
      selectedServiceIds?: string[]
      selectedPropertyIds?: string[]
      selectedOptionIds?: string[]
    }
    const attendeesData = (() => {
      const raw = appointmentData.attendees
      if (raw === undefined || raw === null) {
        logger.debug('afterCreate: attendees missing, using []')
        return [] as AttendeeRequest[]
      }
      return raw
    })()
    const idsOrEmpty = (key: 'selectedServiceIds' | 'selectedPropertyIds' | 'selectedOptionIds'): string[] => {
      const raw = appointmentData[key]
      if (raw === undefined || raw === null) {
        logger.debug(`afterCreate: ${key} missing, using []`)
        return []
      }
      return raw
    }

    const serviceSnapshotIds = await createSnapshotsForAppointment(idsOrEmpty('selectedServiceIds'))
    const propertySnapshotIds = await createSnapshotsForAppointment(idsOrEmpty('selectedPropertyIds'))
    const optionSnapshotIds = await createSnapshotsForAppointment(idsOrEmpty('selectedOptionIds'))
    
    // Validate snapshot IDs (redundant but defensive)
    await validateSnapshotIds(serviceSnapshotIds)
    await validateSnapshotIds(propertySnapshotIds)
    await validateSnapshotIds(optionSnapshotIds)
    
    await record.update({
      serviceSnapshotIds: serviceSnapshotIds.length > 0 ? serviceSnapshotIds : null,
      propertySnapshotIds: propertySnapshotIds.length > 0 ? propertySnapshotIds : null,
      optionSnapshotIds: optionSnapshotIds.length > 0 ? optionSnapshotIds : null,
    })
    
    await createAttendeeRecords(record.id, attendeesData)

    await createFeeRecordsForAppointment(record.id, appointmentData.feeBreakdown ?? null)

    if (record.status === 'submitted') {
      const autoConfirmEnabled = await getAutoConfirmEnabledFromSettings()
      if (autoConfirmEnabled) {
        await record.update({
          status: 'confirmed',
          confirmedAt: new Date(),
          confirmedBy: null,
        })
        logger.info(`Auto-confirmed appointment ${record.id} (submitted → confirmed)`)
        onStatusChange({ appointmentId: record.id, oldStatus: 'submitted', newStatus: 'confirmed' }).catch((err) => {
          logger.error('Notification hook failed on auto-confirm (non-blocking)', { error: err, appointmentId: record.id })
        })
      }
    }

    if (shouldCreateCalendarEvent(record.status)) {
      try {
        logger.debug(`Creating calendar invites for appointment ${record.id}`)

        const calendarId = await getCalendarIdForAppointment()

        const inviteResult = await createInvitesForAppointment(
          record.id,
          calendarId
        )

        if (inviteResult.totalEventsCreated > 0) {
          logger.debug(
            `Calendar invites created: ${inviteResult.totalEventsCreated}/${inviteResult.totalEventsAttempted} events, ` +
            `${inviteResult.totalAttendeesUpdated} attendees updated`
          )
        } else if (inviteResult.noEventInstances) {
          logger.debug('No EventInstances — calendar invites skipped')
        } else {
          const errors = inviteResult.events
            .filter(e => !e.success)
            .map(e => e.error)
            .join('; ')
          logger.error(`Calendar invite creation failed: ${errors || 'no events attempted'}`)
        }
      } catch (calendarError) {
        logger.error('Calendar invite creation error:', calendarError)
      }
    } else {
      logger.debug(`Skipping calendar invites - status is '${record.status}' (not submitted/confirmed)`)
    }
    
    const appointmentWithRelations = await Appointment.findByPk(record.id, {
      include: appointmentIncludes,
    })
    
    res.status(HTTP_STATUS_CODES.CREATED).json(appointmentWithRelations)
  },
  afterUpdate: async (record, req, res) => {
    const newStatus = req.body?.status as string | undefined
    const oldStatus = req.body?._currentStatus as string | undefined

    if (newStatus && oldStatus && newStatus !== oldStatus) {
      onStatusChange({ appointmentId: record.id, oldStatus, newStatus }).catch((err) => {
        logger.error('Notification hook failed (non-blocking)', { error: err, appointmentId: record.id })
      })
    }

    if (newStatus && shouldCreateCalendarEvent(newStatus)) {
      const existingInvites = await AppointmentAttendee.count({
        where: {
          appointmentId: record.id,
          invitationStatus: INVITATION_STATUS_SENT,
        },
      })

      if (existingInvites === 0) {
        try {
          logger.debug(`Status changed to '${newStatus}' — creating calendar invites for appointment ${record.id}`)

          const calendarId = await getCalendarIdForAppointment()
          const inviteResult = await createInvitesForAppointment(record.id, calendarId)

          if (inviteResult.totalEventsCreated > 0) {
            logger.debug(
              `Calendar invites created on status transition: ${inviteResult.totalEventsCreated} events, ` +
              `${inviteResult.totalAttendeesUpdated} attendees updated`
            )
          } else {
            logger.error(`Calendar invite creation failed on status transition`)
          }
        } catch (calendarError) {
          logger.error('Calendar invite creation error on status transition:', calendarError)
        }
      } else {
        logger.debug(`Skipping calendar invites on update — ${existingInvites} attendee(s) already have sent invitations`)
      }
    }

    const appointmentWithRelations = await Appointment.findByPk(record.id, {
      include: appointmentIncludes,
    })
    
    if (!appointmentWithRelations) {
      sendNotFound(res, ERROR_MESSAGES.APPOINTMENT_NOT_FOUND, record.id)
      return
    }
    
    res.json(appointmentWithRelations)
  },
})

router.get('/:id/versions', checkOwnership('appointment', 'id'), async (req: Request, res: Response): Promise<void> => {
  try {
    const id = paramString(req, 'id')
    const appointment = await Appointment.findByPk(id)
    
    if (!appointment) {
      res.status(HTTP_STATUS_CODES.NOT_FOUND).json({ 
        error: ERROR_MESSAGES.APPOINTMENT_NOT_FOUND,
        id
      })
      return
    }
    
    const { services, properties, options } = await loadAllAppointmentVersions({
      serviceSnapshotIds: appointment.serviceSnapshotIds,
      propertySnapshotIds: appointment.propertySnapshotIds,
      optionSnapshotIds: appointment.optionSnapshotIds,
    })
    
    res.json({
      services,
      properties,
      options,
    })
  } catch (error) {
    handleRouteError(error, res, ERROR_MESSAGES.FETCH_APPOINTMENT_VERSIONS, 'fetching appointment versions')
  }
})

export { router as AppointmentCrudRouter }
