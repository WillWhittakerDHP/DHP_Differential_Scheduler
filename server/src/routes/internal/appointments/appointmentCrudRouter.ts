/**
 * Appointment CRUD Router
 * 
 * LEARNING: Refactored to use CRUD router factory pattern with complex POST logic in afterCreate hook
 * WHY: Eliminates boilerplate, ensures consistent patterns, wires in security middleware
 * PATTERN: Factory-generated router with afterCreate hook for snapshots, attendees, and calendar events
 */

import { Request, Response } from 'express'
import { Appointment, AppointmentAttendee } from '../../../config/app.js'
import { checkOwnership } from '../../../middlewares/security.js'
import { createCrudRouter } from '../../helpers/createCrudRouter.js'
import { loadAllAppointmentVersions } from '../../../services/appointmentSnapshotLoader.js'
import { createInvitesForAppointment } from '../../../services/invites/inviteOrchestrationService.js'
import { ERROR_MESSAGES } from './appointmentConstants.js'
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
  type AttendeeRequest,
} from './appointmentHelpers.js'
import { sendSuccess, sendNotFound } from '../../helpers/routerResponseHelpers.js'
import { paramString } from '../../helpers/requestHelpers.js'
import { HTTP_STATUS_CODES } from '../../../constants/router.js'
import { createLogger } from '../../../utils/logger.js'

const logger = createLogger('AppointmentRouter')

// Create base CRUD router using factory with custom handlers for includes
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
  sanitizeInput: (data: unknown): unknown => {
    // Remove attendees and feeBreakdown from appointmentData before creating appointment
    // (attendees in separate table; fee summary + entries created in afterCreate)
    const appointmentData = data as {
      attendees?: AttendeeRequest[]
      feeBreakdown?: unknown
      [key: string]: unknown
    }
    const { attendees: _, feeBreakdown: __, ...appointmentFields } = appointmentData
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

    // Create snapshots for block instances
    const serviceSnapshotIds = await createSnapshotsForAppointment(idsOrEmpty('selectedServiceIds'))
    const propertySnapshotIds = await createSnapshotsForAppointment(idsOrEmpty('selectedPropertyIds'))
    const optionSnapshotIds = await createSnapshotsForAppointment(idsOrEmpty('selectedOptionIds'))
    
    // Validate snapshot IDs (redundant but defensive)
    await validateSnapshotIds(serviceSnapshotIds)
    await validateSnapshotIds(propertySnapshotIds)
    await validateSnapshotIds(optionSnapshotIds)
    
    // Update appointment with snapshot IDs
    await record.update({
      serviceSnapshotIds: serviceSnapshotIds.length > 0 ? serviceSnapshotIds : null,
      propertySnapshotIds: propertySnapshotIds.length > 0 ? propertySnapshotIds : null,
      optionSnapshotIds: optionSnapshotIds.length > 0 ? optionSnapshotIds : null,
    })
    
    // Create attendee records
    await createAttendeeRecords(record.id, attendeesData)

    // Create fee summary + entries (from client buildAppointmentFeeBreakdown)
    await createFeeRecordsForAppointment(record.id, appointmentData.feeBreakdown ?? null)

    // Create calendar invites if status requires it
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
            `${inviteResult.totalAttendeesUpdated} attendees updated` +
            (inviteResult.fallbackUsed ? ' (fallback)' : '')
          )
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
    
    // Fetch appointment with relationships for response
    const appointmentWithRelations = await Appointment.findByPk(record.id, {
      include: appointmentIncludes,
    })
    
    // Send response with full appointment data (override factory's default response)
    res.status(HTTP_STATUS_CODES.CREATED).json(appointmentWithRelations)
  },
  afterUpdate: async (record, req, res) => {
    // Check if status transitioned to one that requires calendar invites
    const newStatus = req.body?.status as string | undefined
    if (newStatus && shouldCreateCalendarEvent(newStatus)) {
      // Only create invites if no attendee already has a googleEventId (prevents duplicates)
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

    // Fetch appointment with relationships for response
    const appointmentWithRelations = await Appointment.findByPk(record.id, {
      include: appointmentIncludes,
    })
    
    if (!appointmentWithRelations) {
      sendNotFound(res, ERROR_MESSAGES.APPOINTMENT_NOT_FOUND, record.id)
      return
    }
    
    // Send response with full appointment data (override factory's default response)
    res.json(appointmentWithRelations)
  },
})

/**
 * GET /appointments/:id/versions
 * Get appointment versions (snapshots)
 * 
 * LEARNING: Extra route for fetching appointment version snapshots
 * WHY: Provides historical state of block instances at appointment creation time
 * PATTERN: Fetch appointment, load versions, return JSON
 * IDOR: Same ownership middleware as GET /:id (user can only read own org's appointments when auth is implemented).
 */
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
