import type { CalendarSettingsData } from '../../../shared/types/calendarSettingsDocument.js'

/** Emails of calendars configured for read sync (Google / Outlook integration). */
export function getReadFromCalendars(calendarSettings: CalendarSettingsData): string[] {
  if (!calendarSettings.enabled || !Array.isArray(calendarSettings.calendars)) {
    return []
  }
  return calendarSettings.calendars
    .filter((entry) => entry.readFrom && entry.email && entry.email.trim() !== '')
    .map((entry) => entry.email.trim())
}
