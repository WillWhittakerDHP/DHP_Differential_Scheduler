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
 * Admin entry dropdown time-out: only show appointments where scheduling began within last X (days/weeks)
 * or quote in quote status for last X. Session 6.8.6 — Business Controls → Confirmation & Holds.
 */
export type AdminEntryTimeoutUnit = 'days' | 'weeks'

export interface AdminEntryTimeout {
  value: number
  unit: AdminEntryTimeoutUnit
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
  /** Admin entry dropdown time-out (X days/weeks). Session 6.8.6. */
  adminEntryTimeout?: AdminEntryTimeout
}
