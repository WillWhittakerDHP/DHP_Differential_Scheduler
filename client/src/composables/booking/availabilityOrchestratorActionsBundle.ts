/**
 * PATTERN: Single composables entry for actions phase — reduces @/composables/ import fan-out (composable-health).
 */
export { useAvailabilityUI } from './useAvailabilityUI'
export { useAvailabilityDevPanel } from './useAvailabilityDevPanel'
export type { UseAvailabilityLogicReturn } from './useAvailabilityLogic'
export type { AvailabilityOrchestratorPostFetchPhaseResult } from './useAvailabilityOrchestratorPostFetchPhase'
export type { AvailabilityOrchestratorSlotsPhaseResult } from './useAvailabilityOrchestratorSlotsPhase'
export type { AvailabilityOrchestratorFormsPhaseResult } from './useAvailabilityOrchestratorFormsPhase'
export type { AvailabilityOrchestratorMoveableGates } from './useAvailabilityOrchestratorMoveableGates'
