/**
 * Shared Core Entity Types
 *
 * LEARNING: Minimal shape for any entity (block/part/event/annotation, instance or shape) shared by client and server
 * WHY: Single source of truth for entity-like payloads in booking, transformer, and API contexts
 * PATTERN: Shared types directory for cross-cutting concerns
 */

/**
 * Minimal entity shape: id, entityKey, name, active.
 * WHY: BookingBlockInstance, BookingPartInstance, and other entity-like types extend or align with this.
 */
export interface CoreEntity {
  id: string
  entityKey: string
  name: string
  active: boolean
}
