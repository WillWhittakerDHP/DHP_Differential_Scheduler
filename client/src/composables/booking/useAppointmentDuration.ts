/**
 * PATTERN: useAppointmentDuration Composable

PATTERN: Composable that uses shared ...
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
 * WHY: useAppointmentDuration composable

WHY: Extracts duration calculation lo...
 */
export function useAppointmentDuration(
  params: UseAppointmentDurationParams
): UseAppointmentDurationReturn {
  const { accumulatedBlockInstances } = params
  
  // PATTERN: Use shared shape composable
  const { appointmentShape } = useAppointmentShape({
    blockInstances: accumulatedBlockInstances
  })

  /**
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
