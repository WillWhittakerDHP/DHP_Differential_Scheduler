/**
 * Availability step event handlers: slot clicks, minimizer confirm/cancel, time basis changes.
 * Accepts reactive params but uses no Vue reactivity internally.
 */
import type { UseAvailabilityStepHandlersParams, UseAvailabilityStepHandlersReturn } from '@/types/booking/availabilityStepHandlers'


export function useAvailabilityStepHandlers(
  params: UseAvailabilityStepHandlersParams
): UseAvailabilityStepHandlersReturn {
  const {
    appointmentSlotOrderIndex,
    closeMinimizerModal,
    minimizerOptions,
    minimizerSlotsForConfirm,
    selectedMinimizerSlotIndex,
    confirmedMinimizerScheduling,
    startTimeType
  } = params

  /** Task 6.9.4.2: Minimizer scheduling flow is in-step (5th sub-step); no modal open. */
  const handleAppointmentSlotClick = (buttonIndex: number): void => {
    appointmentSlotOrderIndex.value = buttonIndex
  }

  /**
   * PATTERN: Event handler that updates state, fails explicitly if minimizerOptions is null
   */
  const handleMinimizerConfirm = (): void => {
    if (!minimizerOptions.value) {
      throw new Error('Cannot confirm minimizer scheduling: minimizerOptions is null')
    }
    
    confirmedMinimizerScheduling.value = {
      ...minimizerOptions.value,
      availableSlots: minimizerSlotsForConfirm.value,
      selectedSlotIndex: selectedMinimizerSlotIndex.value
    }
    closeMinimizerModal()
  }

  /**
   * PATTERN: Event handler that resets state
   */
  const handleMinimizerCancel = (): void => {
    closeMinimizerModal()
    selectedMinimizerSlotIndex.value = null
  }

  /**
   * PATTERN: Event handler that maps UI labels to internal state
   */
  const handleTimeBasisChange = (type: 'major' | 'minor'): void => {
    startTimeType.value = type
  }

  return {
    handleAppointmentSlotClick,
    handleMinimizerConfirm,
    handleMinimizerCancel,
    handleTimeBasisChange
  }
}
