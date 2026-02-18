/**
 * Google Maps API Error Handler
 * 
 * LEARNING: Centralized error handling for Google Maps API operations
 * WHY: Provides typed errors and consistent error responses
 * PATTERN: Error class with user-friendly messages
 */

import type { MapsApiErrorType } from './mapsTypes.js'
import { ERROR_MESSAGES } from './mapsConstants.js'

/**
 * Maps API error class
 * LEARNING: Typed errors for consistent error handling
 * PATTERN: Matches CalendarApiError pattern
 */
export class MapsApiError extends Error {
  constructor(
    public type: MapsApiErrorType,
    message: string,
    public retryable: boolean = false
  ) {
    super(message)
    this.name = 'MapsApiError'
  }

  /**
   * Get user-friendly error message
   * LEARNING: Maps technical errors to user-friendly messages
   * WHY: Users shouldn't see technical error details
   */
  getUserMessage(): string {
    const messages: Record<MapsApiErrorType, string> = {
      auth: ERROR_MESSAGES.AUTH,
      rate_limit: ERROR_MESSAGES.RATE_LIMIT,
      invalid: ERROR_MESSAGES.INVALID,
      not_found: ERROR_MESSAGES.NOT_FOUND,
      network: ERROR_MESSAGES.NETWORK,
      unknown: ERROR_MESSAGES.UNKNOWN,
    }
    return messages[this.type]
  }
}
