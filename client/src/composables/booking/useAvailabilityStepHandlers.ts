/**
 * PATTERN: useAvailabilityStepHandlers Composable

PATTERN: Composable that provide...
 */
import type { UseAvailabilityStepHandlersParams, UseAvailabilityStepHandlersReturn } from '@/types/booking/availabilityStepHandlers'


/**
 * WHY: useAvailabilityStepHandlers composable

WHY: Extracts event handler logi...
 */
export function useAvailabilityStepHandlers(
  params: UseAvailabilityStepHandlersParams
): UseAvailabilityStepHandlersReturn {
  const {
    appointmentSlotOrderIndex,
    hasMoveableParts,
    openMoveableModal,
    closeMoveableModal,
    moveableOptions,
    moveableSlotsForConfirm,
    selectedMoveableSlotIndex,
    confirmedMoveableScheduling,
    startTimeType
  } = params

  const handleAppointmentSlotClick = (buttonIndex: number): void => {
    appointmentSlotOrderIndex.value = buttonIndex
    
    if (hasMoveableParts.value) {
      openMoveableModal()
    }
  }

  /**
   * PATTERN: Event handler that updates state, fails explicitly if moveableOptions is null
   */
  const handleMoveableConfirm = (): void => {
    if (!moveableOptions.value) {
      throw new Error('Cannot confirm moveable scheduling: moveableOptions is null')
    }
    
    confirmedMoveableScheduling.value = {
      ...moveableOptions.value,
      availableSlots: moveableSlotsForConfirm.value,
      selectedSlotIndex: selectedMoveableSlotIndex.value
    }
    closeMoveableModal()
  }

  /**
   * PATTERN: Event handler that resets state
   */
  const handleMoveableCancel = (): void => {
    closeMoveableModal()
    selectedMoveableSlotIndex.value = null
  }

  /**
   * PATTERN: Event handler that maps UI labels to internal state
   */
  const handleTimeBasisChange = (type: 'major' | 'minor'): void => {
    startTimeType.value = type
  }

  return {
    handleAppointmentSlotClick,
    handleMoveableConfirm,
    handleMoveableCancel,
    handleTimeBasisChange
  }
}
