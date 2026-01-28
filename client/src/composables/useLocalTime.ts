/**
 * useLocalTime Composable
 * 
 * LEARNING: Centralized composable for UI-boundary time conversions
 * WHY: Ensures all local time conversions happen only at UI boundary, maintaining UTC RFC3339 everywhere else
 * PATTERN: Composable provides functions for converting between RFC3339 (UTC) and local time formats
 * 
 * Architecture Principle:
 * - Everywhere: Use UTC RFC3339 format only
 * - UI Boundary Only: Convert to/from HH:mm and local time display formats
 * - This composable: Single source of truth for UI-boundary conversions
 * 
 * Usage:
 * - Use in Vue components for display formatting
 * - Use in form inputs/outputs for HH:mm conversion
 * - NEVER use in business logic (use UTC RFC3339 directly)
 */

import type { RFC3339DateTime, ISO8601Date } from '@/types/datetime'
import type { TimeRange, TimeSlot } from '@/types/appointment'

/**
 * Convert RFC3339 datetime to local Date object for display
 * LEARNING: Converts UTC RFC3339 to local Date for browser timezone display
 * WHY: Browser Date objects automatically handle timezone conversion for display
 * PATTERN: Parse RFC3339, browser handles local timezone conversion
 * 
 * @param rfc3339 - RFC3339 datetime string (UTC)
 * @returns Date object in local timezone
 */
function rfc3339ToLocalTime(rfc3339: RFC3339DateTime): Date {
  return new Date(rfc3339)
}

/**
 * Convert RFC3339 datetime to HH:mm format in local timezone
 * LEARNING: Extracts time portion from RFC3339 and formats as HH:mm in local timezone
 * WHY: UI inputs expect HH:mm format, but we store RFC3339 internally
 * PATTERN: Parse RFC3339, extract local hours/minutes, format as HH:mm
 * 
 * @param rfc3339 - RFC3339 datetime string (UTC)
 * @returns Time string in HH:mm format (24-hour) in local timezone
 * 
 * @example
 * ```typescript
 * // If RFC3339 is "2026-01-15T14:30:00Z" and local timezone is EST (-5)
 * rfc3339ToLocalHHmm('2026-01-15T14:30:00Z') // Returns: "09:30"
 * ```
 */
