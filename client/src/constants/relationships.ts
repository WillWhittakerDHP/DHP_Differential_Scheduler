
import type { GlobalEntityKey } from './entities'

export const RELATIONSHIP_KEYS = {
  validBookingCascades: {
    backendName: 'valid_booking_cascades',
    frontendKey: 'validBookingCascades',
    parentEntity: 'blockShape' as GlobalEntityKey,
    childEntity: 'blockShape' as GlobalEntityKey,
  },
  validPartCascades: {
    backendName: 'valid_part_cascades',
    frontendKey: 'validPartCascades',
    parentEntity: 'blockShape' as GlobalEntityKey,
    childEntity: 'partShape' as GlobalEntityKey,
  },
  validAnnotationAssignments: {
    backendName: 'valid_annotation_assignments',
    frontendKey: 'validAnnotationAssignments',
    parentEntity: 'blockShape' as GlobalEntityKey,
    childEntity: 'annotationShape' as GlobalEntityKey,
  },
  validEventCascades: {
    backendName: 'valid_event_cascades',
    frontendKey: 'validEventCascades',
    parentEntity: 'blockShape' as GlobalEntityKey,
    childEntity: 'eventShape' as GlobalEntityKey,
  },
  bookingCascades: {
    backendName: 'booking_cascades',
    frontendKey: 'bookingCascades',
    parentEntity: 'blockInstance' as GlobalEntityKey,
    childEntity: 'blockInstance' as GlobalEntityKey,
  },
  pricingCascades: {
    backendName: 'pricing_cascades',
    frontendKey: 'pricingCascades',
    parentEntity: 'partInstance' as GlobalEntityKey,
    childEntity: 'partInstance' as GlobalEntityKey,
  },
  validPricingCascades: {
    backendName: 'valid_pricing_cascades',
    frontendKey: 'validPricingCascades',
    parentEntity: 'partShape' as GlobalEntityKey,
    childEntity: 'partShape' as GlobalEntityKey,
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
    parentEntity: 'blockInstance' as GlobalEntityKey,
    childEntity: 'eventInstance' as GlobalEntityKey,
  },
  attendeeAssignments: {
    backendName: 'event_instance_attendees',
    frontendKey: 'attendeeAssignments',
    parentEntity: 'eventInstance' as GlobalEntityKey,
    childEntity: 'blockInstance' as GlobalEntityKey,
  },
  instanceComponents: {
    backendName: 'instance_components',
    frontendKey: 'instanceComponents',
    parentEntity: 'blockInstance' as GlobalEntityKey,
    childEntity: 'blockInstance' as GlobalEntityKey,
  },
} as const

/**
PATTERN: keyof typeof pattern for type extraction
 */
export type GlobalRelationshipKey = keyof typeof RELATIONSHIP_KEYS
