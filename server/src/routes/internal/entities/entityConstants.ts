
import { ENTITY_KEYS_ARRAY } from '../../../constants/entities.js'

export const ERROR_MESSAGES = {
  FETCH_CONFIG: 'Failed to fetch entity configuration',
  CONFIGURATION_ERROR: 'Entity configuration error',
  
  FETCH_ENTITIES: 'Failed to fetch {displayName}s',
  FETCH_ENTITY: 'Error fetching {displayName}',
  ENTITY_NOT_FOUND: '{displayName} not found',
  CREATE_ENTITY: 'Error creating {displayName}',
  UPDATE_ENTITY: 'Error updating {displayName}',
  PATCH_ENTITY: 'Failed to patch {displayName}',
  DELETE_ENTITY: 'Error deleting {displayName}',
  
  BULK_UPDATE_ENTITIES: 'Failed to update {displayName}s',
  BULK_UPDATE_FAILED: 'Failed to bulk update {displayName}s',
  INVALID_BULK_ARRAY: 'Request body must be an array of update objects',
  BULK_ARRAY_FORMAT: 'Expected format: [{ id: string, ...fields }]',
  
  VALIDATION_FAILED: 'Validation failed for {displayName}',
  UNKNOWN_ENTITY_KIND: 'Unknown entity kind: {entityType}',
  ENTITY_CONFIG_MISSING: 'Entity configuration missing',
  TEMPORARY_ID_ERROR: 'Cannot update {displayName} with temporary ID',
  TEMPORARY_ID_DETAILS: 'Entity ID "{entityId}" is a temporary ID. Use POST to create the entity first.',
  
  MUTUAL_EXCLUSIVITY_VIOLATION: 'Mutual exclusivity violation',
  MUTUAL_EXCLUSIVITY_MESSAGE: 'isStateControl and canHaveParts cannot both be true. They are mutually exclusive.',
  MUTUAL_EXCLUSIVITY_DETAILS: 'Setting one to true requires the other to be false.',
  
  PART_ASSIGNMENT_CLEANUP_ERROR: 'Error disabling old partAssignments relationships',

  /** DELETE annotation shape blocked by referencing annotation instances */
  ANNOTATION_SHAPE_IN_USE: 'Annotation shape is in use',
  ANNOTATION_SHAPE_IN_USE_DETAILS:
    'Cannot delete this annotation shape because {annotationInstanceCount} annotation instance(s) reference it and {validAnnotationAssignmentChildCount} valid annotation assignment link(s) use it on the annotation side. Remove or reassign those records first.',
  /** FK violation after pre-count (rare race): omit exact count */
  ANNOTATION_SHAPE_IN_USE_DETAILS_RACE:
    'Cannot delete this annotation shape because one or more annotation instances still reference it. Remove or reassign those instances first.',
  BLOCK_SHAPE_IN_USE: 'Block shape is in use',
  BLOCK_SHAPE_IN_USE_DETAILS:
    'Cannot delete this block shape because it is still referenced by {blockInstanceCount} block instance(s), {validBookingCascadeCount} valid booking cascade link(s), {validPartCascadeParentCount} valid part cascade link(s) as parent, {validAnnotationAssignmentParentCount} valid annotation assignment link(s) as parent block, and {validEventCascadeParentCount} valid event cascade link(s) as parent. Remove or reassign those records first.',
  PART_SHAPE_IN_USE: 'Part shape is in use',
  PART_SHAPE_IN_USE_DETAILS:
    'Cannot delete this part shape because it is still referenced by {partInstanceCount} part instance(s), {validPartCascadeCount} valid part cascade link(s), and {validPricingCascadeCount} pricing cascade link(s). Remove or reassign those records first.',
  PART_SHAPE_IN_USE_DETAILS_RACE:
    'Cannot delete this part shape because one or more part instances, valid part cascade links, or pricing cascade links still reference it. Remove or reassign those records first.',
} as const

/** Domain default for BookingMode (wizard); storage uses TernaryBoolean. */
export const DEFAULT_VALUES = {
  BOOKING_MODE: 'standalone' as const,
  /** DB `booking_mode` column default (ternary_boolean). */
  BOOKING_MODE_STORAGE: 'false' as const,
  CONFIG_VERSION: '1.0.0' as const,
} as const

/**
 * WHY: Temporary ID patterns that should be rejected
 */
export const TEMPORARY_ID_PATTERNS = {
  NEW_PREFIX: 'new-',
  NULL_UUID: '00000000-0000-0000-0000-000000000000',
} as const

/**
 * URL segments for dependency-aware delete (preflight / resolve / finalize).
 * Full paths: `/api/v1/internal/entities/:entityType/:id/<segment>`
 * Spec: `.project-manager/features/appointment-workflow/docs/delete-preflight-api-v1.md`
 * Handlers: Phase 6.17.2 — constants only until then.
 */
export const ENTITY_DELETE_ROUTE_SEGMENTS = {
  PREFLIGHT: 'delete-preflight',
  RESOLVE: 'delete-resolve',
  FINALIZE: 'delete-finalize',
} as const

export const FIELD_NAMES = {
  ORDER_INDEX: 'orderIndex',
  BOOKING_MODE: 'bookingMode',
  BOOKING_MODE_SNAKE: 'booking_mode',
  AGENT_PERMISSIONS: 'agentPermissions',
  AGENT_PERMISSIONS_SNAKE: 'agent_permissions',
  DIFFERENTIAL_ROLE: 'differentialRole',
  DIFFERENTIAL_ROLE_SNAKE: 'differential_role',
  DIFFERENTIAL_EVENT_ROLE_OVERRIDES: 'differentialEventRoleOverrides',
  DIFFERENTIAL_EVENT_ROLE_OVERRIDES_SNAKE: 'differential_event_role_overrides',
  CREATED_AT: 'createdAt',
  ID: 'id',
  ANNOTATIONS: 'annotations',
  ENTITY_KEY: 'entityKey',
} as const

export const CONSTRAINT_NAMES = {
  STATE_CONTROL_MUTUAL_EXCLUSIVITY: 'check_state_control_mutual_exclusivity',
  ANNOTATION_INSTANCES_TYPE_FKEY: 'annotation_instances_type_fkey',
  PART_INSTANCES_PART_SHAPE_REF_FKEY: 'part_instances_part_shape_ref_fkey',
  VALID_PART_CASCADES_CHILD_ID_FKEY: 'valid_part_cascades_child_id_fkey',
  VALID_PRICING_CASCADES_PARENT_ID_FKEY: 'valid_pricing_cascades_parent_id_fkey',
  VALID_PRICING_CASCADES_CHILD_ID_FKEY: 'valid_pricing_cascades_child_id_fkey',
} as const

export const ERROR_CODES = {
  CHECK_VIOLATION: '23514',
} as const

export const SORT_ORDERS = {
  ASC: 'ASC',
  DESC: 'DESC',
} as const

export { UNKNOWN_ERROR_MESSAGE } from '../../../../../shared/constants/errorMessages.js'

export { ENTITY_KEYS_ARRAY }
