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
 * - validIndependentComponents → additionalServiceOptions → dependentInstanceOptions → dependentInstances (2026-01-20, final naming)
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
  validAnnotations: {
    backendName: 'valid_annotations',
    frontendKey: 'validAnnotations',
    parentEntity: 'blockShape' as GlobalEntityKey,
    childEntity: 'annotationShape' as GlobalEntityKey,
  },
  validEvents: {
    backendName: 'valid_events',
    frontendKey: 'validEvents',
    parentEntity: 'partShape' as GlobalEntityKey,
    childEntity: 'eventShape' as GlobalEntityKey,
  },
  dependentInstances: {
    backendName: 'dependent_instances',
    frontendKey: 'dependentInstances',
    parentEntity: 'blockInstance' as GlobalEntityKey,
    childEntity: 'blockInstance' as GlobalEntityKey,
  },
  bookingCascades: {
    backendName: 'booking_cascades',
    frontendKey: 'bookingCascades',
    parentEntity: 'blockInstance' as GlobalEntityKey,
    childEntity: 'blockInstance' as GlobalEntityKey,
  },
  partAssignments: {
    backendName: 'part_assignments',
    frontendKey: 'partAssignments',
    parentEntity: 'blockInstance' as GlobalEntityKey,
    childEntity: 'partInstance' as GlobalEntityKey,
  },
  annotationAssignments: {
    backendName: 'annotation_assignments',
    frontendKey: 'annotationAssignments',
    parentEntity: 'blockInstance' as GlobalEntityKey,
    childEntity: 'annotationInstance' as GlobalEntityKey,
  },
  eventAssignments: {
    backendName: 'event_assignments',
    frontendKey: 'eventAssignments',
    parentEntity: 'partInstance' as GlobalEntityKey, // Instance-level, not shape-level
    childEntity: 'eventInstance' as GlobalEntityKey,
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
