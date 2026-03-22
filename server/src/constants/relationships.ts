export const RELATIONSHIP_KEYS = {
  validCascades: true,
  validParts: true,
  validAnnotations: true,
  validEvents: true,
  validPricingCascades: true,
  dependentInstances: true,
  bookingCascades: true,
  pricingCascades: true,
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
