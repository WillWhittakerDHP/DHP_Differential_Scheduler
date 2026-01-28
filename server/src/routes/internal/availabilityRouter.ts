import { Router, Request, Response } from 'express';
import { makeAvailabilities } from "../../utils/availabilities/makeAvailabilties.js";
import { BusinessSettings } from "../../config/app.js";
import type { AvailabilitySettingsData } from "../../db/models/admin/business_settings.js";
import {
  sumWorkHoursForDay,
  sumWorkHoursForDateRange,
  sumWorkHoursForCalendarWeek,
  sumWorkHoursForRollingWeek,
  type RollingWeekDirection
} from "../../utils/availabilities/availabiltiesDbUtils.js";

const router = Router();

/**
 * POST /availability
 * Get available time slots for a date range
 * LEARNING: Availability API endpoint that calculates time slots from calendar data
 * WHY: Provides available appointment times based on service configuration and calendar availability
 * PATTERN: POST endpoint that accepts date range and service info, returns time slots
 */
router.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { serviceId, dateRange, duration, timezone } = req.body;

    // Validate required fields
    if (!serviceId) {
      res.status(400).json({ error: "serviceId is required." });
      return;
    }

    if (!dateRange || !dateRange.start || !dateRange.end) {
      res.status(400).json({ error: "dateRange with start and end is required." });
      return;
    }

    if (!duration || typeof duration !== 'number') {
      res.status(400).json({ error: "duration (number) is required." });
      return;
    }

    // Mock free/busy calendar data for now
    // TODO: Replace with real calendar API integration
    const freeBusyResponse = {
      calendars: {
        primary: {
          busy: [
            // Example: No busy periods for now - all times available
            // In real implementation, this would come from Google Calendar API
          ]
        }
      }
    };

    // Load availability settings from database
    // LEARNING: Fetches admin-configurable settings from business_settings table
    // WHY: Replaces hardcoded settings with database-backed configuration
    const availabilitySettingsRecord = await BusinessSettings.findOne({
      where: { settingKey: 'availability_settings' },
    });

    // Default settings if none exist in database
    const defaultSettings: AvailabilitySettingsData = {
      businessHours: {
        0: { start: "09:00", end: "19:00" }, // Sunday
        1: { start: "09:00", end: "19:00" }, // Monday
        2: { start: "09:00", end: "19:00" }, // Tuesday
        3: { start: "09:00", end: "19:00" }, // Wednesday
        4: { start: "09:00", end: "19:00" }, // Thursday
        5: { start: "09:00", end: "19:00" }, // Friday
        6: { start: "09:00", end: "19:00" }, // Saturday
      },
      minuteIncrement: 15,
      rangeConstraints: {
        businessHours: {
          type: 'businessHours',
          enforcement: 'hard',
          config: {
            hours: {
              0: { start: "09:00", end: "19:00" }, // Sunday
              1: { start: "09:00", end: "19:00" }, // Monday
              2: { start: "09:00", end: "19:00" }, // Tuesday
              3: { start: "09:00", end: "19:00" }, // Wednesday
              4: { start: "09:00", end: "19:00" }, // Thursday
              5: { start: "09:00", end: "19:00" }, // Friday
              6: { start: "09:00", end: "19:00" }, // Saturday
            }
          }
        },
        leadTime: {
          type: 'leadTime',
          enforcement: 'hard',
          config: {
            minutes: 60 // 1 hour lead time
          }
        }
      }
    };

    const availabilitySettings = availabilitySettingsRecord?.settingValue || defaultSettings;

    // Use configured timezone - no fallbacks
    // Timezone must be explicitly configured by admin
    const targetTimezone = availabilitySettings.timezone || timezone;

    // Transform AvailabilitySettings to adminSettings format expected by makeAvailabilities
    // LEARNING: Maps businessHours to freeHours and derives workHours/permissibleStartRule
    // WHY: makeAvailabilities expects different structure than AvailabilitySettings
    const minuteIncrement = availabilitySettings.minuteIncrement;
    const permissibleStartRule = `every :${minuteIncrement}`; // e.g., "every :15" for 15-minute increments

    // Calculate workHours from maxWorkHours.day.maxHours or businessHours max
    const workHours = availabilitySettings.maxWorkHours?.day?.maxHours !== undefined
      ? availabilitySettings.maxWorkHours.day.maxHours
      : Math.max(
          ...Object.values(availabilitySettings.businessHours).map(day => {
            const [startHour, startMin] = day.start.split(':').map(Number);
            const [endHour, endMin] = day.end.split(':').map(Number);
            const startMinutes = startHour * 60 + startMin;
            const endMinutes = endHour * 60 + endMin;
            return (endMinutes - startMinutes) / 60;
          })
        );

    // LEARNING: Extract leadTime from rangeConstraints.leadTime
    // WHY: leadTime moved from buffers to rangeConstraints in unified constraint system
    // PATTERN: Check constraint type is 'leadTime' before accessing config.minutes, fallback to 60 if not configured
    const leadTimeConstraint = availabilitySettings.rangeConstraints?.leadTime
    const leadTimeMinutes = (leadTimeConstraint?.type === 'leadTime' && leadTimeConstraint.config && 'minutes' in leadTimeConstraint.config)
      ? (leadTimeConstraint.config as { minutes: number }).minutes
      : 60;

    const adminSettings = {
      leadTime: leadTimeMinutes, // Already in minutes
      freeHours: availabilitySettings.businessHours, // Map businessHours to freeHours
      workHours: workHours, // Use configured limit or calculated max
      timezone: targetTimezone, // Use configured timezone or fallback
      minuteIncrement: minuteIncrement,
      permissibleStartRule: permissibleStartRule,
    };

    // Call makeAvailabilities
    const availabilities = await makeAvailabilities(
      freeBusyResponse,
      dateRange.start,
      dateRange.end,
      duration,
      serviceId,
      adminSettings
    );

    // Transform TimeSlot objects to JSON-serializable format
    const serializedAvailabilities = availabilities.map(slot => ({
      slotStart: slot.slotStart.toISOString(),
      slotEnd: slot.slotEnd.toISOString(),
      duration: slot.duration
    }));

    res.status(200).json({ availabilities: serializedAvailabilities });
  } catch (error) {
    console.error("Error in /availability route:", error);
    res.status(500).json({ 
      error: "Failed to generate availabilities.",
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /availability/scheduled-hours
 * Get scheduled work hours for a date or date range
 * LEARNING: API endpoint for capacity checking - returns scheduled hours for capacity filters
 * WHY: Allows client-side filtering to check if capacity limits would be exceeded
 * PATTERN: GET endpoint with query parameters for date range or specific date
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
      const dateObj = new Date(date as string);
      if (isNaN(dateObj.getTime())) {
        res.status(400).json({ error: "Invalid date format. Use YYYY-MM-DD." });
        return;
      }
      hours = await sumWorkHoursForDay(dateObj);
    } else if (startDate && endDate) {
      // Date range query
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