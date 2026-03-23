/**
 */
import type { RFC3339DateTime, ISO8601Date } from '@shared/types/primitiveBrands'
import type { SlotTimeBounds } from '@shared/types/availabilityTypes'
import type { TimeSlot } from '@/types/appointment'

function rfc3339ToLocalTime(rfc3339: RFC3339DateTime): Date {
  return new Date(rfc3339)
}

export function rfc3339ToLocalHHmm(rfc3339: RFC3339DateTime): string {
  const date = new Date(rfc3339)
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${hours}:${minutes}`
}

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

export function formatTimeRangeForDisplay(range: SlotTimeBounds | TimeSlot): string {
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

export function formatDateTimeForDisplay(
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

const BUSINESS_HOURS_REFERENCE_DATE = new Date(2000, 0, 1, 0, 0, 0, 0)

function businessHoursHHmmToRfc3339(time: string): RFC3339DateTime {
  const [hours, minutes] = time.split(':').map(Number)
  const localDate = new Date(BUSINESS_HOURS_REFERENCE_DATE.getTime())
  localDate.setHours(hours, minutes, 0, 0)
  return localDate.toISOString() as RFC3339DateTime
}

function rfc3339ToBusinessHoursHHmm(rfc3339: RFC3339DateTime): string {
  const date = new Date(rfc3339)
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${hours}:${minutes}`
}

function userTimeToRfc3339(hhmm: string, date: Date | ISO8601Date): RFC3339DateTime {
  return localHHmmToRfc3339(hhmm, date)
}

function extractBusinessHoursMinutes(rfc3339: RFC3339DateTime): { hours: number; minutes: number } {
  const date = new Date(rfc3339)
  return {
    hours: date.getHours(),
    minutes: date.getMinutes()
  }
}

function rfc3339ToLocalMinutesFromMidnight(rfc3339: RFC3339DateTime): number {
  const date = new Date(rfc3339)
  return date.getHours() * 60 + date.getMinutes()
}

function isTodayLocal(rfc3339: RFC3339DateTime): boolean {
  const date = new Date(rfc3339)
  const today = new Date()
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  )
}

interface LocalTimeReturn {
  rfc3339ToLocalTime: (rfc3339: RFC3339DateTime) => Date
  rfc3339ToLocalHHmm: (rfc3339: RFC3339DateTime) => string
  localHHmmToRfc3339: (hhmm: string, date: Date | ISO8601Date) => RFC3339DateTime
  userTimeToRfc3339: (hhmm: string, date: Date | ISO8601Date) => RFC3339DateTime
  formatTimeForDisplay: (rfc3339: RFC3339DateTime, options?: Intl.DateTimeFormatOptions) => string
  formatTimeRangeForDisplay: (range: SlotTimeBounds | TimeSlot) => string
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

export function useLocalTime(): LocalTimeReturn {
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
