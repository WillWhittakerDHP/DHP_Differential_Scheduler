
import type { RFC3339DateTime } from '@shared/types/primitiveBrands'

let testBaseDate: Date = new Date()

export function setTestBaseDate(date: Date = new Date()): void {
  testBaseDate = new Date(date)
}

export function getTestBaseDate(): Date {
  return new Date(testBaseDate)
}

function getNextDayOfWeek(dayOfWeek: number, baseDate: Date = testBaseDate): Date {
  const date = new Date(baseDate)
  const currentDay = date.getUTCDay()
  const daysUntilTarget = (dayOfWeek - currentDay + 7) % 7 || 7 // If today is target, get next week
  date.setUTCDate(date.getUTCDate() + daysUntilTarget)
  date.setUTCHours(0, 0, 0, 0) // Reset to midnight UTC
  return date
}

export function createTestDateTime(
  date: Date,
  hours: number,
  minutes: number = 0
): RFC3339DateTime {
  const testDate = new Date(date)
  testDate.setUTCHours(hours, minutes, 0, 0)
  return testDate.toISOString() as RFC3339DateTime
}

export function nextMonday9AM(): RFC3339DateTime {
  const monday = getNextDayOfWeek(1) // Monday = 1
  return createTestDateTime(monday, 9, 0)
}

export function nextMonday7PM(): RFC3339DateTime {
  const monday = getNextDayOfWeek(1) // Monday = 1
  return createTestDateTime(monday, 19, 0)
}

export function nextThursday9AM(): RFC3339DateTime {
  const thursday = getNextDayOfWeek(4) // Thursday = 4
  return createTestDateTime(thursday, 9, 0)
}

export function nextThursday7PM(): RFC3339DateTime {
  const thursday = getNextDayOfWeek(4) // Thursday = 4
  return createTestDateTime(thursday, 19, 0)
}

export function nextDayAtTime(
  dayOfWeek: number,
  hours: number,
  minutes: number = 0
): RFC3339DateTime {
  const day = getNextDayOfWeek(dayOfWeek)
  return createTestDateTime(day, hours, minutes)
}

export function todayAtTime(hours: number, minutes: number = 0): RFC3339DateTime {
  const today = new Date(testBaseDate)
  return createTestDateTime(today, hours, minutes)
}

export function tomorrowAtTime(hours: number, minutes: number = 0): RFC3339DateTime {
  const tomorrow = new Date(testBaseDate)
  tomorrow.setUTCDate(tomorrow.getUTCDate() + 1)
  return createTestDateTime(tomorrow, hours, minutes)
}

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

export function nextDayDateOnly(dayOfWeek: number): string {
  const day = getNextDayOfWeek(dayOfWeek)
  const year = day.getUTCFullYear()
  const month = String(day.getUTCMonth() + 1).padStart(2, '0')
  const date = String(day.getUTCDate()).padStart(2, '0')
  return `${year}-${month}-${date}`
}

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
