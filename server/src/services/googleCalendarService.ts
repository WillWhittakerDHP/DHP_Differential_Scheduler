import { google } from 'googleapis';
import { oauth2Client, setCredentials } from '../config/googleOAuth.js';
import { checkRateLimit, recordRequest, waitForRateLimit, RateLimitStatus } from './rateLimiter.js';
import { getCachedFreeBusy, cacheFreeBusy, invalidateCache as invalidateFreeBusyCache } from './freeBusyCache.js';
import { getCachedEvents, cacheEvents, invalidateEventsCache, type CachedCalendarEvent } from './calendarEventsCache.js';

/**
 * Google Calendar Service
 * 
 * LEARNING: Service for interacting with Google Calendar API
 * WHY: Centralized calendar API operations with rate limiting and caching
 * PATTERN: Service layer pattern with infrastructure integration
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
 * Get free-busy information for specified calendars
 * LEARNING: Integrates rate limiter and cache before making API call
 * WHY: Prevents quota exhaustion and reduces API calls
 * @param calendarEmails Array of calendar email addresses to check
 * @param timeMin Start time for free-busy query
 * @param timeMax End time for free-busy query
 * @param accessToken Optional access token (if not provided, uses oauth2Client credentials)
 * @returns Free-busy data for specified calendars
 */
export async function getFreeBusy(
  calendarEmails: string[],
  timeMin: Date | string,
  timeMax: Date | string
): Promise<FreeBusyResponse> {
  // Normalize time inputs
  const timeMinDate = typeof timeMin === 'string' ? new Date(timeMin) : timeMin;
  const timeMaxDate = typeof timeMax === 'string' ? new Date(timeMax) : timeMax;
  
  // Check cache first
  const cachedData = getCachedFreeBusy(calendarEmails, timeMinDate, timeMaxDate);
  if (cachedData) {
    console.log(`[GoogleCalendarService] Cache hit for ${calendarEmails.length} calendars`);
    return cachedData;
  }
  
  // Check rate limit
  const rateLimitResult = checkRateLimit('google-calendar');
  
  if (rateLimitResult.status === 'exceeded') {
    console.warn(`[GoogleCalendarService] Rate limit exceeded, waiting...`);
    await waitForRateLimit('google-calendar');
  }
  
  // Record request for rate limiting
  recordRequest('google-calendar');
  
  try {
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
      throw new Error('Invalid response from Google Calendar API');
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
    
  } catch (error: any) {
    console.error('[GoogleCalendarService] Error fetching free-busy:', error);
    
    // Handle rate limit errors
    if (error.code === 429 || error.code === 403) {
      console.error('[GoogleCalendarService] Rate limit error from API');
      throw new Error('Rate limit exceeded. Please try again later.');
    }
    
    // Handle authentication errors
    if (error.code === 401) {
      console.error('[GoogleCalendarService] Authentication error');
      throw new Error('Authentication failed. Please re-authenticate.');
    }
    
    // Re-throw other errors
    throw error;
  }
}

/**
 * Get full calendar events with locations
 * LEARNING: Fetches full event details (not just free-busy) to extract locations
 * WHY: Required for drive time calculations between appointments
 * @param calendarEmail Calendar email address
 * @param timeMin Start time for event query
 * @param timeMax End time for event query
 * @returns Array of cached calendar events with locations
 */
export async function getCalendarEvents(
  calendarEmail: string,
  timeMin: Date | string,
  timeMax: Date | string
): Promise<CachedCalendarEvent[]> {
  // Normalize time inputs
  const timeMinDate = typeof timeMin === 'string' ? new Date(timeMin) : timeMin;
  const timeMaxDate = typeof timeMax === 'string' ? new Date(timeMax) : timeMax;
  
  // Check cache first
  const cachedData = getCachedEvents(calendarEmail, timeMinDate, timeMaxDate);
  if (cachedData) {
    console.log(`[GoogleCalendarService] Events cache hit for ${calendarEmail}`);
    return cachedData;
  }
  
  // Check rate limit
  const rateLimitResult = checkRateLimit('google-calendar');
  
  if (rateLimitResult.status === 'exceeded') {
    console.warn(`[GoogleCalendarService] Rate limit exceeded, waiting...`);
    await waitForRateLimit('google-calendar');
  }
  
  // Record request for rate limiting
  recordRequest('google-calendar');
  
  try {
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
      throw new Error('Invalid response from Google Calendar API');
    }
    
    // Transform response to our cached format
    const cachedEvents: CachedCalendarEvent[] = response.data.items
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
          location: event.location || null,
          summary: event.summary || null
        };
      })
      .filter((event): event is CachedCalendarEvent => event !== null);
    
    // Cache the response
    cacheEvents(calendarEmail, timeMinDate, timeMaxDate, cachedEvents);
    
    console.log(`[GoogleCalendarService] Successfully fetched ${cachedEvents.length} events`);
    
    return cachedEvents;
    
  } catch (error: any) {
    console.error('[GoogleCalendarService] Error fetching events:', error);
    
    // Handle rate limit errors
    if (error.code === 429 || error.code === 403) {
      console.error('[GoogleCalendarService] Rate limit error from API');
      throw new Error('Rate limit exceeded. Please try again later.');
    }
    
    // Handle authentication errors
    if (error.code === 401) {
      console.error('[GoogleCalendarService] Authentication error');
      throw new Error('Authentication failed. Please re-authenticate.');
    }
    
    // Re-throw other errors
    throw error;
  }
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
 * LEARNING: Creates event on Google Calendar with attendee support
 * WHY: Core booking functionality - creates appointment on calendar
 * PATTERN: Integrates rate limiting and invalidates cache after creation
 * 
 * @param params Event creation parameters
 * @returns Created event details
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
    throw new Error('Event start time must be before end time');
  }
  
  // Check rate limit
  const rateLimitResult = checkRateLimit('google-calendar');
  
  if (rateLimitResult.status === 'exceeded') {
    console.warn('[GoogleCalendarService] Rate limit exceeded, waiting...');
    await waitForRateLimit('google-calendar');
  }
  
  // Record request for rate limiting
  recordRequest('google-calendar');
  
  try {
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
      throw new Error('Invalid response from Google Calendar API - no event ID returned');
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
    // LEARNING: Google Calendar API returns id as string | null | undefined
    // WHY: Type assertion safe here because we already validated id exists above
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
    
  } catch (error: any) {
    console.error('[GoogleCalendarService] Error creating event:', error);
    
    // Handle rate limit errors
    if (error.code === 429 || error.code === 403) {
      console.error('[GoogleCalendarService] Rate limit error from API');
      throw new Error('Rate limit exceeded. Please try again later.');
    }
    
    // Handle authentication errors
    if (error.code === 401) {
      console.error('[GoogleCalendarService] Authentication error');
      throw new Error('Authentication failed. Please re-authenticate.');
    }
    
    // Handle permission errors
    if (error.code === 403 && error.message?.includes('forbidden')) {
      console.error('[GoogleCalendarService] Permission denied - check OAuth scopes');
      throw new Error('Permission denied. Calendar events scope may not be authorized.');
    }
    
    // Handle calendar not found
    if (error.code === 404) {
      console.error('[GoogleCalendarService] Calendar not found');
      throw new Error(`Calendar not found: ${params.calendarId}`);
    }
    
    // Re-throw other errors
    throw error;
  }
}
