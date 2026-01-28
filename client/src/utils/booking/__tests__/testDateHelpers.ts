/**
 * Test Date Helpers
 * 
 * LEARNING: Dynamic date generation for tests
 * WHY: Avoids hardcoded dates that become stale and break tests
 * PATTERN: Generate dates relative to current time or a configurable base date
 * 
 * All dates are generated in UTC and returned as RFC3339DateTime strings
 */

import type { RFC3339DateTime } from '@/types/datetime'

/**
 * Base date for test date generation (defaults to "today")
 * LEARNING: Can be overridden for consistent test runs
 * WHY: Allows tests to use a fixed base date when needed
 * PATTERN: Set once at test setup, use throughout test file
 */
let testBaseDate: Date = new Date()

/**
 * Set the base date for test date generation
 * LEARNING: Allows tests to use a consistent base date
 * WHY: Useful for snapshot tests or when you need deterministic dates
 * PATTERN: Call at the start of a test suite
 * 
 * @param date - Base date to use (defaults to current date)
 */
export function setTestBaseDate(date: Date = new Date()): void {
  testBaseDate = new Date(date)
}

/**
 * Get the current test base date
 * LEARNING: Returns the base date being used for test generation
 * WHY: Allows tests to reference the base date
 * PATTERN: Use when you need to know what date tests are using
 */
export function getTestBaseDate(): Date {
  return new Date(testBaseDate)
}

/**
 * Find the next occurrence of a specific day of week
 * LEARNING: Calculates next occurrence of day relative to base date
 * WHY: Tests often need "next Monday", "next Thursday", etc.
 * PATTERN: Use for business day calculations
 * 
 * @param dayOfWeek - Day of week (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
 * @param baseDate - Optional base date (defaults to testBaseDate)
 * @returns Date object for the next occurrence of the day
 */
function getNextDayOfWeek(dayOfWeek: number, baseDate: Date = testBaseDate): Date {
  const date = new Date(baseDate)
  const currentDay = date.getUTCDay()
  const daysUntilTarget = (dayOfWeek - currentDay + 7) % 7 || 7 // If today is target, get next week
  date.setUTCDate(date.getUTCDate() + daysUntilTarget)
  date.setUTCHours(0, 0, 0, 0) // Reset to midnight UTC
  return date
}

/**
 * Create an RFC3339 datetime string for a specific date and time
 * LEARNING: Generates UTC datetime strings for tests
 * WHY: Tests need consistent datetime format
 * PATTERN: Use for boundary dates, busy times, etc.
 * 
 * @param date - Date object (will use UTC components)
 * @param hours - Hours (0-23) in UTC
 * @param minutes - Minutes (0-59), defaults to 0
 * @returns RFC3339DateTime string
 */
export function createTestDateTime(
  date: Date,
  hours: number,
  minutes: number = 0
): RFC3339DateTime {
  const testDate = new Date(date)
  testDate.setUTCHours(hours, minutes, 0, 0)
  return testDate.toISOString() as RFC3339DateTime
}

/**
 * Create a test date for "next Monday at 9 AM UTC"
 * LEARNING: Common pattern for business day tests
 * WHY: Many tests use Monday as a standard business day
 * PATTERN: Use for standard business day scenarios
 */
export function nextMonday9AM(): RFC3339DateTime {
  const monday = getNextDayOfWeek(1) // Monday = 1
  return createTestDateTime(monday, 9, 0)
}

/**
 * Create a test date for "next Monday at 7 PM UTC"
 * LEARNING: Common pattern for end of business day tests
 * WHY: Many tests use 7 PM as end of business hours
 * PATTERN: Use for end-of-day scenarios
 */
export function nextMonday7PM(): RFC3339DateTime {
  const monday = getNextDayOfWeek(1) // Monday = 1
  return createTestDateTime(monday, 19, 0)
}

/**
 * Create a test date for "next Thursday at 9 AM UTC"
 * LEARNING: Common pattern for mid-week tests
 * WHY: Thursday is often used as a representative weekday
 * PATTERN: Use for weekday scenarios
 */
export function nextThursday9AM(): RFC3339DateTime {
  const thursday = getNextDayOfWeek(4) // Thursday = 4
  return createTestDateTime(thursday, 9, 0)
}

/**
 * Create a test date for "next Thursday at 7 PM UTC"
 */
export function nextThursday7PM(): RFC3339DateTime {
  const thursday = getNextDayOfWeek(4) // Thursday = 4
  return createTestDateTime(thursday, 19, 0)
}

