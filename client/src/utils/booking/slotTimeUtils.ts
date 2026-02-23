/**
 * Slot Time Utilities
 *
 */

import type { TimeRange } from '@/types/appointment'
import type { RFC3339DateTime } from '@shared/types/primitiveBrands'

export function createTimeRange(startTime: string, duration: number): TimeRange {
  const start = new Date(startTime)
  const end = new Date(start)
  end.setUTCMinutes(end.getUTCMinutes() + duration)

  const result = {
    startTime: start.toISOString() as RFC3339DateTime,
    endTime: end.toISOString() as RFC3339DateTime,
    duration
  }

  return result
}

/**
 * WHY: Add minutes to a start time
LEARNING: Helper to add minutes to an ISO st...
 */
export function addMinutes(startTime: string, minutes: number): string {
  const date = new Date(startTime)
  date.setUTCMinutes(date.getUTCMinutes() + minutes)
  return date.toISOString()
}
