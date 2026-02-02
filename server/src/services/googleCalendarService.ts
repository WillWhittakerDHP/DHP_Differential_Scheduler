import { google } from 'googleapis';
import { oauth2Client, setCredentials } from '../config/googleOAuth.js';
import { checkRateLimit, recordRequest, waitForRateLimit, RateLimitStatus } from './rateLimiter.js';
import { getCachedFreeBusy, cacheFreeBusy, invalidateCache as invalidateFreeBusyCache } from './freeBusyCache.js';
import { getCachedEvents, cacheEvents, invalidateEventsCache, type CachedCalendarEvent } from './calendarEventsCache.js';
import { geocodeAddressToPlaceId } from './googleMapsService.js';
import { 
  CalendarApiError, 
  classifyError, 
  withRetry, 
  withFallback, 
  logCalendarError,
  type FallbackResult 
} from './calendarErrorHandler.js';

/**
 * Google Calendar Service
 * 
 * LEARNING: Service for interacting with Google Calendar API
 * WHY: Centralized calendar API operations with rate limiting and caching
 * PATTERN: Service layer pattern with infrastructure integration
 * 
 * SESSION: 2.1.5 - Enhanced error handling with retry and fallback
 */

/**
 * Free-busy response structure from Google Calendar API
 */
export interface FreeBusyResponse {
  calendars: {
    [email: string]: {
      busy: Array<{
        start: string;
        end: string;
      }>;
    };
  };
}

/**
 * Free-busy response with fallback metadata
 * LEARNING: Extended response type that includes source information
 * WHY: Caller needs to know if data might be stale (from cache fallback)
 */
export interface FreeBusyResponseWithMeta extends FreeBusyResponse {
  _meta?: {
    source: 'fresh' | 'cache' | 'empty';
    error?: string;
  };
}

/**
 * Get free-busy information for specified calendars
 * 
 * LEARNING: Integrates rate limiter, cache, retry, and fallback
 * WHY: Provides resilient API calls with graceful degradation
 * PATTERN: Retry for transient errors, fallback to cache on failure
 * 
 * SESSION: 2.1.5 - Enhanced with retry and fallback
 * 
 * @param calendarEmails Array of calendar email addresses to check
 * @param timeMin Start time for free-busy query
 * @param timeMax End time for free-busy query
 * @returns Free-busy data for specified calendars (may be from cache if API fails)
 */
export async function getFreeBusy(
  calendarEmails: string[],
  timeMin: Date | string,
  timeMax: Date | string
): Promise<FreeBusyResponseWithMeta> {
  // Normalize time inputs
  const timeMinDate = typeof timeMin === 'string' ? new Date(timeMin) : timeMin;
  const timeMaxDate = typeof timeMax === 'string' ? new Date(timeMax) : timeMax;
  
  // Check cache first (before any API call)
  const cachedData = getCachedFreeBusy(calendarEmails, timeMinDate, timeMaxDate);
  if (cachedData) {
    console.log(`[GoogleCalendarService] Cache hit for ${calendarEmails.length} calendars`);
    return { ...cachedData, _meta: { source: 'cache' } };
  }
  
  // Define the API operation
  const fetchFromApi = async (): Promise<FreeBusyResponse> => {
    // Check rate limit
    const rateLimitResult = checkRateLimit('google-calendar');
    
    if (rateLimitResult.status === 'exceeded') {
      console.warn(`[GoogleCalendarService] Rate limit exceeded, waiting...`);
      await waitForRateLimit('google-calendar');
    }
    
    // Record request for rate limiting
    recordRequest('google-calendar');
    
    // Create calendar client
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
    
    // Prepare request body
    const requestBody = {
      timeMin: timeMinDate.toISOString(),
      timeMax: timeMaxDate.toISOString(),
      items: calendarEmails.map(email => ({ id: email }))
    };
    
    console.log(`[GoogleCalendarService] Fetching free-busy for ${calendarEmails.length} calendars`);
    
    // Make API call
    const response = await calendar.freebusy.query({
      requestBody
    });
    
    if (!response.data.calendars) {
      throw new CalendarApiError('invalid', 'Invalid response from Google Calendar API');
    }
    
    // Transform response to our format
    const freeBusyData: FreeBusyResponse = {
      calendars: {}
    };
    
    for (const [email, calendarData] of Object.entries(response.data.calendars)) {
      // Filter out null/undefined busy periods and ensure start/end are strings
      const busyPeriods = (calendarData.busy || [])
        .filter(period => period.start && period.end)
        .map(period => ({
          start: period.start!,
          end: period.end!
        }));
      
      freeBusyData.calendars[email] = {
        busy: busyPeriods
      };
    }
    
    // Cache the response
    cacheFreeBusy(calendarEmails, timeMinDate, timeMaxDate, freeBusyData);
    
    console.log(`[GoogleCalendarService] Successfully fetched free-busy data`);
    
    return freeBusyData;
  };
  
  // Execute with retry and fallback
  // LEARNING: withFallback wraps the retry operation
  // WHY: If all retries fail, we still try to return cached data
  const result = await withFallback<FreeBusyResponse>(
    () => withRetry(fetchFromApi, { maxRetries: 2 }),
    () => getCachedFreeBusy(calendarEmails, timeMinDate, timeMaxDate),
    { calendars: {} }  // Empty default if no cache
  );
  
  // Log error if one occurred (but we returned fallback data)
  if (result.error) {
    logCalendarError('GoogleCalendarService.getFreeBusy', result.error, {
      calendarEmails,
      timeMin: timeMinDate.toISOString(),
      timeMax: timeMaxDate.toISOString(),
      source: result.source,
    });
  }
  
  return {
    ...result.data,
    _meta: {
      source: result.source,
      error: result.error?.getUserMessage(),
    },
  };
}