/**
 * Create a test date for "next day at specific time"
 * LEARNING: Flexible helper for any day/time combination
 * WHY: Not all tests need Monday or Thursday
 * PATTERN: Use when you need a specific day/time
 * 
 * @param dayOfWeek - Day of week (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
 * @param hours - Hours (0-23) in UTC
 * @param minutes - Minutes (0-59), defaults to 0
 * @returns RFC3339DateTime string
 */
export function nextDayAtTime(
  dayOfWeek: number,
  hours: number,
  minutes: number = 0
): RFC3339DateTime {
  const day = getNextDayOfWeek(dayOfWeek)
  return createTestDateTime(day, hours, minutes)
}

/**
 * Create a test date for "today at specific time"
 * LEARNING: Use when you need today's date
 * WHY: Some tests need current date, not future dates
 * PATTERN: Use for "today" scenarios
 * 
 * @param hours - Hours (0-23) in UTC
 * @param minutes - Minutes (0-59), defaults to 0
 * @returns RFC3339DateTime string
 */
export function todayAtTime(hours: number, minutes: number = 0): RFC3339DateTime {
  const today = new Date(testBaseDate)
  return createTestDateTime(today, hours, minutes)
}

/**
 * Create a test date for "tomorrow at specific time"
 * LEARNING: Use when you need tomorrow's date
 * WHY: Some tests need next day scenarios
 * PATTERN: Use for "tomorrow" scenarios
 * 
 * @param hours - Hours (0-23) in UTC
 * @param minutes - Minutes (0-59), defaults to 0
 * @returns RFC3339DateTime string
 */
export function tomorrowAtTime(hours: number, minutes: number = 0): RFC3339DateTime {
  const tomorrow = new Date(testBaseDate)
  tomorrow.setUTCDate(tomorrow.getUTCDate() + 1)
  return createTestDateTime(tomorrow, hours, minutes)
}

/**
 * Create a busy time range for tests
 * LEARNING: Helper for creating busy time test data
 * WHY: Many tests need busy time ranges
 * PATTERN: Use for busy time scenarios
 * 
 * @param startDayOfWeek - Day of week for start (0 = Sunday, ..., 6 = Saturday)
 * @param startHours - Start hours (0-23) in UTC
 * @param startMinutes - Start minutes (0-59), defaults to 0
 * @param endDayOfWeek - Day of week for end (can be same or next day)
 * @param endHours - End hours (0-23) in UTC
 * @param endMinutes - End minutes (0-59), defaults to 0
 * @returns Busy time range object
 */
export function createBusyTimeRange(
  startDayOfWeek: number,
  startHours: number,
  startMinutes: number,
  endDayOfWeek: number,
  endHours: number,
  endMinutes: number
): { start: RFC3339DateTime; end: RFC3339DateTime } {
  const startDay = getNextDayOfWeek(startDayOfWeek)
  const endDay = startDayOfWeek === endDayOfWeek 
    ? new Date(startDay) 
    : getNextDayOfWeek(endDayOfWeek)
  
  return {
    start: createTestDateTime(startDay, startHours, startMinutes),
    end: createTestDateTime(endDay, endHours, endMinutes)
  }
}

/**
 * Create a date-only string (YYYY-MM-DD) for a specific day
 * LEARNING: Helper for date-only test data
 * WHY: Some tests need ISO8601Date format
 * PATTERN: Use for date selection scenarios
 * 
 * @param dayOfWeek - Day of week (0 = Sunday, ..., 6 = Saturday)
 * @returns ISO8601Date string (YYYY-MM-DD)
 */
export function nextDayDateOnly(dayOfWeek: number): string {
  const day = getNextDayOfWeek(dayOfWeek)
  const year = day.getUTCFullYear()
  const month = String(day.getUTCMonth() + 1).padStart(2, '0')
  const date = String(day.getUTCDate()).padStart(2, '0')
  return `${year}-${month}-${date}`
}

/**
 * Create a date range for tests
 * LEARNING: Helper for creating date range test data
 * WHY: Many tests need start/end boundaries
 * PATTERN: Use for boundary scenarios
 * 
 * @param startDayOfWeek - Day of week for start
 * @param startHours - Start hours (0-23) in UTC
 * @param endDayOfWeek - Day of week for end
 * @param endHours - End hours (0-23) in UTC
 * @returns Object with startBoundary and endBoundary
 */
export function createDateRange(
  startDayOfWeek: number,
  startHours: number,
  endDayOfWeek: number,
  endHours: number
): { startBoundary: RFC3339DateTime; endBoundary: RFC3339DateTime } {
  return {
    startBoundary: nextDayAtTime(startDayOfWeek, startHours),
    endBoundary: nextDayAtTime(endDayOfWeek, endHours)
  }
}
