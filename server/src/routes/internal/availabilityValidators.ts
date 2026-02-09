/**
 * Availability Router Validation Utilities
 * 
 * LEARNING: Extracted validation logic for availability operations
 * WHY: Improves code reusability, testability, and maintainability
 * PATTERN: Pure validation functions that return validation results
 */

import { ValidationResult } from '../helpers/routerValidators.js'
import { ERROR_MESSAGES } from './availabilityConstants.js'
import type { ComputedAvailabilityRequest } from '@shared/types/availabilityTypes'

/**
 * Validate computed availability request
 * LEARNING: Extracted request validation logic
 * WHY: Reusable validation for availability computation requests
 * PATTERN: Check required fields, return validation result
 * 
 * @param request - Request object to validate
 * @returns ValidationResult indicating if request is valid
 */
export function validateComputedAvailabilityRequest(
  request: unknown
): ValidationResult {
  if (!request || typeof request !== 'object') {
    return {
      valid: false,
      error: ERROR_MESSAGES.INVALID_DATE_RANGE,
    }
  }

  const req = request as ComputedAvailabilityRequest

  // Validate dateRange
  if (!req.dateRange || !req.dateRange.start || !req.dateRange.end) {
    return {
      valid: false,
      error: ERROR_MESSAGES.INVALID_DATE_RANGE,
    }
  }

  // Validate duration
  if (typeof req.duration !== 'number' || req.duration <= 0) {
    return {
      valid: false,
      error: ERROR_MESSAGES.INVALID_DURATION,
    }
  }

  return { valid: true }
}
