/**
 * Maps Route Constants
 *
 * WHY: Centralized strings for maps routes, eliminates magic strings
 */

export const MAPS_ROUTE_MESSAGES = {
  MISSING_INPUT: 'Missing required parameter: input',
  MISSING_PLACE_ID: 'Missing required parameter: placeId',
  INTERNAL_SERVER_ERROR: 'Internal server error',
  DEBUG_DISABLED: 'Debug endpoints disabled in production',
  DRIVE_TIME_CACHE_CLEARED: 'Drive time cache cleared',
  UNEXPECTED_ERROR: 'An unexpected error occurred'
} as const
