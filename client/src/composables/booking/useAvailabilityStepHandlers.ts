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

/**
 * useAvailabilityStepHandlers composable parameters
 */
export interface UseAvailabilityStepHandlersParams {
  /**
   * Appointment slot order index ref (for updating selection)
   */
  appointmentSlotOrderIndex: Ref<number | null>
  
  /**
   * Whether moveable parts are detected
   */
  hasMoveableParts: Ref<boolean>
  
  /**
   * Currently selected slot
   */
  selectedSlot: Ref<AppointmentSlot | null>
  
  /**
   * Function to open moveable modal
   */
  openMoveableModal: () => void
  
  /**
   * Function to close moveable modal
   */
  closeMoveableModal: () => void
  
  /**
   * Moveable options (for confirming selection)
   */
  moveableOptions: Ref<MoveableSchedulingOptions | null>
  
  /**
   * Selected moveable slot index
   */
  selectedMoveableSlotIndex: Ref<number | null>
  
  /**
   * Confirmed moveable scheduling ref (for storing confirmed selection)
   */
  confirmedMoveableScheduling: Ref<MoveableSchedulingOptions | null>
  
  /**
   * Start time type ref (for time basis change handler)
   * NOTE: Uses 'major' | 'minor' for new terminology, with legacy 'inspector' | 'client' for backward compatibility
   */
  startTimeType: Ref<'major' | 'minor' | 'nonDifferential' | 'inspector' | 'client'>
}

/**
 * useAvailabilityStepHandlers composable return type
 */
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
   * NOTE: Accepts 'major' | 'minor' for new terminology, with legacy 'inspector' | 'client' for backward compatibility
   */
  handleTimeBasisChange: (type: 'major' | 'minor' | 'inspector' | 'client') => void
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
    closeMoveableModal,
    moveableOptions,
    selectedMoveableSlotIndex,
    confirmedMoveableScheduling,
    startTimeType
  } = params

  /**
   * LEARNING: Handler for appointment slot click
   * WHY: Updates selectedButtonIndex when slot is clicked, checks for moveable parts
   * PATTERN: Event handler that updates selection state and opens modal if needed
   */
  const handleAppointmentSlotClick = (buttonIndex: number): void => {
    appointmentSlotOrderIndex.value = buttonIndex
    
    // TEMPORARY: Moveable parts scheduling disabled
    // TODO: Re-enable when confirmation modal system is implemented
    // After selection, check for moveable parts
    // Use nextTick to ensure selectedSlot has updated
    // nextTick(() => {
    //   if (hasMoveableParts.value && selectedSlot.value) {
    //     openMoveableModal()
    //   }
    // })
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
    // Reset selection when canceling
    selectedMoveableSlotIndex.value = null
  }

  /**
   * LEARNING: Handler for Time Basis Graph time basis change event
   * WHY: Updates startTimeType when DifferentialGraph component emits change event
   * PATTERN: Event handler that maps UI labels to internal state
   * NOTE: Normalizes legacy 'inspector'/'client' to 'major'/'minor' for internal use
   */
  const handleTimeBasisChange = (type: 'major' | 'minor' | 'inspector' | 'client'): void => {
    // Normalize legacy names to new terminology
    const normalizedType = type === 'inspector' ? 'major' : type === 'client' ? 'minor' : type
    startTimeType.value = normalizedType as 'major' | 'minor' | 'nonDifferential'
  }

  return {
    handleAppointmentSlotClick,
    handleMoveableConfirm,
    handleMoveableCancel,
    handleTimeBasisChange
  }
}
