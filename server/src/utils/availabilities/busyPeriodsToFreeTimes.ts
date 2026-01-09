import { isBefore } from "date-fns";
import { normalizeToUtc } from "./timeNormalization.js";

/**
 * Helper Function: Merge Busy Periods
 * LEARNING: Merges overlapping busy periods from calendar data
 * WHY: Overlapping busy periods need to be combined to calculate accurate free times
 * PATTERN: Sort by start time, then merge overlapping periods
 */
export function mergeBusyPeriods(
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

/**
 * Helper Function: Calculate Free Times
 * LEARNING: Calculates free time slots between busy periods
 * WHY: Determines available time windows for appointments
 * PATTERN: Find gaps between merged busy periods within time range
 */
export function calculateFreeTimes(
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
