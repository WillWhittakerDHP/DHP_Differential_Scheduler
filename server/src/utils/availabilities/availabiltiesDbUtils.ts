/**
 * Availability Database Utilities
 * 
 * ============================================================================
 * ASYNCHRONOUS APPOINTMENT CREATION WORKFLOW SUPPORT
 * ============================================================================
 * 
 * These functions support asynchronous appointment creation workflows where
 * appointments exist in the database with 'submitted' or 'confirmed' status
 * before being synced to Google Calendar. This ensures capacity limits are
 * enforced even when appointments haven't yet appeared in free-busy calendar data.
 * 
 * APPOINTMENT STATUS WORKFLOW:
 * - 'started': Non-quote mode appointment creation in progress (NOT COUNTED)
 * - 'held': Time slots held for clients who paid booking fee (NOT COUNTED)
 * - 'rescheduling': Non-quote mode rescheduling in progress (NOT COUNTED)
 * - 'quoted': Quote mode appointment creation in progress (NOT COUNTED)
 * - 'submitted': Submitted through app, awaiting confirmation (COUNTED)
 * - 'confirmed': Submitted and confirmed (COUNTED)
 * - 'cancelled': Soft-delete, still reschedulable (NOT COUNTED)
 * - 'deleted': Hard-delete (NOT COUNTED)
 * 
 * See: client/src/types/appointment.ts for AppointmentStatus union type definition
 * 
 * SEPARATION OF CONCERNS:
 * - Free-busy checking: Uses Google Calendar API to check external calendar events
 * - Capacity checking: Uses database appointments (these functions) to check internal workflow state
 * 
 * WHY BOTH ARE NEEDED:
 * - Free-busy blocks slots based on calendar events (external, already synced)
 * - Capacity blocks slots based on database appointments (internal, including pending/confirmed but not-yet-synced)
 * 
 * STATUS FILTER LOGIC:
 * All functions in this file query database appointments directly (not calendar events)
 * and only count appointments with status 'submitted' or 'confirmed'. This ensures
 * capacity limits are enforced during the asynchronous workflow period before
 * Google Calendar sync.
 * 
 * ============================================================================
 */

import { createLogger } from '../logger.js';

const logger = createLogger('AvailabilitiesDbUtils');

/**
 * Helper Function: Sum Work Hours for Day
 * LEARNING: Calculates total scheduled work hours for a specific date
 * WHY: Used to enforce maximum work hours per day limit
 * PATTERN: Query appointments for the date and sum durations from selectedTimeSlots
 * 
 * ASYNCHRONOUS WORKFLOW SUPPORT:
 * - Queries database appointments directly (not Google Calendar events)
 * - Only counts appointments with status 'submitted' or 'confirmed'
 * - Supports asynchronous workflow where appointments exist in DB before calendar sync
 * - See: client/src/types/appointment.ts for AppointmentStatus union type definition
 * 
 * IMPLEMENTED: Database-backed work hours calculation
 * ============================================================================
 * Queries scheduled appointments for the specific date and sums durations:
 * 1. Filters appointments by selectedDate matching the date (DATEONLY comparison)
 * 2. Only counts appointments with status 'submitted' or 'confirmed' (line 30)
 * 3. Extracts durations from selectedTimeSlots array
 * 4. Sums all durations and converts minutes to hours
 * 
 * Returns 0 on error or if no appointments found (safe default)
 * ============================================================================
 */
export async function sumWorkHoursForDay(date: Date): Promise<number> {
  try {
    const { Appointment } = await import('../../db/models/booking/appointment.js');
    
    const dateOnly = date.toISOString().split('T')[0];
    
    // PATTERN: Filter by status to only include appointments that should count toward capacity
    const appointments = await Appointment.findAll({
      where: {
        selectedDate: dateOnly,
        status: ['submitted', 'confirmed']
      }
    });
    
    let totalMinutes = 0;
    for (const appointment of appointments) {
      if (appointment.selectedTimeSlots && Array.isArray(appointment.selectedTimeSlots)) {
        for (const slot of appointment.selectedTimeSlots) {
          if (slot.duration && typeof slot.duration === 'number') {
            totalMinutes += slot.duration;
          }
        }
      }
    }
    
    const totalHours = totalMinutes / 60;
    
    return totalHours;
  } catch (error) {
    // PATTERN: Log error with context, return safe default
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error(`Failed to sum work hours for date ${date.toISOString()}:`, errorMessage);
    
    return 0;
  }
}