/**
 * Calendar events response with fallback metadata
 * LEARNING: Extended response type that includes source information
 * WHY: Caller needs to know if data might be stale (from cache fallback)
 */
export interface CalendarEventsResponseWithMeta {
  events: CachedCalendarEvent[];
  _meta?: {
    source: 'fresh' | 'cache' | 'empty';
    error?: string;
  };
}

/**
 * Get full calendar events with locations
 * 
 * LEARNING: Fetches full event details (not just free-busy) to extract locations
 * WHY: Required for drive time calculations between appointments
 * PATTERN: Retry for transient errors, fallback to cache on failure
 * 
 * SESSION: 2.1.5 - Enhanced with retry and fallback
 * 
 * @param calendarEmail Calendar email address
 * @param timeMin Start time for event query
 * @param timeMax End time for event query
 * @returns Array of calendar events with locations (may be from cache if API fails)
 */
export async function getCalendarEvents(
  calendarEmail: string,
  timeMin: Date | string,
  timeMax: Date | string
): Promise<CalendarEventsResponseWithMeta> {
  // Normalize time inputs
  const timeMinDate = typeof timeMin === 'string' ? new Date(timeMin) : timeMin;
  const timeMaxDate = typeof timeMax === 'string' ? new Date(timeMax) : timeMax;
  
  // Check cache first (before any API call)
  const cachedData = getCachedEvents(calendarEmail, timeMinDate, timeMaxDate);
  if (cachedData) {
    console.log(`[GoogleCalendarService] Events cache hit for ${calendarEmail}`);
    return { events: cachedData, _meta: { source: 'cache' } };
  }
  
  // Define the API operation
  const fetchFromApi = async (): Promise<CachedCalendarEvent[]> => {
    // Check rate limit
    const rateLimitResult = checkRateLimit('google-calendar');
    
    if (rateLimitResult.status === 'exceeded') {
      console.warn(`[GoogleCalendarService] Rate limit exceeded, waiting...`);
      await waitForRateLimit('google-calendar');
    }
    
    // Record request for rate limiting
    recordRequest('google-calendar');
    
    // Create calendar client
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
    
    console.log(`[GoogleCalendarService] Fetching events for ${calendarEmail}`);
    
    // Make API call to get full events
    const response = await calendar.events.list({
      calendarId: calendarEmail,
      timeMin: timeMinDate.toISOString(),
      timeMax: timeMaxDate.toISOString(),
      singleEvents: true,
      orderBy: 'startTime',
      maxResults: 2500 // Google Calendar API limit
    });
    
    if (!response.data.items) {
      throw new CalendarApiError('invalid', 'Invalid response from Google Calendar API');
    }
    
    // Transform response to our cached format
    const eventsWithLocations = response.data.items
      .filter(event => event.start && event.end) // Filter out events without start/end
      .map(event => {
        // Extract start time (handle both dateTime and date formats)
        const startTime = event.start?.dateTime || event.start?.date;
        const endTime = event.end?.dateTime || event.end?.date;
        
        if (!startTime || !endTime) {
          return null;
        }
        
        return {
          id: event.id || '',
          start: startTime,
          end: endTime,
          location: event.location || null, // Temporary - will be geocoded to placeId
          summary: event.summary || null
        };
      })
      .filter((event): event is { id: string; start: string; end: string; location: string | null; summary: string | null } => event !== null);
    
    // Geocode addresses to placeIds
    // LEARNING: Convert address strings to placeIds for accurate drive time calculations
    // WHY: placeId is primary location identifier throughout codebase
    // PATTERN: Process geocoding in parallel for all events with locations
    // Session 2.2.3: Added geocoding for placeId standardization
    const events: CachedCalendarEvent[] = await Promise.all(
      eventsWithLocations.map(async (event) => {
        if (event.location) {
          try {
            const placeId = await geocodeAddressToPlaceId(event.location);
            return {
              id: event.id,
              start: event.start,
              end: event.end,
              placeId: placeId || undefined, // Store placeId if found, undefined if not
              summary: event.summary
            };
          } catch (error) {
            // Log warning but continue - geocoding failure shouldn't break event fetching
            console.warn(`[GoogleCalendarService] Failed to geocode location "${event.location}" for event ${event.id}:`, error instanceof Error ? error.message : 'Unknown error');
            return {
              id: event.id,
              start: event.start,
              end: event.end,
              placeId: undefined, // No placeId if geocoding failed
              summary: event.summary
            };
          }
        }
        // Event has no location
        return {
          id: event.id,
          start: event.start,
          end: event.end,
          placeId: undefined,
          summary: event.summary
        };
      })
    );
    
    // Cache the response
    cacheEvents(calendarEmail, timeMinDate, timeMaxDate, events);
    
    console.log(`[GoogleCalendarService] Successfully fetched ${events.length} events (with placeIds)`);
    
    return events;
  };
  
  // Execute with retry and fallback
  const result = await withFallback<CachedCalendarEvent[]>(
    () => withRetry(fetchFromApi, { maxRetries: 2 }),
    () => getCachedEvents(calendarEmail, timeMinDate, timeMaxDate),
    []  // Empty array as default if no cache
  );
  
  // Log error if one occurred (but we returned fallback data)
  if (result.error) {
    logCalendarError('GoogleCalendarService.getCalendarEvents', result.error, {
      calendarEmail,
      timeMin: timeMinDate.toISOString(),
      timeMax: timeMaxDate.toISOString(),
      source: result.source,
    });
  }
  
  return {
    events: result.data,
    _meta: {
      source: result.source,
      error: result.error?.getUserMessage(),
    },
  };
}

