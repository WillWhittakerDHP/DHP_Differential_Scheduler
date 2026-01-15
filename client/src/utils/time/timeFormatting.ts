import type { TimeRange, TimeSlot } from '@/types/appointment'

type MaybeRef<Value> = Value | { value: Value }

/**
 * Format a time range from a TimeRange or TimeSlot object.
 */
export function formatTimeRange(range: TimeRange | TimeSlot): string {
  if (!('startTime' in range && 'endTime' in range)) {
    throw new Error('Invalid time range object: must have startTime/endTime')
  }
  
  const start = new Date(range.startTime)
  const end = new Date(range.endTime)
  
  const formatTime = (date: Date): string => {
    const hours = date.getHours()
    const minutes = date.getMinutes()
    const ampm = hours >= 12 ? 'PM' : 'AM'
    const displayHours = hours % 12 || 12
    const displayMinutes = minutes.toString().padStart(2, '0')
    return `${displayHours}:${displayMinutes} ${ampm}`
  }
  
  return `${formatTime(start)} - ${formatTime(end)}`
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
 * Get today's date in YYYY-MM-DD format.
 */
export function getTodayDate(): string {
  const today = new Date()
  return today.toISOString().split('T')[0]
}

/**
 * Get first available date from time slots (falls back to today).
 */
export function getFirstAvailabilityDate(
  timeSlots: MaybeRef<(TimeRange | TimeSlot)[]>
): string {
  const slots = 'value' in timeSlots ? timeSlots.value : timeSlots

  if (slots && slots.length > 0) {
    const dates = slots
      .map((slot) => {
        if ('startTime' in slot) {
          return new Date(slot.startTime).toISOString().split('T')[0]
        }
        return null
      })
      .filter((date): date is string => date !== null)
      .sort()

    if (dates.length > 0) {
      return dates[0]
    }
  }

  return getTodayDate()
}


