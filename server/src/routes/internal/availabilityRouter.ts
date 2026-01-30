import { Router, Request, Response } from 'express';
import {
  sumWorkHoursForDay,
  sumWorkHoursForDateRange,
  sumWorkHoursForCalendarWeek,
  sumWorkHoursForRollingWeek,
  type RollingWeekDirection
} from "../../utils/availabilities/availabiltiesDbUtils.js";

const router = Router();

/**
 * GET /availability/scheduled-hours
 * Get scheduled work hours for a date or date range
 * 
 * LEARNING: API endpoint for capacity checking - returns scheduled hours for capacity filters
 * WHY: Allows client-side filtering to check if capacity limits would be exceeded
 * PATTERN: GET endpoint with query parameters for date range or specific date
 * 
 * ============================================================================
 * ASYNCHRONOUS APPOINTMENT CREATION WORKFLOW SUPPORT
 * ============================================================================
 * 
 * This endpoint supports asynchronous appointment creation workflows where appointments
 * exist in the database with 'submitted' or 'confirmed' status before being synced to
 * Google Calendar. This ensures capacity limits are enforced even when appointments
 * haven't yet appeared in free-busy calendar data.
 * 
 * APPOINTMENT STATUS WORKFLOW:
 * - 'started': Non-quote mode appointment creation in progress (not counted)
 * - 'submitted': Submitted through app, awaiting confirmation (COUNTED)
 * - 'confirmed': Submitted and confirmed (COUNTED)
 * 
 * See: client/src/types/appointment.ts for AppointmentStatus union type definition
 * 
 * SEPARATION OF CONCERNS:
 * - Free-busy checking: Uses Google Calendar API to check external calendar events
 * - Capacity checking: Uses database appointments (this endpoint) to check internal workflow state
 * 
 * WHY BOTH ARE NEEDED:
 * - Free-busy blocks slots based on calendar events (external, already synced)
 * - Capacity blocks slots based on database appointments (internal, including pending/confirmed but not-yet-synced)
 * 
 * This endpoint queries database appointments directly (not calendar events) and only
 * counts appointments with status 'submitted' or 'confirmed'. This ensures capacity
 * limits are enforced during the asynchronous workflow period before Google Calendar sync.
 * 
 * Query parameters:
 * - date: YYYY-MM-DD format for single date (returns hours for that day)
 * - startDate: YYYY-MM-DD format for date range start
 * - endDate: YYYY-MM-DD format for date range end
 * - calendarWeek: YYYY-MM-DD format - returns hours for the Monday-Sunday week containing this date
 * - rollingWeek: YYYY-MM-DD format - returns hours for rolling 7-day window
 * - direction: 'past' | 'centered' | 'future' (required if rollingWeek is provided)
 */
router.get('/scheduled-hours', async (req: Request, res: Response): Promise<void> => {
  try {
    const { date, startDate, endDate, calendarWeek, rollingWeek, direction } = req.query;

    // Validate that exactly one query type is provided
    const queryTypes = [date, (startDate && endDate), calendarWeek, rollingWeek].filter(Boolean);
    if (queryTypes.length !== 1) {
      res.status(400).json({ 
        error: "Exactly one query type required: 'date', 'startDate+endDate', 'calendarWeek', or 'rollingWeek'" 
      });
      return;
    }

    let hours: number;

    if (date) {
      // Single date query
      // LEARNING: sumWorkHoursForDay queries database appointments with status 'submitted' or 'confirmed'
      // WHY: Supports asynchronous appointment workflow where appointments exist in DB before calendar sync
      const dateObj = new Date(date as string);
      if (isNaN(dateObj.getTime())) {
        res.status(400).json({ error: "Invalid date format. Use YYYY-MM-DD." });
        return;
      }
      hours = await sumWorkHoursForDay(dateObj);
    } else if (startDate && endDate) {
      // Date range query
      // LEARNING: sumWorkHoursForDateRange queries database appointments with status 'submitted' or 'confirmed'
      // WHY: Supports asynchronous appointment workflow where appointments exist in DB before calendar sync
      const startDateObj = new Date(startDate as string);
      const endDateObj = new Date(endDate as string);
      if (isNaN(startDateObj.getTime()) || isNaN(endDateObj.getTime())) {
        res.status(400).json({ error: "Invalid date format. Use YYYY-MM-DD." });
        return;
      }
      if (startDateObj > endDateObj) {
        res.status(400).json({ error: "startDate must be before or equal to endDate." });
        return;
      }
      hours = await sumWorkHoursForDateRange(startDateObj, endDateObj);
    } else if (calendarWeek) {
      // Calendar week query (Monday-Sunday)
      const dateObj = new Date(calendarWeek as string);
      if (isNaN(dateObj.getTime())) {
        res.status(400).json({ error: "Invalid date format. Use YYYY-MM-DD." });
        return;
      }
      hours = await sumWorkHoursForCalendarWeek(dateObj);
    } else if (rollingWeek) {
      // Rolling week query
      // LEARNING: sumWorkHoursForRollingWeek queries database appointments with status 'submitted' or 'confirmed'
      // WHY: Supports asynchronous appointment workflow where appointments exist in DB before calendar sync
      if (!direction) {
        res.status(400).json({ error: "direction parameter required for rollingWeek query. Use 'past', 'centered', or 'future'." });
        return;
      }
      if (!['past', 'centered', 'future'].includes(direction as string)) {
        res.status(400).json({ error: "Invalid direction. Must be 'past', 'centered', or 'future'." });
        return;
      }
      const dateObj = new Date(rollingWeek as string);
      if (isNaN(dateObj.getTime())) {
        res.status(400).json({ error: "Invalid date format. Use YYYY-MM-DD." });
        return;
      }
      hours = await sumWorkHoursForRollingWeek(dateObj, direction as RollingWeekDirection);
    } else {
      // This should never happen due to validation above, but TypeScript needs it
      res.status(400).json({ error: "Invalid query parameters." });
      return;
    }

    res.status(200).json({ hours });
  } catch (error) {
    console.error("Error in /availability/scheduled-hours route:", error);
    res.status(500).json({ 
      error: "Failed to fetch scheduled hours.",
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export { router as AvailabilityRouter };