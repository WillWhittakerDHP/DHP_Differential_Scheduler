/**
 * useTimeSlotDurations Composable
 * 
 * LEARNING: Maps time slots to durations indexed by startTime
 * WHY: Extracts time slot duration mapping logic from AvailabilityStep component
 * PATTERN: Composable that provides computed Map for time slot durations
 */

import { computed, type ComputedRef, type Ref } from 'vue'
import type { TimeSlotsPerDay } from '@/composables/booking/useAvailabilityLogic'
import type { ISO8601Date } from '@/types/datetime'

export interface UseTimeSlotDurationsParams {
  timeSlotsPerDay: ComputedRef<TimeSlotsPerDay[]>
  
  selectedDate: Ref<{ start: ISO8601Date | null; end: ISO8601Date | null }>
}

export interface UseTimeSlotDurationsReturn {
  timeSlotDurations: ComputedRef<Map<string, number>>
}

/**
 * useTimeSlotDurations composable
 * 
 * LEARNING: Maps time slots to durations indexed by startTime
 * WHY: Extracts duration mapping logic from component to composable
 * PATTERN: Composable that returns reactive computed Map
 */
export function useTimeSlotDurations(
  params: UseTimeSlotDurationsParams
): UseTimeSlotDurationsReturn {
  const { timeSlotsPerDay, selectedDate } = params

  /**
   * LEARNING: Extract time slot durations for fallback when shape duration is 0
   * WHY: If services have 0 baseTime, use time slot duration to ensure valid time ranges
   * PATTERN: Map timeSlots to durations, indexed by startTime
   */
  const timeSlotDurations = computed<Map<string, number>>(() => {
    if (!selectedDate.value.start) {
      return new Map<string, number>()
    }
    
    const daySlots = timeSlotsPerDay.value.find(day => day.date === selectedDate.value.start)
    if (!daySlots) {
      return new Map<string, number>()
    }
    
    // WHY: Functional approach avoids mutations, aligns with workspace rules
    // PATTERN: Build Map from array using constructor with entries
    return new Map(
      daySlots.inspectorTimeSlots.map(slot => [slot.startTime, slot.duration])
    )
  })

  return {
    timeSlotDurations
  }
}
