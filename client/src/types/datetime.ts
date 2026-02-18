/**
 * DateTime Type Definitions
 * 
 * LEARNING: Type definitions for datetime handling throughout the application
 * WHY: Ensures consistency and matches international standards (ISO 8601, RFC3339)
 * PATTERN: Type aliases and conversion utilities for standardized formats
 * 
 * Standards:
 * - ISO 8601: International standard for date and time representation
 * - RFC3339: Profile of ISO 8601 used by Google Calendar API and many web APIs
 * 
 * Reference: 
 * - ISO 8601: https://en.wikipedia.org/wiki/ISO_8601
 * - RFC3339: https://datatracker.ietf.org/doc/html/rfc3339
 * - Google Calendar API: https://developers.google.com/calendar/api/v3/reference/freebusy/query
 */

/**
 * ISO 8601 Date Type
 * LEARNING: Type alias for ISO 8601 date-only strings (YYYY-MM-DD format)
 * WHY: Documents intent for date-only values, ensures consistency, aligns with RFC3339/UTC approach
 * PATTERN: Type alias provides documentation without runtime overhead
 * 
 * Format: YYYY-MM-DD (date-only, no time)
 * @audit-allow:hardcoding:magicLabel - Format description is the constant; no extraction needed.
 * Characteristics:
 * - Date-only (no time component)
 * - Lexicographically sortable (chronological order matches string order)
 * - Unambiguous (no timezone confusion for date-only values)
 * - Compatible with RFC3339 date-time strings (can extract date portion)
 * 
 * Usage: Use for date-only values (e.g., selected dates, date ranges, calendar dates)
 * Conversion: Use dateOnlyToRfc3339() to convert to RFC3339 datetime when needed
 * 
 * @example
 * ```typescript
 * const selectedDate: ISO8601Date = "2026-01-15"
 * const dateRange: { start: ISO8601Date; end: ISO8601Date } = {
 *   start: "2026-01-15",
 *   end: "2026-01-20"
 * }
 * ```
 * 
 * Reference: ISO 8601 Date format (https://en.wikipedia.org/wiki/ISO_8601#Dates)
 */
export type ISO8601Date = string

/**
 * RFC3339 DateTime Type (Branded)
 * LEARNING: Branded type provides compile-time type safety for RFC3339 datetime strings
 * WHY: Prevents passing plain strings where RFC3339 datetime is expected
 * PATTERN: Branded type with __brand property + runtime validation functions
 * 
 * Format: "2026-01-15T10:00:00.000Z" or "2026-01-15T10:00:00-05:00"
 * Characteristics:
 * - Date-time (includes time component)
 * - Always includes timezone (Z for UTC or offset like -05:00)
 * - Profile of ISO 8601 standard
 * - Compile-time type safety (can't pass plain string without validation)
 * 
 * Examples: 
 * - UTC: "2026-01-15T14:30:00Z"
 * - With offset: "2026-01-15T14:30:00-05:00"
 * 
 * Usage: 
 * - Use for date-time values (e.g., time slots, busy periods, API timestamps)
 * - Convert Date to RFC3339DateTime using toRFC3339DateTime(date)
 * - Validate strings using isRFC3339DateTime(value) or validateRFC3339DateTime(value)
 * 
 * Reference: 
 * - RFC3339: https://datatracker.ietf.org/doc/html/rfc3339
 * - Google Calendar API: https://developers.google.com/calendar/api/v3/reference/freebusy/query
 * - Branded Types: https://www.typescriptlang.org/docs/handbook/advanced-types.html#index-types
 * @audit-allow:hardcoding:magicLabel - Brand discriminant literal; required for branded type.
 */
export type RFC3339DateTime = string & { readonly __brand: 'RFC3339DateTime' }

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
 *   // Handle invalid datetime from API (e.g. log via logger, show user message)
 * }
 * ```
 * @audit-allow:error-handling:console-in-catch - Example only; real code should use logger.
 * @audit-allow:error-handling:catch-without-logger - JSDoc example only; no executable catch in this file.
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
