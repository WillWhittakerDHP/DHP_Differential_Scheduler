/**
 * Appointment CRUD Router
 * 
 * LEARNING: Refactored to use CRUD router factory pattern with complex POST logic in afterCreate hook
 * WHY: Eliminates boilerplate, ensures consistent patterns, wires in security middleware
 * PATTERN: Factory-generated router with afterCreate hook for snapshots, attendees, and calendar events
 */

import { Router, Request, Response } from 'express'
import { Appointment } from '../../../config/app.js'
import { createCrudRouter } from '../../helpers/createCrudRouter.js'
import { loadAllAppointmentVersions } from '../../../services/appointmentSnapshotLoader.js'
import { createCalendarEventForAppointment } from '../../../services/appointmentCalendarService.js'
import { ERROR_MESSAGES } from './appointmentConstants.js'
import { handleRouteError } from './appointmentErrorHandler.js'
import {
  appointmentIncludes,
  createSnapshotsForAppointment,
  validateSnapshotIds,
  createAttendeeRecords,
  shouldCreateCalendarEvent,
  getCalendarIdForAppointment,
  type AttendeeRequest,
} from './appointmentHelpers.js'
import { sendSuccess, sendNotFound } from '../../helpers/routerResponseHelpers.js'
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
      const appointment = await Appointment.findByPk(req.params.id, {
        include: appointmentIncludes,
      })
      
      if (!appointment) {
        sendNotFound(res, ERROR_MESSAGES.APPOINTMENT_NOT_FOUND, req.params.id)
        return
      }
      
      sendSuccess(res, appointment)
    } catch (error) {
      handleRouteError(error, res, ERROR_MESSAGES.FETCH_APPOINTMENT, 'fetching appointment')
    }
  },
  sanitizeInput: (data: unknown): unknown => {
    // Remove attendees from appointmentData before creating appointment
    // (attendees are stored in separate table)
    const appointmentData = data as { attendees?: AttendeeRequest[]; [key: string]: unknown }
    const { attendees: _, ...appointmentFields } = appointmentData
    return appointmentFields
  },
  afterCreate: async (record, req, res) => {
    // LEARNING: Complex POST logic moved to afterCreate hook
    // WHY: Keeps factory pattern clean while allowing domain-specific behavior
    // PATTERN: Hook runs after record creation, handles side effects
    
    const appointmentData = req.body
    const attendeesData: AttendeeRequest[] = appointmentData.attendees ?? []
    
    // Create snapshots for block instances
    const serviceSnapshotIds = await createSnapshotsForAppointment(
      appointmentData.selectedServiceIds ?? []
    )
    const propertySnapshotIds = await createSnapshotsForAppointment(
      appointmentData.selectedPropertyIds ?? []
    )
    const optionSnapshotIds = await createSnapshotsForAppointment(
      appointmentData.selectedOptionIds ?? []
    )
    
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
    
    // Create calendar event if status requires it
    if (shouldCreateCalendarEvent(record.status)) {
      try {
        logger.debug(`Creating calendar event for appointment ${record.id}`)
        
        const calendarId = await getCalendarIdForAppointment()
        
        const calendarResult = await createCalendarEventForAppointment(
          record.id,
          calendarId
        )
        
        if (calendarResult.success) {
          logger.debug(`Calendar event created: ${calendarResult.eventId}, ${calendarResult.attendeesUpdated} attendees updated`)
        } else {
          logger.error(`Calendar event creation failed: ${calendarResult.error}`)
        }
      } catch (calendarError) {
        // Don't fail the appointment creation if calendar fails
        logger.error('Calendar event creation error:', calendarError)
      }
    } else {
      logger.debug(`Skipping calendar event - status is '${record.status}' (not submitted/confirmed)`)
    }
    
    // Fetch appointment with relationships for response
    const appointmentWithRelations = await Appointment.findByPk(record.id, {
      include: appointmentIncludes,
    })
    
    // Send response with full appointment data (override factory's default response)
    res.status(HTTP_STATUS_CODES.CREATED).json(appointmentWithRelations)
  },
  afterUpdate: async (record, req, res) => {
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
 */
router.get('/:id/versions', async (req: Request, res: Response): Promise<void> => {
  try {
    const appointment = await Appointment.findByPk(req.params.id)
    
    if (!appointment) {
      res.status(HTTP_STATUS_CODES.NOT_FOUND).json({ 
        error: ERROR_MESSAGES.APPOINTMENT_NOT_FOUND,
        id: req.params.id
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
