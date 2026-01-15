/**
 * LEARNING: Shared wizard step data types
 * WHY: Step data interfaces are duplicated across multiple files
 * PATTERN: Centralized type definitions for wizard step data
 * 
 * Used by:
 * - ConfirmationStep.vue
 * - useConfirmationStepData.ts
 * - AvailabilityStep.vue
 * - useAvailabilityStepData.ts
 */

/**
 * LEARNING: Availability step data structure
 * WHY: Used for availability step data in booking wizard
 */
export interface AvailabilityStepData {
  selectedDate: { start: string | null; end: string | null }
  selectedTimeSlots: Array<{ time: string; duration: number }> | null
}
