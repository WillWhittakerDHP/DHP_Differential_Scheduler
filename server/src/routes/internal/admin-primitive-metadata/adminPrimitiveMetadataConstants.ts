/**
 * Admin Primitive Metadata Router Constants
 * 
 * LEARNING: Centralized constants for admin primitive metadata router operations
 * WHY: Eliminates magic strings, improves maintainability, enables type safety
 * PATTERN: Const objects with categorized constants
 */

/**
 * Valid entity types for admin primitive metadata
 * LEARNING: Centralized valid entity types
 * WHY: Single source of truth for entity types, prevents typos
 * PATTERN: Const array with valid entity types
 */
export const VALID_ENTITY_TYPES = [
  'blockShape',
  'partShape',
  'blockInstance',
  'partInstance',
] as const

/**
 * Error messages for admin primitive metadata operations
 * LEARNING: Centralized error messages for consistent API responses
 * WHY: Single source of truth for error messages, easier to maintain and translate
 * PATTERN: Const object with error message values organized by operation type
 */
export const ERROR_MESSAGES = {
  // Admin primitive metadata CRUD operations
  FETCH_METADATA: 'Failed to fetch primitive metadata',
  CREATE_UPDATE_METADATA: 'Failed to create/update primitive metadata',
  DELETE_METADATA: 'Failed to delete primitive metadata',
  
  // Validation errors
  INVALID_ENTITY_TYPE: 'Invalid entityType',
  MISSING_REQUIRED_FIELDS: 'Missing required fields',
  INVALID_RENDER_AS: 'Invalid renderAs',
  MISSING_INPUT_CONFIG: 'Missing inputConfig',
  METADATA_NOT_FOUND: 'Primitive metadata not found',
} as const

/**
 * Required fields for metadata creation/update
 * LEARNING: Centralized required field lists for validation
 * WHY: Single source of truth for required fields, easier to maintain
 * PATTERN: Const array with required field names
 */
export const REQUIRED_FIELDS = {
  CREATE_UPDATE: ['fieldKey', 'dataType', 'label', 'visibility', 'layout', 'displayOrder'] as const,
} as const

/**
 * RenderAs values that require inputConfig
 * LEARNING: Centralized list of renderAs values that require inputConfig
 * WHY: Single source of truth for validation logic
 * PATTERN: Const array with renderAs values
 */
export const RENDER_AS_REQUIRING_INPUT_CONFIG = [
  'select',
  'multiselect',
  'reference',
  'relationshipCollection',
] as const
