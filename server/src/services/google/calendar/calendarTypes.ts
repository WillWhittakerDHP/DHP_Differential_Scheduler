/**
 * Google Calendar API Types
 * 
 * LEARNING: Centralized type definitions for Google Calendar API operations
 * WHY: Single source of truth for Calendar API types, improves type safety
 * PATTERN: Type definitions module
 */

import type { CachedCalendarEvent } from '../../calendarEventsCache.js'

/**
 * Free-busy response structure from Google Calendar API
 */
export interface FreeBusyResponse {
  calendars: {
    [email: string]: {
      busy: Array<{
        start: string
        end: string
      }>
    }
  }
}

/**
 * Free-busy response with fallback metadata
 * LEARNING: Extended response type that includes source information
 * WHY: Caller needs to know if data might be stale (from cache fallback)
 */
export interface FreeBusyResponseWithMeta extends FreeBusyResponse {
  _meta?: {
    source: 'fresh' | 'cache' | 'empty'
    error?: string
  }
}

/**
 * Calendar events response with fallback metadata
 * LEARNING: Extended response type that includes source information
 * WHY: Caller needs to know if data might be stale (from cache fallback)
 */
export interface CalendarEventsResponseWithMeta {
  events: CachedCalendarEvent[]
  _meta?: {
    source: 'fresh' | 'cache' | 'empty'
    error?: string
  }
}

/**
 * Event attendee structure for invitations
 * LEARNING: Represents a person invited to the event
 * WHY: Allows sending calendar invitations to customers/staff
 */
export interface EventAttendee {
  email: string
  displayName?: string
  optional?: boolean  // Whether attendance is optional
}

/**
 * Input parameters for creating a calendar event
 * LEARNING: All required and optional fields for event creation
 * WHY: Type safety for event creation API
 */
export interface CreateEventParams {
  calendarId: string         // Calendar to create event on (usually primary calendar email)
  summary: string            // Event title
  description?: string       // Event description/notes
  location?: string          // Physical location (address)
  start: Date | string       // Start time (Date or ISO string)
  end: Date | string         // End time (Date or ISO string)
  attendees?: EventAttendee[] // People to invite
  sendUpdates?: 'all' | 'externalOnly' | 'none'  // Whether to send email invitations
}

/**
 * Response from event creation
 * LEARNING: Subset of Google Calendar event response we care about
 * WHY: Returns essential info about created event
 */
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
