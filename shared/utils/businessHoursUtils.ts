/**
 * Shared Business Hours Utilities
 *
 * WHY: Business hours can span UTC midnight (e.g. 7 AM–9 PM Eastern = 12:00–02:00 UTC next day);
 *      extracting only hours/minutes loses the date offset and breaks slot generation.
 * PATTERN: UTC-only, no timezone conversion; preserve dayOffset from reference date.
 */

export interface ParsedBusinessHoursTime {
  /** UTC hours (0–23) */
  hours: number
  /** UTC minutes (0–59) */
  minutes: number
  /** Days from reference base date (0 = same day, 1 = next day) */
  dayOffset: number
}

/**
 * Parse a business hours RFC3339 string into UTC time components and day offset.
 * WHY: Reference dates (e.g. 2000-01-01 vs 2000-01-02) encode cross-midnight spans.
 */
export function parseBusinessHoursRFC3339(rfc3339: string): ParsedBusinessHoursTime {
  const utcDate = new Date(rfc3339)
  return {
    hours: utcDate.getUTCHours(),
    minutes: utcDate.getUTCMinutes(),
    dayOffset: utcDate.getUTCDate() - 1, // Reference dates start from day 1 (Jan 1)
  }
}

/**
 * Build UTC day boundaries for one calendar day from business hours RFC3339 start/end.
 * Handles cross-midnight UTC (end on next reference day) by applying dayOffset.
 */
export function buildDayBoundariesUTC(
  year: number,
  month: number,
  day: number,
  startRfc3339: string,
  endRfc3339: string
): { dayStartUtc: Date; dayEndUtc: Date } | null {
  const startParsed = parseBusinessHoursRFC3339(startRfc3339)
  const endParsed = parseBusinessHoursRFC3339(endRfc3339)

  const dayStartUtc = new Date(
    Date.UTC(
      year,
      month,
      day + startParsed.dayOffset,
      startParsed.hours,
      startParsed.minutes,
      0,
      0
    )
  )
  const dayEndUtc = new Date(
    Date.UTC(
      year,
      month,
      day + endParsed.dayOffset,
      endParsed.hours,
      endParsed.minutes,
      0,
      0
    )
  )

  if (dayStartUtc >= dayEndUtc) return null
  return { dayStartUtc, dayEndUtc }
}
