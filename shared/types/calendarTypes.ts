/**
 * Shared Calendar Types
 *
 * LEARNING: Types shared between client and server for calendar configuration
 * WHY: Single source of truth for CalendarConfig/CalendarEntry, prevents type drift
 * PATTERN: Shared types directory for cross-cutting concerns (Phase 1.2 type-similarity remediation)
 */

/**
 * Calendar provider type
 * LEARNING: Identifies which calendar service is configured
 * WHY: Drives API integration (Google, Outlook) or disabled state
 * PATTERN: Enum-like string literal union type
 */
export type CalendarProvider = 'google' | 'outlook' | 'none'

/**
 * Calendar entry with read/write permissions
 * LEARNING: Individual calendar configuration with explicit permissions
 * WHY: Allows admin to configure which calendars are read vs written to
 * PATTERN: Interface with email, optional label, and permission flags
 */
export interface CalendarEntry {
  email: string
  label?: string
  readFrom: boolean
  writeTo: boolean
}

/**
 * Calendar configuration
 * LEARNING: Configuration for which calendars to check for free-busy data and where to create events
 * WHY: Allows admin to configure multiple calendar sources with explicit read/write permissions
 * PATTERN: Dynamic array of calendar entries
 */
export interface CalendarConfig {
  enabled: boolean
  provider: CalendarProvider
  calendars: CalendarEntry[]
  /** Default minutes a slot is held before expiring (1–60). Admin-adjustable under Calendar subtab. */
  holdDurationMinutes?: number
}
