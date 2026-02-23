/**
 * Calendar Route Constants
 *
 */

export const CALENDAR_ROUTE_MESSAGES = {
  MISSING_CALENDAR_ID: 'Invalid request: calendarId is required',
  MISSING_SUMMARY: 'Invalid request: summary (event title) is required',
  MISSING_TIMES: 'Invalid request: start and end times are required',
  INVALID_DATES: 'Invalid request: start and end must be valid ISO date strings',
  START_BEFORE_END: 'Invalid request: start must be before end',
  INVALID_ATTENDEES: 'Invalid request: attendees must be an array',
  INVALID_ATTENDEE_EMAIL: 'Invalid request: each attendee must have an email address',
  INVALID_SEND_UPDATES: 'Invalid request: sendUpdates must be "all", "externalOnly", or "none"',
  NOT_AUTHENTICATED: 'Not authenticated: OAuth credentials not found. Please authenticate first.',
  AUTH_URL: '/api/v1/external/oauth',
  INTERNAL_SERVER_ERROR: 'Internal server error',
  UNEXPECTED_ERROR: 'An unexpected error occurred',
  DEBUG_DISABLED: 'Debug endpoints are not available in production',
  VALID_SEND_UPDATES: ['all', 'externalOnly', 'none'] as const,
} as const;
