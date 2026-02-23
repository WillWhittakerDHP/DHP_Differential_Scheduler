
import type { GlobalEntityKey } from './entities'

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
    parentEntity: 'partInstance' as GlobalEntityKey, // Instance-level, not shape-level
    childEntity: 'eventInstance' as GlobalEntityKey,
  },
  attendeeAssignments: {
    backendName: 'event_shape_attendees',
    frontendKey: 'attendeeAssignments',
    parentEntity: 'eventShape' as GlobalEntityKey,
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
