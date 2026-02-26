/**
 * PATTERN: useAppointmentDuration Composable

PATTERN: Composable that uses shared ...
 */
import { computed } from 'vue'
import { useAppointmentShape } from '@/composables/booking/useAppointmentShape'
import type { UseAppointmentDurationParams, UseAppointmentDurationReturn } from '@/types/booking/appointmentDuration'


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