export function rfc3339ToLocalHHmm(rfc3339: RFC3339DateTime): string {
  const date = new Date(rfc3339)
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${hours}:${minutes}`
}

/**
 * Convert local HH:mm + date to RFC3339 datetime
 * LEARNING: Combines local HH:mm time with date to create UTC RFC3339 datetime
 * WHY: UI inputs HH:mm in local timezone, but we store as UTC RFC3339
 * PATTERN: Create Date in local timezone, convert to UTC RFC3339
 * 
 * @param hhmm - Time string in HH:mm format (24-hour) in local timezone
 * @param date - Date object or ISO8601Date string for the date portion
 * @returns RFC3339DateTime (UTC)
 * 
 * @example
 * ```typescript
 * const date = new Date('2026-01-15')
 * localHHmmToRfc3339('09:30', date) // Returns: "2026-01-15T14:30:00.000Z" (if EST, UTC is +5 hours)
 * ```
 */
function localHHmmToRfc3339(hhmm: string, date: Date | ISO8601Date): RFC3339DateTime {
  const [hours, minutes] = hhmm.split(':').map(Number)
  
  let dateObj: Date
  if (date instanceof Date) {
    dateObj = new Date(date)
  } else {
    // Parse ISO8601Date string (YYYY-MM-DD)
    const [year, month, day] = date.split('-').map(Number)
    dateObj = new Date(year, month - 1, day)
  }
  
  // Set time in local timezone
  dateObj.setHours(hours, minutes, 0, 0)
  
  // Convert to UTC RFC3339
  return dateObj.toISOString() as RFC3339DateTime
}

/**
 * Format RFC3339 datetime for display using Intl.DateTimeFormat
 * LEARNING: Formats UTC RFC3339 datetime for display in local timezone
 * WHY: Provides flexible formatting options for different display contexts
 * PATTERN: Parse RFC3339, use Intl.DateTimeFormat for locale-aware formatting
 * 
 * @param rfc3339 - RFC3339 datetime string (UTC)
 * @param options - Intl.DateTimeFormatOptions for formatting
 * @returns Formatted time string in local timezone
 * 
 * @example
 * ```typescript
 * formatTimeForDisplay('2026-01-15T14:30:00Z', { 
 *   hour: 'numeric', 
 *   minute: '2-digit',
 *   hour12: true 
 * }) // Returns: "9:30 AM" (in local timezone)
 * ```
 */
function formatTimeForDisplay(
  rfc3339: RFC3339DateTime,
  options?: Intl.DateTimeFormatOptions
): string {
  const date = new Date(rfc3339)
  const defaultOptions: Intl.DateTimeFormatOptions = {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    ...options
  }
  return date.toLocaleString('en-US', defaultOptions)
}

/**
 * Format time range (TimeRange or TimeSlot) for display
 * LEARNING: Formats time range for display in local timezone
 * WHY: Common pattern for displaying time slots and ranges
 * PATTERN: Extract start/end times, format both, combine with separator
 * 
 * @param range - TimeRange or TimeSlot object with startTime/endTime
 * @returns Formatted time range string (e.g., "9:30 AM - 10:30 AM")
 */
function formatTimeRangeForDisplay(range: TimeRange | TimeSlot): string {
  if (!('startTime' in range && 'endTime' in range)) {
    throw new Error('Invalid time range object: must have startTime/endTime')
  }
  
  const start = new Date(range.startTime)
  const end = new Date(range.endTime)
  
  const formatTime = (date: Date): string => {
    const hours = date.getHours()
    const minutes = date.getMinutes()
    const ampm = hours >= 12 ? 'PM' : 'AM'
    const displayHours = hours % 12 || 12
    const displayMinutes = minutes.toString().padStart(2, '0')
    return `${displayHours}:${displayMinutes} ${ampm}`
  }
  
  return `${formatTime(start)} - ${formatTime(end)}`
}

/**
 * Extract time-of-day (HH:mm) from RFC3339 datetime in local timezone
 * LEARNING: Extracts time portion from RFC3339 and returns as HH:mm in local timezone
 * WHY: Used for time-only display when date portion is not needed
 * PATTERN: Parse RFC3339, extract local hours/minutes, format as HH:mm
 * 
 * @param rfc3339 - RFC3339 datetime string (UTC)
 * @returns Time string in HH:mm format (24-hour) in local timezone
 */
function rfc3339ToLocalTimeOfDay(rfc3339: RFC3339DateTime): string {
  return rfc3339ToLocalHHmm(rfc3339)
}

/**
 * Format RFC3339 datetime for date-only display using Intl.DateTimeFormat
 * LEARNING: Formats UTC RFC3339 datetime for date display in local timezone
 * WHY: Provides flexible date formatting options for different display contexts
 * PATTERN: Parse RFC3339, use Intl.DateTimeFormat for locale-aware date formatting
 * 
 * @param rfc3339 - RFC3339 datetime string (UTC)
 * @param options - Intl.DateTimeFormatOptions for formatting (defaults to date-only)
 * @returns Formatted date string in local timezone
 * 
 * @example
 * ```typescript
 * formatDateForDisplay('2026-01-15T14:30:00Z', { 
 *   month: 'short', 
 *   day: 'numeric' 
 * }) // Returns: "Jan 15" (in local timezone)
 * ```
 */
function formatDateForDisplay(
  rfc3339: RFC3339DateTime,
  options?: Intl.DateTimeFormatOptions
): string {
  const date = new Date(rfc3339)
  const defaultOptions: Intl.DateTimeFormatOptions = {
    month: 'short',
    day: 'numeric',
    ...options
  }
  return date.toLocaleDateString('en-US', defaultOptions)
}

/**
 * Format RFC3339 datetime for date+time display using Intl.DateTimeFormat
 * LEARNING: Formats UTC RFC3339 datetime for full date+time display in local timezone
 * WHY: Provides flexible date+time formatting options for different display contexts
 * PATTERN: Parse RFC3339, use Intl.DateTimeFormat for locale-aware date+time formatting
 * 
 * @param rfc3339 - RFC3339 datetime string (UTC)
 * @param options - Intl.DateTimeFormatOptions for formatting (defaults to date+time)
 * @returns Formatted date+time string in local timezone
 * 
 * @example
 * ```typescript
 * formatDateTimeForDisplay('2026-01-15T14:30:00Z', { 
 *   month: 'short',
 *   day: 'numeric',
 *   hour: 'numeric',
 *   minute: '2-digit',
 *   hour12: true
 * }) // Returns: "Jan 15, 9:30 AM" (in local timezone)
 * ```
 */
function formatDateTimeForDisplay(
  rfc3339: RFC3339DateTime,
  options?: Intl.DateTimeFormatOptions
): string {
  const date = new Date(rfc3339)
  const defaultOptions: Intl.DateTimeFormatOptions = {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    ...options
  }
  return date.toLocaleString('en-US', defaultOptions)
}

/**
 * Format ISO8601Date (YYYY-MM-DD) for display
 * LEARNING: Formats date-only values for UI display
 * WHY: selectedDate is stored as DATEONLY, needs formatting for display
 * PATTERN: Convert DATEONLY to RFC3339 (midnight UTC), then format
 * 
 * @param dateOnly - ISO8601Date string (YYYY-MM-DD format)
 * @param options - Intl.DateTimeFormatOptions for formatting
 * @returns Formatted date string in local timezone
 * 
 * @example
 * ```typescript
 * formatDateOnlyForDisplay('2026-01-15') // Returns: "Jan 15" (in local timezone)
 * formatDateOnlyForDisplay('2026-01-15', { year: 'numeric' }) // Returns: "Jan 15, 2026"
 * ```
 */
function formatDateOnlyForDisplay(
  dateOnly: ISO8601Date,
  options?: Intl.DateTimeFormatOptions
): string {
  // Convert DATEONLY to RFC3339 (midnight UTC)
  const rfc3339 = `${dateOnly}T00:00:00Z` as RFC3339DateTime
  return formatDateForDisplay(rfc3339, options)
}

/**
 * Reference date for business hours (fixed date to store time-of-day as RFC3339)
 * LEARNING: Use fixed reference date so time-of-day values can be stored as RFC3339
 * WHY: Business hours are time-of-day (e.g., "09:00"), not absolute datetimes
 * PATTERN: Use 2000-01-01 as reference, extract time portion when needed
 * NOTE: Create date in LOCAL timezone (year, month, day) to avoid date shifting when setting hours
 */
const BUSINESS_HOURS_REFERENCE_DATE = new Date(2000, 0, 1, 0, 0, 0, 0) // Jan 1, 2000 midnight LOCAL time

/**
 * Convert business hours time-of-day (HH:mm) to RFC3339 using reference date
 * LEARNING: Converts HH:mm (local time-of-day) to RFC3339 for storage (UI-boundary function for admin forms)
 * WHY: Business hours stored as RFC3339 internally, but UI uses HH:mm in local timezone
 * PATTERN: Create Date in local timezone with reference date, set local hours/minutes, convert to UTC RFC3339
 * NOTE: Business hours are time-of-day values in local timezone, not UTC. When admin enters "09:00",
 *       that means 9:00 AM local time, which must be converted to UTC for storage.
 * 
 * @param time - Time string in HH:mm format (24-hour) representing LOCAL time-of-day
 * @returns RFC3339DateTime (branded type) using reference date, converted to UTC
 * 
 * @example
 * ```typescript
 * // If admin enters "09:00" meaning 9:00 AM local (EST, UTC-5)
 * businessHoursHHmmToRfc3339('09:00') // Returns: "2000-01-01T14:00:00.000Z" (9 AM EST = 2 PM UTC)
 * ```
 */
function businessHoursHHmmToRfc3339(time: string): RFC3339DateTime {
  const [hours, minutes] = time.split(':').map(Number)
  
  // LEARNING: Create Date object in local timezone with reference date
  // WHY: Business hours are local time-of-day, so we set hours/minutes in local timezone
  // PATTERN: Create new Date from reference date (already in local timezone), set local time, then convert to UTC RFC3339
  // NOTE: BUSINESS_HOURS_REFERENCE_DATE is created in local timezone, so getTime() preserves that, then setHours modifies it
  const localDate = new Date(BUSINESS_HOURS_REFERENCE_DATE.getTime())
  localDate.setHours(hours, minutes, 0, 0) // Set in LOCAL timezone (date stays on same day since reference is local)
  
  // Convert to UTC RFC3339
  return localDate.toISOString() as RFC3339DateTime
}

/**
 * Extract business hours time-of-day (HH:mm) from RFC3339 using reference date
 * LEARNING: Converts RFC3339 to HH:mm format for UI display (UI-boundary function for admin forms)
 * WHY: Business hours stored as RFC3339 but displayed as HH:mm in local timezone
 * PATTERN: Parse RFC3339, extract LOCAL hours/minutes (not UTC) since business hours represent local time-of-day
 * NOTE: Business hours RFC3339 strings represent local time-of-day stored as UTC. When we display,
 *       we need to convert back to local time to show the original local time-of-day.
 * 
 * @param rfc3339 - RFC3339 datetime string (using reference date, stored as UTC but represents local time-of-day)
 * @returns Time string in HH:mm format (24-hour) representing LOCAL time-of-day
 * 
 * @example
 * ```typescript
 * // If RFC3339 is "2000-01-01T14:00:00.000Z" (stored UTC representing 9:00 AM EST)
 * rfc3339ToBusinessHoursHHmm('2000-01-01T14:00:00.000Z') // Returns: "09:00" (9 AM local)
 * ```
 */
function rfc3339ToBusinessHoursHHmm(rfc3339: RFC3339DateTime): string {
  const date = new Date(rfc3339)
  // LEARNING: Use getHours() and getMinutes() to get LOCAL time-of-day
  // WHY: Business hours RFC3339 strings represent local time-of-day, so we extract local time
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${hours}:${minutes}`
}

