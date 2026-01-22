import type { ISO8601Date } from './datetime'

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
 * NOTE: Uses ISO 8601 date format (YYYY-MM-DD) for date-only values
 */
export interface AvailabilityStepData {
  selectedDate: { start: ISO8601Date | null; end: ISO8601Date | null }
  selectedTimeSlots: Array<{ time: string; duration: number }> | null
}
