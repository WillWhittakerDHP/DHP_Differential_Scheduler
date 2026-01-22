/**
 * WHY: Availability Settings Configuration
 *
LEARNING: Client-side settings for time slot generation and business hours
WHY: Centralizes business hours and time slot configuration (admin-configurable via Business Controls tab)
PATTERN: TypeScript interface with default values, fetches from API with fallback to defaults
Session 1.3.7: Created to replace hardcoded values in generateTimeSlots
Session 1.4.1: Updated to fetch from API instead of hardcoded defaults
 */
import type { RFC3339DateTime } from '@/types/datetime'
import { businessHoursTimeToRfc3339 } from '@/utils/datetime'
import apiClient from '@/utils/api'
import { createLogger } from '@/utils/logger'

// LEARNING: Use scoped logger for controllable debug output
// WHY: Prevents debug logs in production, allows scope-based filtering
// PATTERN: createLogger(scope) provides debug/info/warn/error methods
const logger = createLogger('availabilitySettings')

/**
 * Business hours for a single day
 * LEARNING: Stored as RFC3339 internally, converted to/from HH:mm for UI
 * WHY: Consistent format throughout codebase, matches Google Calendar API
 * PATTERN: Use fixed reference date (2000-01-01) to store time-of-day as RFC3339
 */
export interface DayHours {
  start: RFC3339DateTime // RFC3339 format with reference date (e.g., "2000-01-01T09:00:00Z" for "09:00")
  end: RFC3339DateTime   // RFC3339 format with reference date (e.g., "2000-01-01T19:00:00Z" for "19:00")
}

/**
 * Availability settings interface
 * LEARNING: Complete configuration for time slot generation
 * WHY: Type-safe settings structure for availability calculations
 * PATTERN: Interface matching server-side adminSettings structure
 */
export interface AvailabilitySettings {
  /**
   * Business hours per day of week (0 = Sunday, 6 = Saturday)
   * LEARNING: Defines when appointments can be scheduled each day
   * WHY: Allows different hours per day (e.g., shorter hours on weekends)
   */
  businessHours: {
    0: DayHours // Sunday
    1: DayHours // Monday
    2: DayHours // Tuesday
    3: DayHours // Wednesday
    4: DayHours // Thursday
    5: DayHours // Friday
    6: DayHours // Saturday
  }
  
  /**
   * Time slot increment in minutes
   * LEARNING: Interval between available time slots
   * WHY: Controls granularity of appointment times (15 min = slots at :00, :15, :30, :45)
   */
  minuteIncrement: number
  
  /**
   * Minimum lead time in minutes before appointments can be booked
   * LEARNING: Buffer time required before first available slot
   * WHY: Prevents booking appointments too close to current time
   */
  leadTime: number
  
  /**
   * Maximum work hours per day (optional)
   * LEARNING: Limits total scheduled appointments per day
   * WHY: Prevents over-scheduling on a single day
   * PATTERN: Optional field, defaults to calculated max from businessHours if not set
   */
  workHoursLimit?: number
  
  /**
   * IANA timezone string (optional)
   * LEARNING: Timezone used for all availability calculations
   * WHY: Allows admin to configure timezone instead of hardcoded default
   * PATTERN: Optional field, defaults to "America/New_York" if not set
   */
  timezone?: string
}

/**
 * Convert business hours from API format to AvailabilitySettings format
 * LEARNING: Converts HH:mm format to RFC3339 format for all days
 * WHY: Eliminates duplicate conversion logic repeated 7 times
 * PATTERN: Map over all days (0-6), convert each day's hours
 * P2-4: Extracted duplicate business hours conversion logic
 * 
 * @param apiHours - Business hours from API in HH:mm format
 * @param defaultStart - Default start time if not provided (default: '09:00')
 * @param defaultEnd - Default end time if not provided (default: '19:00')
 * @returns Business hours in AvailabilitySettings format (RFC3339)
 */
function convertBusinessHoursFromApi(
  apiHours: Record<string, { start: string; end: string }>,
  defaultStart: string = '09:00',
  defaultEnd: string = '19:00'
): AvailabilitySettings['businessHours'] {
  const days: (0 | 1 | 2 | 3 | 4 | 5 | 6)[] = [0, 1, 2, 3, 4, 5, 6]
  
  return days.reduce((acc, day) => {
    acc[day] = {
      start: businessHoursTimeToRfc3339(apiHours[String(day)]?.start || defaultStart),
      end: businessHoursTimeToRfc3339(apiHours[String(day)]?.end || defaultEnd)
    }
    return acc
  }, {} as AvailabilitySettings['businessHours'])
}

