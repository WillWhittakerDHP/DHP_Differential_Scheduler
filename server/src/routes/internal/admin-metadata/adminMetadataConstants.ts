/**
 * Admin Metadata Router Constants
 * 
 * LEARNING: Centralized constants for admin metadata router operations
 * WHY: Eliminates magic strings, improves maintainability, enables type safety
 * PATTERN: Const objects with categorized constants
 */

/**
 * Sentinel UUIDs for global configuration metadata
 * LEARNING: Global configs use fixed UUIDs to identify entity-type-wide metadata
 * WHY: Consistent identification across frontend and backend
 * PATTERN: Same constants used on frontend and backend for consistency
 */
export const GLOBAL_CONFIG_IDS = {
  BLOCK_SHAPE: '00000000-0000-0000-0000-000000000001',
  PART_SHAPE: '00000000-0000-0000-0000-000000000002',
  PART_INSTANCE: '00000000-0000-0000-0000-000000000003',
  BLOCK_INSTANCE: '00000000-0000-0000-0000-000000000004',
} as const

/**
 * Valid entity types for admin metadata
 * LEARNING: Centralized valid entity types
 * WHY: Single source of truth for entity types, prevents typos
 * PATTERN: Const array with valid entity types
 */
export const VALID_ENTITY_TYPES = [
  'blockShape',
  'partShape',
  'blockInstance',
  'partInstance',
  'eventShape',
  'eventInstance',
  'annotationShape',
  'annotationInstance',
] as const

/**
 * Error messages for admin metadata operations
 * LEARNING: Centralized error messages for consistent API responses
 * WHY: Single source of truth for error messages, easier to maintain and translate
 * PATTERN: Const object with error message values organized by operation type
 */
export const ERROR_MESSAGES = {
  // Admin metadata CRUD operations
  FETCH_BATCH_METADATA: 'Failed to fetch batch metadata',
  FETCH_METADATA: 'Failed to fetch metadata',
  CREATE_UPDATE_METADATA: 'Failed to create/update metadata',
  DELETE_METADATA: 'Failed to delete metadata',
  
  // Validation errors
  INVALID_ENTITY_TYPE: 'Invalid entityType',
  MISSING_REQUIRED_FIELDS: 'Missing required fields',
  INVALID_RENDER_AS: 'Invalid renderAs',
  MISSING_INPUT_CONFIG: 'Missing inputConfig',
  METADATA_NOT_FOUND: 'Metadata not found',
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
