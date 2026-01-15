/**
 * Relationship Constants
 * 
 * LEARNING: Relationship configurations define parent-child entity relationships
 * WHY: Type-safe relationship definitions with parent/child entity types
 * PATTERN: Const object with relationship metadata
 * COMPARISON: React uses same structure. Vue uses same constants.
 * 
 * Three-dimensional relationship model:
 * - Cascade: Vertical hierarchy (different shapes, e.g., user_shape → service)
 * - Constituent: Block → Part relationships (math dimension)
 * - Component: Lateral component relationships (same shape, e.g., service → service)
 * 
 * NOTE: Renamed for clearer domain terminology:
 * - activeCascades → bookingCascades (Booking Cascade) (2026-01-08)
 * - activeComponents → instanceComponents → instanceComponents (Instance Components) (2026-01-07)
 * - validIndependentComponents → additionalServiceOptions → dependentInstanceOptions (Dependent Instance Options) (2026-01-09)
 */

import type { GlobalEntityKey } from './entities'

/**
 * Relationship configurations
 * LEARNING: Each relationship defines parent and child entity types
 * WHY: Type safety and relationship metadata
 * PATTERN: Const object with relationship keys and metadata
 */
export const RELATIONSHIP_KEYS = {
  validCascades: {
    backendName: 'valid_cascades',
    frontendKey: 'validCascades',
    parentEntity: 'blockShape' as GlobalEntityKey,
    childEntity: 'blockShape' as GlobalEntityKey,
  },
  validParts: {
    backendName: 'valid_parts',
    frontendKey: 'validParts',
    parentEntity: 'blockShape' as GlobalEntityKey,
    childEntity: 'partShape' as GlobalEntityKey,
  },
  dependentInstanceOptions: {
    backendName: 'dependent_instance_options',
    frontendKey: 'dependentInstanceOptions',
    parentEntity: 'blockInstance' as GlobalEntityKey,
    childEntity: 'blockInstance' as GlobalEntityKey,
  },
  bookingCascades: {
    backendName: 'booking_cascades',
    frontendKey: 'bookingCascades',
    parentEntity: 'blockInstance' as GlobalEntityKey,
    childEntity: 'blockInstance' as GlobalEntityKey,
  },
  activeParts: {
    backendName: 'active_parts',
    frontendKey: 'activeParts',
    parentEntity: 'blockInstance' as GlobalEntityKey,
    childEntity: 'partInstance' as GlobalEntityKey,
  },
  instanceComponents: {
    backendName: 'instance_components',
    frontendKey: 'instanceComponents',
    parentEntity: 'blockInstance' as GlobalEntityKey,
    childEntity: 'blockInstance' as GlobalEntityKey,
  },
  // Note: "descriptions" annotation is intentionally NOT included as a core relationship
  // Descriptions are part of the annotation system (see constants/annotations.ts)
  // and are handled separately from relationships to maintain type safety
} as const

/**
 * Relationship key type
 * LEARNING: Derived from RELATIONSHIP_KEYS object keys
 * WHY: Type-safe relationship key references
 * PATTERN: keyof typeof pattern for type extraction
 */
export type GlobalRelationshipKey = keyof typeof RELATIONSHIP_KEYS
