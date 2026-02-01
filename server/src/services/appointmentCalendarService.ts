/**
 * Appointment Calendar Service
 * 
 * LEARNING: Integrates appointment creation with Google Calendar
 * WHY: Automatically creates calendar events and sends invitations when appointments are booked
 * PATTERN: Service layer that bridges appointment data with Google Calendar API
 * 
 * SESSION: 2.1.3b - Appointment Attendees Architecture
 */

import { createEvent, type CreateEventParams, type EventAttendee } from './googleCalendarService.js';
import { Appointment, AppointmentAttendee, User, PropertyVersion, Address } from '../config/app.js';

/**
 * Result of calendar event creation
 */
export interface CalendarEventResult {
  success: boolean;
  eventId?: string;
  eventLink?: string;
  error?: string;
  attendeesUpdated: number;
}

/**
 * Time slot structure from appointment
 * 
 * LEARNING: Requires RFC3339 format - no legacy fallback
 * WHY: Explicit failure over silent fallback prevents wrong calendar times
 * PATTERN: Client must send full RFC3339 datetime strings
 * 
 * SESSION: 2.1.3b - Removed legacy format support
 */
interface TimeSlot {
  startTime: string;   // RFC3339 format, e.g., "2026-02-01T21:00:00.000Z"
  endTime: string;     // RFC3339 format
  duration?: number;   // Optional - in minutes (can be calculated from start/end)
}

/**
 * Appointment data needed for calendar event creation
 * LEARNING: Uses actual Appointment model field names
 */
interface AppointmentWithDetails {
  id: string;
  selectedDate: Date | string | null;  // DATEONLY field
  selectedTimeSlots: TimeSlot[] | null;  // JSONB array
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

/**
 * Create a Google Calendar event for an appointment
 * 
 * LEARNING: Transforms appointment data into Google Calendar event format
 * WHY: Calendar events need specific format with attendees, times, location
 * 
 * @param appointmentId - The appointment ID to create event for
 * @param calendarId - The calendar to create the event on (default: primary)
 * @returns Result with event details or error
 */
export async function createCalendarEventForAppointment(
  appointmentId: string,
  calendarId: string = 'primary'
): Promise<CalendarEventResult> {
  console.log(`[AppointmentCalendarService] Creating calendar event for appointment ${appointmentId}`);
  
  try {
    // Fetch appointment with all needed relationships
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
      ],
    }) as unknown as AppointmentWithDetails | null;
    
    if (!appointment) {
      return {
        success: false,
        error: `Appointment ${appointmentId} not found`,
        attendeesUpdated: 0,
      };
    }
    
    // Build event parameters including calendarId
    const eventParams = buildEventParams(appointment, calendarId);
    
    // Create the calendar event
    // LEARNING: createEvent returns CreatedEventResponse directly (not wrapped in success/error)
    // WHY: Service layer handles errors via try/catch
    try {
      const createdEvent = await createEvent(eventParams);
      
      // Update attendee records with event ID and status
      const attendeesToUpdate = appointment.attendees?.filter(a => a.shouldReceiveInvitation) || [];
      let attendeesUpdated = 0;
      
      for (const attendee of attendeesToUpdate) {
        try {
          await AppointmentAttendee.update(
            {
              googleEventId: createdEvent.id,
              invitationStatus: 'sent',
            },
            { where: { id: attendee.id } }
          );
          attendeesUpdated++;
        } catch (error) {
          console.error(`[AppointmentCalendarService] Failed to update attendee ${attendee.id}:`, error);
        }
      }
      
      console.log(`[AppointmentCalendarService] Created event ${createdEvent.id}, updated ${attendeesUpdated} attendees`);
      
      return {
        success: true,
        eventId: createdEvent.id,
        eventLink: createdEvent.htmlLink,
        attendeesUpdated,
      };
    } catch (createError) {
      return {
        success: false,
        error: createError instanceof Error ? createError.message : 'Failed to create calendar event',
        attendeesUpdated: 0,
      };
    }
    
  } catch (error) {
    console.error('[AppointmentCalendarService] Error creating calendar event:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      attendeesUpdated: 0,
    };
  }
}

/**
 * Build event parameters from appointment data
 * 
 * LEARNING: Transforms appointment model to Google Calendar event format
 */
