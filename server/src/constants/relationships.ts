/**
 * Relationship Constants (Server-side)
 * 
 * LEARNING: Relationship keys used to determine metadataType in unified metadata router
 * WHY: Backend needs to route metadata based on fieldKey type (matches entity pattern)
 * PATTERN: Simple constant object matching client-side RELATIONSHIP_KEYS
 */

/**
 * Relationship keys that should be stored as relationship metadata
 * LEARNING: Used by unified metadata router to determine metadataType
 * WHY: Backend routes based on fieldKey type (like entities route based on field type)
 * PATTERN: Check if fieldKey is in RELATIONSHIP_KEYS to determine metadataType
 */
export const RELATIONSHIP_KEYS = {
  validCascades: true,
  validParts: true,
  validAnnotations: true,
  dependentInstances: true,
  bookingCascades: true,
  partAssignments: true,
  annotationAssignments: true,
  eventAssignments: true,
  instanceComponents: true,
} as const;

/**
 * Check if a fieldKey is a relationship key
 * LEARNING: Helper function to determine metadataType
 * WHY: Used by unified metadata router to route based on fieldKey type
 * PATTERN: Simple key lookup (matches entity pattern where backend routes based on field type)
 */
export function isRelationshipKey(fieldKey: string): boolean {
  return fieldKey in RELATIONSHIP_KEYS;
}
