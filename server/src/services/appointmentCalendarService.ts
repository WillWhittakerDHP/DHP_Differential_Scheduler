import { INVITATION_STATUS_SENT } from '@shared/constants/inviteStatusConstants.js';
import { createEvent } from './google/calendar/eventCreationService.js';
import type { CreateEventParams, EventAttendee } from './google/calendar/calendarTypes.js';
import {
  Appointment,
  AppointmentAttendee,
  AppointmentTimeSlot,
  User,
  PropertyVersion,
  Address,
} from '../config/app.js';
import { UNKNOWN_ERROR_MESSAGE } from '../constants/router.js';
import { createLogger } from '../utils/logger.js';

const logger = createLogger('AppointmentCalendarService');

interface CalendarEventResult {
  success: boolean;
  eventId?: string;
  eventLink?: string;
  error?: string;
  attendeesUpdated: number;
}

/** `selectedTimeSlots` JSON from Appointment.toJSON; duration optional. */
interface CalendarSelectedTimeSlot {
  startTime: string
  endTime: string
  duration?: number
}

interface AppointmentWithDetails {
  id: string;
  selectedDate: Date | string | null;  // DATEONLY field
  selectedTimeSlots: CalendarSelectedTimeSlot[] | null;
  status: string;
  propertyVersion?: {
    address?: {
      streetAddress: string;
      city: string;
      state: string;
      zipCode: string;
    };
  };
  attendees?: Array<{
    id: string;
    userId: string;
    shouldReceiveInvitation: boolean;
    user?: {
      id: string;
      email: string;
      firstName?: string;
      lastName?: string;
    };
  }>;
}

function isCalendarSelectedTimeSlot(v: unknown): v is CalendarSelectedTimeSlot {
  if (v === null || typeof v !== 'object') return false;
  const o = v as Record<string, unknown>;
  return typeof o.startTime === 'string' && typeof o.endTime === 'string';
}

function isAppointmentCalendarPayload(v: unknown): v is AppointmentWithDetails {
  if (v === null || typeof v !== 'object') return false;
  const o = v as Record<string, unknown>;
  if (typeof o.id !== 'string' || typeof o.status !== 'string') return false;
  const slots = o.selectedTimeSlots;
  if (slots === null || slots === undefined) return true;
  if (!Array.isArray(slots)) return false;
  return slots.every((s) => isCalendarSelectedTimeSlot(s));
}

export async function createCalendarEventForAppointment(
  appointmentId: string,
  calendarId: string = 'primary'
): Promise<CalendarEventResult> {
  logger.info(`Creating calendar event for appointment ${appointmentId}`);
  
  try {
    const appointment = await Appointment.findByPk(appointmentId, {
      include: [
        {
          model: PropertyVersion,
          as: 'propertyVersion',
          include: [{ model: Address, as: 'address' }],
        },
        {
          model: AppointmentAttendee,
          as: 'attendees',
          include: [{ model: User, as: 'user' }],
        },
        {
          model: AppointmentTimeSlot,
          as: 'timeSlots',
          separate: true,
        },
      ],
    });
    
    if (!appointment) {
      return {
        success: false,
        error: `Appointment ${appointmentId} not found`,
        attendeesUpdated: 0,
      };
    }
    
    const rawJson = appointment.toJSON();
    if (!isAppointmentCalendarPayload(rawJson)) {
      logger.error('Appointment toJSON shape invalid for calendar event', { appointmentId });
      return {
        success: false,
        error: `Appointment ${appointmentId} payload invalid for calendar`,
        attendeesUpdated: 0,
      };
    }
    const json = rawJson;
    const eventParams = buildEventParams(json, calendarId);
    
    try {
      const createdEvent = await createEvent(eventParams);
      
      const filtered = json.attendees?.filter((a) => a.shouldReceiveInvitation)
      const attendeesToUpdate = filtered !== undefined && filtered !== null ? filtered : []
      let attendeesUpdated = 0;
      
      for (const attendee of attendeesToUpdate) {
        try {
          await AppointmentAttendee.update(
              {
              googleEventId: createdEvent.id,
              invitationStatus: INVITATION_STATUS_SENT,
            },
            { where: { id: attendee.id } }
          );
          attendeesUpdated++;
        } catch (error) {
          logger.error(`Failed to update attendee ${attendee.id}:`, error);
        }
      }
      
      logger.info(`Created event ${createdEvent.id}, updated ${attendeesUpdated} attendees`);
      
      return {
        success: true,
        eventId: createdEvent.id,
        eventLink: createdEvent.htmlLink,
        attendeesUpdated,
      };
    } catch (createError) {
      logger.error(createError)
      return {
        success: false,
        error: createError instanceof Error ? createError.message : 'Failed to create calendar event',
        attendeesUpdated: 0,
      };
    }
    
  } catch (error) {
    logger.error('Error creating calendar event:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : UNKNOWN_ERROR_MESSAGE,
      attendeesUpdated: 0,
    };
  }
}