/**
 * Helper Function: Sum Work Hours for Date Range
 * LEARNING: Calculates total scheduled work hours for a date range (inclusive)
 * WHY: Used for calendar week and rolling week capacity calculations
 * PATTERN: Query appointments in date range and sum durations from selectedTimeSlots
 * 
 * ASYNCHRONOUS WORKFLOW SUPPORT:
 * - Queries database appointments directly (not Google Calendar events)
 * - Only counts appointments with status 'submitted' or 'confirmed' (line 88)
 * - Supports asynchronous workflow where appointments exist in DB before calendar sync
 * - See: client/src/types/appointment.ts for AppointmentStatus union type definition
 * 
 * @param startDate - Start date of range (inclusive)
 * @param endDate - End date of range (inclusive)
 * @returns Total work hours in the date range
 */
export async function sumWorkHoursForDateRange(startDate: Date, endDate: Date): Promise<number> {
  try {
    const { Appointment } = await import('../../db/models/booking/appointment.js');
    const { Op } = await import('sequelize');
    
    const startDateOnly = startDate.toISOString().split('T')[0];
    const endDateOnly = endDate.toISOString().split('T')[0];
    
    const appointments = await Appointment.findAll({
      where: {
        selectedDate: {
          [Op.between]: [startDateOnly, endDateOnly]
        },
        status: ['submitted', 'confirmed']
      }
    });
    
    let totalMinutes = 0;
    for (const appointment of appointments) {
      if (appointment.selectedTimeSlots && Array.isArray(appointment.selectedTimeSlots)) {
        for (const slot of appointment.selectedTimeSlots) {
          if (slot.duration && typeof slot.duration === 'number') {
            totalMinutes += slot.duration;
          }
        }
      }
    }
    
    const totalHours = totalMinutes / 60;
    
    return totalHours;
  } catch (error) {
    // PATTERN: Log error with context, return safe default
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error(`Failed to sum work hours for date range ${startDate.toISOString()} to ${endDate.toISOString()}:`, errorMessage);
    
    return 0;
  }
}

/**
 * Helper Function: Sum Work Hours for Calendar Week
 * LEARNING: Calculates total scheduled work hours for the calendar week (Monday-Sunday) containing the date
 * WHY: Used for calendar week capacity filter
 * PATTERN: Calculate Monday and Sunday of the week, then query date range
 * 
 * ASYNCHRONOUS WORKFLOW SUPPORT:
 * - Delegates to sumWorkHoursForDateRange which queries database appointments (not Google Calendar events)
 * - Only counts appointments with status 'submitted' or 'confirmed'
 * - Supports asynchronous workflow where appointments exist in DB before calendar sync
 * - See: client/src/types/appointment.ts for AppointmentStatus union type definition
 * 
 * @param date - Date within the calendar week
 * @returns Total work hours in the calendar week (Monday-Sunday)
 */
export async function sumWorkHoursForCalendarWeek(date: Date): Promise<number> {
  try {
    // LEARNING: Use UTC methods for all date calculations
    // WHY: Ensures consistent behavior regardless of server timezone
    const dayOfWeek = date.getUTCDay();
    
    const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    
    const monday = new Date(Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate() - daysFromMonday,
      0, 0, 0, 0
    ));
    
    const sunday = new Date(Date.UTC(
      monday.getUTCFullYear(),
      monday.getUTCMonth(),
      monday.getUTCDate() + 6,
      23, 59, 59, 999
    ));
    
    return await sumWorkHoursForDateRange(monday, sunday);
  } catch (error) {
    // PATTERN: Log error with context, return safe default
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error(`Failed to sum work hours for calendar week containing ${date.toISOString()}:`, errorMessage);
    
    return 0;
  }
}

