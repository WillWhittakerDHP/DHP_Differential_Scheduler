/**
 * Google Calendar Event Creation Service
 * 
 * LEARNING: Service for creating Google Calendar events
 * WHY: Centralized event creation with rate limiting, retry, and cache invalidation
 * PATTERN: Service layer with infrastructure integration
 */

import { google } from 'googleapis'
import { oauth2Client } from '../../../config/googleOAuth.js'
import { withRateLimit } from '../shared/googleApiRateLimiter.js'
import { invalidateEventsCache } from '../../calendarEventsCache.js'
import { withRetry, classifyError, logCalendarError, CalendarApiError } from '../../calendarErrorHandler.js'
import { createLogger } from '../../../utils/logger.js'
import type { CreateEventParams, CreatedEventResponse } from './calendarTypes.js'
import { DEFAULT_SEND_UPDATES } from './calendarConstants.js'

const logger = createLogger('EventCreationService')

/**
 * Create a calendar event with optional invitations
 * 
 * LEARNING: Creates event on Google Calendar with attendee support
 * WHY: Core booking functionality - creates appointment on calendar
 * PATTERN: Integrates rate limiting, retry for transient errors, and invalidates cache after creation
 * 
 * @param params - Event creation parameters
 * @returns Created event details
 * @throws CalendarApiError if creation fails after retries
 */
export async function createEvent(params: CreateEventParams): Promise<CreatedEventResponse> {
  const {
    calendarId,
    summary,
    description,
    location,
    start,
    end,
    attendees,
    sendUpdates = DEFAULT_SEND_UPDATES
  } = params
  
  // Normalize time inputs
  const startDate = typeof start === 'string' ? new Date(start) : start
  const endDate = typeof end === 'string' ? new Date(end) : end
  
  // Validate times
  if (startDate >= endDate) {
    throw new CalendarApiError('invalid', 'Event start time must be before end time')
  }
  
  // Define the API operation
  const createEventOperation = async (): Promise<CreatedEventResponse> => {
    return await withRateLimit('google-calendar', async () => {
      // Create calendar client
      const calendar = google.calendar({ version: 'v3', auth: oauth2Client })
      
      // Prepare event resource
      const eventResource: {
        summary: string
        description?: string
        location?: string
        start: { dateTime: string; timeZone?: string }
        end: { dateTime: string; timeZone?: string }
        attendees?: Array<{ email: string; displayName?: string; optional?: boolean }>
      } = {
        summary,
        start: {
          dateTime: startDate.toISOString()
        },
        end: {
          dateTime: endDate.toISOString()
        }
      }
      
      // Add optional fields
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
      
      logger.debug('Creating event', {
        calendarId,
        summary,
        start: startDate.toISOString(),
        end: endDate.toISOString()
      })
      
      // Make API call to create event
      const response = await calendar.events.insert({
        calendarId,
        requestBody: eventResource,
        sendUpdates  // 'all' sends email invitations to all attendees
      })
      
      if (!response.data || !response.data.id) {
        throw new CalendarApiError('invalid', 'Invalid response from Google Calendar API - no event ID returned')
      }
      
      const createdEvent = response.data
      
      // CRITICAL: Invalidate caches after event creation
      // This ensures subsequent availability checks get fresh data
      logger.debug('Invalidating caches after event creation', { calendarId })
      
      // Invalidate events cache for this calendar
      invalidateEventsCache(calendarId)
      
      logger.debug('Successfully created event', { eventId: createdEvent.id })
      
      // Build response
      const result: CreatedEventResponse = {
        id: createdEvent.id!,  // Validated exists above
        htmlLink: createdEvent.htmlLink || '',
        summary: createdEvent.summary || summary,
        start: createdEvent.start?.dateTime || createdEvent.start?.date || startDate.toISOString(),
        end: createdEvent.end?.dateTime || createdEvent.end?.date || endDate.toISOString()
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
  
  // Execute with retry (no fallback for write operations)
  // LEARNING: Write operations should fail explicitly, not silently
  // WHY: User needs to know if their event wasn't created
  try {
    return await withRetry(createEventOperation, { maxRetries: 2 })
  } catch (error: any) {
    // Ensure we throw a CalendarApiError
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
