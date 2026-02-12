/**
 * Admin Relationship Metadata Router Constants
 *
 * LEARNING: Centralized constants for admin relationship metadata router operations
 * WHY: Eliminates magic strings, improves maintainability, enables type safety
 * PATTERN: Const objects with categorized constants
 */

import {
  createRequiredFields,
  RELATIONSHIP_METADATA_REQUIRED_FIELDS_CREATE_UPDATE,
} from '../admin-metadata/adminMetadataConstants.js'

/**
 * Valid entity types for admin relationship metadata
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
 * Error messages for admin relationship metadata operations
 * LEARNING: Centralized error messages for consistent API responses
 * WHY: Single source of truth for error messages, easier to maintain and translate
 * PATTERN: Const object with error message values organized by operation type
 */
export const ERROR_MESSAGES = {
  // Admin relationship metadata CRUD operations
  FETCH_METADATA: 'Failed to fetch relationship metadata',
  CREATE_UPDATE_METADATA: 'Failed to create/update relationship metadata',
  DELETE_METADATA: 'Failed to delete relationship metadata',
  
  // Validation errors
  INVALID_ENTITY_TYPE: 'Invalid entityType',
  MISSING_REQUIRED_FIELDS: 'Missing required fields',
  MISSING_INPUT_CONFIG: 'Missing inputConfig',
  METADATA_NOT_FOUND: 'Relationship metadata not found',
} as const

/** Required fields for metadata creation/update (same shape as admin metadata, relationshipKey-based) */
export const REQUIRED_FIELDS = createRequiredFields(RELATIONSHIP_METADATA_REQUIRED_FIELDS_CREATE_UPDATE)

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
