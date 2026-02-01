/**
 * LEARNING: Shared wizard step data types
 * WHY: Re-export from canonical source to prevent format mismatches
 * PATTERN: Single source of truth for type definitions
 * 
 * SESSION: 2.1.3b - Fixed duplicate interface causing timezone issues
 * 
 * Used by:
 * - ConfirmationStep.vue
 * - useConfirmationStepData.ts
 * - AvailabilityStep.vue
 * - useAvailabilityStepData.ts
 */

// LEARNING: Re-export AvailabilityStepData from canonical source
// WHY: The canonical source uses RFC3339 startTime/endTime format
// PATTERN: Avoid duplicate interface definitions
export type { AvailabilityStepData } from '@/utils/booking/availabilityStepData'
