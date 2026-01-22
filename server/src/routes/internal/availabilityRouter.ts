import { Router, Request, Response } from 'express';
import { makeAvailabilities } from "../../utils/availabilities/makeAvailabilties.js";
import { BusinessSettings } from "../../config/app.js";
import type { AvailabilitySettingsData } from "../../db/models/admin/business_settings.js";

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
      leadTime: 60, // 1 hour in minutes
      workHoursLimit: undefined, // Will be calculated if not set
      timezone: 'America/New_York' // Default timezone
    };

    const availabilitySettings = availabilitySettingsRecord?.settingValue || defaultSettings;

    // Use configured timezone or fallback to request timezone or default
    const targetTimezone = availabilitySettings.timezone 
      || timezone 
      || "America/New_York";

    // Transform AvailabilitySettings to adminSettings format expected by makeAvailabilities
    // LEARNING: Maps businessHours to freeHours and derives workHours/permissibleStartRule
    // WHY: makeAvailabilities expects different structure than AvailabilitySettings
    const minuteIncrement = availabilitySettings.minuteIncrement;
    const permissibleStartRule = `every :${minuteIncrement}`; // e.g., "every :15" for 15-minute increments

    // Calculate workHours from configured limit or businessHours max
    const workHours = availabilitySettings.workHoursLimit !== undefined
      ? availabilitySettings.workHoursLimit
      : Math.max(
          ...Object.values(availabilitySettings.businessHours).map(day => {
            const [startHour, startMin] = day.start.split(':').map(Number);
            const [endHour, endMin] = day.end.split(':').map(Number);
            const startMinutes = startHour * 60 + startMin;
            const endMinutes = endHour * 60 + endMin;
            return (endMinutes - startMinutes) / 60;
          })
        );

    const adminSettings = {
      leadTime: availabilitySettings.leadTime, // Already in minutes
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

export { router as AvailabilityRouter };