/**
 * useAvailabilityStepHandlers Composable
 * 
 * LEARNING: Event handlers for availability step interactions
 * WHY: Extracts event handler logic from AvailabilityStep component
 * PATTERN: Composable that provides event handler functions
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
   * LEARNING: Updates selectedButtonIndex when slot is clicked, checks for moveable parts
   * WHY: Updates selection state and opens modal if needed
   */
  handleAppointmentSlotClick: (buttonIndex: number) => void
  
  /**
   * Handler for moveable modal confirm
   * LEARNING: Stores confirmed moveable scheduling and closes modal
   * WHY: Updates state with confirmed selection
   */
  handleMoveableConfirm: () => void
  
  /**
   * Handler for moveable modal cancel
   * LEARNING: Closes modal without saving
   * WHY: Resets state when canceling
   */
  handleMoveableCancel: () => void
  
  /**
   * Handler for Time Basis Graph time basis change event
   * LEARNING: Updates startTimeType when DifferentialGraph component emits change event
   * WHY: Maps UI labels to internal state
   */
  handleTimeBasisChange: (type: 'major' | 'minor') => void
}

/**
 * useAvailabilityStepHandlers composable
 * 
 * LEARNING: Event handlers for availability step interactions
 * WHY: Extracts event handler logic from component to composable
 * PATTERN: Composable that returns event handler functions
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
   * LEARNING: Handler for moveable modal confirm
   * WHY: Stores confirmed moveable scheduling and closes modal
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
   * LEARNING: Handler for moveable modal cancel
   * WHY: Closes modal without saving
   * PATTERN: Event handler that resets state
   */
  const handleMoveableCancel = (): void => {
    closeMoveableModal()
    selectedMoveableSlotIndex.value = null
  }

  /**
   * LEARNING: Handler for Time Basis Graph time basis change event
   * WHY: Updates startTimeType when DifferentialGraph component emits change event
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
