import { Op } from 'sequelize';
import { createLogger } from '../logger.js';
import { STATUSES_REQUIRING_CALENDAR_EVENT } from '../../routes/internal/appointments/appointmentConstants.js';
import { Appointment, AppointmentFeeSummary } from '../../config/app.js';
import type { RollingWeekDirection } from '../../../../shared/types/availabilityTypes.js';
import { getCalendarWeekRange, getRollingWeekRange } from './availabilitiesDbSums.js';

const logger = createLogger('AvailabilitiesDbIncome');

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
