/**
 * Shared Router Constants
 * 
 * LEARNING: Centralized constants for all router operations
 * WHY: Eliminates duplication, provides single source of truth for common router constants
 * PATTERN: Const objects and strings for shared values
 */

/**
 * Unknown error fallback message
 * LEARNING: Fallback message when error type cannot be determined
 * WHY: Consistent error message format when error details are unavailable
 * PATTERN: Const string for unknown errors
 */
export const UNKNOWN_ERROR_MESSAGE = 'Unknown error'

/**
 * HTTP status codes
 * LEARNING: Centralized HTTP status code constants
 * WHY: Single source of truth for status codes, prevents magic numbers
 * PATTERN: Const object with status code values
 */
export const HTTP_STATUS_CODES = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
} as const

/**
 * Error message templates
 * LEARNING: Reusable error message templates with {displayName} placeholder
 * WHY: Consistent error messages across routers, supports entity-specific customization
 * PATTERN: Const object with template strings
 */
export const ERROR_MESSAGE_TEMPLATES = {
  FETCH_FAILED: 'Failed to fetch {displayName}',
  FETCH_ALL_FAILED: 'Failed to fetch {displayName}s',
  CREATE_FAILED: 'Failed to create {displayName}',
  UPDATE_FAILED: 'Failed to update {displayName}',
  DELETE_FAILED: 'Failed to delete {displayName}',
  NOT_FOUND: '{displayName} not found',
  VALIDATION_FAILED: 'Validation failed for {displayName}',
} as const

/**
 * Simple validation error message (no placeholder)
 * LEARNING: Used by error handlers for Sequelize validation errors
 * WHY: Consistent validation error message across all routers
 * PATTERN: Const string for validation errors
 */
export const VALIDATION_FAILED_MESSAGE = 'Validation failed'
