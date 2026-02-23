
import type { TimeRangeBounds } from '@shared/types/availabilityTypes'

/** Busy period from Google Calendar free/busy API (RFC3339 start/end). */
export type GoogleCalendarBusyPeriod = TimeRangeBounds & { readonly __brand: 'GoogleCalendarBusyPeriod' }

interface GoogleCalendarError {
  domain: string  // Error domain (e.g., "global")
  reason: string   // Error reason (e.g., "notFound", "groupTooBig")
}

interface GoogleCalendarFreeBusy {
  busy: GoogleCalendarBusyPeriod[]
  errors?: GoogleCalendarError[]
}

interface GoogleCalendarGroup {
  calendars: string[]
  errors?: GoogleCalendarError[]
}

export interface GoogleFreeBusyResponse {
  kind: 'calendar#freeBusy'
  timeMin: string  // RFC3339 format - start of queried interval
  timeMax: string  // RFC3339 format - end of queried interval
  calendars?: Record<string, GoogleCalendarFreeBusy>
  groups?: Record<string, GoogleCalendarGroup>
}
