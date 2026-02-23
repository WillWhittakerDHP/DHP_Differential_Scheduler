/**
 * Google Maps API Error Handler
 * 
 */

import type { MapsApiErrorType } from './mapsTypes.js'
import { ERROR_MESSAGES } from './mapsConstants.js'

/**
 * PATTERN: Maps API error class
PATTERN: Matches CalendarApiError pattern
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
