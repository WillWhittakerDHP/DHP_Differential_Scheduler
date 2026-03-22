/**
 * PATTERN: API Dev Panel Data Composable

PATTERN: Composable with reactive state a...
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
import type {
  OAuthStatusShape,
  RateLimitShape,
  DevPanelCacheShape,
  UseApiDevPanelDataReturn,
} from '@/types/dev/apiDevPanelData'

const logger = createLogger('ApiDevPanel')

function handleRateLimitResponse(
  response: PromiseSettledResult<unknown>,
  apiType: 'calendar' | 'maps',
  rateLimitStats: Ref<{ calendar: RateLimitShape | null; maps: RateLimitShape | null }>
): void {
  if (response.status === 'fulfilled' && response.value && typeof response.value === 'object' && 'data' in response.value) {
    rateLimitStats.value[apiType] = (response.value as { data: RateLimitShape }).data
  } else if (response.status === 'rejected') {
    logger.error(`Error fetching ${apiType} rate limit:`, response.reason)
  }
}

function checkBothRateLimitsFailed(
  calendarResponse: PromiseSettledResult<unknown>,
  mapsResponse: PromiseSettledResult<unknown>
): boolean {
  return calendarResponse.status === 'rejected' && mapsResponse.status === 'rejected'
}

export function useApiDevPanelData(apiBaseUrl: string): UseApiDevPanelDataReturn {
  const oauthStatus = ref<OAuthStatusShape | null>(null)
  const eventsCache = ref<DevPanelCacheShape | null>(null)
  const rateLimitStats = ref<{
    calendar: RateLimitShape | null
    maps: RateLimitShape | null
  }>({
    calendar: null,
    maps: null
  })
  const driveTimeCache = ref<DevPanelCacheShape | null>(null)
  
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

  async function fetchOAuthStatus(): Promise<void> {
    loading.value.oauth = true
    errors.value.oauth = null
    try {
      const response = await axios.get(`${apiBaseUrl}/api/v1/external/oauth/status`)
      oauthStatus.value = response.data
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } }; message?: string }
      errors.value.oauth = err.response?.data?.message || err.message || ERROR_FETCH_OAUTH_STATUS
      logger.error('Error fetching OAuth status:', error)
    } finally {
      loading.value.oauth = false
    }
  }

  async function fetchEventsCache(): Promise<void> {
    loading.value.events = true
    errors.value.events = null
    try {
      const response = await axios.get(`${apiBaseUrl}/api/v1/external/calendar/debug/events-cache`)
      eventsCache.value = response.data
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } }; message?: string }
      errors.value.events = err.response?.data?.message || err.message || ERROR_FETCH_EVENTS_CACHE
      logger.error('Error fetching events cache:', error)
    } finally {
      loading.value.events = false
    }
  }

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
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } }; message?: string }
      errors.value.ratelimit = err.response?.data?.message || err.message || ERROR_FETCH_RATE_LIMIT
      logger.error('Error fetching rate limit stats:', error)
    } finally {
      loading.value.ratelimit = false
    }
  }

  async function fetchDriveTimeCache(): Promise<void> {
    loading.value.drivetime = true
    errors.value.drivetime = null
    try {
      const response = await axios.get(`${apiBaseUrl}/api/v1/external/maps/debug/drive-time-cache`)
      driveTimeCache.value = response.data
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } }; message?: string }
      errors.value.drivetime = err.response?.data?.message || err.message || ERROR_FETCH_DRIVE_TIME_CACHE
      logger.error('Error fetching drive time cache:', error)
    } finally {
      loading.value.drivetime = false
    }
  }

  async function fetchDevStatus(): Promise<void> {
    loading.value.oauth = true
    loading.value.ratelimit = true
    errors.value.oauth = null
    errors.value.ratelimit = null
    
    try {
      const response = await axios.get(`${apiBaseUrl}/api/v1/internal/dev/status`)
      const data = response.data
      
      oauthStatus.value = data.oauth
      
      rateLimitStats.value = {
        calendar: data.rateLimits.calendar,
        maps: data.rateLimits.maps
      }
      
      eventsCache.value = data.caches.events
      driveTimeCache.value = data.caches.driveTime
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } }; message?: string }
      const errorMessage = err.response?.data?.message || err.message || ERROR_FETCH_DEV_STATUS
      errors.value.oauth = errorMessage
      errors.value.ratelimit = errorMessage
      logger.error('Error fetching dev status:', error)
    } finally {
      loading.value.oauth = false
      loading.value.ratelimit = false
    }
  }

  async function fetchAll(): Promise<void> {
    await fetchDevStatus()
  }

  return {
    oauthStatus,
    eventsCache,
    rateLimitStats,
    driveTimeCache,
    loading,
    errors,
    fetchOAuthStatus,
    fetchEventsCache,
    fetchRateLimitStats,
    fetchDriveTimeCache,
    fetchDevStatus,
    fetchAll,
  }
}