/**
 * Default availability settings
 * LEARNING: Fallback defaults matching server-side defaultAvailabilitySettings
 * WHY: Provides working configuration if API call fails or no settings exist in database
 * PATTERN: Default export with sensible business hours, used as fallback
 */
export const defaultAvailabilitySettings: AvailabilitySettings = {
  businessHours: {
    0: { start: businessHoursTimeToRfc3339("09:00"), end: businessHoursTimeToRfc3339("19:00") }, // Sunday
    1: { start: businessHoursTimeToRfc3339("09:00"), end: businessHoursTimeToRfc3339("19:00") }, // Monday
    2: { start: businessHoursTimeToRfc3339("09:00"), end: businessHoursTimeToRfc3339("19:00") }, // Tuesday
    3: { start: businessHoursTimeToRfc3339("09:00"), end: businessHoursTimeToRfc3339("19:00") }, // Wednesday
    4: { start: businessHoursTimeToRfc3339("09:00"), end: businessHoursTimeToRfc3339("19:00") }, // Thursday
    5: { start: businessHoursTimeToRfc3339("09:00"), end: businessHoursTimeToRfc3339("19:00") }, // Friday
    6: { start: businessHoursTimeToRfc3339("09:00"), end: businessHoursTimeToRfc3339("19:00") }, // Saturday
  },
  minuteIncrement: 15, // 15-minute intervals
  leadTime: 60, // 1 hour lead time
  workHoursLimit: undefined, // Will be calculated from businessHours
  timezone: 'America/New_York' // Default timezone
}

/**
 * Cache entry with metadata
 * LEARNING: Track cache timestamp for TTL-based invalidation
 * WHY: Allows automatic refresh after configured time period
 * PATTERN: Cache entry with timestamp and data
 */
interface CacheEntry {
  settings: AvailabilitySettings
  cachedAt: number  // timestamp (Date.now())
}

/**
 * In-memory cache for availability settings
 * LEARNING: Caches settings with timestamp for TTL-based invalidation
 * WHY: Improves performance and reduces server load, with automatic refresh
 * PATTERN: Cache entry with timestamp, validated against TTL
 */
let cachedSettings: CacheEntry | null = null

/**
 * Cache TTL in milliseconds (default: 5 minutes)
 * LEARNING: Configurable via environment variable
 * WHY: Different TTL for dev (short) vs production (longer)
 * PATTERN: Environment-based configuration
 * P3-2: Extracted magic number to constant
 */
const DEFAULT_CACHE_TTL_MINUTES = 5
const CACHE_TTL_MS = import.meta.env.VITE_AVAILABILITY_CACHE_TTL 
  ? Number(import.meta.env.VITE_AVAILABILITY_CACHE_TTL) 
  : DEFAULT_CACHE_TTL_MINUTES * 60 * 1000  // Default: 5 minutes

/**
 * Check if cached settings are still valid
 * LEARNING: TTL-based cache validation
 * WHY: Automatic refresh after configured time period
 * PATTERN: Compare current time with cached timestamp
 */
function isCacheValid(): boolean {
  if (!cachedSettings) return false
  
  const age = Date.now() - cachedSettings.cachedAt
  const isValid = age < CACHE_TTL_MS
  
  if (!isValid) {
    logger.debug('Cache expired', { 
      age: `${(age / 1000).toFixed(0)}s`, 
      ttl: `${(CACHE_TTL_MS / 1000).toFixed(0)}s` 
    })
  }
  
  return isValid
}

/**
 * Get availability settings from API with fallback to defaults
 * LEARNING: Fetches settings from business-settings API endpoint with TTL-based cache
 * WHY: Allows admin to configure settings without code changes, with automatic refresh
 * PATTERN: API call with error handling, TTL validation, and fallback to defaults
 * 
 * @returns Promise<AvailabilitySettings> - Settings from API or defaults
 */
