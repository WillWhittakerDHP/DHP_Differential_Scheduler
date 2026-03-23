/**
 * WHY: Moveable/availability day keys are UTC calendar YYYY-MM-DD; UI must not use
 * toLocaleDateString without timeZone: 'UTC' or the weekday/calendar shifts in the browser TZ.
 * PATTERN: UTC for calendar keys and stepping; local formatting only where explicitly for wall-clock (e.g. time-of-day).
 */
import type { RFC3339DateTime } from '@shared/types/primitiveBrands'

/** Today's date as UTC calendar key (matches server slotsByDay / moveable fetch keys). */
export function currentUtcDateKey(): string {
  const n = new Date()
  const y = n.getUTCFullYear()
  const m = String(n.getUTCMonth() + 1).padStart(2, '0')
  const d = String(n.getUTCDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

/** Add calendar days in UTC to a YYYY-MM-DD key. */
export function addUtcDaysToDateKey(dayKey: string, deltaDays: number): string {
  const [y, mo, d] = dayKey.split('-').map(Number)
  const date = new Date(Date.UTC(y, (mo ?? 1) - 1, d ?? 1, 0, 0, 0, 0))
  date.setUTCDate(date.getUTCDate() + deltaDays)
  return date.toISOString().slice(0, 10)
}

/** Stepper / header: weekday + month + day for a UTC calendar key. */
export function formatUtcDayKeyWithWeekday(dayKey: string): string {
  const [y, mo, d] = dayKey.split('-').map(Number)
  if (!y || !mo || !d) return dayKey
  const instant = new Date(Date.UTC(y, mo - 1, d, 12, 0, 0, 0))
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  }).format(instant)
}

/** Moveable confirm row: month + day only, UTC calendar of the slot start instant. */
export function formatRfc3339UtcCalendarShort(rfc3339: RFC3339DateTime): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(rfc3339))
}
