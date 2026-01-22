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
 * Extract time-of-day (HH:mm) from RFC3339 datetime
 * LEARNING: Converts RFC3339 to HH:mm format for UI display
 * WHY: Business hours stored as RFC3339 but displayed as HH:mm
 * PATTERN: Parse RFC3339, extract hours and minutes in UTC
 * 
 * @param rfc3339 - RFC3339 datetime string
 * @returns Time string in HH:mm format (24-hour)
 * 
 * @example
 * ```typescript
 * rfc3339ToTimeOfDay('2026-01-15T09:30:00Z') // Returns: "09:30"
 * rfc3339ToTimeOfDay('2026-01-15T17:45:00-05:00') // Returns: "22:45" (converted to UTC)
 * ```
 */
export function rfc3339ToTimeOfDay(rfc3339: RFC3339DateTime): string {
  const date = new Date(rfc3339)
  const hours = String(date.getUTCHours()).padStart(2, '0')
  const minutes = String(date.getUTCMinutes()).padStart(2, '0')
  return `${hours}:${minutes}`
}

/**
 * Combine time-of-day (HH:mm) with date to create RFC3339 datetime
 * LEARNING: Converts HH:mm + date to RFC3339 for storage
 * WHY: UI inputs HH:mm, but we store as RFC3339
 * PATTERN: Combine time string with date, create UTC datetime, return branded type
 * 
 * @param time - Time string in HH:mm format (24-hour)
 * @param date - Date object to combine with time
 * @returns RFC3339DateTime (branded type)
 * 
 * @example
 * ```typescript
 * const date = new Date('2026-01-15')
 * timeOfDayToRfc3339('09:30', date) // Returns: "2026-01-15T09:30:00.000Z" (as RFC3339DateTime)
 * ```
 */
export function timeOfDayToRfc3339(time: string, date: Date): RFC3339DateTime {
  const [hours, minutes] = time.split(':').map(Number)
  const rfc3339Date = new Date(date)
  rfc3339Date.setUTCHours(hours, minutes, 0, 0)
  return rfc3339Date.toISOString() as RFC3339DateTime
}

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

/**
 * Reference date for business hours (fixed date to store time-of-day as RFC3339)
 * LEARNING: Use fixed reference date so time-of-day values can be stored as RFC3339
 * WHY: Business hours are time-of-day (e.g., "09:00"), not absolute datetimes
 * PATTERN: Use 2000-01-01 as reference, extract time portion when needed
 */
const BUSINESS_HOURS_REFERENCE_DATE = new Date('2000-01-01T00:00:00Z')

/**
 * Convert business hours time-of-day (HH:mm) to RFC3339 using reference date
 * LEARNING: Converts HH:mm to RFC3339 for storage
 * WHY: Business hours stored as RFC3339 internally, but UI uses HH:mm
 * PATTERN: Combine HH:mm with fixed reference date to create RFC3339, return branded type
 * 
 * @param time - Time string in HH:mm format (24-hour)
 * @returns RFC3339DateTime (branded type) using reference date
 * 
 * @example
 * ```typescript
 * businessHoursTimeToRfc3339('09:00') // Returns: "2000-01-01T09:00:00.000Z" (as RFC3339DateTime)
 * ```
 */
export function businessHoursTimeToRfc3339(time: string): RFC3339DateTime {
  const [hours, minutes] = time.split(':').map(Number)
  const rfc3339Date = new Date(BUSINESS_HOURS_REFERENCE_DATE)
  rfc3339Date.setUTCHours(hours, minutes, 0, 0)
  return rfc3339Date.toISOString() as RFC3339DateTime
}

/**
 * Extract business hours time-of-day (HH:mm) from RFC3339 using reference date
 * LEARNING: Converts RFC3339 to HH:mm format for UI display
 * WHY: Business hours stored as RFC3339 but displayed as HH:mm
 * PATTERN: Extract hours and minutes from RFC3339 datetime
 * 
 * @param rfc3339 - RFC3339 datetime string (using reference date)
 * @returns Time string in HH:mm format (24-hour)
 * 
 * @example
 * ```typescript
 * rfc3339ToBusinessHoursTime('2000-01-01T09:00:00Z') // Returns: "09:00"
 * ```
 */
export function rfc3339ToBusinessHoursTime(rfc3339: RFC3339DateTime): string {
  const date = new Date(rfc3339)
  const hours = String(date.getUTCHours()).padStart(2, '0')
  const minutes = String(date.getUTCMinutes()).padStart(2, '0')
  return `${hours}:${minutes}`
}
