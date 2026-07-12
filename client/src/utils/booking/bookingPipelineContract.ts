/**
 * WHY: Single entry surface for the client booking finalization path (ARCHITECTURE.md §10, master plan Phase 4.1).
 * Lineage = `partInstance.id`; events = `eventAssignmentsByPartInstanceId` + placement on `event_shapes`.
 */
export { createPartFinals, filterZeroedParts } from './partFinalizer'
export { createBlockFinals, filterZeroedBlocks } from './blockFinalizer'
export {
  buildAppointmentShape,
  createMinimalAppointmentShapeForDuration,
  applyShapeToTime,
} from './appointmentSlotBuilder'
export { calculateSlotShape } from './partFinalizerSlotShape'
