import type { ISO8601Date, RFC3339DateTime } from '@shared/types/primitiveBrands'
import type { DayOfWeek } from '@/types/datetime'

export function toISO8601Date(value: string): ISO8601Date {
  return value as ISO8601Date
}

export function isRFC3339DateTime(value: string): value is RFC3339DateTime {
  const rfc3339Regex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?([+-]\d{2}:\d{2}|Z)$/
  return rfc3339Regex.test(value)
}

export function validateRFC3339DateTime(value: string): RFC3339DateTime {
  if (!isRFC3339DateTime(value)) {
    throw new Error(`Invalid RFC3339DateTime: ${value}`)
  }
  return value
}

export function toRFC3339DateTime(date: Date): RFC3339DateTime {
  return date.toISOString() as RFC3339DateTime
}

export function toDayOfWeek(n: number): DayOfWeek {
  if (!Number.isInteger(n) || n < 0 || n > 6) {
    throw new Error(`Invalid day of week: ${n}. Must be integer between 0 and 6.`)
  }
  return n as DayOfWeek
}

export function getDayOfWeek(date: Date): DayOfWeek {
  return date.getDay() as DayOfWeek
}
