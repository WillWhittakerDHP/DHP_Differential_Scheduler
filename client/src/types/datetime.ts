/**
 * DateTime Type Definitions
 *
 * LEARNING: Re-exports canonical branded types from shared; conversion/validation helpers live here.
 * WHY: Single source of truth for ISO8601Date, RFC3339DateTime in shared/types/primitiveBrands.ts
 * PATTERN: Type re-exports from @shared; runtime helpers at API boundaries.
 */
import type { ISO8601Date, RFC3339DateTime } from '@shared/types/primitiveBrands'

/**
 * Convert string to ISO8601Date at API boundaries.
 * WHY: Apply branding in one place so callers do not cast.
 */
export function toISO8601Date(value: string): ISO8601Date {
  return value as ISO8601Date
}

/**
 * Type guard for RFC3339 datetime strings
 * LEARNING: Runtime validation that value is a valid RFC3339 datetime
 * WHY: Provides runtime type safety to complement compile-time branded type
 * PATTERN: Type guard with regex validation
 * 
 * @param value - String to check
 * @returns true if value is a valid RFC3339 datetime string
 * 
 * @example
 * ```typescript
 * if (isRFC3339DateTime(userInput)) {
 *   // TypeScript knows userInput is RFC3339DateTime here
 *   const dateTime: RFC3339DateTime = userInput
 * }
 * ```
 */
export function isRFC3339DateTime(value: string): value is RFC3339DateTime {
  const rfc3339Regex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?([+-]\d{2}:\d{2}|Z)$/
  return rfc3339Regex.test(value)
}

/**
 * Validate and convert string to RFC3339DateTime
 * LEARNING: Throws error if string is not valid RFC3339 datetime
 * WHY: Safe conversion from untrusted strings with clear error messages
 * PATTERN: Validation function that throws on invalid input
 * 
 * @param value - String to validate
 * @returns RFC3339DateTime if valid
 * @throws Error if value is not a valid RFC3339 datetime
 * 
 * @example
 * ```typescript
 * try {
 *   const dateTime = validateRFC3339DateTime(apiResponse.timestamp)
 * } catch (error) {
 *   logger.error(error)
 *   // Handle invalid datetime from API (e.g. show user message)
 * }
 * ```
 */
export function validateRFC3339DateTime(value: string): RFC3339DateTime {
  if (!isRFC3339DateTime(value)) {
    throw new Error(`Invalid RFC3339DateTime: ${value}`)
  }
  return value
}

/**
 * Convert Date object to RFC3339DateTime
 * LEARNING: Safe conversion from Date to branded RFC3339DateTime type
 * WHY: Ensures Date.toISOString() output is properly typed as RFC3339DateTime
 * PATTERN: Conversion function that produces branded type
 * 
 * @param date - Date object to convert
 * @returns RFC3339DateTime string
 * 
 * @example
 * ```typescript
 * const now: RFC3339DateTime = toRFC3339DateTime(new Date())
 * const tomorrow: RFC3339DateTime = toRFC3339DateTime(new Date(Date.now() + 86400000))
 * ```
 */
export function toRFC3339DateTime(date: Date): RFC3339DateTime {
  return date.toISOString() as RFC3339DateTime
}

/**
 * Day of Week Type
 * LEARNING: Branded type for day of week values (0-6)
 * WHY: Provides type safety and eliminates runtime casting
 * PATTERN: Type alias with validation functions
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
 * Convert number to DayOfWeek with validation
 * LEARNING: Validates and converts number to DayOfWeek type
 * WHY: Provides safe conversion with error handling
 * PATTERN: Validation function that throws on invalid input
 * 
 * @param n - Number to convert (0-6)
 * @returns DayOfWeek if valid
 * @throws Error if n is not a valid day of week
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
