/**
 * Yes+deadline moveable path: surface when loaded completion slots are empty (blocks Next).
 */
import { computed, type ComputedRef } from 'vue'
import type { AvailabilitySubStepOrchestratorState } from '@/types/booking/injectionContexts'

export interface UseAvailabilityStepMoveableInfeasibleParams {
  o: AvailabilitySubStepOrchestratorState
  moveableNoFeasibleCompletionSlotsMessage: ComputedRef<string>
}

export interface UseAvailabilityStepMoveableInfeasibleReturn {
  moveableInfeasible: ComputedRef<boolean>
  moveableInfeasibleMessage: ComputedRef<string>
}

export function useAvailabilityStepMoveableInfeasible(
  params: UseAvailabilityStepMoveableInfeasibleParams
): UseAvailabilityStepMoveableInfeasibleReturn {
  const { o, moveableNoFeasibleCompletionSlotsMessage } = params

  const moveableInfeasible = computed(() => {
    if (!o.hasMoveablePartsGated.value) return false
    const c = o.contingencyPeriod.value
    if (c.hasContingency !== true || !c.endDate || !c.endTime) return false
    if (!o.moveableOptions.value) return false
    if (o.isLoadingOptions.value || o.isLoadingMoveableDaySlots.value) return false
    return o.moveableAppointmentSlots.value.length === 0
  })

  const moveableInfeasibleMessage = computed(() => moveableNoFeasibleCompletionSlotsMessage.value)

  return {
    moveableInfeasible,
    moveableInfeasibleMessage,
  }
}
