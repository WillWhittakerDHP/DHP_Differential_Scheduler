/**
 * Warn when slot overlay is visible but wizard grid label is missing (misconfiguration signal).
 */
import { watch, type ComputedRef, type Ref } from 'vue'
import type { AppLogger } from '@/utils/logger'

export interface UseAvailabilityStepSlotOverlayLabelGuardParams {
  overlay: {
    showSlotsOverlay: ComputedRef<boolean>
    slotGridOverlayLabel: ComputedRef<string | null>
  }
  isBookingFlowReady: Ref<boolean> | ComputedRef<boolean>
  logger: AppLogger
}

export function useAvailabilityStepSlotOverlayLabelGuard(
  params: UseAvailabilityStepSlotOverlayLabelGuardParams
): void {
  const { overlay, isBookingFlowReady, logger } = params

  watch(
    () => ({
      showingSlotsOverlay: overlay.showSlotsOverlay.value,
      slotGridLabel: overlay.slotGridOverlayLabel.value,
      bookingFlowReady: isBookingFlowReady.value,
    }),
    ({ showingSlotsOverlay, slotGridLabel, bookingFlowReady }) => {
      if (bookingFlowReady && showingSlotsOverlay && !slotGridLabel) {
        logger.warn(
          'Slot grid overlay is shown but differentialGraphDefaultLabel is missing in wizard settings. Set it under Admin → Business Controls → Calendar → Grid, then Save (wizard settings are persisted with that save).'
        )
      }
    },
    { immediate: true }
  )
}