/**
 * Set OAuth credentials for calendar service
 * LEARNING: Updates OAuth client with user's tokens
 * WHY: Required before making API calls
 * @param tokens Token object with access_token, refresh_token, etc.
 */
export function setCalendarCredentials(tokens: {
  access_token?: string | null;
  refresh_token?: string | null;
  expiry_date?: number | null;
}) {
  setCredentials(tokens);
}

/**
 * Event attendee structure for invitations
 * LEARNING: Represents a person invited to the event
 * WHY: Allows sending calendar invitations to customers/staff
 */
export interface EventAttendee {
  email: string;
  displayName?: string;
  optional?: boolean;  // Whether attendance is optional
}

/**
 * Input parameters for creating a calendar event
 * LEARNING: All required and optional fields for event creation
 * WHY: Type safety for event creation API
 */
export interface CreateEventParams {
  calendarId: string;         // Calendar to create event on (usually primary calendar email)
  summary: string;            // Event title
  description?: string;       // Event description/notes
  location?: string;          // Physical location (address)
  start: Date | string;       // Start time (Date or ISO string)
  end: Date | string;         // End time (Date or ISO string)
  attendees?: EventAttendee[]; // People to invite
  sendUpdates?: 'all' | 'externalOnly' | 'none';  // Whether to send email invitations
}

/**
 * Response from event creation
 * LEARNING: Subset of Google Calendar event response we care about
 * WHY: Returns essential info about created event
 */
export interface CreatedEventResponse {
  id: string;                 // Google Calendar event ID
  htmlLink: string;           // Link to view event in Google Calendar
  summary: string;            // Event title
  start: string;              // Start time (ISO string)
  end: string;                // End time (ISO string)
  location?: string;          // Location if provided
  attendees?: Array<{
    email: string;
    responseStatus: string;   // 'needsAction' | 'accepted' | 'declined' | 'tentative'
  }>;
}

