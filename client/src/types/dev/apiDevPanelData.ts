import type { Ref } from 'vue'

export interface OAuthStatusShape {
  authenticated?: boolean
  hasRefreshToken?: boolean
  expiryDate?: string
  authUrl?: string
}

export interface RateLimitShape {
  requestsPerMinute?: number
  currentRequests?: number
  remainingRequests?: number
  utilizationPercent?: number
}

export interface DevPanelCacheEntry {
  key: string
  expired?: boolean
  data?: unknown
  age?: number
  ttl?: number
}

export interface DevPanelCacheStats {
  totalEntries?: number
  memoryUsage?: number
  oldestEntryAge?: number | null
}

export interface DevPanelCacheShape {
  stats?: DevPanelCacheStats
  entries?: DevPanelCacheEntry[]
}

export interface UseApiDevPanelDataLoading {
  oauth: boolean
  events: boolean
  ratelimit: boolean
  drivetime: boolean
}

export interface UseApiDevPanelDataErrors {
  oauth: string | null
  events: string | null
  ratelimit: string | null
  drivetime: string | null
}

export interface UseApiDevPanelDataReturn {
  oauthStatus: Ref<OAuthStatusShape | null>
  eventsCache: Ref<DevPanelCacheShape | null>
  rateLimitStats: Ref<{ calendar: RateLimitShape | null; maps: RateLimitShape | null }>
  driveTimeCache: Ref<DevPanelCacheShape | null>
  loading: Ref<UseApiDevPanelDataLoading>
  errors: Ref<UseApiDevPanelDataErrors>
  fetchOAuthStatus: () => Promise<void>
  fetchEventsCache: () => Promise<void>
  fetchRateLimitStats: () => Promise<void>
  fetchDriveTimeCache: () => Promise<void>
  fetchDevStatus: () => Promise<void>
  fetchAll: () => Promise<void>
}
