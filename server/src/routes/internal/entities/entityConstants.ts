/**
 * Entity Router Constants
 * 
 * LEARNING: Centralized constants for entity router operations
 * WHY: Eliminates magic strings, improves maintainability, enables type safety
 * PATTERN: Const objects with categorized constants
 */

import { ENTITY_KEYS_ARRAY } from '../../../constants/entities.js'

/**
 * Error messages for entity operations
 * LEARNING: Centralized error messages for consistent API responses
 * WHY: Single source of truth for error messages, easier to maintain and translate
 * PATTERN: Const object with error message values organized by operation type
 */
export const ERROR_MESSAGES = {
  // Configuration operations
  FETCH_CONFIG: 'Failed to fetch entity configuration',
  CONFIGURATION_ERROR: 'Entity configuration error',
  
  // Entity CRUD operations
  FETCH_ENTITIES: 'Failed to fetch {displayName}s',
  FETCH_ENTITY: 'Error fetching {displayName}',
  ENTITY_NOT_FOUND: '{displayName} not found',
  CREATE_ENTITY: 'Error creating {displayName}',
  UPDATE_ENTITY: 'Error updating {displayName}',
  PATCH_ENTITY: 'Failed to patch {displayName}',
  DELETE_ENTITY: 'Error deleting {displayName}',
  
  // Bulk operations
  BULK_UPDATE_ENTITIES: 'Failed to update {displayName}s',
  BULK_UPDATE_FAILED: 'Failed to bulk update {displayName}s',
  INVALID_BULK_ARRAY: 'Request body must be an array of update objects',
  BULK_ARRAY_FORMAT: 'Expected format: [{ id: string, ...fields }]',
  
  // Validation errors
  VALIDATION_FAILED: 'Validation failed for {displayName}',
  UNKNOWN_ENTITY_KIND: 'Unknown entity kind: {entityType}',
  ENTITY_CONFIG_MISSING: 'Entity configuration missing',
  TEMPORARY_ID_ERROR: 'Cannot update {displayName} with temporary ID',
  TEMPORARY_ID_DETAILS: 'Entity ID "{entityId}" is a temporary ID. Use POST to create the entity first.',
  
  // Constraint violations
  MUTUAL_EXCLUSIVITY_VIOLATION: 'Mutual exclusivity violation',
  MUTUAL_EXCLUSIVITY_MESSAGE: 'isStateControl and canHaveParts cannot both be true. They are mutually exclusive.',
  MUTUAL_EXCLUSIVITY_DETAILS: 'Setting one to true requires the other to be false.',
  
  // Part assignment cleanup
  PART_ASSIGNMENT_CLEANUP_ERROR: 'Error disabling old partAssignments relationships',
} as const

/**
 * Default values for entity operations
 * LEARNING: Centralized default values for optional fields
 * WHY: Single source of truth for defaults, easier to maintain
 * PATTERN: Const object with default values
 */
export const DEFAULT_VALUES = {
  BOOKING_MODE: 'standalone' as const,
  CONFIG_VERSION: '1.0.0' as const,
} as const

/**
 * Temporary ID patterns that should be rejected
 * LEARNING: Patterns that indicate temporary/client-side IDs
 * WHY: Prevents updates to entities that don't exist in database
 * PATTERN: Const array with temporary ID patterns
 */
export const TEMPORARY_ID_PATTERNS = {
  NEW_PREFIX: 'new-',
  NULL_UUID: '00000000-0000-0000-0000-000000000000',
} as const

/**
 * Field names used in entity operations
 * LEARNING: Centralized field names for consistency
 * WHY: Single source of truth for field names, handles both camelCase and snake_case
 * PATTERN: Const object with field name values
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
 * LEARNING: Centralized constraint names for error handling
 * WHY: Single source of truth for constraint names, easier to maintain
 * PATTERN: Const object with constraint name values
 */
export const CONSTRAINT_NAMES = {
  STATE_CONTROL_MUTUAL_EXCLUSIVITY: 'check_state_control_mutual_exclusivity',
} as const

/**
 * Database error codes
 * LEARNING: Centralized error codes for error handling
 * WHY: Single source of truth for error codes, easier to maintain
 * PATTERN: Const object with error code values
 */
export const ERROR_CODES = {
  CHECK_VIOLATION: '23514',
} as const

/**
 * Sort order directions
 * LEARNING: Centralized sort order values
 * WHY: Single source of truth for sort orders
 * PATTERN: Const object with sort order values
 */
export const SORT_ORDERS = {
  ASC: 'ASC',
  DESC: 'DESC',
} as const

/**
 * Unknown error fallback message
 * LEARNING: Re-export from shared constants
 * WHY: Single source of truth; avoids circular dependency with router
 * PATTERN: Re-export from shared constants
 */
export { UNKNOWN_ERROR_MESSAGE } from '../../../../../shared/constants/errorMessages.js'

/**
 * Entity keys array for config endpoint
 * LEARNING: Re-export entity keys array for config endpoint
 * WHY: Single source of truth, already defined in constants/entities.ts
 * PATTERN: Re-export from existing constants
 */
export { ENTITY_KEYS_ARRAY }
