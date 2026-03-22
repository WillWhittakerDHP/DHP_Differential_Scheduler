import type { CalendarConfig } from './calendarTypes.js'

/** Singleton calendar integration + hold policy (stored as one JSON document). */
export interface CalendarSettingsData extends CalendarConfig {
  /** When true, appointments created with status 'submitted' are auto-transitioned to 'confirmed'. */
  autoConfirmEnabled?: boolean
}
