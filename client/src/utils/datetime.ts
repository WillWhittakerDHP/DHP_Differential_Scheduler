import type { ISO8601Date, RFC3339DateTime } from '@shared/types/primitiveBrands'

export function toISO8601Date(value: string): ISO8601Date {
  return value as ISO8601Date
}

export function toRFC3339DateTime(date: Date): RFC3339DateTime {
  return date.toISOString() as RFC3339DateTime
}
