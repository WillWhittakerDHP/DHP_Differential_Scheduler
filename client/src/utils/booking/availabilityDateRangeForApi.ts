/**
 * WHY: RFC3339 UTC day window for availability API — pure date math isolated from composable.
 */

import type { ISO8601Date } from '@shared/types/primitiveBrands'
import type { TimeRangeBounds } from '@shared/types/availabilityTypes'
import { parseUTCDate } from '@/utils/booking/dateUtils'
import { toRFC3339DateTime } from '@/utils/datetime'

/**
 * Builds [start of UTC day, end of same UTC day] for the given calendar date string.
 * Returns null if the date is invalid or strictly before today's UTC calendar date.
 */
export function buildRfc3339UtcDayRangeForSelectedDate(startValue: ISO8601Date): TimeRangeBounds | null {
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
