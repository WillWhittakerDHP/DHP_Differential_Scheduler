import { google } from 'googleapis';
import { oauth2Client, setCredentials } from '../config/googleOAuth.js';
import { checkRateLimit, recordRequest, waitForRateLimit, RateLimitStatus } from './rateLimiter.js';
import { getCachedFreeBusy, cacheFreeBusy } from './freeBusyCache.js';

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
