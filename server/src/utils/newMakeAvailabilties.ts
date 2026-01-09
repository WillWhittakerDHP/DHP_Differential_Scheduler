import { addMinutes, isBefore } from "date-fns";
import { toZonedTime, fromZonedTime, formatInTimeZone } from "date-fns-tz";

// Class Definitions
export class TimeSlot {
  constructor(
    public duration: number, 
    public slotStart: Date, 
    public slotEnd: Date
  ) {}
}

// Helper Function: Normalize Times
function normalizeToUtc(time: string, timezone: string): Date {
  return fromZonedTime(time, timezone); // Converts to UTC
}

function normalizeToZone(time: Date, timezone: string): Date {
  return toZonedTime(time, timezone); // Converts UTC to the target timezone
}

// Helper Function: Merge Busy Periods
function mergeBusyPeriods(
  busy: { start: string; end: string }[],
  timezone: string
): { start: Date; end: Date }[] {
  const normalizedBusy = busy.map(({ start, end }) => ({
    start: normalizeToUtc(start, timezone),
    end: normalizeToUtc(end, timezone),
  }));

  const sortedBusy = normalizedBusy.sort((a, b) => a.start.getTime() - b.start.getTime());

  const merged: { start: Date; end: Date }[] = [];
  for (const period of sortedBusy) {
    if (merged.length > 0 && merged[merged.length - 1].end >= period.start) {
      merged[merged.length - 1].end = new Date(
        Math.max(merged[merged.length - 1].end.getTime(), period.end.getTime())
      );
    } else {
      merged.push(period);
    }
  }

  return merged;
}

// Helper Function: Calculate Free Times
function calculateFreeTimes(
  mergedBusy: { start: Date; end: Date }[],
  timeMin: Date,
  timeMax: Date
): { start: Date; end: Date }[] {
  const freeTimes: { start: Date; end: Date }[] = [];

  let previousEnd = timeMin;
  for (const period of mergedBusy) {
    if (isBefore(previousEnd, period.start)) {
      freeTimes.push({ start: previousEnd, end: period.start });
    }
    previousEnd = new Date(Math.max(previousEnd.getTime(), period.end.getTime()));
  }

  if (isBefore(previousEnd, timeMax)) {
    freeTimes.push({ start: previousEnd, end: timeMax });
  }

  return freeTimes;
}

// Helper Function: Map Permissible Starts
function mapPermissibleStarts(rule: string): number[] {
  const mapping: Record<string, number[]> = {
    "every :00": [0],
    "every :15": [0, 15, 30, 45],
    "every :30": [0, 30],
  };
  return mapping[rule] || [];
}

// Helper Function: Split Free Times into FreeBits
function splitFreeTimesToFreeBits(
  freeTimes: { start: Date; end: Date }[],
  minuteIncrement: number,
  permissibleStarts: number[]
): TimeSlot[] {
  const freeBits: TimeSlot[] = [];

  for (const { start, end } of freeTimes) {
    const startMinutes = start.getUTCMinutes();
    const alignedStarts = permissibleStarts.filter(
      (pStart) => pStart >= startMinutes
    );

    for (const permissibleStart of alignedStarts) {
      let currentStart = new Date(start);
      currentStart.setUTCMinutes(permissibleStart, 0, 0);

      while (isBefore(currentStart, end)) {
        const currentEnd = addMinutes(currentStart, minuteIncrement);
        if (isBefore(currentEnd, end) || currentEnd.getTime() === end.getTime()) {
          freeBits.push(new TimeSlot(minuteIncrement, currentStart, currentEnd));
        }
        currentStart = addMinutes(currentStart, minuteIncrement);
      }
    }
  }

  return freeBits;
}

// Helper Function: Find Availabilities
function findAvailabilities(freeBits: TimeSlot[], duration: number): TimeSlot[] {
  const availabilities: TimeSlot[] = [];
  let contiguousBits: TimeSlot[] = [];

  for (const bit of freeBits) {
    contiguousBits.push(bit);

    const totalDuration = contiguousBits.reduce((sum, slot) => sum + slot.duration, 0);

    if (totalDuration >= duration) {
      availabilities.push(
        new TimeSlot(
          totalDuration,
          contiguousBits[0].slotStart,
          contiguousBits[contiguousBits.length - 1].slotEnd
        )
      );

      contiguousBits.shift(); // Move to the next potential start
    }
  }

  return availabilities;
}

// Helper Function: Fetch Available Days
async function fetchAvailableDays(serviceId: string): Promise<number[]> {
  // Simulate a database call to fetch available days based on serviceId
  // Replace with real database interaction
  console.log(`Fetching available days for serviceId: ${serviceId}`);
  return [1, 2, 3, 4, 5]; // Example: Monday to Friday
}

