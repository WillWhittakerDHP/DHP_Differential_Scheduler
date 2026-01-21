/**
 * DateTime Type Definitions
 * 
 * LEARNING: Type definitions for datetime handling throughout the application
 * WHY: Ensures consistency and matches Google Calendar API format
 * PATTERN: Type aliases and conversion utilities for RFC3339 format
 */

/**
 * RFC3339 DateTime Type
 * LEARNING: Type alias for RFC3339-formatted datetime strings (ISO 8601 with timezone)
 * WHY: Documents intent, ensures consistency, matches Google Calendar API format
 * PATTERN: Type alias provides documentation without runtime overhead
 * 
 * Format: "2026-01-15T10:00:00.000Z" or "2026-01-15T10:00:00-05:00"
 * Examples: 
 * - UTC: "2026-01-15T14:30:00Z"
 * - With offset: "2026-01-15T14:30:00-05:00"
 * 
 * Reference: https://developers.google.com/calendar/api/v3/reference/freebusy/query
 */
export type RFC3339DateTime = string
