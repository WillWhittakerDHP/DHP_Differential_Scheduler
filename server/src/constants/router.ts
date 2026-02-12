/**
 * Shared Router Constants
 * 
 * LEARNING: Centralized constants for all router operations
 * WHY: Eliminates duplication, provides single source of truth for common router constants
 * PATTERN: Const objects and strings for shared values
 */

/** Unknown error fallback (re-export from shared). */
export { UNKNOWN_ERROR_MESSAGE } from '../../../shared/constants/errorMessages.js'

import { ERROR_MESSAGES as ENTITY_ERROR_MESSAGES } from '../routes/internal/entities/entityConstants.js'
import { ERROR_MESSAGES as USER_ERROR_MESSAGES } from '../routes/internal/users/userConstants.js'

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
  FETCH_ALL_FAILED: ENTITY_ERROR_MESSAGES.FETCH_ENTITIES,
  CREATE_FAILED: 'Failed to create {displayName}',
  UPDATE_FAILED: 'Failed to update {displayName}',
  DELETE_FAILED: 'Failed to delete {displayName}',
  NOT_FOUND: ENTITY_ERROR_MESSAGES.ENTITY_NOT_FOUND,
  VALIDATION_FAILED: ENTITY_ERROR_MESSAGES.VALIDATION_FAILED,
} as const

/**
 * Simple validation error message (no placeholder)
 * LEARNING: Used by error handlers for Sequelize validation errors
 * WHY: Consistent validation error message across all routers
 * PATTERN: Re-export from user constants
 */
export const VALIDATION_FAILED_MESSAGE = USER_ERROR_MESSAGES.VALIDATION_FAILED