export async function getAvailabilitySettings(): Promise<AvailabilitySettings> {
  // Check cache validity (TTL-based)
  if (cachedSettings && isCacheValid()) {
    logger.debug('Returning cached settings', { 
      cachedAt: new Date(cachedSettings.cachedAt).toISOString() 
    })
    return cachedSettings.settings
  }
  
  // Cache miss or expired - fetch from API
  logger.info('Fetching settings from API', { 
    reason: cachedSettings ? 'cache_expired' : 'cache_miss' 
  })

  try {
    // Fetch settings from API
    const response = await apiClient.get('/business-settings/availability_settings')
    
    if (response.data && response.data.setting_value) {
      const rawSettings = response.data.setting_value as {
        businessHours?: {
          [key: string]: { start: string; end: string } // API returns HH:mm format
        }
        minuteIncrement?: number
        leadTime?: number
        workHoursLimit?: number
        timezone?: string
      }
      
      // Validate settings structure (basic check)
      if (
        rawSettings.businessHours &&
        rawSettings.minuteIncrement &&
        rawSettings.leadTime !== undefined
      ) {
        // P2-4: Use shared business hours conversion function
        // LEARNING: Convert business hours from HH:mm (API format) to RFC3339 (internal format)
        // WHY: API returns HH:mm, but we store as RFC3339 internally
        // PATTERN: Use convertBusinessHoursFromApi to eliminate duplicate conversion logic
        const convertedSettings: AvailabilitySettings = {
          businessHours: convertBusinessHoursFromApi(rawSettings.businessHours),
          minuteIncrement: rawSettings.minuteIncrement,
          leadTime: rawSettings.leadTime,
          workHoursLimit: rawSettings.workHoursLimit, // Optional field
          timezone: rawSettings.timezone || 'America/New_York' // Default if not set
        }
        
        // Update cache with timestamp
        cachedSettings = {
          settings: convertedSettings,
          cachedAt: Date.now()
        }
        
        logger.info('Settings cached', { ttl: `${(CACHE_TTL_MS / 1000).toFixed(0)}s` })
        return convertedSettings
      }
    }
    
    // If response is invalid, fall back to defaults or stale cache
    if (cachedSettings) {
      logger.warn('Invalid API response, using stale cached settings as fallback')
      return cachedSettings.settings
    }
    
    logger.warn('Invalid API response, using default settings as fallback')
    return defaultAvailabilitySettings
  } catch (error) {
    logger.error('Failed to fetch settings from API', { error })
    
    // Fallback to stale cache or defaults
    if (cachedSettings) {
      logger.warn('Using stale cached settings as fallback')
      return cachedSettings.settings
    }
    
    logger.warn('Using default settings as fallback')
    return defaultAvailabilitySettings
  }
}

/**
 * Manually invalidate cached settings
 * LEARNING: Allows admin UI to force refresh after updates
 * WHY: Immediate visibility of admin changes without waiting for TTL
 * PATTERN: Export public invalidation function
 * 
 * @example
 * // In admin settings panel after save:
 * await saveAvailabilitySettings(newSettings)
 * invalidateAvailabilitySettingsCache()
 * await getAvailabilitySettings()  // Fetches fresh settings
 */
export function invalidateAvailabilitySettingsCache(): void {
  if (cachedSettings) {
    logger.info('Cache invalidated manually')
    cachedSettings = null
  }
}

/**
 * Clear cached availability settings (alias for invalidateAvailabilitySettingsCache)
 * LEARNING: Maintains backward compatibility
 * WHY: Existing code may use clearAvailabilitySettingsCache
 * @deprecated Use invalidateAvailabilitySettingsCache instead
 */
export function clearAvailabilitySettingsCache(): void {
  invalidateAvailabilitySettingsCache()
}

/**
 * Get cache status for debugging
 * LEARNING: Provides visibility into cache state
 * WHY: Useful for debugging cache behavior and TTL configuration
 * PATTERN: Returns cache metadata for inspection
 * 
 * @returns Cache status information
 */
export function getAvailabilitySettingsCacheStatus(): {
  isCached: boolean
  cachedAt: string | null
  age: number | null
  ttl: number
} {
  return {
    isCached: cachedSettings !== null && isCacheValid(),
    cachedAt: cachedSettings ? new Date(cachedSettings.cachedAt).toISOString() : null,
    age: cachedSettings ? Date.now() - cachedSettings.cachedAt : null,
    ttl: CACHE_TTL_MS
  }
}
