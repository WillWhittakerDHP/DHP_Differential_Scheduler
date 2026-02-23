/**
 * Entity Router Constants
 * 
 */

import { ENTITY_KEYS_ARRAY } from '../../../constants/entities.js'

/**
 * Error messages for entity operations
 */
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
} as const

/**
 * Default values for entity operations
 */
export const DEFAULT_VALUES = {
  BOOKING_MODE: 'standalone' as const,
  CONFIG_VERSION: '1.0.0' as const,
} as const

/**
 * WHY: Temporary ID patterns that should be rejected
LEARNING: Patterns that in...
 */
export const TEMPORARY_ID_PATTERNS = {
  NEW_PREFIX: 'new-',
  NULL_UUID: '00000000-0000-0000-0000-000000000000',
} as const

/**
 * Field names used in entity operations
 */
export const FIELD_NAMES = {
  ORDER_INDEX: 'orderIndex',
  BOOKING_MODE: 'bookingMode',
  BOOKING_MODE_SNAKE: 'booking_mode',
  CREATED_AT: 'createdAt',
  ID: 'id',
  ANNOTATIONS: 'annotations',
  ENTITY_KEY: 'entityKey',
} as const

/**
 * Database constraint names
 */
export const CONSTRAINT_NAMES = {
  STATE_CONTROL_MUTUAL_EXCLUSIVITY: 'check_state_control_mutual_exclusivity',
} as const

/**
 * Database error codes
 */
export const ERROR_CODES = {
  CHECK_VIOLATION: '23514',
} as const

/**
 * Sort order directions
 */
export const SORT_ORDERS = {
  ASC: 'ASC',
  DESC: 'DESC',
} as const

/**
 * WHY: Unknown error fallback message
WHY: Single source of truth; avoids circu...
 */
export { UNKNOWN_ERROR_MESSAGE } from '../../../../../shared/constants/errorMessages.js'

/**
 * Entity keys array for config endpoint
 */
export { ENTITY_KEYS_ARRAY }
