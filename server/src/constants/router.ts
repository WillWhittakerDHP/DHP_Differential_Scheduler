/**
 * Shared Router Constants
 * 
 */

/** Unknown error fallback (re-export from shared). */
export { UNKNOWN_ERROR_MESSAGE } from '../../../shared/constants/errorMessages.js'

import { ERROR_MESSAGES as ENTITY_ERROR_MESSAGES } from '../routes/internal/entities/entityConstants.js'
import { ERROR_MESSAGES as USER_ERROR_MESSAGES } from '../routes/internal/users/userConstants.js'

/**
 * HTTP status codes
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
 */
export const VALIDATION_FAILED_MESSAGE = USER_ERROR_MESSAGES.VALIDATION_FAILED
