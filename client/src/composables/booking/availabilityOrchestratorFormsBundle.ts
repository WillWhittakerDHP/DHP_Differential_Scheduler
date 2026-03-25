/**
 * PATTERN: Single composables entry for forms phase — reduces @/composables/ import fan-out (composable-health).
 */
export { useAvailabilityEmptyState } from './useAvailabilityEmptyState'
export { useAvailabilityStepData } from './useAvailabilityStepData'
export { useAvailabilityValidation } from './useAvailabilityValidation'
export type { UseAvailabilityLogicReturn } from './useAvailabilityLogic'
export type { AvailabilityOrchestratorMinimizerGates } from './useAvailabilityOrchestratorMinimizerGates'
export type { AvailabilityOrchestratorSlotsPhaseResult } from './useAvailabilityOrchestratorSlotsPhase'
