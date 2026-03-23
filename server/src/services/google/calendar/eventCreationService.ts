
import { google } from 'googleapis'
import { oauth2Client } from '../../../config/googleOAuth.js'
import { withRateLimit } from '../shared/googleApiRateLimiter.js'
import { invalidateEventsCache } from '../../calendarEventsCache.js'
import { withRetry, classifyError, logCalendarError, CalendarApiError } from '../../calendarErrorHandler.js'
import { createLogger } from '../../../utils/logger.js'
import type { CreateEventParams, CreatedEventResponse } from './calendarTypes.js'
import { DEFAULT_SEND_UPDATES } from './calendarConstants.js'
import { buildCalendarEventResource } from './buildCalendarEventResource.js'
import { buildCalendarEventsInsertParams } from './calendarInsertParams.js'
import { mapGoogleCalendarCreatedEvent } from './mapGoogleCalendarCreatedEvent.js'

const logger = createLogger('EventCreationService')

export async function createEvent(params: CreateEventParams): Promise<CreatedEventResponse> {
  const { calendarId, summary, start, end, sendUpdates = DEFAULT_SEND_UPDATES, addConferenceLink } = params

  const startDate = typeof start === 'string' ? new Date(start) : start
  const endDate = typeof end === 'string' ? new Date(end) : end

  if (startDate >= endDate) {
    throw new CalendarApiError('invalid', 'Event start time must be before end time')
  }

  const createEventOperation = async (): Promise<CreatedEventResponse> => {
    return await withRateLimit('google-calendar', async () => {
      const calendar = google.calendar({ version: 'v3', auth: oauth2Client })
      const eventResource = buildCalendarEventResource(params, startDate, endDate)
      const insertParams = buildCalendarEventsInsertParams({
        calendarId,
        eventResource,
        sendUpdates,
        addConferenceLink,
      })

      logger.debug('Creating event', {
        calendarId,
        summary,
        start: startDate.toISOString(),
        end: endDate.toISOString(),
      })

      const response = await calendar.events.insert(insertParams)

      if (!response.data || !response.data.id) {
        throw new CalendarApiError('invalid', 'Invalid response from Google Calendar API - no event ID returned')
      }

      logger.debug('Invalidating caches after event creation', { calendarId })
      invalidateEventsCache(calendarId)
      logger.debug('Successfully created event', { eventId: response.data.id })

      return mapGoogleCalendarCreatedEvent(response.data, summary, startDate, endDate)
    })
  }

  try {
    return await withRetry(createEventOperation, { maxRetries: 2 })
  } catch (error: unknown) {
    logger.error(error)
    const calendarError = error instanceof CalendarApiError ? error : classifyError(error)

    logCalendarError('EventCreationService.createEvent', calendarError, {
      calendarId,
      summary,
      start: startDate.toISOString(),
      end: endDate.toISOString(),
    })

    throw calendarError
  }
}
