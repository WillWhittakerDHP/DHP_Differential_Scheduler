
import type { CachedCalendarEvent } from '../../calendarEventsCache.js'

export interface CalendarEventsResponseWithMeta {
  events: CachedCalendarEvent[]
  _meta?: {
    source: 'fresh' | 'cache' | 'empty'
    error?: string
  }
}

export interface EventAttendee {
  email: string
  displayName?: string
  optional?: boolean  // Whether attendance is optional
}

export interface ReminderOverride {
  method: 'email' | 'popup'
  minutes: number
}

export interface CreateEventParams {
  calendarId: string         // Calendar to create event on (usually primary calendar email)
  summary: string            // Event title
  description?: string       // Event description/notes
  location?: string          // Physical location (address)
  start: Date | string       // Start time (Date or ISO string)
  end: Date | string         // End time (Date or ISO string)
  attendees?: EventAttendee[] // People to invite
  sendUpdates?: 'all' | 'externalOnly' | 'none'
  visibility?: 'default' | 'public' | 'private' | 'confidential'
  transparency?: 'opaque' | 'transparent'
  guestsCanModify?: boolean
  guestsCanInviteOthers?: boolean
  guestsCanSeeOtherGuests?: boolean
  addConferenceLink?: boolean
  colorId?: string | null
  status?: 'confirmed' | 'tentative'
  reminderOverrides?: ReminderOverride[] | null
}

export interface CreatedEventResponse {
  id: string                 // Google Calendar event ID
  htmlLink: string           // Link to view event in Google Calendar
  summary: string            // Event title
  start: string              // Start time (ISO string)
  end: string                // End time (ISO string)
  location?: string          // Location if provided
  attendees?: Array<{
    email: string
    responseStatus: string   // 'needsAction' | 'accepted' | 'declined' | 'tentative'
  }>
}
