/**

PATTERN: Service layer between composa...
 */
import axios, { AxiosError } from 'axios'
import { UNKNOWN_ERROR_MESSAGE } from '@/constants/errorMessages'
import { createLogger } from '@/utils/logger'
import { useApiCallStatus } from '@/composables/booking/useApiCallStatus'
import apiClient from '@/utils/api'
import type {
  ComputedSlotAvailabilityData,
  ComputedAvailabilityRequest,
} from '@shared/types/availabilityTypes'
import { CalendarApiError } from '@/services/calendarApiError'

const logger = createLogger('calendarApiService')
const { recordApiCall } = useApiCallStatus()

function handleApiError(error: unknown): CalendarApiError {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<{ error?: string; authUrl?: string }>
    
    if (axiosError.response?.status === 401) {
      return new CalendarApiError(
        'not_authenticated',
        'OAuth authentication required',
        axiosError.response.data?.authUrl
      )
    }
    
    if (axiosError.response?.status === 429) {
      return new CalendarApiError(
        'rate_limit',
        'API rate limit exceeded'
      )
    }
    
    if (axiosError.response?.status === 404) {
      return new CalendarApiError(
        'calendar_not_found',
        'Calendar not found or inaccessible'
      )
    }
    
    if (!axiosError.response) {
      return new CalendarApiError(
        'network_error',
        'Network error: Could not connect to server'
      )
    }
    
    const rawMessage = axiosError.response?.data?.error
    const message = rawMessage !== undefined && rawMessage !== null && rawMessage !== '' ? rawMessage : 'Invalid response from server'
    return new CalendarApiError('invalid_response', message)
  }
  
  return new CalendarApiError(
    'unknown',
    error instanceof Error ? error.message : UNKNOWN_ERROR_MESSAGE
  )
}

export type { CalendarEvent } from '@shared/types/availabilityTypes'


/**
 * Fetch computed slot availability from server
 *
 * Single endpoint returns pre-computed slots per day (slotsByDay) and metadata.
 * Slot generation and constraint checks run server-side; client only applies shape and renders.
 *
 * dataSource controls which external APIs the server calls:
 * - 'real': Full pipeline (Calendar Events API, Routes API, capacity)
 * - 'mock': Settings/constraints only — no Google API calls
 * - 'none': Empty response with settings metadata only
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
    const response = await apiClient.post<ComputedSlotAvailabilityData>(
      '/availability/computed-data',
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
