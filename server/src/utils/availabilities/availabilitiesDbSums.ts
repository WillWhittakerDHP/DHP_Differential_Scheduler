import { Op } from 'sequelize';
import { createLogger } from '../logger.js';
import { STATUSES_REQUIRING_CALENDAR_EVENT } from '../../routes/internal/appointments/appointmentConstants.js';
import { Appointment, AppointmentTimeSlot } from '../../config/app.js';
import type { RollingWeekDirection } from '../../../../shared/types/availabilityTypes.js';
import { ROLLING_WEEK_DIRECTION } from './availabilityConstants.js';

const logger = createLogger('AvailabilitiesDbUtils');

const APPOINTMENT_TIME_SLOTS_INCLUDE = [
  { model: AppointmentTimeSlot, as: 'timeSlots' as const, required: false },
];

function whereSelectedDateBetweenInclusive(startDateOnly: string, endDateOnly: string) {
  return {
    selectedDate: { [Op.between]: [startDateOnly, endDateOnly] },
    status: [...STATUSES_REQUIRING_CALENDAR_EVENT],
  };
}

function sumDurationsFromAppointments(
  appointments: Array<{ timeSlots?: Array<{ durationMinutes?: number | null }> }>
): number {
  return appointments.reduce(
    (total, apt) =>
      total +
      (Array.isArray(apt.timeSlots) ? apt.timeSlots : []).reduce(
        (slotSum, row) =>
          slotSum + (typeof row.durationMinutes === 'number' ? row.durationMinutes : 0),
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
 * 3. Extracts durations from appointment_time_slots rows (via `timeSlots` include)
 * 4. Sums all durations and converts minutes to hours
 * 
 * Returns 0 on error or if no appointments found (safe default)
 * ============================================================================
 */
export async function sumWorkHoursForDay(date: Date): Promise<number> {
  try {
    const dateOnly = date.toISOString().split('T')[0];
    
    // PATTERN: Filter by status to only include appointments that should count toward capacity
    const appointments = await Appointment.findAll({
      where: {
        selectedDate: dateOnly,
        status: [...STATUSES_REQUIRING_CALENDAR_EVENT],
      },
      include: [{ model: AppointmentTimeSlot, as: 'timeSlots', required: false }],
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
    const startDateOnly = startDate.toISOString().split('T')[0];
    const endDateOnly = endDate.toISOString().split('T')[0];
    const appointments = await Appointment.findAll({
      where: whereSelectedDateBetweenInclusive(startDateOnly, endDateOnly),
      include: APPOINTMENT_TIME_SLOTS_INCLUDE,
    });
    return sumDurationsFromAppointments(appointments) / 60;
  } catch (error) {
    logger.error(error)
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error(`Failed to sum work hours for date range ${startDate.toISOString()} to ${endDate.toISOString()}:`, errorMessage);
    
    return 0;
  }
}

export function getCalendarWeekRange(date: Date): { start: Date; end: Date } {
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


export function getRollingWeekRange(
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