/**
 * Convert user-entered time (HH:mm) to RFC3339 for any UI boundary
 * LEARNING: General-purpose converter for user time inputs (UI-boundary function)
 * WHY: Any UI component that accepts time input needs to convert HH:mm back to RFC3339
 * PATTERN: Accepts HH:mm + date, creates Date in local timezone, converts to UTC RFC3339
 * 
 * This is a convenience wrapper around localHHmmToRfc3339 for clarity in UI components.
 * Use this when users enter times in forms, time pickers, or any other UI input.
 * 
 * @param hhmm - Time string in HH:mm format (24-hour) in local timezone
 * @param date - Date object or ISO8601Date string (YYYY-MM-DD) for the date portion
 * @returns RFC3339DateTime (UTC)
 * 
 * @example
 * ```typescript
 * // User enters "09:30" in a time input for date "2026-01-15"
 * userTimeToRfc3339('09:30', '2026-01-15') // Returns: "2026-01-15T14:30:00.000Z" (if EST, UTC is +5 hours)
 * ```
 */
function userTimeToRfc3339(hhmm: string, date: Date | ISO8601Date): RFC3339DateTime {
  return localHHmmToRfc3339(hhmm, date)
}

/**
 * Extract business hours minutes from RFC3339 datetime
 * LEARNING: Extracts hours and minutes for business hours comparison (UI-boundary function)
 * WHY: Business hours are stored as RFC3339 with reference date but represent local time-of-day
 * PATTERN: Parse RFC3339, extract local hours/minutes (not UTC) since business hours represent local time-of-day
 * 
 * This function is used for business hours comparison logic, not display.
 * Business hours RFC3339 strings represent local time-of-day stored as UTC.
 * 
 * @param rfc3339 - RFC3339 datetime string (using reference date, stored as UTC but represents local time-of-day)
 * @returns Object with hours and minutes in local timezone
 * 
 * @example
 * ```typescript
 * // If RFC3339 is "2000-01-01T14:00:00.000Z" (stored UTC representing 9:00 AM EST)
 * extractBusinessHoursMinutes('2000-01-01T14:00:00.000Z') // Returns: { hours: 9, minutes: 0 }
 * ```
 */
