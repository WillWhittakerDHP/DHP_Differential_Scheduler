/**

PATTERN: Pure functions that can be used b...
 */
import type { Ref } from 'vue'
import type { TimeSlot } from '@/types/appointment'
import type { RFC3339DateTime } from '@shared/types/primitiveBrands'
import { rfc3339ToLocalHHmm } from '@/composables/useLocalTime'

function extractTimeString(value: string | Date): string | null {
  try {
    // LEARNING: Only accept RFC3339 format (ISO timestamp)
    // WHY: HH:mm format should only exist at UI boundary, not in business logic
    // PATTERN: Convert to RFC3339 string if needed, then use useLocalTime for extraction
    let rfc3339: RFC3339DateTime
    
    if (value instanceof Date) {
      if (isNaN(value.getTime())) {
        return null
      }
      rfc3339 = value.toISOString() as RFC3339DateTime
    } else if (typeof value === 'string') {
      const date = new Date(value)
      if (isNaN(date.getTime())) {
        return null
      }
      rfc3339 = value as RFC3339DateTime
    } else {
      return null
    }
    
    // LEARNING: Use useLocalTime composable for local time extraction
    // PATTERN: Use rfc3339ToLocalHHmm from useLocalTime
    return rfc3339ToLocalHHmm(rfc3339)
  } catch {
    return null
  }
}

function findMatchingTimeSlot(
  timeString: string,
  availableSlots: TimeSlot[]
): TimeSlot | undefined {
  const normalizedTime = extractTimeString(timeString)
  if (!normalizedTime) return undefined
  
  return availableSlots.find(slot => {
    const slotTimeString = extractTimeString(slot.startTime)
    return slotTimeString === normalizedTime
  })
}

/**
 * Loaded time slot from API/DB (RFC3339 strings at boundary).
 * WHY: Structurally aligned with shared SlotTimeBounds; endTime optional for loaded payloads.
 */
export interface LoadedTimeSlot {
  startTime: string  // RFC3339 datetime string
  endTime?: string   // Optional RFC3339 datetime string (for future use)
}

/**
 * Match loaded time slots to available time slots and update refs
 * 
 * 
 * Algorithm:
 * 1. First loaded slot → major time slot (legacy: inspector)
 * 2. Second loaded slot (if exists) → minor time slot (legacy: client)
 * 
 * @param loadedSlots - Array of loaded time slots from saved appointment
 * @param availableSlots - Array of currently available TimeSlot objects
 * @param majorAppointmentSlotRef - Ref to update with matched major appointment slot
 * @param minorAppointmentSlotRef - Ref to update with matched minor appointment slot
 */
export function matchLoadedTimeSlots(
  loadedSlots: LoadedTimeSlot[],
  availableSlots: TimeSlot[],
  majorAppointmentSlotRef: Ref<TimeSlot | null>,
  minorAppointmentSlotRef: Ref<TimeSlot | null>
): void {
  if (loadedSlots.length === 0 || availableSlots.length === 0) return

  if (loadedSlots.length > 0) {
    const majorMatch = findMatchingTimeSlot(loadedSlots[0].startTime, availableSlots)
    if (majorMatch) {
      majorAppointmentSlotRef.value = majorMatch
    }
  }

  if (loadedSlots.length > 1) {
    const minorMatch = findMatchingTimeSlot(loadedSlots[1].startTime, availableSlots)
    if (minorMatch) {
      minorAppointmentSlotRef.value = minorMatch
    }
  }
}

