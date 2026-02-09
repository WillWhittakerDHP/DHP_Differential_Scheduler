/**
 * API Dev Panel Data Composable
 * 
 * LEARNING: Manages API fetching and state for dev panel
 * WHY: Reduces component complexity, centralizes API logic
 * PATTERN: Composable with reactive state and fetch functions
 */

import { ref, type Ref } from 'vue'
import axios from 'axios'
import { createLogger } from '@/utils/logger'
import {
  ERROR_FETCH_OAUTH_STATUS,
  ERROR_FETCH_EVENTS_CACHE,
  ERROR_FETCH_RATE_LIMIT_BOTH,
  ERROR_FETCH_RATE_LIMIT,
  ERROR_FETCH_DRIVE_TIME_CACHE,
  ERROR_FETCH_DEV_STATUS,
} from '@/constants/errorMessages'

const logger = createLogger('ApiDevPanel')

/**
 * Handle rate limit response from Promise.allSettled
 * LEARNING: Extracted helper to reduce fetchRateLimitStats complexity
 * WHY: Reduces nesting depth from 9 to <= 3
 * 
 * @param response - Promise.allSettled response
 * @param apiType - Type of API ('calendar' | 'maps')
 * @param rateLimitStats - Reactive ref to update
 */
function handleRateLimitResponse(
  response: PromiseSettledResult<any>,
  apiType: 'calendar' | 'maps',
  rateLimitStats: Ref<{ calendar: any | null; maps: any | null }>
): void {
  if (response.status === 'fulfilled') {
    rateLimitStats.value[apiType] = response.value.data
  } else {
    logger.error(`Error fetching ${apiType} rate limit:`, response.reason)
  }
}

/**
 * Check if both rate limit APIs failed
 * LEARNING: Extracted helper to reduce fetchRateLimitStats complexity
 * WHY: Simplifies error handling logic
 * 
 * @param calendarResponse - Calendar API response
 * @param mapsResponse - Maps API response
 * @returns True if both failed
 */
function checkBothRateLimitsFailed(
  calendarResponse: PromiseSettledResult<any>,
  mapsResponse: PromiseSettledResult<any>
): boolean {
  return calendarResponse.status === 'rejected' && mapsResponse.status === 'rejected'
}

/**
 * Composable for managing API dev panel data
 * LEARNING: Extracted all API fetching logic from component
 * WHY: Reduces main component from ~1349 to ~800 lines
 * 
 * @param apiBaseUrl - Base URL for API requests
 * @returns Reactive state and fetch functions
 */
