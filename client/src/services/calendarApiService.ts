/**
 * Client-side Calendar API Service
 * 
 * LEARNING: Service layer for Google Calendar API calls via server
 * WHY: Centralized API calls, authentication checks, response transformation
 * PATTERN: Service layer between composables and server endpoints
 * 
 * Session 2.1.2: Created for Calendar Availability Integration
 */

import axios, { AxiosError } from 'axios'
import type { BusyTimeRange } from '@/utils/booking/timeSlotFitter'
import type { RFC3339DateTime } from '@/types/datetime'
import { createLogger } from '@/utils/logger'
import { useApiCallStatus } from '@/composables/booking/useApiCallStatus'

const logger = createLogger('calendarApiService')
const { recordApiCall } = useApiCallStatus()

// Use environment variable or default to localhost for development
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'

/**
 * OAuth authentication status from server
 * LEARNING: Matches server response from /api/v1/external/oauth/status
 */
export interface OAuthStatus {
  authenticated: boolean
  hasRefreshToken?: boolean
  expiryDate?: number
  authUrl?: string
}

/**
 * Options for calendar API calls
 * LEARNING: Allows bypassing server cache for force refresh
 */
export interface CalendarApiOptions {
  skipCache?: boolean
}

/**
 * Server free-busy response format
 * LEARNING: Matches response from POST /api/v1/external/calendar/freebusy
 */
interface ServerFreeBusyResponse {
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
 * Error types for calendar API operations
 * LEARNING: Explicit error types for proper error handling
 * WHY: Different errors need different user messages
 */
export type CalendarApiErrorType = 
  | 'not_authenticated'
  | 'rate_limit'
  | 'network_error'
  | 'invalid_response'
  | 'calendar_not_found'
  | 'unknown'

/**
 * Calendar API error with type information
 */
export class CalendarApiError extends Error {
  constructor(
    public type: CalendarApiErrorType,
    message: string,
    public authUrl?: string
  ) {
    super(message)
    this.name = 'CalendarApiError'
  }
}

/**
 * Get user-friendly error message based on error type
 * LEARNING: Maps error types to user-facing messages
 * WHY: Technical errors should be translated for users
 */
export function getErrorMessage(type: CalendarApiErrorType): string {
  const messages: Record<CalendarApiErrorType, string> = {
    not_authenticated: 'Please connect your Google Calendar to check availability.',
    rate_limit: 'Too many requests. Please try again in a moment.',
    network_error: 'Could not reach calendar service. Check your connection.',
    invalid_response: 'Calendar data unavailable.',
    calendar_not_found: 'One or more calendars could not be accessed.',
    unknown: 'An unexpected error occurred.'
  }
  return messages[type]
}

/**
 * Check OAuth authentication status
 * 
 * LEARNING: First check before making any calendar API calls
 * WHY: Don't attempt API calls if not authenticated
 * PATTERN: Pre-flight check to avoid unnecessary errors
 * 
 * @returns OAuth status including authentication state and auth URL
 */
export async function checkOAuthStatus(): Promise<OAuthStatus> {
  try {
    const response = await axios.get<OAuthStatus>(
      `${API_BASE_URL}/api/v1/external/oauth/status`
    )
    
    logger.debug('[checkOAuthStatus] Status:', response.data)
    
    return {
      ...response.data,
      authUrl: response.data.authUrl || '/api/v1/external/oauth'
    }
  } catch (error) {
    logger.error('[checkOAuthStatus] Error:', error)
    
    // Return unauthenticated status on error
    return {
      authenticated: false,
      authUrl: '/api/v1/external/oauth'
    }
  }
}

/**
 * Fetch free-busy data from server
 * 
 * LEARNING: Main function for getting calendar busy times
 * WHY: Transforms server response to BusyTimeRange[] format
 * PATTERN: Error handling with specific error types
 * 
 * @param calendarEmails - Array of calendar email addresses to check
 * @param timeMin - Start of time range (RFC3339)
 * @param timeMax - End of time range (RFC3339)
 * @param options - Optional settings like skipCache
 * @returns Array of busy time ranges
 * @throws CalendarApiError on failure
 */
export async function fetchFreeBusy(
  calendarEmails: string[],
  timeMin: RFC3339DateTime,
  timeMax: RFC3339DateTime,
  options?: CalendarApiOptions
): Promise<BusyTimeRange[]> {
  // Don't call API if no calendars configured
  if (!calendarEmails || calendarEmails.length === 0) {
    logger.debug('[fetchFreeBusy] No calendar emails provided, returning empty')
    return []
  }
  
  logger.debug('[fetchFreeBusy] Fetching for calendars:', calendarEmails)
  
  try {
    // Build URL with optional skipCache query param
    const url = options?.skipCache
      ? `${API_BASE_URL}/api/v1/external/calendar/freebusy?skipCache=true`
      : `${API_BASE_URL}/api/v1/external/calendar/freebusy`
    
    const response = await axios.post<ServerFreeBusyResponse>(url, {
      calendarEmails,
      timeMin,
      timeMax
    })
    
    // Transform server response to BusyTimeRange[]
    // LEARNING: Flatten all calendars' busy periods into single array
    // WHY: Availability calculation needs all busy times merged
    const busyTimes = transformFreeBusyResponse(response.data)
    
    logger.debug('[fetchFreeBusy] Fetched', busyTimes.length, 'busy periods')
    
    // Record successful API call
    recordApiCall('freeBusy', 'hit')
    
    return busyTimes
    
  } catch (error) {
    // Handle specific error types
    const apiError = handleApiError(error)
    logger.error('[fetchFreeBusy] Error:', apiError.type, apiError.message)
    
    // Record failed API call
    recordApiCall('freeBusy', 'error')
    
    throw apiError
  }
}

/**
 * Transform server free-busy response to BusyTimeRange array
 * 
 * LEARNING: Server returns nested object by calendar, we need flat array
 * WHY: Availability checking needs all busy periods in one list
 * PATTERN: Flatten nested structure with explicit type casting
 */
function transformFreeBusyResponse(response: ServerFreeBusyResponse): BusyTimeRange[] {
  if (!response.calendars) {
    return []
  }
  
  // PATTERN: Flatten all calendars' busy periods into single array using flatMap
  return Object.values(response.calendars)
    .flatMap(calendar => 
      (calendar.busy && Array.isArray(calendar.busy))
        ? calendar.busy.map(period => ({
            start: period.start as RFC3339DateTime,
            end: period.end as RFC3339DateTime
          }))
        : []
    )
}

/**
 * Handle API errors and convert to CalendarApiError
 * 
 * LEARNING: Map various error types to specific CalendarApiError
 * WHY: Different errors need different handling and user messages
 * PATTERN: Error type detection and translation
 */
function handleApiError(error: unknown): CalendarApiError {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<{ error?: string; authUrl?: string }>
    
    // Check for authentication error
    if (axiosError.response?.status === 401) {
      return new CalendarApiError(
        'not_authenticated',
        'OAuth authentication required',
        axiosError.response.data?.authUrl
      )
    }
    
    // Check for rate limit
    if (axiosError.response?.status === 429) {
      return new CalendarApiError(
        'rate_limit',
        'API rate limit exceeded'
      )
    }
    
    // Check for not found (calendar doesn't exist or no access)
    if (axiosError.response?.status === 404) {
      return new CalendarApiError(
        'calendar_not_found',
        'Calendar not found or inaccessible'
      )
    }
    
    // Check for network error (no response)
    if (!axiosError.response) {
      return new CalendarApiError(
        'network_error',
        'Network error: Could not connect to server'
      )
    }
    
    // Default to invalid response for other errors
    return new CalendarApiError(
      'invalid_response',
      axiosError.response?.data?.error || 'Invalid response from server'
    )
  }
  
