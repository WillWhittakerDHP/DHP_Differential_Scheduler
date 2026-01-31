/**
 * Relationship Type Constants
 * 
 * LEARNING: Constants for relationship type strings used in switch statements
 * WHY: Eliminates hardcoded strings in switch/case statements for type safety
 * PATTERN: Const object with relationship type values
 */

/**
 * Relationship type constants for switch statements
 * LEARNING: Use these constants instead of hardcoded strings
 * WHY: Type-safe, maintainable, single source of truth
 * PATTERN: Const object with relationship type values matching RelationshipKind type
 */
export const RELATIONSHIP_TYPES = {
  ANNOTATION_ASSIGNMENTS: 'annotationAssignments',
  ATTENDEE_ASSIGNMENTS: 'attendeeAssignments',
  EVENT_ASSIGNMENTS: 'eventAssignments',
  VALID_CASCADES: 'validCascades',
  VALID_PARTS: 'validParts',
  VALID_ANNOTATIONS: 'validAnnotations',
  VALID_EVENTS: 'validEvents',
  DEPENDENT_INSTANCES: 'dependentInstances',
  BOOKING_CASCADES: 'bookingCascades',
  PART_ASSIGNMENTS: 'partAssignments',
  INSTANCE_COMPONENTS: 'instanceComponents',
} as const

/**
 * Relationship type type
 * LEARNING: Derived from RELATIONSHIP_TYPES values
 * WHY: Type-safe relationship type references
 * PATTERN: typeof pattern for type extraction
 */
export type RelationshipType = typeof RELATIONSHIP_TYPES[keyof typeof RELATIONSHIP_TYPES]
