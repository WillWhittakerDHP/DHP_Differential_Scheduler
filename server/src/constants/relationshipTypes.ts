export const RELATIONSHIP_TYPES = {
  ANNOTATION_ASSIGNMENTS: 'annotationAssignments',
  ATTENDEE_ASSIGNMENTS: 'attendeeAssignments',
  EVENT_ASSIGNMENTS: 'eventAssignments',
  VALID_BOOKING_CASCADES: 'validBookingCascades',
  VALID_PART_CASCADES: 'validPartCascades',
  VALID_ANNOTATION_ASSIGNMENTS: 'validAnnotationAssignments',
  VALID_EVENT_CASCADES: 'validEventCascades',
  DEPENDENT_INSTANCES: 'dependentInstances',
    BOOKING_CASCADES: 'bookingCascades',
    ACCUMULATION_LINKS: 'accumulationLinks',
    PRICING_CASCADES: 'pricingCascades',
  VALID_PRICING_CASCADES: 'validPricingCascades',
  PART_ASSIGNMENTS: 'partAssignments',
  INSTANCE_COMPONENTS: 'instanceComponents',
} as const

/**
PATTERN: typeof pattern for type extraction
 */
export type RelationshipType = typeof RELATIONSHIP_TYPES[keyof typeof RELATIONSHIP_TYPES]
