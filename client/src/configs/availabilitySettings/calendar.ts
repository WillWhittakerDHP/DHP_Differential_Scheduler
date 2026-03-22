/**
 * Calendar helpers (CalendarConfig lives in calendarSettings after settings split).
 */
import type { CalendarConfig } from '@/configs/calendarSettings'

/**
 * Validate email format for calendar configuration.
 */
export function isValidCalendarEmail(email: string): boolean {
  if (!email || email.trim() === '') {
    return true
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email.trim())
}

/**
 * Extract calendar emails that are configured for reading (readFrom: true).
 */
export function getReadFromCalendars(config: CalendarConfig | undefined): string[] {
  if (!config || !config.enabled || !Array.isArray(config.calendars)) {
    return []
  }
  return config.calendars
    .filter((entry) => entry.readFrom && entry.email && entry.email.trim() !== '')
    .map((entry) => entry.email.trim())
}
