export interface TimeSlot {
  slotStart: string
  slotEnd: string
}

type MaybeRef<Value> = Value | { value: Value }

/**
 * Format a time range from a TimeSlot object.
 */
export function formatTimeRange(slot: TimeSlot): string {
  const start = new Date(slot.slotStart)
  const end = new Date(slot.slotEnd)

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
 * Compare two TimeSlot objects for equality.
 */
export function areSlotsEqual(slot1: TimeSlot | null, slot2: TimeSlot | null): boolean {
  if (!slot1 || !slot2) return false
  return slot1.slotStart === slot2.slotStart && slot1.slotEnd === slot2.slotEnd
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
export function getFirstAvailabilityDate(timeSlots: MaybeRef<TimeSlot[]>): string {
  const slots = 'value' in timeSlots ? timeSlots.value : timeSlots

  if (slots && slots.length > 0) {
    const dates = slots
      .map((slot) => new Date(slot.slotStart).toISOString().split('T')[0])
      .sort()

    if (dates.length > 0) {
      return dates[0]
    }
  }

  return getTodayDate()
}


