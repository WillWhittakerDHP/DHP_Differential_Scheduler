import { Router, Request, Response } from 'express';
import {
  sumWorkHoursForDay,
  sumWorkHoursForDateRange,
  sumWorkHoursForCalendarWeek,
  sumWorkHoursForRollingWeek,
  type RollingWeekDirection
} from "../../utils/availabilities/availabiltiesDbUtils.js";

const router = Router();

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
      const dateObj = new Date(date as string);
      if (isNaN(dateObj.getTime())) {
        res.status(400).json({ error: "Invalid date format. Use YYYY-MM-DD." });
        return;
      }
      hours = await sumWorkHoursForDay(dateObj);
    } else if (startDate && endDate) {
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
      const dateObj = new Date(calendarWeek as string);
      if (isNaN(dateObj.getTime())) {
        res.status(400).json({ error: "Invalid date format. Use YYYY-MM-DD." });
        return;
      }
      hours = await sumWorkHoursForCalendarWeek(dateObj);
    } else if (rollingWeek) {
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