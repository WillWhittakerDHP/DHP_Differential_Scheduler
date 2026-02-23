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
  PRICING_CASCADES: 'pricingCascades',
  VALID_PRICING_CASCADES: 'validPricingCascades',
  PART_ASSIGNMENTS: 'partAssignments',
  INSTANCE_COMPONENTS: 'instanceComponents',
} as const

/**
PATTERN: typeof pattern for type extraction
 */
export type RelationshipType = typeof RELATIONSHIP_TYPES[keyof typeof RELATIONSHIP_TYPES]
