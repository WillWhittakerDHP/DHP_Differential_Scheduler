/**
 * Slot grid overlay state for differential perspective (composable-health: extract from useAvailabilityStepUI).
 * Returns overlay label, error, and visibility — used when user hasn't chosen major/minor yet.
 */
import { computed, type ComputedRef } from 'vue'
import { ANNOTATION_UI_SLOTS } from '@shared/constants/annotationSlots'
import type { AvailabilitySubStepOrchestratorState } from '@/types/booking/injectionContexts'
import { useWizardSettings } from '@/composables/admin/useWizardSettings'
import { resolveBookingAnnotationSlotText } from '@/utils/booking/resolveBookingAnnotationSlotText'

interface UseAvailabilityStepSlotOverlayParams {
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
  const {
    labels: { differentialGraphDefaultLabel },
  } = useWizardSettings()

  const hasSelectedSlot = computed(
    () => o.graphBars.value?.major != null || o.graphBars.value?.minor != null
  )

  const annotationGridOverlayLabel = computed(() => {
    const blocks = o.wizard.accAvailability.value
    const selectedUt = o.wizard.selectedUserTypeBlock.value?.id ?? null
    for (const block of blocks) {
      const text = resolveBookingAnnotationSlotText(
        block.annotationUi,
        ANNOTATION_UI_SLOTS.GRID_OVERLAY,
        selectedUt
      ).trim()
      if (text.length > 0) {
        return text
      }
    }
    return ''
  })

  const slotGridOverlayLabel = computed(() => {
    const fromAnnotation = annotationGridOverlayLabel.value
    if (fromAnnotation.length > 0) {
      return fromAnnotation
    }
    return differentialGraphDefaultLabel.value
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
