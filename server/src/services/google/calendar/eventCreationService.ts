
import type { RFC3339DateTime } from '@shared/types/availabilityTypes.js'
import { google } from 'googleapis'
import { oauth2Client } from '../../../config/googleOAuth.js'
import { withRateLimit } from '../shared/googleApiRateLimiter.js'
import { invalidateEventsCache } from '../../calendarEventsCache.js'
import { withRetry, classifyError, logCalendarError, CalendarApiError } from '../../calendarErrorHandler.js'
import { createLogger } from '../../../utils/logger.js'
import type { CreateEventParams, CreatedEventResponse } from './calendarTypes.js'
import { DEFAULT_SEND_UPDATES } from './calendarConstants.js'

const logger = createLogger('EventCreationService')

export async function createEvent(params: CreateEventParams): Promise<CreatedEventResponse> {
  const {
    calendarId,
    summary,
    description,
    location,
    start,
    end,
    attendees,
    sendUpdates = DEFAULT_SEND_UPDATES,
    visibility,
    transparency,
    guestsCanModify,
    guestsCanInviteOthers,
    guestsCanSeeOtherGuests,
    addConferenceLink,
    colorId,
    status,
    reminderOverrides
  } = params
  
  const startDate = typeof start === 'string' ? new Date(start) : start
  const endDate = typeof end === 'string' ? new Date(end) : end
  
  if (startDate >= endDate) {
    throw new CalendarApiError('invalid', 'Event start time must be before end time')
  }
  
  const createEventOperation = async (): Promise<CreatedEventResponse> => {
    return await withRateLimit('google-calendar', async () => {
      const calendar = google.calendar({ version: 'v3', auth: oauth2Client })
      
      const eventResource: Record<string, unknown> = {
        summary,
        // @audit-allow:hardcoding:fieldMapping - Google Calendar API event payload
        start: { dateTime: startDate.toISOString() },
        // @audit-allow:hardcoding:fieldMapping - Google Calendar API event payload
        end: { dateTime: endDate.toISOString() }
      }
      
      if (description) {
        eventResource.description = description
      }
      
      if (location) {
        eventResource.location = location
      }
      
      if (attendees && attendees.length > 0) {
        eventResource.attendees = attendees.map(attendee => ({
          email: attendee.email,
          displayName: attendee.displayName,
          optional: attendee.optional
        }))
      }

      if (visibility && visibility !== 'default') {
        eventResource.visibility = visibility
      }

      if (transparency) {
        eventResource.transparency = transparency
      }

      if (guestsCanModify !== undefined) {
        eventResource.guestsCanModify = guestsCanModify
      }

      if (guestsCanInviteOthers !== undefined) {
        eventResource.guestsCanInviteOthers = guestsCanInviteOthers
      }

      if (guestsCanSeeOtherGuests !== undefined) {
        eventResource.guestsCanSeeOtherGuests = guestsCanSeeOtherGuests
      }

      if (colorId) {
        eventResource.colorId = colorId
      }

      if (status && status !== 'confirmed') {
        eventResource.status = status
      }

      if (reminderOverrides && reminderOverrides.length > 0) {
        eventResource.reminders = {
          useDefault: false,
          overrides: reminderOverrides.map(r => ({
            method: r.method,
            minutes: r.minutes
          }))
        }
      }

      if (addConferenceLink) {
        eventResource.conferenceData = {
          createRequest: {
            requestId: `${calendarId}-${Date.now()}`,
            conferenceSolutionKey: { type: 'hangoutsMeet' }
          }
        }
      }
      
      logger.debug('Creating event', {
        calendarId,
        summary,
        start: startDate.toISOString(),
        end: endDate.toISOString()
      })
      
      const insertParams: Record<string, unknown> = {
        calendarId,
        requestBody: eventResource,
        sendUpdates
      }

      if (addConferenceLink) {
        insertParams.conferenceDataVersion = 1
      }

      const response = await calendar.events.insert(insertParams)
      
      if (!response.data || !response.data.id) {
        throw new CalendarApiError('invalid', 'Invalid response from Google Calendar API - no event ID returned')
      }
      
      const createdEvent = response.data
      
      logger.debug('Invalidating caches after event creation', { calendarId })
      invalidateEventsCache(calendarId)
      // @audit-allow:hardcoding:fieldMapping - Logger context object
      logger.debug('Successfully created event', { eventId: createdEvent.id })
      
      const result: CreatedEventResponse = {
        id: createdEvent.id!,
        htmlLink: (() => {
          const raw = createdEvent.htmlLink
          return raw !== undefined && raw !== null && raw !== '' ? raw : ''
        })(),
        summary: createdEvent.summary || summary,
        start: (createdEvent.start?.dateTime || createdEvent.start?.date || startDate.toISOString()) as RFC3339DateTime,
        end: (createdEvent.end?.dateTime || createdEvent.end?.date || endDate.toISOString()) as RFC3339DateTime
      }
      
      if (createdEvent.location) {
        result.location = createdEvent.location
      }
      
      if (createdEvent.attendees) {
        result.attendees = createdEvent.attendees
          .filter(a => a.email)
          .map(a => ({
            email: a.email!,
            responseStatus: a.responseStatus || 'needsAction'
          }))
      }
      
      return result
    })
  }
  
  try {
    return await withRetry(createEventOperation, { maxRetries: 2 })
  } catch (error: unknown) {
    logger.error(error)
    const calendarError = error instanceof CalendarApiError 
      ? error 
      : classifyError(error)
    
    logCalendarError('EventCreationService.createEvent', calendarError, {
      calendarId,
      summary,
      start: startDate.toISOString(),
      end: endDate.toISOString(),
    })
    
    throw calendarError
  }
}
