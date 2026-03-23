import type { ComputedRef } from 'vue'
import type { AvailabilitySubStepContext, AvailabilitySubStepOrchestratorState } from '@/types/booking/injectionContexts'
import type { UseAvailabilityStepUIReturn } from '@/composables/booking/useAvailabilityStepUI'
import type { UseAvailabilityStepSlotOverlayReturn } from '@/composables/booking/useAvailabilityStepSlotOverlay'

export interface BuildAvailabilitySubStepContextParams {
  o: AvailabilitySubStepOrchestratorState
  ui: Pick<
    UseAvailabilityStepUIReturn,
    | 'handleDateChangeWithConfirm'
    | 'onOptionIdUpdate'
    | 'handleTimeBasisChangeWithConfirm'
    | 'handleSlotClickWithConfirm'
    | 'handleMoveableConfirmWithConfirm'
  >
  overlay: Pick<
    UseAvailabilityStepSlotOverlayReturn,
    'showSlotsOverlay' | 'slotGridOverlayLabel' | 'slotGridOverlayError'
  >
  moveableInfeasible: ComputedRef<boolean>
  moveableInfeasibleMessage: ComputedRef<string>
  hasOptions: ComputedRef<boolean>
}

/**
 * WHY: Keeps AvailabilityStep.vue under vue-architecture script size limits; same object shape as prior inline provide().
 */
export function buildAvailabilitySubStepContext(
  params: BuildAvailabilitySubStepContextParams
): AvailabilitySubStepContext {
  const { o, ui, overlay, moveableInfeasible, moveableInfeasibleMessage, hasOptions } = params

  return {
    o,
    handleDateChangeWithConfirm: ui.handleDateChangeWithConfirm,
    onOptionIdUpdate: ui.onOptionIdUpdate,
    handleTimeBasisChangeWithConfirm: ui.handleTimeBasisChangeWithConfirm,
    handleSlotClickWithConfirm: ui.handleSlotClickWithConfirm,
    handleMoveableConfirmWithConfirm: ui.handleMoveableConfirmWithConfirm,
    get showSlotsOverlay() {
      return overlay.showSlotsOverlay.value
    },
    get slotGridOverlayLabel() {
      return overlay.slotGridOverlayLabel.value
    },
    get slotGridOverlayError() {
      return overlay.slotGridOverlayError.value
    },
    get emptyStateMessage() {
      return o.emptyStateMessage.value ?? ''
    },
    get firstAvailableNotice() {
      return o.firstAvailableNotice?.value ?? null
    },
    clearFirstAvailableNotice: o.clearFirstAvailableNotice,
    get moveableInfeasible() {
      return moveableInfeasible.value
    },
    get moveableInfeasibleMessage() {
      return moveableInfeasibleMessage.value
    },
    hasOptions,
  }
}