export function extractBusinessHoursMinutes(rfc3339: RFC3339DateTime): { hours: number; minutes: number } {
  const date = new Date(rfc3339)
  // LEARNING: Use getHours() and getMinutes() to get LOCAL time-of-day
  // WHY: Business hours RFC3339 strings represent local time-of-day, so we extract local time
  return {
    hours: date.getHours(),
    minutes: date.getMinutes()
  }
}

/**
 * Convert RFC3339 datetime to minutes from midnight in local timezone
 * LEARNING: Converts RFC3339 to minutes from midnight for business hours comparison (UI-boundary function)
 * WHY: Business hours comparison needs minutes from midnight in local timezone
 * PATTERN: Extract local hours/minutes, convert to total minutes from midnight
 * 
 * This function is used for comparing slot times against business hours.
 * Business hours are interpreted as local time-of-day, so slots must be compared in local time.
 * 
 * @param rfc3339 - RFC3339 datetime string (UTC)
 * @returns Minutes from midnight in local timezone
 * 
 * @example
 * ```typescript
 * // If RFC3339 is "2026-01-15T14:30:00Z" and local timezone is EST (-5)
 * // Local time is 9:30 AM, which is 570 minutes from midnight
 * rfc3339ToLocalMinutesFromMidnight('2026-01-15T14:30:00Z') // Returns: 570
 * ```
 */
