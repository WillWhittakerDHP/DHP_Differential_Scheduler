/**
 * Slot Time Utilities
 *
 * LEARNING: Pure time math for appointment slots (no shape/slot logic).
 * WHY: Shared by slot builder and perspective resolver; keeps time logic in one place.
 * PATTERN: Pure functions, no side effects.
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
 * Add minutes to a start time
 * LEARNING: Helper to add minutes to an ISO string
 * WHY: Used for calculating client start time with offset (e.g. differential minor range)
 * PATTERN: Create Date, add minutes, return ISO string
 */
export function addMinutes(startTime: string, minutes: number): string {
  const date = new Date(startTime)
  date.setUTCMinutes(date.getUTCMinutes() + minutes)
  return date.toISOString()
}
