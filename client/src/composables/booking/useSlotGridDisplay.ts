/**
 * WHY: Component-logic audit - move .map() out of AppointmentSlotGrid.
 */
import { computed, type Ref } from 'vue'
import type { AppointmentSlot } from '@/types/appointment'
import { derivePerspective } from '@/utils/booking/perspectiveResolver'

export interface SlotDisplayItem {
  buttonIndex: number
  displayTime: string
  isAvailable: boolean
  violations?: unknown
}

export interface UseSlotGridDisplayOptions {
  appointmentSlots: Ref<AppointmentSlot[]>
  timeBasis: Ref<string>
}

export function useSlotGridDisplay(options: UseSlotGridDisplayOptions): Ref<SlotDisplayItem[]> {
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
