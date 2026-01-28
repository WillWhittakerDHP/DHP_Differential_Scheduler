import type { TimeRange, TimeSlot } from '@/types/appointment'
import type { ISO8601Date } from '@/types/datetime'
import { useLocalTime } from '@/composables/useLocalTime'

type MaybeRef<Value> = Value | { value: Value }

// Create composable instance for utility function use
const { formatTimeRangeForDisplay } = useLocalTime()

/**
 * Format a time range from a TimeRange or TimeSlot object.
 * LEARNING: Uses useLocalTime composable for UI-boundary formatting
 * WHY: Ensures all local time conversions happen only at UI boundary
 * PATTERN: Delegate to formatTimeRangeForDisplay from useLocalTime composable
 */
export function formatTimeRange(range: TimeRange | TimeSlot): string {
  return formatTimeRangeForDisplay(range)
}

/**
 * Compare two TimeRange or TimeSlot objects for equality.
 */
export function areSlotsEqual(
  slot1: TimeRange | TimeSlot | null, 
  slot2: TimeRange | TimeSlot | null
): boolean {
  if (!slot1 || !slot2) return false
  
  if ('startTime' in slot1 && 'endTime' in slot1 && 'startTime' in slot2 && 'endTime' in slot2) {
    return slot1.startTime === slot2.startTime && slot1.endTime === slot2.endTime
  }
  
  return false
}

/**
 * Format duration in minutes to a readable string ("Xh Ym" / "Xh" / "Ym").
 */
export function formatDuration(minutes: number): string {
  if (minutes === 0) return '0m'

  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60

  if (hours > 0 && mins > 0) {
    return `${hours}h ${mins}m`
  }
  if (hours > 0) {
    return `${hours}h`
  }
  return `${mins}m`
}

/**
 * Get today's date in ISO 8601 format (YYYY-MM-DD).
 * LEARNING: Returns ISO 8601 date format for date-only values
 * WHY: Consistent with RFC3339 datetime approach, aligns with international standards
 * PATTERN: Extract date portion from UTC datetime
 */
export function getTodayDate(): ISO8601Date {
  const today = new Date()
  return today.toISOString().split('T')[0] as ISO8601Date
}

/**
 * Get first available date from time slots (falls back to today).
 * LEARNING: Returns ISO 8601 date format (YYYY-MM-DD) for date-only values
 * WHY: Consistent with date format standards throughout the codebase
 * PATTERN: Extract date portion from RFC3339 datetime strings
 */
export function getFirstAvailabilityDate(
  timeSlots: MaybeRef<(TimeRange | TimeSlot)[]>
): ISO8601Date {
  const slots = 'value' in timeSlots ? timeSlots.value : timeSlots

  if (slots && slots.length > 0) {
    const dates = slots
      .map((slot) => {
        if ('startTime' in slot) {
          return new Date(slot.startTime).toISOString().split('T')[0] as ISO8601Date
        }
        return null
      })
      .filter((date): date is ISO8601Date => date !== null)
      .sort()

    if (dates.length > 0) {
      return dates[0]
    }
  }

  return getTodayDate()
}


