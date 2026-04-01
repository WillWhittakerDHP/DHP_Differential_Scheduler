export const RELATIONSHIP_KEYS = {
  validBookingCascades: true,
  validPartCascades: true,
  validAnnotationAssignments: true,
  validEventCascades: true,
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
