import { normalizeToUtc, normalizeToZone } from "./timeNormalization.js";
import { sumWorkHoursForDay } from "./availabiltiesDbUtils.js";

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
 * PATTERN: Use interval intersection to preserve usable sub-ranges instead of discarding partial overlaps
 * P1-4: Fixed to use interval intersection instead of discarding partial overlaps
 */
export function filterByFreeHours(
  freeTimes: { start: Date; end: Date }[],
  freeHours: Record<number, { start: string; end: string }>,
  timezone: string
): { start: Date; end: Date }[] {
  return freeTimes
    .flatMap(({ start, end }) => {
      const dayIndex = normalizeToZone(start, timezone).getDay();
      const freeHoursForDay = freeHours[dayIndex];
      if (!freeHoursForDay) return [];

      const freeStart = normalizeToUtc(freeHoursForDay.start, timezone);
      const freeEnd = normalizeToUtc(freeHoursForDay.end, timezone);

      // P1-4: Use interval intersection to preserve usable sub-ranges
      // LEARNING: Calculate intersection of free time window with business hours
      // WHY: Preserves partial overlaps instead of discarding them (e.g., 08:00-10:00 window with 09:00-17:00 hours → 09:00-10:00)
      // PATTERN: Calculate intersection: max(start, freeStart) to min(end, freeEnd), only if intersection exists
      const intersectionStart = start > freeStart ? start : freeStart;
      const intersectionEnd = end < freeEnd ? end : freeEnd;

      // Only return intersection if it's valid (start < end)
      if (intersectionStart < intersectionEnd) {
        return [{ start: intersectionStart, end: intersectionEnd }];
      }
      
      return [];
    });
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
 * Filters free times based on work hours
 * LEARNING: Filters time slots to exclude days that exceed work hours limit
 * WHY: Prevents over-scheduling on a single day
 * PATTERN: Check if day's total work hours is within limit
 * 
 * IMPLEMENTED: Database-backed work hours filtering
 * ============================================================================
 * Queries scheduled appointments for each day and filters out days exceeding limit:
 * 1. Extracts actual date from start parameter
 * 2. Calls sumWorkHoursForDay(date) to get total scheduled hours
 * 3. Filters out days where totalWorkHours > workHoursLimit
 * 
 * Now async to support database queries
 * ============================================================================
 */
export async function filterByWorkHours(
  freeTimes: { start: Date; end: Date }[],
  workHoursLimit: number,
  timezone: string
): Promise<{ start: Date; end: Date }[]> {
  // Filter days by checking if total scheduled work hours is within limit
  const filteredTimes: { start: Date; end: Date }[] = [];
  
  for (const { start, end } of freeTimes) {
    // Extract actual date from start (normalized to timezone for accurate date extraction)
    const dateInZone = normalizeToZone(start, timezone);
    // LEARNING: Extract date components from timezone-normalized date to ensure correct day
    // WHY: Prevents timezone shifts that could query the wrong day
    // PATTERN: Use timezone-normalized date components, create Date at UTC midnight for that date
    const year = dateInZone.getFullYear();
    const month = dateInZone.getMonth();
    const day = dateInZone.getDate();
    // Create Date object at UTC midnight for the target date
    // This ensures sumWorkHoursForDay gets the correct date string when it calls toISOString()
    const dateOnly = new Date(Date.UTC(year, month, day));
    
    // Query total work hours for this date
    const totalWorkHours = await sumWorkHoursForDay(dateOnly);
    
    // Only include if within work hours limit
    if (totalWorkHours <= workHoursLimit) {
      filteredTimes.push({ start, end });
    }
  }
  
  return filteredTimes;
}
