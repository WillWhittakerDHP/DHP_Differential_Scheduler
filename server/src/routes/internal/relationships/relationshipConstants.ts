/**
 * Relationship Router Constants
 * 
 * LEARNING: Centralized constants for relationship router operations
 * WHY: Eliminates magic strings, improves maintainability, enables type safety
 * PATTERN: Const objects with categorized constants
 */

import {
  ValidCascade,
  ValidPart,
  ValidAnnotation,
  ValidEvent,
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

/**
 * Relationship kind configuration
 * LEARNING: RelationshipKind represents the type of relationship (validCascades, validParts, etc.)
 * WHY: Clear naming - "kind" distinguishes relationship types from entity structure types
 * PATTERN: Type alias for relationship discriminator values
 * 
 * Three-dimensional relationship model:
 * - Cascade: Vertical hierarchy (different shapes, e.g., user_shape → service)
 * - Constituent: Block → Part relationships (math dimension)
 * - Component: Lateral component relationships (same shape, e.g., service → service)
 */
export type RelationshipKind = 'validCascades' | 'validParts' | 'validAnnotations' | 'validEvents' | 'validPricingCascades' | 'dependentInstances' | 'bookingCascades' | 'pricingCascades' | 'partAssignments' | 'annotationAssignments' | 'eventAssignments' | 'attendeeAssignments' | 'instanceComponents'

export interface RelationshipConfig {
  model: ModelStatic<Model>
  displayName: string
  parentEntity: string
  childEntity: string
}

/**
 * Relationship registry
 * LEARNING: Registry pattern for relationship type configuration
 * WHY: Centralized configuration for all relationship types
 * PATTERN: Record mapping relationship kinds to their configuration
 */
export const RELATIONSHIP_REGISTRY: Record<RelationshipKind, RelationshipConfig> = {
  validCascades: {
    model: ValidCascade,
    displayName: 'Valid Cascade',
    parentEntity: 'blockShape',
    childEntity: 'blockShape'
  },
  validParts: {
    model: ValidPart,
    displayName: 'Valid Part',
    parentEntity: 'blockShape',
    childEntity: 'partShape'
  },
  validAnnotations: {
    model: ValidAnnotation,
    displayName: 'Valid Annotation',
    parentEntity: 'blockShape',
    childEntity: 'annotationShape'
  },
  validEvents: {
    model: ValidEvent,
    displayName: 'Valid Event',
    parentEntity: 'partShape',
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
    parentEntity: 'partInstance', // Can be partInstance or blockInstance (determined by parent_kind)
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

/**
 * Error messages for relationship operations
 * LEARNING: Centralized error messages for consistent API responses
 * WHY: Single source of truth for error messages, easier to maintain and translate
 * PATTERN: Const object with error message values organized by operation type
 */
export const ERROR_MESSAGES = {
  // Relationship CRUD operations
  FETCH_RELATIONSHIPS: 'Failed to fetch relationships',
  CREATE_RELATIONSHIP: 'Error creating relationship',
  UPDATE_INSTANCE_COMPONENT: 'Error updating instance component',
  UPDATE_ANNOTATION_ASSIGNMENT: 'Error updating annotation assignment',
  DELETE_RELATIONSHIP: 'Error deleting relationship',
  DELETE_INSTANCE_COMPONENT: 'Error deleting instance component',
  
  // Validation errors
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

/**
 * Sequelize error codes
 * LEARNING: Centralized Sequelize error codes
 * WHY: Single source of truth for error code checking
 * PATTERN: Const object with error codes
 */
export const SEQUELIZE_ERROR_CODES = {
  UNIQUE_CONSTRAINT: '23505',
  FOREIGN_KEY_CONSTRAINT: '23503',
} as const
