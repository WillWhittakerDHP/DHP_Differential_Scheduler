import { addMinutes } from "date-fns";
import { normalizeToUtc, normalizeToZone } from "./timeNormalization.js";
import { mergeBusyPeriods, calculateFreeTimes } from "./busyPeriodsToFreeTimes.js";
import { splitFreeTimesToFreeBits, mapPermissibleStarts, findAvailabilities, TimeSlot } from "./freeTimesToValidAvailabilities.js";
import { fetchAvailableDays } from "./availabiltiesDbUtils.js";
import { filterByFreeHours, filterByLeadTime, filterByWorkHours, filterByAvailableDays } from "./availabilityFilters.js";
import { filterByDriveTime, Destination } from "./filterByDriveTimes.js";

/**
 * P1-1: Proper type definitions for Google Calendar FreeBusy API response
 * LEARNING: Type-safe interfaces for calendar busy period data
 * WHY: Prevents runtime errors and improves code maintainability
 * PATTERN: Define interfaces matching Google Calendar API structure
 */
interface CalendarBusyPeriod {
  start: string  // RFC3339 datetime
  end: string    // RFC3339 datetime
}

interface CalendarBusy {
  busy: CalendarBusyPeriod[]
  errors?: Array<{ domain: string; reason: string }>
}

interface FreeBusyResponse {
  kind?: 'calendar#freeBusy'
  timeMin?: string
  timeMax?: string
  calendars: Record<string, CalendarBusy>
}

/**
 * Main Function: Make Availabilities
 * LEARNING: Calculates available time slots for appointments based on calendar data and admin settings
 * WHY: Core function that determines when appointments can be scheduled
 * PATTERN: Multi-step filtering pipeline: merge busy periods → calculate free times → apply filters → find valid slots
 * 
 * Process:
 * 1. Normalize time range to UTC
 * 2. Merge overlapping busy periods
 * 3. Calculate free time windows
 * 4. Filter by available days, free hours, work hours
 * 5. Split into time increments
 * 6. Filter by lead time
 * 7. Find contiguous slots that meet duration requirement
 * 8. Convert back to target timezone
 */
