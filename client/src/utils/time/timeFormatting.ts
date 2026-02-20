import type { TimeRange, TimeSlot } from '@/types/appointment'
import type { ISO8601Date } from '@shared/types/primitiveBrands'
import { useLocalTime } from '@/composables/useLocalTime'

type MaybeRef<Value> = Value | { value: Value }

const { formatTimeRangeForDisplay } = useLocalTime()

export function formatTimeRange(range: TimeRange | TimeSlot): string {
  return formatTimeRangeForDisplay(range)
}

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

export function getTodayDate(): ISO8601Date {
  const today = new Date()
  return today.toISOString().split('T')[0] as ISO8601Date
}

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