export function rfc3339ToLocalMinutesFromMidnight(rfc3339: RFC3339DateTime): number {
  const date = new Date(rfc3339)
  // LEARNING: Use getHours() and getMinutes() to get LOCAL time-of-day
  // WHY: Business hours are interpreted as local time-of-day, so we need local minutes from midnight
  return date.getHours() * 60 + date.getMinutes()
}

/**
 * Check if RFC3339 datetime is today in local timezone
 * LEARNING: UTC-aware "is today" check for UI-boundary date comparisons (UI-boundary function)
 * WHY: Date comparisons need to account for timezone - "today" means today in user's local timezone
 * PATTERN: Parse RFC3339, compare date components in local timezone
 * 
 * This replaces the old isToday() helper that used local time methods incorrectly.
 * 
 * @param rfc3339 - RFC3339 datetime string (UTC)
 * @returns true if the date is today in local timezone, false otherwise
 * 
 * @example
 * ```typescript
 * // If today is 2026-01-15 and local timezone is EST
 * isTodayLocal('2026-01-15T14:30:00Z') // Returns: true (14:30 UTC = 9:30 AM EST on same day)
 * isTodayLocal('2026-01-16T04:30:00Z') // Returns: true (4:30 UTC = 11:30 PM EST previous day, but date is today)
 * ```
 */
function isTodayLocal(rfc3339: RFC3339DateTime): boolean {
  const date = new Date(rfc3339)
  const today = new Date()
  
  // LEARNING: Compare date components in local timezone
  // WHY: "Today" is defined by the user's local timezone, not UTC
  // PATTERN: Compare local date, month, and year
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  )
}

export interface UseLocalTimeReturn {
  rfc3339ToLocalTime: (rfc3339: RFC3339DateTime) => Date
  rfc3339ToLocalHHmm: (rfc3339: RFC3339DateTime) => string
  localHHmmToRfc3339: (hhmm: string, date: Date | ISO8601Date) => RFC3339DateTime
  userTimeToRfc3339: (hhmm: string, date: Date | ISO8601Date) => RFC3339DateTime
  formatTimeForDisplay: (rfc3339: RFC3339DateTime, options?: Intl.DateTimeFormatOptions) => string
  formatTimeRangeForDisplay: (range: TimeRange | TimeSlot) => string
  rfc3339ToLocalTimeOfDay: (rfc3339: RFC3339DateTime) => string
  businessHoursHHmmToRfc3339: (time: string) => RFC3339DateTime
  rfc3339ToBusinessHoursHHmm: (rfc3339: RFC3339DateTime) => string
  formatDateForDisplay: (rfc3339: RFC3339DateTime, options?: Intl.DateTimeFormatOptions) => string
  formatDateTimeForDisplay: (rfc3339: RFC3339DateTime, options?: Intl.DateTimeFormatOptions) => string
  formatDateOnlyForDisplay: (dateOnly: ISO8601Date, options?: Intl.DateTimeFormatOptions) => string
  extractBusinessHoursMinutes: (rfc3339: RFC3339DateTime) => { hours: number; minutes: number }
  rfc3339ToLocalMinutesFromMidnight: (rfc3339: RFC3339DateTime) => number
  isTodayLocal: (rfc3339: RFC3339DateTime) => boolean
}

/**
 * useLocalTime Composable
 * LEARNING: Provides UI-boundary time conversion functions
 * WHY: Centralizes all local time conversions to ensure UTC RFC3339 everywhere else
 * PATTERN: Composable that returns conversion functions
 * 
 * @returns Object with time conversion functions
 */
export function useLocalTime(): UseLocalTimeReturn {
  return {
    rfc3339ToLocalTime,
    rfc3339ToLocalHHmm,
    localHHmmToRfc3339,
    userTimeToRfc3339,
    formatTimeForDisplay,
    formatTimeRangeForDisplay,
    rfc3339ToLocalTimeOfDay,
    businessHoursHHmmToRfc3339,
    rfc3339ToBusinessHoursHHmm,
    formatDateForDisplay,
    formatDateTimeForDisplay,
    formatDateOnlyForDisplay,
    extractBusinessHoursMinutes,
    rfc3339ToLocalMinutesFromMidnight,
    isTodayLocal,
  }
}
