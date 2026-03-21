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
import { STATUSES_REQUIRING_CALENDAR_EVENT } from '../../routes/internal/appointments/appointmentConstants.js';
import { Appointment, AppointmentFeeSummary } from '../../config/app.js';

const logger = createLogger('AvailabilitiesDbUtils');

function sumDurationsFromAppointments(
  appointments: Array<{ selectedTimeSlots?: Array<{ duration?: number } | Record<string, unknown>> | null }>
): number {
  return appointments.reduce(
    (total, apt) =>
      total +
      (Array.isArray(apt.selectedTimeSlots) ? apt.selectedTimeSlots : []).reduce(
        (slotSum, slot) =>
          slotSum + (typeof (slot as { duration?: number }).duration === 'number' ? (slot as { duration: number }).duration : 0),
        0
      ),
    0
  );
}

/**
 * Helper Function: Sum Work Hours for Day
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
        status: [...STATUSES_REQUIRING_CALENDAR_EVENT],
      },
    });

    const totalMinutes = sumDurationsFromAppointments(appointments);
    const totalHours = totalMinutes / 60;
    
    return totalHours;
  } catch (error) {
    logger.error(error)
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error(`Failed to sum work hours for date ${date.toISOString()}:`, errorMessage);
    
    return 0;
  }
}

/**
 * Helper Function: Sum Work Hours for Date Range
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
async function sumWorkHoursForDateRange(startDate: Date, endDate: Date): Promise<number> {
  try {
    const { Appointment } = await import('../../db/models/booking/appointment.js');
    const { Op } = await import('sequelize');
    
    const startDateOnly = startDate.toISOString().split('T')[0];
    const endDateOnly = endDate.toISOString().split('T')[0];
    
    const appointments = await Appointment.findAll({
      where: {
        selectedDate: {
          [Op.between]: [startDateOnly, endDateOnly],
        },
        status: [...STATUSES_REQUIRING_CALENDAR_EVENT],
      },
    });

    const totalMinutes = sumDurationsFromAppointments(appointments);
    const totalHours = totalMinutes / 60;
    
    return totalHours;
  } catch (error) {
    logger.error(error)
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error(`Failed to sum work hours for date range ${startDate.toISOString()} to ${endDate.toISOString()}:`, errorMessage);
    
    return 0;
  }
}

function getCalendarWeekRange(date: Date): { start: Date; end: Date } {
  const dayOfWeek = date.getUTCDay();
  const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  const monday = new Date(
    Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate() - daysFromMonday,
      0,
      0,
      0,
      0
    )
  );
  const sunday = new Date(
    Date.UTC(
      monday.getUTCFullYear(),
      monday.getUTCMonth(),
      monday.getUTCDate() + 6,
      23,
      59,
      59,
      999
    )
  );
  return { start: monday, end: sunday };
}

/**
 * Helper Function: Sum Work Hours for Calendar Week
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
    const { start, end } = getCalendarWeekRange(date);
    return await sumWorkHoursForDateRange(start, end);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error(
      `Failed to sum work hours for calendar week containing ${date.toISOString()}:`,
      errorMessage
    );
    return 0;
  }
}

import type { RollingWeekDirection } from '../../../../shared/types/availabilityTypes.js'
import { ROLLING_WEEK_DIRECTION } from './availabilityConstants.js'

function getRollingWeekRange(
  date: Date,
  direction: RollingWeekDirection
): { start: Date; end: Date } {
  const y = date.getUTCFullYear();
  const m = date.getUTCMonth();
  const d = date.getUTCDate();

  switch (direction) {
    case ROLLING_WEEK_DIRECTION.PAST:
      return {
        start: new Date(Date.UTC(y, m, d - 6, 0, 0, 0, 0)),
        end: new Date(Date.UTC(y, m, d, 23, 59, 59, 999)),
      };
    case ROLLING_WEEK_DIRECTION.CENTERED:
      return {
        start: new Date(Date.UTC(y, m, d - 3, 0, 0, 0, 0)),
        end: new Date(Date.UTC(y, m, d + 3, 23, 59, 59, 999)),
      };
    case ROLLING_WEEK_DIRECTION.FUTURE:
      return {
        start: new Date(Date.UTC(y, m, d, 0, 0, 0, 0)),
        end: new Date(Date.UTC(y, m, d + 6, 23, 59, 59, 999)),
      };
    default:
      logger.warn(`Invalid rolling week direction: ${direction}, defaulting to ${ROLLING_WEEK_DIRECTION.PAST}`);
      return {
        start: new Date(Date.UTC(y, m, d - 6, 0, 0, 0, 0)),
        end: new Date(Date.UTC(y, m, d, 23, 59, 59, 999)),
      };
  }
}

/**
 * Helper Function: Sum Work Hours for Rolling Week
 *
 * ASYNCHRONOUS WORKFLOW SUPPORT:
 * - Delegates to sumWorkHoursForDateRange which queries database appointments (not Google Calendar events)
 * - Only counts appointments with status 'submitted' or 'confirmed'
 * - Supports asynchronous workflow where appointments exist in DB before calendar sync
 * - See: client/src/types/appointment.ts for AppointmentStatus union type definition
 *
 * @param date - Reference date for rolling week calculation
 * @param direction - Direction of rolling week (see ROLLING_WEEK_DIRECTION)
 * @returns Total work hours in the rolling 7-day window
 */