  // Unknown error type
  return new CalendarApiError(
    'unknown',
    error instanceof Error ? error.message : 'Unknown error'
  )
}

/**
 * Get the full OAuth authorization URL
 * 
 * LEARNING: Constructs full URL for OAuth redirect
 * WHY: Client needs to redirect user to Google consent screen
 */
export function getOAuthUrl(): string {
  return `${API_BASE_URL}/api/v1/external/oauth`
}

/**
 * Calendar event with location data
 * LEARNING: Structure matches server CachedCalendarEvent
 * WHY: Used for drive time calculations between appointments
 * PATTERN: Uses placeId as primary location identifier (address only at UI boundary)
 */
export interface CalendarEvent {
  id: string
  start: string
  end: string
  placeId?: string        // Google Place ID for drive time calculation (primary location identifier)
  summary: string | null   // Event title for context/debugging
}

/**
 * Fetch calendar events with locations
 * 
 * LEARNING: Gets full calendar events (not just free-busy) to extract locations
 * WHY: Required for drive time calculations between appointments
 * PATTERN: Server-side cache (5-15 min TTL) reduces API calls
 * 
 * Session 2.2.3: Added for drive time integration
 * 
 * @param calendarEmail Calendar email address
 * @param timeMin Start time for event query (RFC3339)
 * @param timeMax End time for event query (RFC3339)
 * @param options Optional settings like skipCache
 * @returns Array of calendar events with locations
 * @throws CalendarApiError on failure
 */
export async function fetchCalendarEvents(
  calendarEmail: string,
  timeMin: RFC3339DateTime,
  timeMax: RFC3339DateTime,
  options?: CalendarApiOptions
): Promise<CalendarEvent[]> {
  if (!calendarEmail) {
    logger.debug('[fetchCalendarEvents] No calendar email provided, returning empty')
    return []
  }
  
  logger.debug('[fetchCalendarEvents] Fetching events for:', calendarEmail)
  
  try {
    // Build URL with query params
    const params = new URLSearchParams({
      calendarEmail,
      timeMin,
      timeMax
    })
    
    if (options?.skipCache) {
      params.append('skipCache', 'true')
    }
    
    const response = await axios.get<CalendarEvent[]>(
      `${API_BASE_URL}/api/v1/external/calendar/events?${params.toString()}`
    )
    
    logger.debug('[fetchCalendarEvents] Fetched', response.data.length, 'events')
    
    // Record successful API call
    recordApiCall('events', 'hit')
    
    return response.data
    
  } catch (error) {
    const apiError = handleApiError(error)
    logger.error('[fetchCalendarEvents] Error:', apiError.type, apiError.message)
    
    // Record failed API call
    recordApiCall('events', 'error')
    
    throw apiError
  }
}
