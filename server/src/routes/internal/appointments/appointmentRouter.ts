import { Router, Request, Response } from 'express';
import { Op } from 'sequelize';
import { 
  Appointment, 
  PropertyVersion, 
  Address, 
  PropertyDetails, 
  User, 
  BlockInstanceVersion,
  AppointmentAttendee,
  BlockInstance,
  BusinessSettings
} from '../../../config/app.js';
import { 
  fetchAll, 
  fetchById, 
  createRecord, 
  updateRecord, 
  patchRecord, 
  deleteRecord 
} from '../../helpers/dataController.js';
import { createBlockInstanceVersion } from '../../../services/instanceVersioning.js';
import { loadAllAppointmentVersions } from '../../../services/appointmentSnapshotLoader.js';
import { getUserTypeBlockIdForRole } from '../../../utils/userTypeMapping.js';
import { createCalendarEventForAppointment } from '../../../services/appointmentCalendarService.js';
import { createLogger } from '../../../utils/logger.js';

const logger = createLogger('AppointmentRouter');

/**
 * Get the writeTo calendar email from business settings
 * LEARNING: Reads calendarConfig from availability_settings to find calendar with writeTo: true
 * WHY: Appointments should be created on the calendar configured by admin, not hardcoded
 * PATTERN: Helper function to extract writeTo calendar from settings
 * 
 * @returns Calendar email string where writeTo is true, or undefined if not configured
 */
async function getWriteToCalendarFromSettings(): Promise<string | undefined> {
  try {
    const setting = await BusinessSettings.findOne({
      where: { settingKey: 'availability_settings' },
    });
    
    if (!setting || !setting.settingValue) {
      logger.debug('No availability_settings found, using default calendar');
      return undefined;
    }
    
    const settings = setting.settingValue as {
      calendarConfig?: {
        enabled?: boolean;
        provider?: string;
        calendars?: Array<{
          email?: string;
          readFrom?: boolean;
          writeTo?: boolean;
        }>;
      };
    };
    
    const calendarConfig = settings.calendarConfig;
    if (!calendarConfig || !calendarConfig.enabled) {
      logger.debug('Calendar integration not enabled');
      return undefined;
    }
    
    if (!Array.isArray(calendarConfig.calendars)) {
      logger.error('Invalid calendar config: calendars must be an array');
      return undefined;
    }
    
    // Find calendar with writeTo: true
    const writeToEntry = calendarConfig.calendars.find(
      entry => entry.writeTo && entry.email && entry.email.trim() !== ''
    );
    
    if (writeToEntry?.email) {
      logger.debug('Found writeTo calendar', { email: writeToEntry.email });
      return writeToEntry.email.trim();
    }
    
    logger.debug('No writeTo calendar configured');
    return undefined;
  } catch (error) {
    logger.error('Error reading writeTo calendar from settings', { error });
    return undefined;
  }
}

/**
 * Type for attendee data in request body
 * LEARNING: Flexible attendee structure for calendar invitations
 * WHY: Enables N attendees per appointment with proper role tracking
 * SESSION: 2.1.3b - Appointment Attendees Architecture
 */
interface AttendeeRequest {
  userId: string;
  userTypeBlockInstanceId?: string | null;
  shouldReceiveInvitation?: boolean;
  role?: string; // If provided, server will look up the UserTypeBlock
}

const router = Router();

/**
 * Standard includes for appointment queries
 * LEARNING: Centralized include definition for consistency
 * WHY: Includes attendees relationship for calendar invitations
 * SESSION: 2.1.3b - Appointment Attendees Architecture
 */
const appointmentIncludes = [
  { 
    model: PropertyVersion, 
    as: 'propertyVersion',
    include: [
      { model: Address, as: 'address' },
      { model: PropertyDetails, as: 'propertyDetails' },
    ],
  },
  // Attendees relationship (replaces legacy clientId/agentId)
  { 
    model: AppointmentAttendee, 
    as: 'attendees',
    include: [
      { model: User, as: 'user' },
      { model: BlockInstance, as: 'userTypeBlockInstance' },
    ],
  },
];

