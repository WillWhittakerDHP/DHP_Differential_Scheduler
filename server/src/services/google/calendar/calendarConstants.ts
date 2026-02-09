/**
 * Google Calendar API Constants
 * 
 * LEARNING: Centralized constants for Google Calendar API operations
 * WHY: Single source of truth for Calendar API constants, eliminates magic strings
 * PATTERN: Constants module
 */

/**
 * Default send updates value for event creation
 * LEARNING: Default to sending invitation emails
 */
export const DEFAULT_SEND_UPDATES: 'all' | 'externalOnly' | 'none' = 'all'

/**
 * Maximum results for calendar events list API
 * LEARNING: Google Calendar API limit
 */
export const MAX_EVENTS_RESULTS = 2500
