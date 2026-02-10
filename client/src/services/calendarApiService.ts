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
import { createLogger } from '@/utils/logger'
import { useApiCallStatus } from '@/composables/booking/useApiCallStatus'
import type {
  ComputedSlotAvailabilityData,
  ComputedAvailabilityRequest,
} from '@shared/types/availabilityTypes'

const logger = createLogger('calendarApiService')
const { recordApiCall } = useApiCallStatus()

// Use environment variable or default to localhost for development
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'

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

// Phase 9: Removed getErrorMessage, checkOAuthStatus, getOAuthUrl - no current callers; OAuth status via dev panel / internal status

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
 * Fetch computed slot availability from server
 *
 * LEARNING: Single endpoint returns pre-computed slots per day (slotsByDay) and metadata
 * WHY: Slot generation and constraint checks run server-side; client only applies shape and renders
 * PATTERN: POST returns ComputedSlotAvailabilityData (slotsByDay, constraints, events, _meta)
 *
 * @param request - ComputedAvailabilityRequest with date range, placeId, duration, and dataSource
 * @returns ComputedSlotAvailabilityData with slotsByDay and metadata
 * @throws CalendarApiError on failure
 */
export async function fetchComputedAvailabilityData(
  request: ComputedAvailabilityRequest
): Promise<ComputedSlotAvailabilityData> {
  logger.debug('[fetchComputedAvailabilityData] Request:', request)

  try {
    const response = await axios.post<ComputedSlotAvailabilityData>(
      `${API_BASE_URL}/api/v1/internal/availability/computed-data`,
      request
    )

    recordApiCall('computedData', 'hit')

    return response.data
  } catch (error) {
    const apiError = handleApiError(error)
    logger.error('[fetchComputedAvailabilityData] Error:', apiError.type, apiError.message)

    recordApiCall('computedData', 'error')

    throw apiError
  }
}
