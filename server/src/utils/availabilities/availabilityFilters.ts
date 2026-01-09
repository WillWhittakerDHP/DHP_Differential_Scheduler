import { normalizeToUtc, normalizeToZone } from "./timeNormalization.js";

/**
 * Filters free times based on available days
 * LEARNING: Filters time slots to only include days when service is available
 * WHY: Services may only be available on specific days of the week
 * PATTERN: Filter by day index (0 = Sunday, 6 = Saturday)
 */
export function filterByAvailableDays(
  freeTimes: { start: Date; end: Date }[],
  availableDays: number[],
  timezone: string
): { start: Date; end: Date }[] {
  return freeTimes.filter(({ start }) => {
    const dayIndex = normalizeToZone(start, timezone).getDay();
    return availableDays.includes(dayIndex);
  });
}

/**
 * Filters free times based on free hours
 * LEARNING: Filters time slots to only include hours when service is available
 * WHY: Services may have specific operating hours per day
 * PATTERN: Check if free time falls within configured free hours for that day
 */
export function filterByFreeHours(
  freeTimes: { start: Date; end: Date }[],
  freeHours: Record<number, { start: string; end: string }>,
  timezone: string
): { start: Date; end: Date }[] {
  return freeTimes
    .map(({ start, end }) => {
      const dayIndex = normalizeToZone(start, timezone).getDay();
      const freeHoursForDay = freeHours[dayIndex];
      if (!freeHoursForDay) return null;

      const freeStart = normalizeToUtc(freeHoursForDay.start, timezone);
      const freeEnd = normalizeToUtc(freeHoursForDay.end, timezone);

      if (start >= freeStart && end <= freeEnd) {
        return { start, end };
      }
      return null;
    })
    .filter(Boolean) as { start: Date; end: Date }[]; // Remove null results
}

/**
 * Filters freeBits based on lead time
 * LEARNING: Filters time slots to exclude slots that are too soon (before lead time threshold)
 * WHY: Ensures minimum advance notice for appointments
 * PATTERN: Filter slots that start after lead time threshold
 */
export function filterByLeadTime(
  freeBits: { duration: number; slotStart: Date; slotEnd: Date }[],
  leadTimeThreshold: Date
): { duration: number; slotStart: Date; slotEnd: Date }[] {
  return freeBits.filter(({ slotStart }) => slotStart >= leadTimeThreshold);
}

/**
 * Placeholder function for summing work hours (to be replaced by real implementation)
 * LEARNING: Calculates total work hours scheduled for a day
 * WHY: Enforces maximum work hours per day limit
 * PATTERN: Placeholder for now - will query database for scheduled appointments
 */
export function sumWorkHoursForDay(dayIndex: number): number {
  console.log(`Summing work hours for dayIndex: ${dayIndex}`);
  return 0; // Example: No work hours for now
}

/**
 * Filters free times based on work hours
 * LEARNING: Filters time slots to exclude days that exceed work hours limit
 * WHY: Prevents over-scheduling on a single day
 * PATTERN: Check if day's total work hours is within limit
 */
export function filterByWorkHours(
  freeTimes: { start: Date; end: Date }[],
  workHoursLimit: number,
  timezone: string
): { start: Date; end: Date }[] {
  return freeTimes.filter(({ start }) => {
    const dayIndex = normalizeToZone(start, timezone).getDay();
    const totalWorkHours = sumWorkHoursForDay(dayIndex);
    return totalWorkHours <= workHoursLimit;
  });
}
