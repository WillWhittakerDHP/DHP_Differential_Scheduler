/**
 * Types for calendar_settings API (singleton: calendar integration + auto-confirm).
 */
import type { CalendarConfig, CalendarEntry, CalendarProvider, AdminEntryTimeout, AdminEntryTimeoutUnit } from '@shared/types/calendarTypes'

export type { CalendarConfig, CalendarEntry, CalendarProvider, AdminEntryTimeout, AdminEntryTimeoutUnit }

export interface CalendarSettingsData extends CalendarConfig {
  /** When true, appointments created with status 'submitted' are auto-transitioned to 'confirmed'. */
  autoConfirmEnabled?: boolean
}

export const DEFAULT_CALENDAR_CONFIG: CalendarConfig = {
  enabled: false,
  provider: 'none',
  calendars: [],
  holdDurationMinutes: 15,
  holdDurationMin: 1,
  holdDurationMax: 60,
  holdDurationFallback: 15,
  adminEntryTimeout: { value: 30, unit: 'days' },
}
