/**
 * Builds the injectable context for AvailabilitySubStepContent (keeps AvailabilityStep.vue thin).
 */
import type { ComputedRef } from 'vue'
import type { AvailabilitySubStepContext } from '@/types/booking/injectionContexts'

interface BuildAvailabilitySubStepContextParams {
  o: AvailabilitySubStepContext['o']
  handleDateChangeWithConfirm: AvailabilitySubStepContext['handleDateChangeWithConfirm']
  onOptionIdUpdate: AvailabilitySubStepContext['onOptionIdUpdate']
  handleTimeBasisChangeWithConfirm: AvailabilitySubStepContext['handleTimeBasisChangeWithConfirm']
  handleSlotClickWithConfirm: AvailabilitySubStepContext['handleSlotClickWithConfirm']
  handleMoveableConfirmWithConfirm: AvailabilitySubStepContext['handleMoveableConfirmWithConfirm']
  showSlotsOverlay: ComputedRef<boolean>
  slotGridOverlayLabel: ComputedRef<string | null>
  slotGridOverlayError: ComputedRef<string | null>
  moveableInfeasible: ComputedRef<boolean>
  moveableInfeasibleMessage: ComputedRef<string>
  hasOptions: ComputedRef<boolean>
}

export function buildAvailabilitySubStepContext(
  params: BuildAvailabilitySubStepContextParams
): AvailabilitySubStepContext {
  const {
    o,
    handleDateChangeWithConfirm,
    onOptionIdUpdate,
    handleTimeBasisChangeWithConfirm,
    handleSlotClickWithConfirm,
    handleMoveableConfirmWithConfirm,
    showSlotsOverlay,
    slotGridOverlayLabel,
    slotGridOverlayError,
    moveableInfeasible,
    moveableInfeasibleMessage,
    hasOptions,
  } = params

  return {
    o,
    handleDateChangeWithConfirm,
    onOptionIdUpdate,
    handleTimeBasisChangeWithConfirm,
    handleSlotClickWithConfirm,
    handleMoveableConfirmWithConfirm,
    get showSlotsOverlay() {
      return showSlotsOverlay.value
    },
    get slotGridOverlayLabel() {
      return slotGridOverlayLabel.value
    },
    get slotGridOverlayError() {
      return slotGridOverlayError.value
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