function buildEventParams(appointment: AppointmentWithDetails, calendarId: string): CreateEventParams {
  // Build event summary (title)
  const summary = buildEventSummary(appointment);
  
  // Build location from address
  const location = buildEventLocation(appointment);
  
  // Build description
  const description = buildEventDescription(appointment);
  
  // Calculate start and end times
  const { start, end } = calculateEventTimes(appointment);
  
  // Build attendees list
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

/**
 * Build event summary (title)
 */
function buildEventSummary(appointment: AppointmentWithDetails): string {
  const address = appointment.propertyVersion?.address;
  
  if (address) {
    return `Inspection: ${address.streetAddress}`;
  }
  
  return `Inspection Appointment`;
}

/**
 * Build event location string
 */
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

/**
 * Build event description
 */
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
 * Calculate event start and end times
 * 
 * LEARNING: Extracts RFC3339 times from selectedTimeSlots
 * WHY: Google Calendar API expects ISO 8601 datetime strings
 * PATTERN: Explicit failure over silent fallback - missing data should fail loudly
 * 
 * SESSION: 2.1.3b - Removed legacy fallback; now requires proper RFC3339 format
 */
function calculateEventTimes(appointment: AppointmentWithDetails): { start: string; end: string } {
  const firstSlot = appointment.selectedTimeSlots?.[0];
  
  // PATTERN: Explicit failure - require proper time slot data
  if (!firstSlot) {
    console.error(`[AppointmentCalendarService] No time slots found for appointment ${appointment.id}`);
    console.error(`[AppointmentCalendarService] selectedTimeSlots:`, JSON.stringify(appointment.selectedTimeSlots));
    throw new Error(`Appointment ${appointment.id} has no selectedTimeSlots - cannot create calendar event`);
  }
  
  if (!firstSlot.startTime || !firstSlot.endTime) {
    console.error(`[AppointmentCalendarService] Time slot missing startTime/endTime for appointment ${appointment.id}`);
    console.error(`[AppointmentCalendarService] firstSlot:`, JSON.stringify(firstSlot));
    throw new Error(
      `Appointment ${appointment.id} time slot missing required fields. ` +
      `Got: startTime=${firstSlot.startTime}, endTime=${firstSlot.endTime}. ` +
      `Expected RFC3339 format (e.g., "2026-02-01T14:30:00.000Z")`
    );
  }
  
  console.log(`[AppointmentCalendarService] Using RFC3339 format: start=${firstSlot.startTime}, end=${firstSlot.endTime}`);
  
  // Validate the dates
  const startDate = new Date(firstSlot.startTime);
  const endDate = new Date(firstSlot.endTime);
  
  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    console.error(`[AppointmentCalendarService] Invalid RFC3339 dates: start=${firstSlot.startTime}, end=${firstSlot.endTime}`);
    throw new Error(`Invalid dates: ${firstSlot.startTime} / ${firstSlot.endTime}`);
  }
  
  return {
    start: startDate.toISOString(),
    end: endDate.toISOString(),
  };
}

/**
 * Build attendees list for calendar event
 * 
 * LEARNING: Filters attendees who should receive invitations
 * WHY: Some attendees may not need calendar invites (e.g., internal tracking only)
 */
function buildAttendeesList(appointment: AppointmentWithDetails): EventAttendee[] {
  const attendees: EventAttendee[] = [];
  
  if (!appointment.attendees) {
    return attendees;
  }
  
  for (const attendee of appointment.attendees) {
    // Skip if shouldn't receive invitation
    if (!attendee.shouldReceiveInvitation) {
      continue;
    }
    
    // Skip if no user or email
    if (!attendee.user?.email) {
      console.warn(`[AppointmentCalendarService] Attendee ${attendee.id} has no email, skipping`);
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

/**
 * Check if OAuth is configured for calendar operations
 * 
 * LEARNING: Pre-check before attempting calendar operations
 * WHY: Provides clear error messages when OAuth not set up
 */
export async function isCalendarConfigured(): Promise<boolean> {
  // Check if we have the required environment variables
  const hasClientId = !!process.env.GOOGLE_CLIENT_ID;
  const hasClientSecret = !!process.env.GOOGLE_CLIENT_SECRET;
  
  return hasClientId && hasClientSecret;
}

/**
 * Sync invitation status from Google Calendar
 * 
 * LEARNING: Updates local records based on Google Calendar response status
 * WHY: Attendees may accept/decline invitations outside our system
 * 
 * @param appointmentId - The appointment to sync
 * @returns Number of records updated
 */
export async function syncInvitationStatus(appointmentId: string): Promise<number> {
  // TODO: Implement status sync from Google Calendar
  // This would query the calendar event and update invitation_status
  // based on each attendee's responseStatus (needsAction, accepted, declined, tentative)
  console.log(`[AppointmentCalendarService] Status sync not yet implemented for ${appointmentId}`);
  return 0;
}
