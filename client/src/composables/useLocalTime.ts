/**
 * WHY: useLocalTime Composable

LEARNING: Centralized composable for UI-boundar...
 */
import type { RFC3339DateTime, ISO8601Date } from '@shared/types/primitiveBrands'
import type { TimeRange, TimeSlot } from '@/types/appointment'

/**
 * WHY: Convert RFC3339 datetime to local Date object for display
LEARNING: Conv...
 */
function rfc3339ToLocalTime(rfc3339: RFC3339DateTime): Date {
  return new Date(rfc3339)
}

/**
 * WHY: Convert RFC3339 datetime to HH:mm format in local timezone
LEARNING: Ext...
 */
export function rfc3339ToLocalHHmm(rfc3339: RFC3339DateTime): string {
  const date = new Date(rfc3339)
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${hours}:${minutes}`
}

/**
 * WHY: Convert local HH:mm + date to RFC3339 datetime
LEARNING: Combines local ...
 */
function localHHmmToRfc3339(hhmm: string, date: Date | ISO8601Date): RFC3339DateTime {
  const [hours, minutes] = hhmm.split(':').map(Number)
  
  let dateObj: Date
  if (date instanceof Date) {
    dateObj = new Date(date)
  } else {
    const [year, month, day] = date.split('-').map(Number)
    dateObj = new Date(year, month - 1, day)
  }
  
  dateObj.setHours(hours, minutes, 0, 0)
  
  return dateObj.toISOString() as RFC3339DateTime
}

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

function rfc3339ToLocalTimeOfDay(rfc3339: RFC3339DateTime): string {
  return rfc3339ToLocalHHmm(rfc3339)
}

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

function formatDateOnlyForDisplay(
  dateOnly: ISO8601Date,
  options?: Intl.DateTimeFormatOptions
): string {
  const rfc3339 = `${dateOnly}T00:00:00Z` as RFC3339DateTime
  return formatDateForDisplay(rfc3339, options)
}

/**
 * WHY: Reference date for business hours (fixed date to store time-of-day as RF...
 */
const BUSINESS_HOURS_REFERENCE_DATE = new Date(2000, 0, 1, 0, 0, 0, 0) // Jan 1, 2000 midnight LOCAL time

/**
 * WHY: Convert business hours time-of-day (HH:mm) to RFC3339 using reference da...
 */
function businessHoursHHmmToRfc3339(time: string): RFC3339DateTime {
  const [hours, minutes] = time.split(':').map(Number)
  
  // LEARNING: Create Date object in local timezone with reference date
  // WHY: Business hours are local time-of-day, so we set hours/minutes in local timezone
  // PATTERN: Create new Date from reference date (already in local timezone), set local time, then convert to UTC RFC3339
  const localDate = new Date(BUSINESS_HOURS_REFERENCE_DATE.getTime())
  localDate.setHours(hours, minutes, 0, 0) // Set in LOCAL timezone (date stays on same day since reference is local)
  
  return localDate.toISOString() as RFC3339DateTime
}

function rfc3339ToBusinessHoursHHmm(rfc3339: RFC3339DateTime): string {
  const date = new Date(rfc3339)
  // WHY: Business hours RFC3339 strings represent local time-of-day, so we extract local time
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${hours}:${minutes}`
}

/**
 * WHY: Convert user-entered time (HH:mm) to RFC3339 for any UI boundary
WHY: An...
 */
function userTimeToRfc3339(hhmm: string, date: Date | ISO8601Date): RFC3339DateTime {
  return localHHmmToRfc3339(hhmm, date)
}

export function extractBusinessHoursMinutes(rfc3339: RFC3339DateTime): { hours: number; minutes: number } {
  const date = new Date(rfc3339)
  // WHY: Business hours RFC3339 strings represent local time-of-day, so we extract local time
  return {
    hours: date.getHours(),
    minutes: date.getMinutes()
  }
}

/**
 * WHY: Convert RFC3339 datetime to minutes from midnight in local timezone
LEAR...
 */
export function rfc3339ToLocalMinutesFromMidnight(rfc3339: RFC3339DateTime): number {
  const date = new Date(rfc3339)
  // WHY: Business hours are interpreted as local time-of-day, so we need local minutes from midnight
  return date.getHours() * 60 + date.getMinutes()
}

/**
 * WHY: Check if RFC3339 datetime is today in local timezone
LEARNING: UTC-aware...
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
 * WHY: useLocalTime Composable
WHY: Centralizes all local time conversions to e...
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
