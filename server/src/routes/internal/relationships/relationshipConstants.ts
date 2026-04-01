
import {
  ValidBookingCascade,
  ValidPartCascade,
  ValidAnnotationAssignment,
  ValidEventCascade,
  ValidPricingCascade,
  DependentInstance,
  BookingCascade,
  PricingCascade,
  PartAssignment,
  AnnotationAssignment,
  EventAssignment,
  EventShapeAttendee,
  InstanceComponent,
} from '../../../config/app.js'
import { Model, ModelStatic } from 'sequelize'

export type RelationshipKind = 'validBookingCascades' | 'validPartCascades' | 'validAnnotationAssignments' | 'validEventCascades' | 'validPricingCascades' | 'dependentInstances' | 'bookingCascades' | 'pricingCascades' | 'partAssignments' | 'annotationAssignments' | 'eventAssignments' | 'attendeeAssignments' | 'instanceComponents'

export interface RelationshipConfig {
  model: ModelStatic<Model>
  displayName: string
  parentEntity: string
  childEntity: string
}

export const RELATIONSHIP_REGISTRY: Record<RelationshipKind, RelationshipConfig> = {
  validBookingCascades: {
    model: ValidBookingCascade,
    displayName: 'Valid Booking Cascade',
    parentEntity: 'blockShape',
    childEntity: 'blockShape'
  },
  validPartCascades: {
    model: ValidPartCascade,
    displayName: 'Valid Part Cascade',
    parentEntity: 'blockShape',
    childEntity: 'partShape'
  },
  validAnnotationAssignments: {
    model: ValidAnnotationAssignment,
    displayName: 'Valid Annotation Assignment',
    parentEntity: 'blockShape',
    childEntity: 'annotationShape'
  },
  validEventCascades: {
    model: ValidEventCascade,
    displayName: 'Valid Event Cascade',
    parentEntity: 'blockShape',
    childEntity: 'eventShape'
  },
  dependentInstances: {
    model: DependentInstance,
    displayName: 'Dependent Instance',
    parentEntity: 'blockInstance',
    childEntity: 'blockInstance'
  },
  bookingCascades: {
    model: BookingCascade,
    displayName: 'Booking Cascade',
    parentEntity: 'blockInstance',
    childEntity: 'blockInstance'
  },
  pricingCascades: {
    model: PricingCascade,
    displayName: 'Pricing Cascade',
    parentEntity: 'partInstance',
    childEntity: 'partInstance'
  },
  validPricingCascades: {
    model: ValidPricingCascade,
    displayName: 'Valid Pricing Cascade',
    parentEntity: 'partShape',
    childEntity: 'partShape'
  },
  partAssignments: {
    model: PartAssignment,
    displayName: 'Part Assignment',
    parentEntity: 'blockInstance',
    childEntity: 'partInstance'
  },
  annotationAssignments: {
    model: AnnotationAssignment,
    displayName: 'Annotation Assignment',
    parentEntity: 'blockInstance',
    childEntity: 'annotationInstance'
  },
  eventAssignments: {
    model: EventAssignment,
    displayName: 'Event Assignment',
    parentEntity: 'blockInstance',
    childEntity: 'eventInstance'
  },
  attendeeAssignments: {
    model: EventShapeAttendee,
    displayName: 'Attendee Assignment',
    parentEntity: 'eventShape',
    childEntity: 'blockInstance'
  },
  instanceComponents: {
    model: InstanceComponent,
    displayName: 'Instance Component',
    parentEntity: 'blockInstance',
    childEntity: 'blockInstance'
  }
}

export const ERROR_MESSAGES = {
  FETCH_RELATIONSHIPS: 'Failed to fetch relationships',
  CREATE_RELATIONSHIP: 'Error creating relationship',
  UPDATE_INSTANCE_COMPONENT: 'Error updating instance component',
  UPDATE_ANNOTATION_ASSIGNMENT: 'Error updating annotation assignment',
  DELETE_RELATIONSHIP: 'Error deleting relationship',
  DELETE_INSTANCE_COMPONENT: 'Error deleting instance component',
  
  UNKNOWN_RELATIONSHIP_KIND: 'Unknown relationship kind',
  RELATIONSHIP_CONFIG_MISSING: 'Relationship configuration missing',
  MODEL_NOT_AVAILABLE: 'Model not available',
  MISSING_REQUIRED_FIELDS: 'Missing required fields: parentId and childId are required',
  PARENT_CHILD_SAME: 'Parent and child cannot be the same entity',
  PARENT_NOT_FOUND: 'Parent BlockInstance not found',
  CHILD_NOT_FOUND: 'Child BlockInstance not found',
  BLOCK_INSTANCE_NOT_FOUND: 'BlockInstance not found',
  BLOCK_SHAPE_MISSING: 'BlockInstance missing BlockShape',
  NOT_COMPOSABLE: 'BlockShape is not composable. Components are only allowed for BlockInstances with composable BlockShapes.',
  DIFFERENT_BLOCK_SHAPES: 'Components must have the same BlockShape as their parent',
  CIRCULAR_REFERENCE: 'Circular reference detected: adding this component would create a cycle',
  COMPONENT_ALREADY_EXISTS: 'Component relationship already exists',
  INVALID_PARENT_ENTITY: 'Invalid parent entity',
  INVALID_CHILD_ENTITY: 'Invalid child entity',
  INVALID_BLOCK_SHAPE_REFERENCE: 'Invalid block shape reference',
  INVALID_ATTENDEE_TYPE: 'Invalid attendee type',
  RELATIONSHIP_ALREADY_EXISTS: 'Relationship already exists',
  INVALID_ENTITY_REFERENCE: 'Invalid entity reference',
  INSTANCE_COMPONENT_NOT_FOUND: 'Instance component not found',
  INSTANCE_COMPONENT_DELETED: 'Instance component deleted successfully',
  ANNOTATION_ASSIGNMENT_NOT_FOUND: 'Annotation assignment not found',
  RELATIONSHIP_NOT_FOUND: 'Relationship not found',
  PRICING_CASCADE_SHAPE_NOT_VALID: 'No valid pricing cascade exists between the parent and child part shapes. Configure validPricingCascades on the part shapes first.',
} as const

export const SEQUELIZE_ERROR_CODES = {
  UNIQUE_CONSTRAINT: '23505',
  FOREIGN_KEY_CONSTRAINT: '23503',
} as const
