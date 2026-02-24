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
  /** Default minutes a slot is held before expiring. Clamped by holdDurationMin/Max. Admin-adjustable under Calendar subtab. */
  holdDurationMinutes?: number
  /** Min allowed hold duration (minutes). From admin settings; fallback 1 if missing. */
  holdDurationMin?: number
  /** Max allowed hold duration (minutes). From admin settings; fallback 60 if missing. */
  holdDurationMax?: number
  /** Default when holdDurationMinutes is missing/invalid. From admin settings; fallback 15 if missing. */
  holdDurationFallback?: number
}
