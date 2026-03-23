/**
 */
import { computed, type ComputedRef, type Ref } from 'vue'
import type { SlotAvailabilityResult } from '@shared/types/availabilityTypes'
import type { SlotTimeBounds } from '@shared/types/availabilityTypes'
import type { AppointmentSlot } from '@/types/appointment'
import { derivePerspective } from '@/utils/booking/perspectiveResolver'

export interface SlotDisplayItem extends SlotAvailabilityResult {
  buttonIndex: number
  displayTime: SlotTimeBounds | null
}

interface UseSlotGridDisplayOptions {
  appointmentSlots: Ref<AppointmentSlot[]>
  timeBasis: Ref<string>
}

export function useSlotGridDisplay(options: UseSlotGridDisplayOptions): ComputedRef<SlotDisplayItem[]> {
  return computed(() => {
    const currentPerspective = options.timeBasis.value as 'major' | 'minor' | 'nonDifferential'
    return options.appointmentSlots.value.map((appointmentSlot) => {
      const displayTime = derivePerspective(appointmentSlot, currentPerspective)
      const violations =
        !appointmentSlot.isAvailable && appointmentSlot.flexibleViolations
          ? appointmentSlot.flexibleViolations
          : undefined
      return {
        buttonIndex: appointmentSlot.buttonIndex,
        displayTime,
        isAvailable: appointmentSlot.isAvailable,
        violations,
      }
    })
  })
}
