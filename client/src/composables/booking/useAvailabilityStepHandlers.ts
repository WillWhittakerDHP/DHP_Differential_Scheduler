/**
 * PATTERN: useAvailabilityStepHandlers Composable

PATTERN: Composable that provide...
 */
import { type Ref } from 'vue'
import type { AppointmentSlot } from '@/types/appointment'
import type { MoveableSchedulingOptions } from '@/types/moveableScheduling'

export interface UseAvailabilityStepHandlersParams {
  appointmentSlotOrderIndex: Ref<number | null>
  
  hasMoveableParts: Ref<boolean>
  
  selectedSlot: Ref<AppointmentSlot | null>
  
  openMoveableModal: () => void
  
  closeMoveableModal: () => void
  
  moveableOptions: Ref<MoveableSchedulingOptions | null>
  
  selectedMoveableSlotIndex: Ref<number | null>
  
  confirmedMoveableScheduling: Ref<MoveableSchedulingOptions | null>
  
  startTimeType: Ref<'major' | 'minor' | 'nonDifferential'>
}

export interface UseAvailabilityStepHandlersReturn {
  /**
   * Handler for appointment slot click
   */
  handleAppointmentSlotClick: (buttonIndex: number) => void
  
  /**
   * Handler for moveable modal confirm
   */
  handleMoveableConfirm: () => void
  
  /**
   * WHY: /**
Handler for moveable modal cancel
WHY: Resets state when canceling
   */
  handleMoveableCancel: () => void
  
  /**
   * WHY: /**
Handler for Time Basis Graph time basis change event
WHY: Maps UI la...
   */
  handleTimeBasisChange: (type: 'major' | 'minor') => void
}

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
