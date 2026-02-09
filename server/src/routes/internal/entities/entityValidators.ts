/**
 * Entity Router Validation Utilities
 * 
 * LEARNING: Extracted validation logic for entity operations
 * WHY: Improves code reusability, testability, and maintainability
 * PATTERN: Pure validation functions that return validation results
 */

import { ERROR_MESSAGES, TEMPORARY_ID_PATTERNS } from './entityConstants.js'

/**
 * Validation result type
 * LEARNING: Structured validation result for consistent error handling
 * WHY: Enables type-safe validation results with clear success/failure states
 * PATTERN: Discriminated union type for validation results
 */
export type ValidationResult = 
  | { valid: true }
  | { valid: false; error: string; details?: Record<string, unknown> }

/**
 * Validate entity ID is not a temporary ID
 * LEARNING: Extracted entity ID validation logic
 * WHY: Prevents updates to entities that don't exist in database
 * PATTERN: Check ID against temporary ID patterns, return validation result
 * 
 * @param entityId - Entity ID to validate
 * @param displayName - Display name of the entity type for error messages
 * @returns ValidationResult indicating if entity ID is valid
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
 * LEARNING: Extracted bulk update validation logic
 * WHY: Prevents invalid request bodies from being processed
 * PATTERN: Check if request body is array, return validation result
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