/**
 * Create a calendar event with optional invitations
 * 
 * LEARNING: Creates event on Google Calendar with attendee support
 * WHY: Core booking functionality - creates appointment on calendar
 * PATTERN: Integrates rate limiting, retry for transient errors, and invalidates cache after creation
 * 
 * SESSION: 2.1.5 - Enhanced with retry (no fallback - write operations must succeed)
 * 
 * @param params Event creation parameters
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
    sendUpdates = 'all'  // Default to sending invitation emails
  } = params;
  
  // Normalize time inputs
  const startDate = typeof start === 'string' ? new Date(start) : start;
  const endDate = typeof end === 'string' ? new Date(end) : end;
  
  // Validate times
  if (startDate >= endDate) {
    throw new CalendarApiError('invalid', 'Event start time must be before end time');
  }
  
  // Define the API operation
  const createEventOperation = async (): Promise<CreatedEventResponse> => {
    // Check rate limit
    const rateLimitResult = checkRateLimit('google-calendar');
    
    if (rateLimitResult.status === 'exceeded') {
      console.warn('[GoogleCalendarService] Rate limit exceeded, waiting...');
      await waitForRateLimit('google-calendar');
    }
    
    // Record request for rate limiting
    recordRequest('google-calendar');
    
    // Create calendar client
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
    
    // Prepare event resource
    const eventResource: {
      summary: string;
      description?: string;
      location?: string;
      start: { dateTime: string; timeZone?: string };
      end: { dateTime: string; timeZone?: string };
      attendees?: Array<{ email: string; displayName?: string; optional?: boolean }>;
    } = {
      summary,
      start: {
        dateTime: startDate.toISOString()
      },
      end: {
        dateTime: endDate.toISOString()
      }
    };
    
    // Add optional fields
    if (description) {
      eventResource.description = description;
    }
    
    if (location) {
      eventResource.location = location;
    }
    
    if (attendees && attendees.length > 0) {
      eventResource.attendees = attendees.map(attendee => ({
        email: attendee.email,
        displayName: attendee.displayName,
        optional: attendee.optional
      }));
    }
    
    console.log(`[GoogleCalendarService] Creating event on calendar: ${calendarId}`);
    console.log(`[GoogleCalendarService] Event: "${summary}" from ${startDate.toISOString()} to ${endDate.toISOString()}`);
    
    // Make API call to create event
    const response = await calendar.events.insert({
      calendarId,
      requestBody: eventResource,
      sendUpdates  // 'all' sends email invitations to all attendees
    });
    
    if (!response.data || !response.data.id) {
      throw new CalendarApiError('invalid', 'Invalid response from Google Calendar API - no event ID returned');
    }
    
    const createdEvent = response.data;
    
    // CRITICAL: Invalidate caches after event creation
    // This ensures subsequent availability checks get fresh data
    console.log(`[GoogleCalendarService] Invalidating caches for calendar: ${calendarId}`);
    
    // Invalidate free-busy cache for this calendar
    invalidateFreeBusyCache([calendarId]);
    
    // Invalidate events cache for this calendar
    invalidateEventsCache(calendarId);
    
    console.log(`[GoogleCalendarService] Successfully created event: ${createdEvent.id}`);
    
    // Build response
    const result: CreatedEventResponse = {
      id: createdEvent.id!,  // Validated exists above
      htmlLink: createdEvent.htmlLink || '',
      summary: createdEvent.summary || summary,
      start: createdEvent.start?.dateTime || createdEvent.start?.date || startDate.toISOString(),
      end: createdEvent.end?.dateTime || createdEvent.end?.date || endDate.toISOString()
    };
    
    if (createdEvent.location) {
      result.location = createdEvent.location;
    }
    
    if (createdEvent.attendees) {
      result.attendees = createdEvent.attendees
        .filter(a => a.email)
        .map(a => ({
          email: a.email!,
          responseStatus: a.responseStatus || 'needsAction'
        }));
    }
    
    return result;
  };
  
  // Execute with retry (no fallback for write operations)
  // LEARNING: Write operations should fail explicitly, not silently
  // WHY: User needs to know if their event wasn't created
  try {
    return await withRetry(createEventOperation, { maxRetries: 2 });
  } catch (error: any) {
    // Ensure we throw a CalendarApiError
    const calendarError = error instanceof CalendarApiError 
      ? error 
      : classifyError(error);
    
    logCalendarError('GoogleCalendarService.createEvent', calendarError, {
      calendarId,
      summary,
      start: startDate.toISOString(),
      end: endDate.toISOString(),
    });
    
    throw calendarError;
  }
}
