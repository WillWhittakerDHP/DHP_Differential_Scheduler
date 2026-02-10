/**
 * useAppointmentDuration Composable
 * 
 * LEARNING: Calculates authoritative slot span duration from AppointmentShape
 * WHY: Extracts duration calculation logic from AvailabilityStep component
 * PATTERN: Composable that uses shared shape composable to get duration
 */

import { computed, type ComputedRef } from 'vue'
import type { BookingBlockInstance } from '@/utils/transformers/globalToBookingTransformer'
import { useAppointmentShape } from '@/composables/booking/useAppointmentShape'

export interface UseAppointmentDurationParams {
  accumulatedBlockInstances: ComputedRef<BookingBlockInstance[]>
}

export interface UseAppointmentDurationReturn {
  appointmentDuration: ComputedRef<number | null>
}

/**
 * useAppointmentDuration composable
 * 
 * LEARNING: Calculates authoritative slot span duration from AppointmentShape
 * WHY: Extracts duration calculation logic from component to composable
 * PATTERN: Composable that uses shared shape composable to get duration
 */
export function useAppointmentDuration(
  params: UseAppointmentDurationParams
): UseAppointmentDurationReturn {
  const { accumulatedBlockInstances } = params
  
  // PATTERN: Use shared shape composable
  // WHY: Eliminates duplicate shape-building logic, single source of truth
  const { appointmentShape } = useAppointmentShape({
    blockInstances: accumulatedBlockInstances
  })

  /**
   * LEARNING: Extract authoritative slot span duration from shared shape
   * WHY: slotShape.roundedDuration = max(eventFinal.roundedDuration) = slot span from start to latest event end
   * PATTERN: Return slotShape.roundedDuration directly from shared shape
   * NOTE: In differential services, this equals major event duration. In non-differential, equals single event duration.
   */
  const appointmentDuration = computed<number | null>(() => {
    const shape = appointmentShape.value
    if (!shape) {
      return null
    }
    
    const roundedDuration = shape.slotShape.roundedDuration
    return roundedDuration > 0 ? roundedDuration : null
  })

  return {
    appointmentDuration
  }
}
