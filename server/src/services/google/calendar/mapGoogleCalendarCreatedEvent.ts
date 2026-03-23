/**
 * WHY: Map Google Calendar API insert response → app CreatedEventResponse (thin createEvent).
 */

import type { calendar_v3 } from 'googleapis'
import type { RFC3339DateTime } from '@shared/types/availabilityTypes.js'
import type { CreatedEventResponse } from './calendarTypes.js'

export function mapGoogleCalendarCreatedEvent(
  createdEvent: calendar_v3.Schema$Event,
  summary: string,
  startDate: Date,
  endDate: Date
): CreatedEventResponse {
  const htmlLinkRaw = createdEvent.htmlLink
  const htmlLink =
    htmlLinkRaw !== undefined && htmlLinkRaw !== null && htmlLinkRaw !== '' ? htmlLinkRaw : ''

  const result: CreatedEventResponse = {
    id: createdEvent.id!,
    htmlLink,
    summary: createdEvent.summary || summary,
    start: (createdEvent.start?.dateTime ||
      createdEvent.start?.date ||
      startDate.toISOString()) as RFC3339DateTime,
    end: (createdEvent.end?.dateTime || createdEvent.end?.date || endDate.toISOString()) as RFC3339DateTime,
  }

  if (createdEvent.location) {
    result.location = createdEvent.location
  }

  if (createdEvent.attendees) {
    result.attendees = createdEvent.attendees
      .filter((a) => a.email)
      .map((a) => ({
        email: a.email!,
        responseStatus: a.responseStatus || 'needsAction',
      }))
  }

  return result
}
