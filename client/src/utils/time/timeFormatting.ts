import type { SlotTimeBounds } from '@shared/types/availabilityTypes'
import type { TimeSlot } from '@/types/appointment'
import type { ISO8601Date } from '@shared/types/primitiveBrands'
import { formatTimeRangeForDisplay } from '@/utils/time/localTime'

type MaybeRef<Value> = Value | { value: Value }

export function formatTimeRange(range: SlotTimeBounds | TimeSlot): string {
  return formatTimeRangeForDisplay(range)
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
  timeSlots: MaybeRef<(SlotTimeBounds | TimeSlot)[]>
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


