/**
 * useBusyTimes Composable
 * 
 * LEARNING: Fetches and manages busy times from calendar for availability checking
 * WHY: Extracts busy times calculation logic from AvailabilityStep component
 * PATTERN: Composable with async data fetching, loading, and error states
 * 
 * Session 2.1.2: Updated to support async API calls and multiple data sources
 */

import { ref, watch, type ComputedRef, type Ref } from 'vue'
import { getCalendarAvailability } from '@/utils/timeSlotCalculations'
import type { RFC3339DateTime } from '@/types/datetime'
import type { BusyTimeRange } from '@/utils/booking/timeSlotFitter'
import type { FreeBusyDataSource } from '@/composables/booking/useFreeBusyDataSource'
import { CalendarApiError, getErrorMessage } from '@/services/calendarApiService'
import { createLogger } from '@/utils/logger'

const logger = createLogger('useBusyTimes')

export interface UseBusyTimesParams {
  /** Date range to fetch busy times for */
  dateRangeForApi: ComputedRef<{ start: RFC3339DateTime; end: RFC3339DateTime } | null>
  
  /** Data source mode: 'real', 'mock', 'both', or 'none' */
  dataSource: Ref<FreeBusyDataSource>
  
  /** Calendar emails to check */
  calendarEmails: Ref<string[]>
  
  /** Skip server cache on next fetch */
  skipCache?: Ref<boolean>
  
  /** Refresh trigger key (incrementing triggers re-fetch) */
  refreshKey: Ref<number>
}

export interface UseBusyTimesReturn {
  /** Busy times from calendar for availability checking */
  busyTimes: Ref<BusyTimeRange[]>
  
  /** Error from last fetch attempt (null if successful) */
  error: Ref<Error | null>
  
  /** User-friendly error message */
  errorMessage: Ref<string | null>
  
  /** Whether a fetch is in progress */
  isLoading: Ref<boolean>
  
  /** OAuth auth URL if not authenticated */
  authUrl: Ref<string | null>
  
  /** Manual refresh function */
  refresh: () => Promise<void>
}

/**
 * useBusyTimes composable
 * 
 * LEARNING: Manages async busy time fetching with loading/error states
 * WHY: API calls need proper error handling and loading indicators
 * PATTERN: Composable with async watch and explicit error handling
 * 
 * Session 2.1.2: Updated to be async with data source support
 */
export function useBusyTimes(
  params: UseBusyTimesParams
): UseBusyTimesReturn {
  const { dateRangeForApi, dataSource, calendarEmails, skipCache, refreshKey } = params

  // State refs
  const busyTimes = ref<BusyTimeRange[]>([])
  const error = ref<Error | null>(null)
  const errorMessage = ref<string | null>(null)
  const isLoading = ref(false)
  const authUrl = ref<string | null>(null)
  
  /**
   * Fetch busy times from the appropriate source
   * LEARNING: Async function that handles all data source modes
   * WHY: Centralizes fetch logic with proper error handling
   */
  const fetchBusyTimes = async (): Promise<void> => {
    const dateRange = dateRangeForApi.value
    
    if (!dateRange) {
      busyTimes.value = []
      error.value = null
      errorMessage.value = null
      return
    }
    
    isLoading.value = true
    error.value = null
    errorMessage.value = null
    authUrl.value = null
    
    try {
      logger.debug('[useBusyTimes] Fetching busy times:', {
        dataSource: dataSource.value,
        calendarCount: calendarEmails.value.length,
        skipCache: skipCache?.value
      })
      
      const result = await getCalendarAvailability(
        { start: dateRange.start, end: dateRange.end },
        {
          dataSource: dataSource.value,
          calendarEmails: calendarEmails.value,
          skipCache: skipCache?.value
        }
      )
      
      busyTimes.value = result
      
      logger.debug('[useBusyTimes] Fetched', result.length, 'busy periods')
      
    } catch (err) {
      // Handle CalendarApiError with specific error types
      if (err instanceof CalendarApiError) {
        error.value = err
        errorMessage.value = getErrorMessage(err.type)
        
        // Store auth URL if not authenticated
        if (err.type === 'not_authenticated' && err.authUrl) {
          authUrl.value = err.authUrl
        }
        
        logger.error('[useBusyTimes] Calendar API error:', err.type, err.message)
      } else {
        // Generic error
        error.value = err instanceof Error ? err : new Error(String(err))
        errorMessage.value = 'An unexpected error occurred while fetching calendar data.'
        logger.error('[useBusyTimes] Unexpected error:', err)
      }
      
      // Don't silently fall back - keep busyTimes empty on error
      // PATTERN: Explicit error handling, never silent
      busyTimes.value = []
      
    } finally {
      isLoading.value = false
      
      // Clear skipCache after use
      if (skipCache) {
        skipCache.value = false
      }
    }
  }
  
  /**
   * Manual refresh function
   * LEARNING: Allows external triggering of refresh
   * WHY: Dev panel and retry buttons need to trigger refresh
   */
  const refresh = async (): Promise<void> => {
    await fetchBusyTimes()
  }
  
  // Watch for changes and fetch
  // LEARNING: Watch multiple dependencies for automatic re-fetch
  // WHY: Any change to date range, data source, or calendar emails should trigger fetch
  watch(
    [dateRangeForApi, dataSource, calendarEmails, refreshKey],
    () => {
      fetchBusyTimes()
    },
    { immediate: true }
  )

  return {
    busyTimes,
    error,
    errorMessage,
    isLoading,
    authUrl,
    refresh
  }
}

