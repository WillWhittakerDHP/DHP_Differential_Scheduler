/**
 * Shared Block Instance–Like Types
 *
 * LEARNING: Minimal shape for "block instance in booking/selection context" shared by client and server
 * WHY: Single source of truth for block-instance-like payloads (TYPE_SIMILARITY_PROPOSAL § 1.5)
 * PATTERN: Shared types directory for cross-cutting concerns
 */

/**
 * Minimal block-instance shape (id, entity key, name, active).
 * WHY: BookingBlockInstance, SelectionCardItem, BlockInstanceSnapshot extend or align with this.
 */
export interface BlockInstanceLike {
  id: string
  entityKey: string
  name: string
  active: boolean
}