export async function makeAvailabilities(
  freeBusyResponse: FreeBusyResponse,
  timeMin: string,
  timeMax: string,
  duration: number,
  serviceId: string,
  adminSettings: {
    leadTime: number,
    freeHours: Record<string, { start: string; end: string }>,
    workHours: number,
    timezone: string,
    minuteIncrement: number,
    permissibleStartRule: string,
  }
): Promise<TimeSlot[]> {
  try {
    const timeMinDate = normalizeToUtc(timeMin, adminSettings.timezone);
    const timeMaxDate = normalizeToUtc(timeMax, adminSettings.timezone);

    // P1-1: Type-safe extraction of busy periods
    // LEARNING: Extract busy periods with proper type checking
    // WHY: Prevents runtime errors from undefined properties
    // PATTERN: Check for calendars property, extract busy periods safely
    const busyPeriods = freeBusyResponse.calendars
      ? Object.values(freeBusyResponse.calendars).flatMap((calendar: CalendarBusy) => calendar.busy || [])
      : [];

    const mergedBusy = mergeBusyPeriods(busyPeriods, adminSettings.timezone);

    let freeTimes = mergedBusy.length
      ? calculateFreeTimes(mergedBusy, timeMinDate, timeMaxDate)
      : [{ start: timeMinDate, end: timeMaxDate }];

    if (!freeTimes.length) {
      console.log("No free times available in makeAvailabilities.");
      return [];
    }

    // 1. Fetch available days
    const availableDays = await fetchAvailableDays(serviceId);

    // 2. Filter freeTimes by availableDays
    freeTimes = filterByAvailableDays(freeTimes, availableDays, adminSettings.timezone);

    // 3. Filter freeTimes by freeHours
    freeTimes = filterByFreeHours(freeTimes, adminSettings.freeHours, adminSettings.timezone);

    // 4. Filter by workHours (before splitting into bits)
    freeTimes = filterByWorkHours(freeTimes, adminSettings.workHours, adminSettings.timezone);

    // 5. Filter by drive times (placeholder - returns freeTimes as-is for now)
    const destinations: Destination[] = mergedBusy.map((busy) => ({
      location: "EventLocation_" + busy.start.toISOString(), // Placeholder for the location
    }));

    freeTimes = filterByDriveTime(
      freeTimes,
      mergedBusy,
      new Map(), // Empty drive time cache for now
      destinations,
      adminSettings.minuteIncrement
    );

    // 6. Filter freeBits by leadTime
    const leadTimeThreshold = addMinutes(new Date(), adminSettings.leadTime);
    // P0-4: Pass minuteIncrement to generate offsets dynamically
    // LEARNING: Generate permissible starts from minuteIncrement instead of hard-coded mapping
    // WHY: Supports any minuteIncrement value (e.g., :60, :20) without hard-coding
    // PATTERN: Pass minuteIncrement as second parameter to mapPermissibleStarts
    const permissibleStarts = mapPermissibleStarts(adminSettings.permissibleStartRule, adminSettings.minuteIncrement);

    const freeBits = filterByLeadTime(
      splitFreeTimesToFreeBits(freeTimes, adminSettings.minuteIncrement, permissibleStarts),
      leadTimeThreshold
    );

    const availabilities = findAvailabilities(freeBits, duration);

    // P0-2: Timezone consistency - slots are already in UTC from client
    // LEARNING: Client generates slots in UTC, server receives UTC boundaries
    // WHY: Maintains consistency - both client and server use UTC internally
    // PATTERN: Keep slots in UTC, convert to admin timezone only for display/API response
    // NOTE: normalizeToZone converts UTC to admin timezone for display purposes
    return availabilities.map((slot) => {
      // Convert all slots back to the target adminSettings.timezone for output
      // NOTE: This conversion is for display/API response - internal calculations use UTC
      return new TimeSlot(
        slot.duration,
        normalizeToZone(slot.slotStart, adminSettings.timezone),
        normalizeToZone(slot.slotEnd, adminSettings.timezone)
      );
    });
  } catch (error) {
    // P2-7: Improved error handling with context logging
    // LEARNING: Log error with parameters that caused failure for debugging
    // WHY: Helps diagnose issues by showing what inputs caused the error
    // PATTERN: Log error message, stack trace, and relevant parameters
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    console.error("Error in makeAvailabilities:", {
      message: errorMessage,
      stack: errorStack,
      context: {
        timeMin,
        timeMax,
        duration,
        serviceId,
        timezone: adminSettings.timezone,
        minuteIncrement: adminSettings.minuteIncrement,
        permissibleStartRule: adminSettings.permissibleStartRule,
        calendarsCount: freeBusyResponse.calendars ? Object.keys(freeBusyResponse.calendars).length : 0
      }
    });
    
    // Return empty array to prevent crashes, but error is logged for debugging
    return [];
  }
}

// /* 
// Admin Settings to Set Up
// 1. General Time Management Settings
// timezone: The default timezone for scheduling (e.g., "America/New_York").
// minuteIncrement: The increments in minutes to split free periods (e.g., 15).
// permissibleStartRule: Rules defining permissible start times (e.g., "every :15").
// 2. Lead Time Settings
// leadTime: Minimum time (in minutes) required between the current time and the start of an available time slot. Calculated as minuteIncrement * adminValue.
// 3. Free Time Management Settings
// freeHours:
// Daily time ranges during which appointments can be scheduled.
// Example:
// json
// Copy
// Edit
// {
//   "0": { "start": "08:00", "end": "20:00" }, // Sunday
//   "1": { "start": "08:00", "end": "20:00" }, // Monday
//   "2": { "start": "08:00", "end": "20:00" }, // Tuesday
//   ...
// }
// 4. Work Hours Settings
// workHours: Maximum allowable work hours per day (e.g., 8).
// 5. Day Availability Settings
// availableDays:
// List of day indices (0 = Sunday, 6 = Saturday) when appointments can be scheduled.
// Retrieved dynamically from the database based on serviceId.
// 6. Drive Time Management Settings
// driveTimeTo: Time required to drive from the origin to the busy period's start location.
// driveTimeFrom: Time required to drive from the busy period's end location to the destination.
// Drive Time Behavior:
// Exclude freeBits:
// Starting within driveTimeTo after the end of a busy period.
// Ending within driveTimeFrom before the start of the next busy period.
// Additional Notes
// Database Settings:

// availableDays will require a table or query linked to services.
// FreeHours and WorkHours can also be stored in the database for flexibility.
// Future Enhancements:

// Add per-service customizations for all settings.
// Allow overrides for specific days or special events.

// */