// Helper Function: Filter Free Times by Free Hours
function filterByFreeHours(
  start: Date,
  end: Date,
  freeHoursForDay: { start: string; end: string },
  timezone: string
): { start: Date; end: Date } | null {
  const startLocal = normalizeToZone(start, timezone);
  const endLocal = normalizeToZone(end, timezone);

  const freeStart = normalizeToUtc(freeHoursForDay.start, timezone);
  const freeEnd = normalizeToUtc(freeHoursForDay.end, timezone);

  if (startLocal >= freeStart && endLocal <= freeEnd) {
    return { start, end };
  }
  return null;
}

// Helper Function: Sum Work Hours for Day
function sumWorkHoursForDay(dayIndex: number): number {
  // Simulate a database call to sum work hours for the day
  // Replace with real database interaction
  console.log(`Summing work hours for dayIndex: ${dayIndex}`);
  return 0; // Example: No work hours for now
}

/**
 * Google Calendar FreeBusy API response structure
 * WHY: Type-safe representation of Google Calendar API response
 * PATTERN: Matches Google Calendar API v3 freebusy response format
 */
interface GoogleCalendarBusyPeriod {
  start: string;
  end: string;
}

interface GoogleCalendarFreeBusy {
  busy: GoogleCalendarBusyPeriod[];
}

interface GoogleFreeBusyResponse {
  calendars?: Record<string, GoogleCalendarFreeBusy>;
}

// Main Function: Make Availabilities
export async function makeAvailabilities(
  freeBusyResponse: GoogleFreeBusyResponse,
  timeMin: string,
  timeMax: string,
  timezone: string,
  minuteIncrement: number,
  permissibleStartRule: string,
  duration: number,
  serviceId: string,
  adminSettings: {
    leadTime: number;
    freeHours: Record<string, { start: string; end: string }>;
    workHours: number;
  }
): Promise<TimeSlot[]> {
  try {
    const timeMinDate = normalizeToUtc(timeMin, timezone);
    const timeMaxDate = normalizeToUtc(timeMax, timezone);

    const busyPeriods = freeBusyResponse.calendars
      ? Object.values(freeBusyResponse.calendars).flatMap((calendar) => calendar.busy)
      : [];

    const mergedBusy = mergeBusyPeriods(busyPeriods, timezone);

    const freeTimes = mergedBusy.length
      ? calculateFreeTimes(mergedBusy, timeMinDate, timeMaxDate)
      : [{ start: timeMinDate, end: timeMaxDate }];

    if (!freeTimes.length) {
      console.log("No free times available in makeAvailabilities.");
      return [];
    }

    // 1. Fetch available days
    const availableDays = await fetchAvailableDays(serviceId);

    // 2. Filter freeTimes by availableDays
    const filteredByDays = freeTimes.filter(({ start }) => {
      const dayIndex = normalizeToZone(start, timezone).getDay();
      return availableDays.includes(dayIndex);
    });

    // 3. Filter freeTimes by freeHours
    const filteredByHours = filteredByDays.map(({ start, end }) => {
      const dayIndex = normalizeToZone(start, timezone).getDay();
      const freeHoursForDay = adminSettings.freeHours[dayIndex];
      return filterByFreeHours(start, end, freeHoursForDay, timezone);
    }).filter(Boolean) as { start: Date; end: Date }[];

    // 4. Filter freeBits by leadTime
    const leadTimeThreshold = addMinutes(new Date(), adminSettings.leadTime);
    const permissibleStarts = mapPermissibleStarts(permissibleStartRule);

    const freeBits = splitFreeTimesToFreeBits(filteredByHours, minuteIncrement, permissibleStarts)
      .filter(({ slotStart }) => slotStart >= leadTimeThreshold);

    // 5. Filter by workHours (unused - kept for potential future use)
    // const filteredByWorkHours = filteredByHours.filter(({ start }) => {
    //   const dayIndex = normalizeToZone(start, timezone).getDay();
    //   const totalWorkHours = sumWorkHoursForDay(dayIndex);
    //   return totalWorkHours <= adminSettings.workHours;
    // });

    const availabilities = findAvailabilities(freeBits, duration);

    return availabilities.map((slot) => {
      // Convert all slots back to the target timezone for output
      return new TimeSlot(
        slot.duration,
        normalizeToZone(slot.slotStart, timezone),
        normalizeToZone(slot.slotEnd, timezone)
      );
    });
  } catch (error) {
    console.error("Error in makeAvailabilities:", error);
    return [];
  }
}
