/**
 * Google Calendar Credentials Helper
 * 
 * LEARNING: Wrapper for setting OAuth credentials for calendar service
 * WHY: Provides clear API for calendar-specific credential management
 * PATTERN: Thin wrapper around OAuth config
 */

import { setCredentials } from '../../../config/googleOAuth.js'

/**
 * Set OAuth credentials for calendar service
 * LEARNING: Updates OAuth client with user's tokens
 * WHY: Required before making API calls
 * @param tokens Token object with access_token, refresh_token, etc.
 */
export function setCalendarCredentials(tokens: {
  access_token?: string | null
  refresh_token?: string | null
  expiry_date?: number | null
}): void {
  setCredentials(tokens)
}
