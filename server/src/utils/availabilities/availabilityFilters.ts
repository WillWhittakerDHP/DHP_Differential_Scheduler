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
 * Placeholder function for summing work hours (DISABLED - P0-3)
 * LEARNING: Calculates total work hours scheduled for a day
 * WHY: Enforces maximum work hours per day limit
 * PATTERN: Currently disabled - returns 0 to effectively disable the filter
 * 
 * P0-3: DISABLED - Work hours filter is not implemented
 * ============================================================================
 * TODO: Implement work hours aggregation
 * 
 * This function currently always returns 0, making the work hours filter ineffective.
 * To implement properly:
 * 1. Query scheduled appointments for the day (filter by date range)
 * 2. Sum total duration of all appointments for that day
 * 3. Return total hours (duration / 60)
 * 
 * Related files:
 * - server/src/db/models/appointment.ts (Appointment model)
 * - server/src/utils/availabilities/availabiltiesDbUtils.ts (duplicate stub exists)
 * 
 * Until implemented, filterByWorkHours effectively allows all days (always passes filter).
 * ============================================================================
 */
export function sumWorkHoursForDay(dayIndex: number): number {
  // P0-3: Disabled - always returns 0 to effectively disable the filter
  // TODO: Implement proper work hours aggregation from scheduled appointments
  console.log(`[DISABLED] Summing work hours for dayIndex: ${dayIndex} - feature not implemented`);
  return 0; // Always returns 0, making filterByWorkHours always pass
}

/**
 * Filters free times based on work hours
 * LEARNING: Filters time slots to exclude days that exceed work hours limit
 * WHY: Prevents over-scheduling on a single day
 * PATTERN: Check if day's total work hours is within limit
 * 
 * P0-3: CURRENTLY DISABLED - sumWorkHoursForDay always returns 0
 * ============================================================================
 * This filter is currently ineffective because sumWorkHoursForDay() always returns 0.
 * As a result, all days pass the filter regardless of workHoursLimit.
 * 
 * To enable this filter:
 * 1. Implement sumWorkHoursForDay() to query scheduled appointments
 * 2. Return actual total work hours for the day
 * 3. Filter will then properly exclude days exceeding workHoursLimit
 * ============================================================================
 */
export function filterByWorkHours(
  freeTimes: { start: Date; end: Date }[],
  workHoursLimit: number,
  timezone: string
): { start: Date; end: Date }[] {
  // P0-3: Filter is effectively disabled - sumWorkHoursForDay always returns 0
  // All days pass the filter until sumWorkHoursForDay is properly implemented
  return freeTimes.filter(({ start }) => {
    const dayIndex = normalizeToZone(start, timezone).getDay();
    const totalWorkHours = sumWorkHoursForDay(dayIndex);
    // Since totalWorkHours is always 0, this condition is always true
    return totalWorkHours <= workHoursLimit;
  });
}
