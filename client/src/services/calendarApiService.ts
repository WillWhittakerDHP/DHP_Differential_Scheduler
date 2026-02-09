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
import type { BusyTimeRange } from '@/utils/booking/slotPipeline'
import type { RFC3339DateTime } from '@/types/datetime'
import { createLogger } from '@/utils/logger'
import { useApiCallStatus } from '@/composables/booking/useApiCallStatus'
import { groupConstraintsByCategory } from '@shared/utils/constraintUtils'
import type {
  ComputedAvailabilityData,
  ComputedAvailabilityRequest,
} from '@shared/types/availabilityTypes'

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

// Phase 9: Removed getErrorMessage - no longer used

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

// Phase 9: Removed fetchFreeBusy and transformFreeBusyResponse
// WHY: Calendar events data is now fetched server-side via fetchComputedAvailabilityData

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

// Phase 9: Removed fetchCalendarEvents
// WHY: Calendar events are now fetched server-side via fetchComputedAvailabilityData

/**
 * Fetch computed availability data from server
 * 
 * LEARNING: Single endpoint that returns all pre-computed availability data
 * WHY: Eliminates multiple client-side API calls and constraint extraction
 * PATTERN: Single POST request returns everything needed for slot generation
 * 
 * Phase 5: Server-Side Computed Availability Data Refactor
 * 
 * @param request - ComputedAvailabilityRequest with date range, placeId, duration, and dataSource
 * @returns ComputedAvailabilityData with all pre-computed availability information
 * @throws CalendarApiError on failure
 */
export async function fetchComputedAvailabilityData(
  request: ComputedAvailabilityRequest
): Promise<ComputedAvailabilityData> {
  logger.debug('[fetchComputedAvailabilityData] Request:', request)
  
  try {
    const response = await axios.post<ComputedAvailabilityData>(
      `${API_BASE_URL}/api/v1/internal/availability/computed-data`,
      request
    )
    
    // Group constraints by category for logging (matches new unified structure)
    const { range, overlap, capacity } = groupConstraintsByCategory(response.data.constraints)
    
    // Derive scheduled hours count from enriched capacity constraints
    const scheduledHoursCount = capacity.reduce((sum, c) => {
      return sum + (c.scheduledHours ? Object.keys(c.scheduledHours).length : 0)
    }, 0)
    logger.debug('[fetchComputedAvailabilityData] Response received:', {
      constraints: response.data.constraints.length,
      rangeConstraints: range.length,
      overlapConstraints: overlap.length,
      capacityConstraints: capacity.length,
      busyPeriods: response.data.busyPeriods.length,
      calendarEvents: response.data.calendarEvents.length,
      outOfOfficeEvents: response.data.outOfOfficeEvents.length,
      scheduledHours: scheduledHoursCount + ' keys (enriched on constraints)',
    })
    
    // Record successful API call
    recordApiCall('computedData', 'hit')
    
    return response.data
    
  } catch (error) {
    const apiError = handleApiError(error)
    logger.error('[fetchComputedAvailabilityData] Error:', apiError.type, apiError.message)
    
    // Record failed API call
    recordApiCall('computedData', 'error')
    
    throw apiError
  }
}
