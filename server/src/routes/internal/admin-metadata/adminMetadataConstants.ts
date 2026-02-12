/**
 * Admin Metadata Router Constants
 * 
 * LEARNING: Centralized constants for admin metadata router operations
 * WHY: Eliminates magic strings, improves maintainability, enables type safety
 * PATTERN: Const objects with categorized constants
 */

/**
 * Sentinel UUIDs for global configuration metadata
 * LEARNING: Re-export from shared for consistency across frontend and backend
 */
export { GLOBAL_CONFIG_IDS } from '../../../../../shared/constants/globalConfigIds.js'

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
 * Shared required field list for admin metadata (fieldKey-based)
 * LEARNING: Used by admin metadata and admin primitive metadata
 * WHY: Single source of truth for required fields, eliminates duplication
 */
export const METADATA_REQUIRED_FIELDS_CREATE_UPDATE = ['fieldKey', 'dataType', 'label', 'visibility', 'layout', 'displayOrder'] as const

/**
 * Shared required field list for admin relationship metadata (relationshipKey-based)
 * LEARNING: Same structure as metadata but first key is relationshipKey
 */
export const RELATIONSHIP_METADATA_REQUIRED_FIELDS_CREATE_UPDATE = ['relationshipKey', 'dataType', 'label', 'visibility', 'layout', 'displayOrder'] as const

/**
 * Factory for REQUIRED_FIELDS shape (single structure definition for audit)
 * LEARNING: Both metadata and relationship metadata use same object shape
 */
export function createRequiredFields<T extends readonly string[]>(createUpdate: T): { readonly CREATE_UPDATE: T } {
  return { CREATE_UPDATE: createUpdate }
}

/** Required fields for metadata creation/update */
export const REQUIRED_FIELDS = createRequiredFields(METADATA_REQUIRED_FIELDS_CREATE_UPDATE)

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
