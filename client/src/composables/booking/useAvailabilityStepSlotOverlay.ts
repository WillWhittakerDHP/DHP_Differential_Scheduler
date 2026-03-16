/**
 * Slot grid overlay state for differential perspective (composable-health: extract from useAvailabilityStepUI).
 * Returns overlay label, error, and visibility — used when user hasn't chosen major/minor yet.
 */
import { computed, type ComputedRef } from 'vue'
import type { AvailabilitySubStepOrchestratorState } from '@/composables/booking/injectionKeys'
import { useWizardSettings } from '@/composables/admin/useWizardSettings'

export interface UseAvailabilityStepSlotOverlayParams {
  o: AvailabilitySubStepOrchestratorState
}

export interface UseAvailabilityStepSlotOverlayReturn {
  slotGridOverlayLabel: ComputedRef<string | null>
  slotGridOverlayError: ComputedRef<string | null>
  showSlotsOverlay: ComputedRef<boolean>
}

export function useAvailabilityStepSlotOverlay(
  params: UseAvailabilityStepSlotOverlayParams
): UseAvailabilityStepSlotOverlayReturn {
  const { o } = params
  const { differentialGraphDefaultLabel } = useWizardSettings()

  const hasSelectedSlot = computed(
    () => o.graphBars.value?.major != null || o.graphBars.value?.minor != null
  )
  const slotGridOverlayLabel = computed(() => differentialGraphDefaultLabel.value)
  const showSlotsOverlay = computed(
    () =>
      o.isEffectivelyDifferential.value &&
      !hasSelectedSlot.value &&
      !o.userHasChosenTimeBasisFromGraph?.value
  )
  const slotGridOverlayError = computed(() => {
    if (!showSlotsOverlay.value) return null
    if (slotGridOverlayLabel.value) return null
    return 'Differential Graph Default Label is not configured. Set it in Admin → Business Controls → Calendar → Grid.'
  })

  return {
    slotGridOverlayLabel,
    slotGridOverlayError,
    showSlotsOverlay,
  }
}
