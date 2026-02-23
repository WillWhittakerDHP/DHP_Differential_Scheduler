/**
 * WHY: DateTime Type Definitions
WHY: Single source of truth for ISO8601Date, R...
 */
import type { ISO8601Date, RFC3339DateTime } from '@shared/types/primitiveBrands'

/**
 * Convert string to ISO8601Date at API boundaries.
 */
export function toISO8601Date(value: string): ISO8601Date {
  return value as ISO8601Date
}

/**
 * WHY: Type guard for RFC3339 datetime strings
LEARNING: Runtime validation tha...
 */
export function isRFC3339DateTime(value: string): value is RFC3339DateTime {
  const rfc3339Regex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?([+-]\d{2}:\d{2}|Z)$/
  return rfc3339Regex.test(value)
}

/**
 * WHY: Validate and convert string to RFC3339DateTime
LEARNING: Throws error if...
 */
export function validateRFC3339DateTime(value: string): RFC3339DateTime {
  if (!isRFC3339DateTime(value)) {
    throw new Error(`Invalid RFC3339DateTime: ${value}`)
  }
  return value
}

/**
 * WHY: Convert Date object to RFC3339DateTime
LEARNING: Safe conversion from Da...
 */
export function toRFC3339DateTime(date: Date): RFC3339DateTime {
  return date.toISOString() as RFC3339DateTime
}

/**
 * Day of Week Type
 * 
 * P3-4: Added DayOfWeek type to eliminate runtime casting
 * 
 * Values:
 * - 0 = Sunday
 * - 1 = Monday
 * - 2 = Tuesday
 * - 3 = Wednesday
 * - 4 = Thursday
 * - 5 = Friday
 * - 6 = Saturday
 */
export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6

/**
 * WHY: Convert number to DayOfWeek with validation
LEARNING: Validates and conv...
 */
export function toDayOfWeek(n: number): DayOfWeek {
  if (!Number.isInteger(n) || n < 0 || n > 6) {
    throw new Error(`Invalid day of week: ${n}. Must be integer between 0 and 6.`)
  }
  return n as DayOfWeek
}

export function getDayOfWeek(date: Date): DayOfWeek {
  return date.getDay() as DayOfWeek  // getDay() always returns 0-6
}
