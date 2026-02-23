/**
 * Google Calendar Credentials Helper
 * 
 */

import { setCredentials } from '../../../config/googleOAuth.js'

/**
 * Set OAuth credentials for calendar service
 * @param tokens Token object with access_token, refresh_token, etc.
 */
export function setCalendarCredentials(tokens: {
  access_token?: string | null
  refresh_token?: string | null
  expiry_date?: number | null
}): void {
  setCredentials(tokens)
}