export async function sumWorkHoursForRollingWeek(
  date: Date,
  direction: RollingWeekDirection
): Promise<number> {
  try {
    const { start, end } = getRollingWeekRange(date, direction);
    return await sumWorkHoursForDateRange(start, end);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error(
      `Failed to sum work hours for rolling week (${direction}) containing ${date.toISOString()}:`,
      errorMessage
    );
    return 0;
  }
}

/**
 * Sum income (total_fee) from appointment_fee_summaries for a given date.
 */
export async function sumIncomeForDay(date: Date): Promise<number> {
  try {
    const dateOnly = date.toISOString().split('T')[0];
    const appointments = await Appointment.findAll({
      where: {
        selectedDate: dateOnly,
        status: [...STATUSES_REQUIRING_CALENDAR_EVENT],
      },
      include: [{ model: AppointmentFeeSummary, as: 'feeSummary', required: false, attributes: ['totalFee'] }],
    });
    const total = appointments.reduce(
      (sum, a) => sum + (Number((a as { feeSummary?: { totalFee: number } }).feeSummary?.totalFee) || 0),
      0
    );
    return total;
  } catch (error) {
    logger.error(error)
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error(`Failed to sum income for date ${date.toISOString()}:`, errorMessage);
    return 0;
  }
}

/**
 * Sum income for a date range (inclusive).
 */
async function sumIncomeForDateRange(startDate: Date, endDate: Date): Promise<number> {
  try {
    const { Op } = await import('sequelize');
    const startDateOnly = startDate.toISOString().split('T')[0];
    const endDateOnly = endDate.toISOString().split('T')[0];
    const appointments = await Appointment.findAll({
      where: {
        selectedDate: { [Op.between]: [startDateOnly, endDateOnly] },
        status: [...STATUSES_REQUIRING_CALENDAR_EVENT],
      },
      include: [{ model: AppointmentFeeSummary, as: 'feeSummary', required: false, attributes: ['totalFee'] }],
    });
    const total = appointments.reduce(
      (sum, a) => sum + (Number((a as { feeSummary?: { totalFee: number } }).feeSummary?.totalFee) || 0),
      0
    );
    return total;
  } catch (error) {
    logger.error(error)
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error(`Failed to sum income for date range ${startDate.toISOString()} to ${endDate.toISOString()}:`, errorMessage);
    return 0;
  }
}

export async function sumIncomeForCalendarWeek(date: Date): Promise<number> {
  try {
    const { start, end } = getCalendarWeekRange(date);
    return await sumIncomeForDateRange(start, end);
  } catch (error) {
    logger.error(error)
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error(`Failed to sum income for calendar week containing ${date.toISOString()}:`, errorMessage);
    return 0;
  }
}

export async function sumIncomeForRollingWeek(date: Date, direction: RollingWeekDirection): Promise<number> {
  try {
    const { start, end } = getRollingWeekRange(date, direction);
    return await sumIncomeForDateRange(start, end);
  } catch (error) {
    logger.error(error)
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error(`Failed to sum income for rolling week (${direction}) containing ${date.toISOString()}:`, errorMessage);
    return 0;
  }
}
