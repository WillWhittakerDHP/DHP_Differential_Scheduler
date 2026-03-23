/**
 * WHY: RFC3339 UTC day window for availability API — pure date math isolated from composable.
 */

import type { ISO8601Date, RFC3339DateTime } from '@shared/types/primitiveBrands'
import { parseUTCDate } from '@/utils/booking/dateUtils'
import { toRFC3339DateTime } from '@/utils/datetime'

export interface Rfc3339DayRange {
  start: RFC3339DateTime
  end: RFC3339DateTime
}

/**
 * Builds [start of UTC day, end of same UTC day] for the given calendar date string.
 * Returns null if the date is invalid or strictly before today's UTC calendar date.
 */
export function buildRfc3339UtcDayRangeForSelectedDate(startValue: ISO8601Date): Rfc3339DayRange | null {
  const startDate = parseUTCDate(startValue)
  if (!startDate) {
    return null
  }

  const endCal = new Date(
    Date.UTC(startDate.getUTCFullYear(), startDate.getUTCMonth(), startDate.getUTCDate() + 1, 0, 0, 0, 0)
  )

  const startDateTime = new Date(
    Date.UTC(startDate.getUTCFullYear(), startDate.getUTCMonth(), startDate.getUTCDate(), 0, 0, 0, 0)
  )

  const now = new Date()
  const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0))
  const startDateOnly = new Date(
    Date.UTC(startDate.getUTCFullYear(), startDate.getUTCMonth(), startDate.getUTCDate(), 0, 0, 0, 0)
  )

  if (startDateOnly < today) {
    return null
  }

  const endDateTime = new Date(
    Date.UTC(endCal.getUTCFullYear(), endCal.getUTCMonth(), endCal.getUTCDate(), 23, 59, 59, 999)
  )

  return {
    start: toRFC3339DateTime(startDateTime),
    end: toRFC3339DateTime(endDateTime),
  }
}
