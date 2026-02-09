/**
 * Appointment CRUD Router
 * 
 * LEARNING: Extracted CRUD operations for appointments
 * WHY: Separates CRUD operations from router setup, improves maintainability
 * PATTERN: Express router with RESTful endpoints
 */

import { Router, Request, Response } from 'express'
import { Appointment } from '../../../config/app.js'
import { 
  fetchAll, 
  fetchById, 
  createRecord, 
  updateRecord, 
  patchRecord, 
  deleteRecord
} from '../../helpers/dataController.js'
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
import { HTTP_STATUS_CODES } from '../../../constants/router.js'
import { createLogger } from '../../../utils/logger.js'

const logger = createLogger('AppointmentRouter')

const router = Router()

/**
 * GET /appointments
 * List all appointments
 * 
 * LEARNING: Fetches all appointments with relationships
 * WHY: Provides complete appointment data with attendees and property information
 * PATTERN: Fetch all with includes, return JSON
 */
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const appointments = await fetchAll(Appointment, {
      includes: appointmentIncludes
    })
    res.json(appointments)
  } catch (error) {
    handleRouteError(error, res, ERROR_MESSAGES.FETCH_APPOINTMENTS, 'fetching appointments')
  }
})

/**
 * GET /appointments/:id
 * Get single appointment by ID
 * 
 * LEARNING: Fetches single appointment by ID with relationships
 * WHY: Provides complete appointment data for a specific appointment
 * PATTERN: Fetch by ID with includes, return 404 if not found
 */
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const appointment = await Appointment.findByPk(req.params.id, {
      include: appointmentIncludes,
    })
    
    if (!appointment) {
      res.status(HTTP_STATUS_CODES.NOT_FOUND).json({ 
        error: ERROR_MESSAGES.APPOINTMENT_NOT_FOUND,
        id: req.params.id
      })
      return
    }
    
    res.json(appointment)
  } catch (error) {
    handleRouteError(error, res, ERROR_MESSAGES.FETCH_APPOINTMENT, 'fetching appointment')
  }
})

/**
 * POST /appointments
 * Create a new appointment
 * 
 * LEARNING: Creates appointment with snapshots, attendees, and calendar integration
 * WHY: Enables appointment creation via API with full feature support
 * PATTERN: Create snapshots, validate, create appointment, create attendees, create calendar event
 */
router.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const appointmentData = req.body
    const attendeesData: AttendeeRequest[] = appointmentData.attendees || []
    
    // Remove attendees from appointmentData before creating appointment
    // (attendees are stored in separate table)
    const { attendees: _, ...appointmentFields } = appointmentData
    
    // Create snapshots for block instances
    const serviceSnapshotIds = await createSnapshotsForAppointment(
      appointmentFields.selectedServiceIds || []
    )
    const propertySnapshotIds = await createSnapshotsForAppointment(
      appointmentFields.selectedPropertyIds || []
    )
    const optionSnapshotIds = await createSnapshotsForAppointment(
      appointmentFields.selectedOptionIds || []
    )
    
    // Validate snapshot IDs (redundant but defensive)
    await validateSnapshotIds(serviceSnapshotIds)
    await validateSnapshotIds(propertySnapshotIds)
    await validateSnapshotIds(optionSnapshotIds)
    
    // Create the appointment
    const appointment = await createRecord(Appointment, {
      ...appointmentFields,
      serviceSnapshotIds: serviceSnapshotIds.length > 0 ? serviceSnapshotIds : null,
      propertySnapshotIds: propertySnapshotIds.length > 0 ? propertySnapshotIds : null,
      optionSnapshotIds: optionSnapshotIds.length > 0 ? optionSnapshotIds : null,
    })
    
    // Create attendee records
    // LEARNING: Attendees are created after appointment to have the appointmentId
    // WHY: Junction table requires appointment to exist first
    // SESSION: 2.1.3b - Appointment Attendees Architecture
    await createAttendeeRecords(appointment.id, attendeesData)
    
    // LEARNING: Trigger calendar event creation when appointment is submitted or confirmed
    // WHY: Sends Google Calendar invitations to all attendees
    // SESSION: 2.1.3b - Appointment Attendees Architecture
    if (shouldCreateCalendarEvent(appointment.status)) {
      try {
        logger.debug(`Creating calendar event for appointment ${appointment.id}`)
        
        const calendarId = await getCalendarIdForAppointment()
        
        const calendarResult = await createCalendarEventForAppointment(
          appointment.id,
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
      logger.debug(`Skipping calendar event - status is '${appointment.status}' (not submitted/confirmed)`)
    }
    
    const appointmentWithRelations = await Appointment.findByPk(appointment.id, {
      include: appointmentIncludes,
    })
    
    res.status(HTTP_STATUS_CODES.CREATED).json(appointmentWithRelations)
  } catch (error) {
    handleRouteError(error, res, ERROR_MESSAGES.CREATE_APPOINTMENT, 'creating appointment')
  }
})

/**
 * PUT /appointments/:id
 * Update an appointment (full update)
 * 
 * LEARNING: Updates appointment record with full replacement
 * WHY: Enables full appointment updates via API
 * PATTERN: Update record, return 404 if not found, return updated record with includes
 */
router.put('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const updatedRows = await updateRecord(Appointment, req.params.id, req.body)
    
    if (updatedRows === 0) {
      res.status(HTTP_STATUS_CODES.NOT_FOUND).json({ 
        error: ERROR_MESSAGES.APPOINTMENT_NOT_FOUND,
        id: req.params.id
      })
      return
    }
    
    const appointment = await Appointment.findByPk(req.params.id, {
      include: appointmentIncludes,
    })
    
    res.json(appointment)
  } catch (error) {
    handleRouteError(error, res, ERROR_MESSAGES.UPDATE_APPOINTMENT, 'updating appointment')
  }
})

/**
 * PATCH /appointments/:id
 * Partially update an appointment
 * 
 * LEARNING: Updates appointment record with partial data
 * WHY: Enables partial appointment updates via API
 * PATTERN: Patch record, return 404 if not found, return updated record with includes
 */
router.patch('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const updated = await patchRecord(Appointment, req.params.id, req.body)
    
    if (!updated) {
      res.status(HTTP_STATUS_CODES.NOT_FOUND).json({ 
        error: ERROR_MESSAGES.APPOINTMENT_NOT_FOUND,
        id: req.params.id
      })
      return
    }
    
    const appointment = await Appointment.findByPk(req.params.id, {
      include: appointmentIncludes,
    })
    
    res.json(appointment)
  } catch (error) {
    handleRouteError(error, res, ERROR_MESSAGES.PATCH_APPOINTMENT, 'patching appointment')
  }
})

/**
 * DELETE /appointments/:id
 * Delete an appointment
 * 
 * LEARNING: Deletes appointment record
 * WHY: Enables appointment deletion via API
 * PATTERN: Delete record, return 404 if not found, return 204 on success
 */
router.delete('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const deleted = await deleteRecord(Appointment, req.params.id)
    
    if (!deleted) {
      res.status(HTTP_STATUS_CODES.NOT_FOUND).json({ 
        error: ERROR_MESSAGES.APPOINTMENT_NOT_FOUND,
        id: req.params.id
      })
      return
    }
    
    res.status(HTTP_STATUS_CODES.NO_CONTENT).send()
  } catch (error) {
    handleRouteError(error, res, ERROR_MESSAGES.DELETE_APPOINTMENT, 'deleting appointment')
  }
})

/**
 * GET /appointments/:id/versions
 * Get appointment versions (snapshots)
 * 
 * LEARNING: Fetches version snapshots for appointment block instances
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
