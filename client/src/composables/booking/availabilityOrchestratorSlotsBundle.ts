/**
 * PATTERN: Single composables entry for slots phase — reduces @/composables/ import fan-out (composable-health).
 */
export { useAppointmentSlots } from './useAppointmentSlots'
export { useMoveablePartsScheduling } from './useMoveablePartsScheduling'
export type { AvailabilityOrchestratorSlotComputeds } from './useAvailabilityOrchestratorSlotComputeds'
export type { AvailabilityOrchestratorMoveableGates } from './useAvailabilityOrchestratorMoveableGates'
export type { UseAvailabilityLogicReturn } from './useAvailabilityLogic'
export type { AvailabilityOrchestratorPostFetchPhaseResult } from './useAvailabilityOrchestratorPostFetchPhase'
