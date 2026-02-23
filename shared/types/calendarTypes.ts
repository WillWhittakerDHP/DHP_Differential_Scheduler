/**
 * Shared Calendar Types
 *
 */

/**
 * Calendar provider type
 * WHY: Drives API integration (Google, Outlook) or disabled state
 */
export type CalendarProvider = 'google' | 'outlook' | 'none'

/**
 * Calendar entry with read/write permissions
 */
export interface CalendarEntry {
  email: string
  label?: string
  readFrom: boolean
  writeTo: boolean
}

/**
 * Calendar configuration
 */
export interface CalendarConfig {
  enabled: boolean
  provider: CalendarProvider
  calendars: CalendarEntry[]
  /** Default minutes a slot is held before expiring (1–60). Admin-adjustable under Calendar subtab. */
  holdDurationMinutes?: number
}