router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const appointments = await fetchAll(Appointment, {
      includes: appointmentIncludes
    });
    res.json(appointments);
  } catch (error) {
    console.error('[AppointmentRouter] Error fetching appointments:', error);
    res.status(500).json({ 
      error: 'Failed to fetch appointments',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const appointment = await Appointment.findByPk(req.params.id, {
      include: appointmentIncludes,
    });
    
    if (!appointment) {
      res.status(404).json({ 
        error: 'Appointment not found',
        id: req.params.id
      });
      return;
    }
    
    res.json(appointment);
  } catch (error) {
    console.error('[AppointmentRouter] Error fetching appointment:', error);
    res.status(500).json({ 
      error: 'Error fetching appointment',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

async function createSnapshotsForAppointment(
  blockInstanceIds: string[]
): Promise<string[]> {
  if (!blockInstanceIds || blockInstanceIds.length === 0) {
    return [];
  }

  const snapshots = await Promise.all(
    blockInstanceIds.map(async (blockInstanceId) => {
      const version = await createBlockInstanceVersion(blockInstanceId);
      return version.id;
    })
  );
  
  return snapshots;
}

/**
 * Validate snapshot IDs exist
 * Application-level FK validation for arrays
 */
async function validateSnapshotIds(snapshotIds: string[]): Promise<void> {
  if (snapshotIds.length === 0) return;
  
  const count = await BlockInstanceVersion.count({
    where: { id: { [Op.in]: snapshotIds } }
  });
  
  if (count !== snapshotIds.length) {
    throw new Error('One or more snapshot IDs are invalid');
  }
}

router.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const appointmentData = req.body;
    const attendeesData: AttendeeRequest[] = appointmentData.attendees || [];
    
    // Remove attendees from appointmentData before creating appointment
    // (attendees are stored in separate table)
    const { attendees: _, ...appointmentFields } = appointmentData;
    
    const serviceSnapshotIds = await createSnapshotsForAppointment(
      appointmentFields.selectedServiceIds || []
    );
    const propertySnapshotIds = await createSnapshotsForAppointment(
      appointmentFields.selectedPropertyIds || []
    );
    const optionSnapshotIds = await createSnapshotsForAppointment(
      appointmentFields.selectedOptionIds || []
    );
    
    // Validate snapshot IDs (redundant but defensive)
    await validateSnapshotIds(serviceSnapshotIds);
    await validateSnapshotIds(propertySnapshotIds);
    await validateSnapshotIds(optionSnapshotIds);
    
    // Create the appointment
    const appointment = await createRecord(Appointment, {
      ...appointmentFields,
      serviceSnapshotIds: serviceSnapshotIds.length > 0 ? serviceSnapshotIds : null,
      propertySnapshotIds: propertySnapshotIds.length > 0 ? propertySnapshotIds : null,
      optionSnapshotIds: optionSnapshotIds.length > 0 ? optionSnapshotIds : null,
    });
    
    // Create attendee records
    // LEARNING: Attendees are created after appointment to have the appointmentId
    // WHY: Junction table requires appointment to exist first
    // SESSION: 2.1.3b - Appointment Attendees Architecture
    if (attendeesData.length > 0) {
      console.log(`[AppointmentRouter] Creating ${attendeesData.length} attendee records`);
      
      await Promise.all(attendeesData.map(async (attendee) => {
        // If role is provided but not userTypeBlockInstanceId, look it up
        let userTypeBlockInstanceId = attendee.userTypeBlockInstanceId;
        if (!userTypeBlockInstanceId && attendee.role) {
          userTypeBlockInstanceId = await getUserTypeBlockIdForRole(attendee.role);
        }
        
        return AppointmentAttendee.create({
          appointmentId: appointment.id,
          userId: attendee.userId,
          userTypeBlockInstanceId: userTypeBlockInstanceId || null,
          shouldReceiveInvitation: attendee.shouldReceiveInvitation ?? true,
          invitationStatus: 'pending',
        });
      }));
      
      console.log(`[AppointmentRouter] Created attendee records for appointment ${appointment.id}`);
    } else {
      console.log(`[AppointmentRouter] No attendees provided for appointment ${appointment.id}`);
    }
    
    // LEARNING: Trigger calendar event creation when appointment is submitted or confirmed
    // WHY: Sends Google Calendar invitations to all attendees
    // SESSION: 2.1.3b - Appointment Attendees Architecture
    if (appointment.status === 'submitted' || appointment.status === 'confirmed') {
      try {
        console.log(`[AppointmentRouter] Creating calendar event for appointment ${appointment.id}`);
        
        // Get writeTo calendar from settings (or fallback to default)
        const writeToCalendar = await getWriteToCalendarFromSettings();
        const calendarId = writeToCalendar || 'scheduling@districthomepro.com'; // Fallback to default if not configured
        
        if (!writeToCalendar) {
          console.warn(`[AppointmentRouter] No writeTo calendar configured, using default: ${calendarId}`);
        }
        
        const calendarResult = await createCalendarEventForAppointment(
          appointment.id,
          calendarId
        );
        
        if (calendarResult.success) {
          console.log(`[AppointmentRouter] Calendar event created: ${calendarResult.eventId}, ${calendarResult.attendeesUpdated} attendees updated`);
        } else {
          console.error(`[AppointmentRouter] Calendar event creation failed: ${calendarResult.error}`);
        }
      } catch (calendarError) {
        // Don't fail the appointment creation if calendar fails
        console.error(`[AppointmentRouter] Calendar event creation error:`, calendarError);
      }
    } else {
      console.log(`[AppointmentRouter] Skipping calendar event - status is '${appointment.status}' (not submitted/confirmed)`);
    }
    
    const appointmentWithRelations = await Appointment.findByPk(appointment.id, {
      include: appointmentIncludes,
    });
    
    res.status(201).json(appointmentWithRelations);
  } catch (error) {
    console.error('[AppointmentRouter] Error creating appointment:', error);
    res.status(500).json({ 
      error: 'Failed to create appointment',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

router.put('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const updatedRows = await updateRecord(Appointment, req.params.id, req.body);
    
    if (updatedRows === 0) {
      res.status(404).json({ 
        error: 'Appointment not found',
        id: req.params.id
      });
      return;
    }
    
    const appointment = await Appointment.findByPk(req.params.id, {
      include: appointmentIncludes,
    });
    
    res.json(appointment);
  } catch (error) {
    console.error('[AppointmentRouter] Error updating appointment:', error);
    res.status(500).json({ 
      error: 'Failed to update appointment',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

router.patch('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const updated = await patchRecord(Appointment, req.params.id, req.body);
    
    if (!updated) {
      res.status(404).json({ 
        error: 'Appointment not found',
        id: req.params.id
      });
      return;
    }
    
    const appointment = await Appointment.findByPk(req.params.id, {
      include: appointmentIncludes,
    });
    
    res.json(appointment);
  } catch (error) {
    console.error('[AppointmentRouter] Error patching appointment:', error);
    res.status(500).json({ 
      error: 'Failed to patch appointment',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

router.delete('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const deleted = await deleteRecord(Appointment, req.params.id);
    
    if (!deleted) {
      res.status(404).json({ 
        error: 'Appointment not found',
        id: req.params.id
      });
      return;
    }
    
    res.status(204).send();
  } catch (error) {
    console.error('[AppointmentRouter] Error deleting appointment:', error);
    res.status(500).json({ 
      error: 'Failed to delete appointment',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

router.get('/:id/versions', async (req: Request, res: Response): Promise<void> => {
  try {
    const appointment = await Appointment.findByPk(req.params.id);
    
    if (!appointment) {
      res.status(404).json({ 
        error: 'Appointment not found',
        id: req.params.id
      });
      return;
    }
    
    const { services, properties, options } = await loadAllAppointmentVersions({
      serviceSnapshotIds: appointment.serviceSnapshotIds,
      propertySnapshotIds: appointment.propertySnapshotIds,
      optionSnapshotIds: appointment.optionSnapshotIds,
    });
    
    res.json({
      services,
      properties,
      options,
    });
  } catch (error) {
    console.error('[AppointmentRouter] Error fetching appointment versions:', error);
    res.status(500).json({ 
      error: 'Error fetching appointment versions',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export { router as AppointmentRouter };

