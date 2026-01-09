import { toZonedTime, fromZonedTime } from "date-fns-tz";

/**
 * Helper Function: Normalize Times
 * LEARNING: Timezone normalization utilities for availability calculations
 * WHY: Converts between UTC and local timezones for accurate time slot calculations
 * PATTERN: Use date-fns-tz for timezone conversions
 */
export function normalizeToUtc(time: string, timezone: string): Date {
  return fromZonedTime(time, timezone); // Converts to UTC
}

export function normalizeToZone(time: Date, timezone: string): Date {
  return toZonedTime(time, timezone); // Converts UTC to the target timezone
}