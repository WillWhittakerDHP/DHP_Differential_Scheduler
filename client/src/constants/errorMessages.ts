/**
 * Error Message Constants
 * 
 * LEARNING: Centralized error messages for API dev panel
 * WHY: Eliminates hardcoding audit findings, provides single source of truth
 * PATTERN: Named constants for all user-facing error messages
 */

/**
 * Error message for OAuth status fetch failure
 */
export const ERROR_FETCH_OAUTH_STATUS = 'Failed to fetch OAuth status'

/**
 * Error message for events cache fetch failure
 */
export const ERROR_FETCH_EVENTS_CACHE = 'Failed to fetch events cache'

/**
 * Error message when both rate limit APIs fail
 */
export const ERROR_FETCH_RATE_LIMIT_BOTH = 'Failed to fetch rate limit stats for both APIs'

/**
 * Error message for rate limit fetch failure
 */
export const ERROR_FETCH_RATE_LIMIT = 'Failed to fetch rate limit stats'

/**
 * Error message for drive time cache fetch failure
 */
export const ERROR_FETCH_DRIVE_TIME_CACHE = 'Failed to fetch drive time cache'

/**
 * Error message for dev status fetch failure
 */
export const ERROR_FETCH_DEV_STATUS = 'Failed to fetch dev status'
