/**
 * Property Router Constants
 * 
 * LEARNING: Centralized constants for property router operations
 * WHY: Eliminates magic strings, improves maintainability, enables type safety
 * PATTERN: Const objects with categorized constants
 */

/**
 * Block shape names used in property validation
 * LEARNING: Block shape names are validated against these constants
 * WHY: Single source of truth for block shape names, prevents typos
 * PATTERN: Const object with block shape name values
 */
export const BLOCK_SHAPE_NAMES = {
  PROPERTIES: 'Properties',
} as const

/**
 * Error messages for property operations
 * LEARNING: Centralized error messages for consistent API responses
 * WHY: Single source of truth for error messages, easier to maintain and translate
 * PATTERN: Const object with error message values organized by operation type
 */
export const ERROR_MESSAGES = {
  // Property CRUD operations
  FETCH_PROPERTIES: 'Failed to fetch properties',
  FETCH_PROPERTY: 'Error fetching property',
  PROPERTY_NOT_FOUND: 'Property not found',
  CREATE_PROPERTY: 'Failed to create property',
  UPDATE_PROPERTY: 'Failed to update property',
  PATCH_PROPERTY: 'Failed to patch property',
  DELETE_PROPERTY: 'Failed to delete property',
  
  // Property types operations
  FETCH_PROPERTY_TYPES: 'Failed to fetch property types',
  PROPERTY_VERSION_NOT_FOUND: 'Property version not found',
  ADD_PROPERTY_TYPE: 'Failed to add property type',
  UPDATE_PROPERTY_TYPE: 'Failed to update property type',
  REMOVE_PROPERTY_TYPE: 'Failed to remove property type',
  REPLACE_PROPERTY_TYPES: 'Failed to replace property types',
  PROPERTY_TYPE_NOT_FOUND: 'Property type not found',
  PROPERTY_TYPE_ALREADY_ASSIGNED: 'Property type already assigned to this property version',
  
  // Validation errors
  MISSING_REQUIRED_FIELDS: 'Missing required fields',
  MISSING_BLOCK_INSTANCE_ID: 'Missing required field: blockInstanceId',
  BLOCK_INSTANCE_NOT_FOUND: 'Block instance not found',
  INVALID_BLOCK_SHAPE: 'Block instance must have "Properties" block_shape',
  INVALID_BLOCK_SHAPES_BULK: 'All block instances must have "Properties" block_shape',
  BLOCK_INSTANCES_NOT_FOUND: 'Some block instances not found',
} as const

/**
 * Required field names for property operations
 * LEARNING: Centralized required field lists for validation
 * WHY: Single source of truth for required fields, easier to maintain
 * PATTERN: Const arrays with required field names
 */
export const REQUIRED_FIELDS = {
  ADDRESS: ['address', 'city', 'state', 'zipCode'] as const,
  PROPERTY_TYPE: ['blockInstanceId'] as const,
} as const

import { DEFAULT_PROPERTY_SOURCE } from '../../../../../shared/constants/propertyConstants.js'

/**
 * Default values for property operations
 * LEARNING: Centralized default values for optional fields
 * WHY: Single source of truth for defaults; SOURCE from shared constant
 * PATTERN: Const object with default values
 */
export const DEFAULT_VALUES = {
  SOURCE: DEFAULT_PROPERTY_SOURCE,
  ORDER_INDEX: 0 as const,
} as const

/**
 * Unknown error fallback message
 * LEARNING: Re-export from shared constants
 * WHY: Single source of truth, already defined in constants/router.ts
 * PATTERN: Re-export from shared constants
 */
export { UNKNOWN_ERROR_MESSAGE } from '../../../constants/router.js'