export function useApiDevPanelData(apiBaseUrl: string) {
  // API data state
  const oauthStatus = ref<any>(null)
  const eventsCache = ref<any>(null)
  const rateLimitStats = ref<{
    calendar: any | null
    maps: any | null
  }>({
    calendar: null,
    maps: null
  })
  const driveTimeCache = ref<any>(null)
  
  const loading = ref({
    oauth: false,
    events: false,
    ratelimit: false,
    drivetime: false
  })
  
  const errors = ref({
    oauth: null as string | null,
    events: null as string | null,
    ratelimit: null as string | null,
    drivetime: null as string | null
  })

  /**
   * Fetch OAuth status
   */
  async function fetchOAuthStatus(): Promise<void> {
    loading.value.oauth = true
    errors.value.oauth = null
    try {
      const response = await axios.get(`${apiBaseUrl}/api/v1/external/oauth/status`)
      oauthStatus.value = response.data
    } catch (error: any) {
      errors.value.oauth = error.response?.data?.message || error.message || ERROR_FETCH_OAUTH_STATUS
      logger.error('Error fetching OAuth status:', error)
    } finally {
      loading.value.oauth = false
    }
  }

  /**
   * Fetch events cache
   */
  async function fetchEventsCache(): Promise<void> {
    loading.value.events = true
    errors.value.events = null
    try {
      const response = await axios.get(`${apiBaseUrl}/api/v1/external/calendar/debug/events-cache`)
      eventsCache.value = response.data
    } catch (error: any) {
      errors.value.events = error.response?.data?.message || error.message || ERROR_FETCH_EVENTS_CACHE
      logger.error('Error fetching events cache:', error)
    } finally {
      loading.value.events = false
    }
  }

  /**
   * Fetch rate limit stats for both APIs
   * LEARNING: Reduced complexity through helper extraction
   * WHY: Nesting reduced from 9 to <= 3
   */
  async function fetchRateLimitStats(): Promise<void> {
    loading.value.ratelimit = true
    errors.value.ratelimit = null
    try {
      const [calendarResponse, mapsResponse] = await Promise.allSettled([
        axios.get(`${apiBaseUrl}/api/v1/external/calendar/debug/rate-limit`),
        axios.get(`${apiBaseUrl}/api/v1/external/maps/debug/rate-limit`)
      ])
      
      handleRateLimitResponse(calendarResponse, 'calendar', rateLimitStats)
      handleRateLimitResponse(mapsResponse, 'maps', rateLimitStats)
      
      if (checkBothRateLimitsFailed(calendarResponse, mapsResponse)) {
        errors.value.ratelimit = ERROR_FETCH_RATE_LIMIT_BOTH
      }
    } catch (error: any) {
      errors.value.ratelimit = error.response?.data?.message || error.message || ERROR_FETCH_RATE_LIMIT
      logger.error('Error fetching rate limit stats:', error)
    } finally {
      loading.value.ratelimit = false
    }
  }

  /**
   * Fetch drive time cache
   */
  async function fetchDriveTimeCache(): Promise<void> {
    loading.value.drivetime = true
    errors.value.drivetime = null
    try {
      const response = await axios.get(`${apiBaseUrl}/api/v1/external/maps/debug/drive-time-cache`)
      driveTimeCache.value = response.data
    } catch (error: any) {
      errors.value.drivetime = error.response?.data?.message || error.message || ERROR_FETCH_DRIVE_TIME_CACHE
      logger.error('Error fetching drive time cache:', error)
    } finally {
      loading.value.drivetime = false
    }
  }

  /**
   * Fetch aggregated dev status from backend
   * LEARNING: Single endpoint reduces client requests from 5+ to 1
   * WHY: Improves page load performance, reduces external route calls
   */
  async function fetchDevStatus(): Promise<void> {
    loading.value.oauth = true
    loading.value.ratelimit = true
    errors.value.oauth = null
    errors.value.ratelimit = null
    
    try {
      const response = await axios.get(`${apiBaseUrl}/api/v1/internal/dev/status`)
      const data = response.data
      
      // Extract OAuth status
      oauthStatus.value = data.oauth
      
      // Extract rate limit stats
      rateLimitStats.value = {
        calendar: data.rateLimits.calendar,
        maps: data.rateLimits.maps
      }
      
      // Extract cache data (for use when tabs are opened)
      eventsCache.value = data.caches.events
      driveTimeCache.value = data.caches.driveTime
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || ERROR_FETCH_DEV_STATUS
      errors.value.oauth = errorMessage
      errors.value.ratelimit = errorMessage
      logger.error('Error fetching dev status:', error)
    } finally {
      loading.value.oauth = false
      loading.value.ratelimit = false
    }
  }

  /**
   * Fetch all data
   * LEARNING: Uses single aggregated endpoint instead of multiple calls
   */
  async function fetchAll(): Promise<void> {
    await fetchDevStatus()
  }

  return {
    // State
    oauthStatus,
    eventsCache,
    rateLimitStats,
    driveTimeCache,
    loading,
    errors,
    // Functions
    fetchOAuthStatus,
    fetchEventsCache,
    fetchRateLimitStats,
    fetchDriveTimeCache,
    fetchDevStatus,
    fetchAll,
  }
}
