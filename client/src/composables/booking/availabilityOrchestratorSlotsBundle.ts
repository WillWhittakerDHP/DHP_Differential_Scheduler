/**
 * PATTERN: Single composables entry for slots phase — reduces @/composables/ import fan-out (composable-health).
 */
export { useAppointmentSlots } from './useAppointmentSlots'
export { useMinimizerPartsScheduling } from './useMinimizerPartsScheduling'
export type { AvailabilityOrchestratorSlotComputeds } from './useAvailabilityOrchestratorSlotComputeds'
export type { AvailabilityOrchestratorMinimizerGates } from './useAvailabilityOrchestratorMinimizerGates'
export type { UseAvailabilityLogicReturn } from './useAvailabilityLogic'
export type { AvailabilityOrchestratorPostFetchPhaseResult } from './useAvailabilityOrchestratorPostFetchPhase'
