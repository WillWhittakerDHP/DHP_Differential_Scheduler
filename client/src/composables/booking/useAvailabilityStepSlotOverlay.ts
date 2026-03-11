/**
 * Slot grid overlay state for differential perspective (composable-health: extract from useAvailabilityStepUI).
 * Returns overlay label, error, and visibility — used when user hasn't chosen major/minor yet.
 */
import { computed, type ComputedRef, type Ref } from 'vue'
import type { AvailabilitySubStepOrchestratorState } from '@/composables/booking/injectionKeys'
import type { AvailabilitySettings } from '@/configs/availabilitySettings/types'

export interface UseAvailabilityStepSlotOverlayParams {
  o: AvailabilitySubStepOrchestratorState
  availabilitySettings: Ref<AvailabilitySettings | null>
}

export interface UseAvailabilityStepSlotOverlayReturn {
  slotGridOverlayLabel: ComputedRef<string | null>
  slotGridOverlayError: ComputedRef<string | null>
  showSlotsOverlay: ComputedRef<boolean>
}

export function useAvailabilityStepSlotOverlay(
  params: UseAvailabilityStepSlotOverlayParams
): UseAvailabilityStepSlotOverlayReturn {
  const { o, availabilitySettings } = params

  const hasSelectedSlot = computed(
    () => o.graphBars.value?.major != null || o.graphBars.value?.minor != null
  )
  const slotGridOverlayLabel = computed(() => {
    const raw = availabilitySettings.value?.differentialPerspectives?.differentialGraphDefaultLabel
    return typeof raw === 'string' ? raw.trim() : null
  })
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
