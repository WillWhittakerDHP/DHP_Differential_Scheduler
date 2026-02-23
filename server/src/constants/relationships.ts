export const RELATIONSHIP_KEYS = {
  validCascades: true,
  validParts: true,
  validAnnotations: true,
  dependentInstances: true,
  bookingCascades: true,
  partAssignments: true,
  annotationAssignments: true,
  eventAssignments: true,
  attendeeAssignments: true,
  instanceComponents: true,
} as const;

/**
PATTERN: Simple key lookup (ma...
 */
export function isRelationshipKey(fieldKey: string): boolean {
  return fieldKey in RELATIONSHIP_KEYS;
}
