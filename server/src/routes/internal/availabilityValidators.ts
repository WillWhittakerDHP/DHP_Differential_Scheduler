
import type { ValidationResult } from '../helpers/routerValidators.js'
import { ERROR_MESSAGES } from './availabilityConstants.js'
import type { ComputedAvailabilityRequest } from '../../../../shared/types/availabilityTypes.js'

/**
 * Validate computed availability request
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

  if (!req.dateRange || !req.dateRange.start || !req.dateRange.end) {
    return {
      valid: false,
      error: ERROR_MESSAGES.INVALID_DATE_RANGE,
    }
  }

  if (typeof req.duration !== 'number' || req.duration <= 0) {
    return {
      valid: false,
      error: ERROR_MESSAGES.INVALID_DURATION,
    }
  }

  if (
    req.appointmentId !== undefined
    && req.appointmentId !== null
    && typeof req.appointmentId !== 'string'
  ) {
    return {
      valid: false,
      error: 'appointmentId must be a string when provided',
    }
  }

  if (
    req.reschedulingAppointmentId !== undefined
    && req.reschedulingAppointmentId !== null
    && typeof req.reschedulingAppointmentId !== 'string'
  ) {
    return {
      valid: false,
      error: 'reschedulingAppointmentId must be a string when provided',
    }
  }

  return { valid: true }
}
