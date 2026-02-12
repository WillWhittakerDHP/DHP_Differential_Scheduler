/**
 * Google OAuth Route Constants
 *
 * WHY: Single source of truth for OAuth route strings; reduces hardcoding audit findings
 */

export const GOOGLE_OAUTH_MESSAGES = {
  AUTH_URL_GENERATE_FAILED: 'Failed to generate authorization URL',
  AUTH_FAILED: 'Authorization failed',
  AUTH_FAILED_GOOGLE: (error: string): string => `Google returned error: ${error}`,
  INVALID_REQUEST: 'Invalid request',
  AUTH_CODE_REQUIRED: 'Authorization code is required',
  AUTH_SUCCESS: 'Authentication successful - tokens saved for future sessions',
  AUTH_FAILED_GENERIC: 'Authentication failed',
  AUTH_UNEXPECTED_ERROR: 'An unexpected error occurred during authentication',
  VISIT_AUTH_URL: 'Visit the authUrl to authenticate with Google',
  CHECK_STATUS_FAILED: 'Failed to check authentication status',
  UNKNOWN_ERROR: 'Unknown error',
  TEST_URL_MESSAGE: 'Copy this URL and paste it in your browser to test the OAuth flow',
} as const

export { NODE_ENV } from '../../constants/appConstants.js'