function buildEventParams(appointment: AppointmentWithDetails, calendarId: string): CreateEventParams {
  const summary = buildEventSummary(appointment);
  
  const location = buildEventLocation(appointment);
  
  const description = buildEventDescription(appointment);
  
  const { start, end } = calculateEventTimes(appointment);
  
  const attendees = buildAttendeesList(appointment);
  
  return {
    calendarId,
    summary,
    description,
    location,
    start,
    end,
    attendees,
    sendUpdates: 'all', // Send invitation emails to all attendees
  };
}

function buildEventSummary(appointment: AppointmentWithDetails): string {
  const address = appointment.propertyVersion?.address;
  
  if (address) {
    return `Inspection: ${address.streetAddress}`;
  }
  
  return `Inspection Appointment`;
}

function buildEventLocation(appointment: AppointmentWithDetails): string | undefined {
  const address = appointment.propertyVersion?.address;
  
  if (!address) {
    return undefined;
  }
  
  const parts = [
    address.streetAddress,
    address.city,
    address.state,
    address.zipCode,
  ].filter(Boolean);
  
  return parts.join(', ');
}

function buildEventDescription(appointment: AppointmentWithDetails): string {
  const lines: string[] = [
    'Home Inspection Appointment',
    '',
    '---',
    'This event was automatically created by the scheduling system.',
    `Appointment ID: ${appointment.id}`,
  ];
  
  return lines.join('\n');
}

/**

 */
function calculateEventTimes(appointment: AppointmentWithDetails): { start: string; end: string } {
  const firstSlot = appointment.selectedTimeSlots?.[0];
  
  // PATTERN: Explicit failure - require proper time slot data
  if (!firstSlot) {
    logger.error(`No time slots found for appointment ${appointment.id}`);
    logger.error(`selectedTimeSlots:`, JSON.stringify(appointment.selectedTimeSlots));
    throw new Error(`Appointment ${appointment.id} has no selectedTimeSlots - cannot create calendar event`);
  }
  
  if (!firstSlot.startTime || !firstSlot.endTime) {
    logger.error(`Time slot missing startTime/endTime for appointment ${appointment.id}`);
    logger.error(`firstSlot:`, JSON.stringify(firstSlot));
    throw new Error(
      `Appointment ${appointment.id} time slot missing required fields. ` +
      `Got: startTime=${firstSlot.startTime}, endTime=${firstSlot.endTime}. ` +
      `Expected RFC3339 format (e.g., "2026-02-01T14:30:00.000Z")`
    );
  }
  
  logger.debug(`Using RFC3339 format: start=${firstSlot.startTime}, end=${firstSlot.endTime}`);
  
  const startDate = new Date(firstSlot.startTime);
  const endDate = new Date(firstSlot.endTime);
  
  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    logger.error(`Invalid RFC3339 dates: start=${firstSlot.startTime}, end=${firstSlot.endTime}`);
    throw new Error(`Invalid dates: ${firstSlot.startTime} / ${firstSlot.endTime}`);
  }
  
  return {
    start: startDate.toISOString(),
    end: endDate.toISOString(),
  };
}

function buildAttendeesList(appointment: AppointmentWithDetails): EventAttendee[] {
  const attendees: EventAttendee[] = [];
  
  if (!appointment.attendees) {
    return attendees;
  }
  
  for (const attendee of appointment.attendees) {
    if (!attendee.shouldReceiveInvitation) {
      continue;
    }
    
    if (!attendee.user?.email) {
      logger.warn(`Attendee ${attendee.id} has no email, skipping`);
      continue;
    }
    
    const displayName = [attendee.user.firstName, attendee.user.lastName]
      .filter(Boolean)
      .join(' ') || undefined;
    
    attendees.push({
      email: attendee.user.email,
      displayName,
    });
  }
  
  return attendees;
}
