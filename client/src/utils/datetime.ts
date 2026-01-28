/**
 * DateTime Conversion Utilities
 * 
 * LEARNING: Utilities for converting between RFC3339 datetime and ISO 8601 date formats
 * WHY: Keeps internal formats consistent (RFC3339 for datetime, ISO 8601 for dates) while allowing UI flexibility
 * PATTERN: Pure functions for format conversion
 * 
 * Standards:
 * - RFC3339: Date-time format (ISO 8601 profile) - used for timestamps, time slots, busy periods
 * - ISO 8601: Date-only format (YYYY-MM-DD) - used for calendar dates, date selections
 * 
 * Reference:
 * - ISO 8601: https://en.wikipedia.org/wiki/ISO_8601
 * - RFC3339: https://datatracker.ietf.org/doc/html/rfc3339
 */

import type { RFC3339DateTime, ISO8601Date } from '@/types/datetime'

/**
 * Extract date-only (ISO 8601 YYYY-MM-DD) from RFC3339 datetime
 * LEARNING: Converts RFC3339 datetime to ISO 8601 date format for UI display
 * WHY: Datetimes stored as RFC3339 but dates displayed as ISO 8601 (YYYY-MM-DD)
 * PATTERN: Parse RFC3339, extract date components in UTC
 * 
 * @param rfc3339 - RFC3339 datetime string
 * @returns ISO 8601 date string (YYYY-MM-DD format)
 * 
 * @example
 * ```typescript
 * rfc3339ToDateOnly('2026-01-15T10:00:00Z') // Returns: "2026-01-15"
 * ```
 */
export function rfc3339ToDateOnly(rfc3339: RFC3339DateTime): ISO8601Date {
  const date = new Date(rfc3339)
  const year = date.getUTCFullYear()
  const month = String(date.getUTCMonth() + 1).padStart(2, '0')
  const day = String(date.getUTCDate()).padStart(2, '0')
  return `${year}-${month}-${day}` as ISO8601Date
}

/**
 * Convert ISO 8601 date (YYYY-MM-DD) to RFC3339 datetime (midnight UTC)
 * LEARNING: Converts ISO 8601 date to RFC3339 datetime for storage
 * WHY: UI inputs ISO 8601 date (YYYY-MM-DD), but we store as RFC3339 datetime
 * PATTERN: Parse ISO 8601 date string, create UTC datetime at midnight, return branded type
 * 
 * @param date - ISO 8601 date string (YYYY-MM-DD format)
 * @returns RFC3339DateTime (branded type, midnight UTC)
 * 
 * @example
 * ```typescript
 * dateOnlyToRfc3339('2026-01-15') // Returns: "2026-01-15T00:00:00.000Z" (as RFC3339DateTime)
 * ```
 */
export function dateOnlyToRfc3339(date: ISO8601Date): RFC3339DateTime {
  const [year, month, day] = date.split('-').map(Number)
  const rfc3339Date = new Date(Date.UTC(year, month - 1, day, 0, 0, 0))
  return rfc3339Date.toISOString() as RFC3339DateTime
}
