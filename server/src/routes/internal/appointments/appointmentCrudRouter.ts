import { Request, Response } from 'express'
import { Appointment, AppointmentAttendee } from '../../../config/app.js'
import { checkOwnership } from '../../../middlewares/security.js'
import { createCrudRouter } from '../../helpers/createCrudRouter.js'
import { loadAllAppointmentVersions } from '../../../services/appointmentSnapshotLoader.js'
import { createInvitesForAppointment } from '../../../services/invites/inviteOrchestrationService.js'
import { ERROR_MESSAGES, ALLOWED_OVERRIDE_CONSTRAINTS } from './appointmentConstants.js'
import { handleRouteError } from './appointmentErrorHandler.js'
import type { AppointmentFeeBreakdownPayload } from '../../../../../shared/types/appointmentFeeTypes.js'
import {
  appointmentIncludes,
  createSnapshotsForAppointment,
  validateSnapshotIds,
  createAttendeeRecords,
  createFeeRecordsForAppointment,
  shouldCreateCalendarEvent,
  getCalendarIdForAppointment,
  getHoldDurationDefaultFromSettings,
  type AttendeeRequest,
} from './appointmentHelpers.js'
import { sendSuccess, sendNotFound } from '../../helpers/routerResponseHelpers.js'
import { paramString } from '../../helpers/requestHelpers.js'
import { HTTP_STATUS_CODES } from '../../../constants/router.js'
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
  beforeUpdate: async (req): Promise<void> => {
    const body = req.body as { status?: string; _holdDurationDefaultFromSettings?: number }
    if (body?.status === 'held') {
      body._holdDurationDefaultFromSettings = await getHoldDurationDefaultFromSettings()
    }
  },
  sanitizeInput: (data: unknown): unknown => {
    const appointmentData = data as {
      attendees?: AttendeeRequest[]
      feeBreakdown?: unknown
      holdDurationMinutes?: unknown
      overrideConstraints?: unknown
      _holdDurationDefaultFromSettings?: number
      status?: string
      [key: string]: unknown
    }
    const {
      attendees: _,
      feeBreakdown: __,
      holdDurationMinutes: rawDuration,
      overrideConstraints: rawOverrides,
      _holdDurationDefaultFromSettings: defaultFromSettings,
      ...appointmentFields
    } = appointmentData

    if (appointmentFields.status === 'held') {
      const HOLD_DURATION_MAX = 60
      const parsed = Number(rawDuration)
      const fromRequest = (!Number.isNaN(parsed) && parsed >= 1 && parsed <= HOLD_DURATION_MAX)
        ? Math.floor(parsed)
        : undefined
      const durationMinutes = fromRequest ?? (typeof defaultFromSettings === 'number' ? defaultFromSettings : 15)

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
    // LEARNING: Complex POST logic moved to afterCreate hook
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
    if (newStatus && shouldCreateCalendarEvent(newStatus)) {
      const existingInvites = await AppointmentAttendee.count({
        where: {
          appointmentId: record.id,
          invitationStatus: 'sent',
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
