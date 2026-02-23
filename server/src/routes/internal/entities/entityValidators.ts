/**
 * Entity Router Validation Utilities
 * 
 */

import { ERROR_MESSAGES, TEMPORARY_ID_PATTERNS } from './entityConstants.js'

/**
 * WHY: Validation result type
WHY: Enables type-safe validation results with cl...
 */
export type ValidationResult = 
  | { valid: true }
  | { valid: false; error: string; details?: Record<string, unknown> }

/**
 * PATTERN: Validate entity ID is not a temporary ID
PATTERN: Check ID against tempo...
 */
export function validateEntityId(
  entityId: string,
  displayName: string
): ValidationResult {
  if (entityId.startsWith(TEMPORARY_ID_PATTERNS.NEW_PREFIX) || 
      entityId === TEMPORARY_ID_PATTERNS.NULL_UUID) {
    return {
      valid: false,
      error: ERROR_MESSAGES.TEMPORARY_ID_ERROR.replace('{displayName}', displayName),
      details: {
        details: ERROR_MESSAGES.TEMPORARY_ID_DETAILS.replace('{entityId}', entityId),
        id: entityId
      }
    }
  }
  
  return { valid: true }
}

/**
 * Validate bulk update request body is an array
 * 
 * @param updates - Request body to validate
 * @returns ValidationResult indicating if request body is valid
 */
export function validateBulkUpdateArray(
  updates: unknown
): ValidationResult {
  if (!Array.isArray(updates)) {
    return {
      valid: false,
      error: ERROR_MESSAGES.INVALID_BULK_ARRAY,
      details: {
        details: ERROR_MESSAGES.BULK_ARRAY_FORMAT
      }
    }
  }
  
  return { valid: true }
}