export type RollingWeekDirection = 'past' | 'centered' | 'future'

/**
 * Helper Function: Sum Work Hours for Rolling Week
 * LEARNING: Calculates total scheduled work hours for a rolling 7-day window based on direction
 * WHY: Used for rolling week capacity filter with configurable direction
 * PATTERN: Calculate date range based on direction, then query date range
 * 
 * ASYNCHRONOUS WORKFLOW SUPPORT:
 * - Delegates to sumWorkHoursForDateRange which queries database appointments (not Google Calendar events)
 * - Only counts appointments with status 'submitted' or 'confirmed'
 * - Supports asynchronous workflow where appointments exist in DB before calendar sync
 * - See: client/src/types/appointment.ts for AppointmentStatus union type definition
 * 
 * @param date - Reference date for rolling week calculation
 * @param direction - Direction of rolling week ('past', 'centered', or 'future')
 * @returns Total work hours in the rolling 7-day window
 */
export async function sumWorkHoursForRollingWeek(date: Date, direction: RollingWeekDirection): Promise<number> {
  try {
    // LEARNING: Use UTC methods for all date calculations
    // WHY: Ensures consistent behavior regardless of server timezone
    let startDate: Date;
    let endDate: Date;
    
    const referenceDateUTC = new Date(Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate(),
      0, 0, 0, 0
    ));
    
    switch (direction) {
      case 'past':
        endDate = new Date(Date.UTC(
          referenceDateUTC.getUTCFullYear(),
          referenceDateUTC.getUTCMonth(),
          referenceDateUTC.getUTCDate(),
          23, 59, 59, 999
        ));
        startDate = new Date(Date.UTC(
          referenceDateUTC.getUTCFullYear(),
          referenceDateUTC.getUTCMonth(),
          referenceDateUTC.getUTCDate() - 6,
          0, 0, 0, 0
        ));
        break;
        
      case 'centered':
        startDate = new Date(Date.UTC(
          referenceDateUTC.getUTCFullYear(),
          referenceDateUTC.getUTCMonth(),
          referenceDateUTC.getUTCDate() - 3,
          0, 0, 0, 0
        ));
        endDate = new Date(Date.UTC(
          referenceDateUTC.getUTCFullYear(),
          referenceDateUTC.getUTCMonth(),
          referenceDateUTC.getUTCDate() + 3,
          23, 59, 59, 999
        ));
        break;
        
      case 'future':
        startDate = new Date(Date.UTC(
          referenceDateUTC.getUTCFullYear(),
          referenceDateUTC.getUTCMonth(),
          referenceDateUTC.getUTCDate(),
          0, 0, 0, 0
        ));
        endDate = new Date(Date.UTC(
          referenceDateUTC.getUTCFullYear(),
          referenceDateUTC.getUTCMonth(),
          referenceDateUTC.getUTCDate() + 6,
          23, 59, 59, 999
        ));
        break;
        
      default:
        logger.warn(`Invalid rolling week direction: ${direction}, defaulting to 'past'`);
        endDate = new Date(Date.UTC(
          referenceDateUTC.getUTCFullYear(),
          referenceDateUTC.getUTCMonth(),
          referenceDateUTC.getUTCDate(),
          23, 59, 59, 999
        ));
        startDate = new Date(Date.UTC(
          referenceDateUTC.getUTCFullYear(),
          referenceDateUTC.getUTCMonth(),
          referenceDateUTC.getUTCDate() - 6,
          0, 0, 0, 0
        ));
    }
    
    return await sumWorkHoursForDateRange(startDate, endDate);
  } catch (error) {
    // PATTERN: Log error with context, return safe default
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error(`Failed to sum work hours for rolling week (${direction}) containing ${date.toISOString()}:`, errorMessage);
    
    return 0;
  }
}

