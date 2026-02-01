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
import type { GlobalEntityId } from '@/types/entities'
import apiClient from '@/utils/api'
import { createLogger } from '@/utils/logger'

const logger = createLogger('availabilitySettings')

/**
 * Business hours for a single day
 * LEARNING: Stored as RFC3339 internally, converted to/from HH:mm for UI
 * WHY: Consistent format throughout codebase, matches Google Calendar API
 * PATTERN: Use fixed reference date (2000-01-01) to store time-of-day as RFC3339
 * NOTE: Internal type only - not exported as it's only used in AvailabilitySettings interface
 */
interface DayHours {
  start: RFC3339DateTime // RFC3339 format with reference date (e.g., "2000-01-01T09:00:00Z" for "09:00")
  end: RFC3339DateTime   // RFC3339 format with reference date (e.g., "2000-01-01T19:00:00Z" for "19:00")
}

/**
 * Constraint enforcement level
 * LEARNING: Controls how strictly constraints are enforced
 * WHY: Provides flexibility in how constraints are applied (off = not applied, flexible = warn/soft block, hard = hard block)
 * PATTERN: Enum-like string literal union type
 */
export type ConstraintEnforcement = 'off' | 'flexible' | 'hard'

/**
 * Rolling week calculation direction
 * LEARNING: Determines how rolling 7-day window is calculated relative to appointment date
 * WHY: Different businesses may prefer different rolling week calculations
 * PATTERN: Enum-like string literal union type
 * NOTE: Internal type only - not exported as it's only used in RollingWeekCapacityFilter interface
 */
type RollingWeekDirection = 'past' | 'centered' | 'future'

/**
 * Work capacity filter configuration
 * LEARNING: Configuration for a single capacity filter (daily, calendar week, or rolling week)
 * WHY: Encapsulates max hours and filter mode together
 * PATTERN: Interface with required fields
 */
export interface WorkCapacityFilter {
  maxHours: number
  enforcement: ConstraintEnforcement
}

/**
 * Rolling week capacity filter configuration
 * LEARNING: Extends WorkCapacityFilter with direction setting
 * WHY: Rolling week needs direction to determine date range calculation
 * PATTERN: Extends base interface with additional field
 */
export interface RollingWeekCapacityFilter extends WorkCapacityFilter {
  direction: RollingWeekDirection
}

/**
 * Range constraint type
 * LEARNING: Identifies the type of time-based restriction
 * WHY: Allows different range constraint types (businessHours, leadTime, dateRange) to coexist
 * PATTERN: Enum-like string literal union type
 * NOTE: Exported for use in constraintTypes.ts constants
 */
export type RangeConstraintType = 'businessHours' | 'leadTime' | 'dateRange'

/**
 * Range constraint configuration
 * LEARNING: Configuration for business hours constraint
 * WHY: Encapsulates business hours per day
 * PATTERN: Interface with business hours map
 */
export interface BusinessHoursConfig {
  hours: AvailabilitySettings['businessHours']
}

/**
 * Range constraint configuration
 * LEARNING: Configuration for lead time constraint
 * WHY: Encapsulates minimum lead time in minutes
 * PATTERN: Interface with minutes field
 * NOTE: Internal type only - not exported as it's only used in RangeConstraint interface
 */
interface LeadTimeConfig {
  minutes: number
}

/**
 * Range constraint configuration
 * LEARNING: Configuration for date range constraint
 * WHY: Encapsulates absolute start and end boundaries
 * PATTERN: Interface with start and end RFC3339 datetime strings
 */
export interface DateRangeConfig {
  start: string  // RFC3339 datetime
  end: string    // RFC3339 datetime
}

/**
 * Range constraint
 * LEARNING: Time-based restrictions that filter slots by when they can occur
 * WHY: Consolidates business hours, leadTime, and date range boundaries into unified structure
 * PATTERN: Interface with type, enforcement, and config
 */
export interface RangeConstraint {
  type: RangeConstraintType
  enforcement: ConstraintEnforcement
  config: BusinessHoursConfig | LeadTimeConfig | DateRangeConfig
}

/**
 * Buffer type for distinguishing buffer purposes
 * LEARNING: Identifies the purpose of a buffer configuration
 * WHY: Allows different buffer types (appointment, driveTime, lunch) to coexist
 * PATTERN: Enum-like string literal union type
 * NOTE: Internal type only - not exported as it's only used in BufferConfig interface
 */
type BufferType = 'appointment' | 'driveTime' | 'lunch'

/**
 * Buffer placement for controlling where buffer is applied
 * LEARNING: Controls where buffer time is placed around slots
 * WHY: Different buffer placements (before, after, both) serve different purposes
 * PATTERN: Enum-like string literal union type
 * NOTE: Internal type only - not exported as it's only used in BufferConfig interface
 */
type BufferPlacement = 'off' | 'before' | 'after' | 'both'

/**
 * Buffer configuration (now OverlapConstraint)
 * LEARNING: Configuration for a single buffer type (appointment, driveTime, or lunch)
 * WHY: Encapsulates buffer type, minutes, placement, and enforcement together
 * PATTERN: Interface with required fields, similar to WorkCapacityFilter
 */
export interface BufferConfig {
  type: BufferType
  minutes: number
  placement: BufferPlacement  // Renamed from mode
  enforcement: ConstraintEnforcement  // Added enforcement property
}

/**
 * Availability settings interface
 * LEARNING: Complete configuration for time slot generation
 * WHY: Type-safe settings structure for availability calculations
 * PATTERN: Interface matching server-side adminSettings structure
 */
export interface AvailabilitySettings {
  businessHours: {
    0: DayHours // Sunday
    1: DayHours // Monday
    2: DayHours // Tuesday
    3: DayHours // Wednesday
    4: DayHours // Thursday
    5: DayHours // Friday
    6: DayHours // Saturday
  }
  
  minuteIncrement: number
  
  /**
   * Range constraints (optional)
   * LEARNING: Time-based restrictions that filter slots by when they can occur
   * WHY: Consolidates business hours, leadTime, and date range boundaries into unified structure
   * PATTERN: Optional nested object with businessHours, leadTime, and dateRange constraints
   */
  rangeConstraints?: {
    businessHours?: RangeConstraint  // Business hours per day (always enforced)
    leadTime?: RangeConstraint      // Lead time constraint (filters slots before now + minutes)
    dateRange?: RangeConstraint     // Date range boundaries (absolute start/end limits)
  }
  
  /**
   * Overlap constraints (buffers) (optional)
   * LEARNING: Time gaps around appointments to prevent overlaps
   * WHY: Groups related buffer settings together for consistency and better organization
   * PATTERN: Optional nested object with appointment, driveTime, and lunch buffers
   * 
   * Note: leadTime moved to rangeConstraints.leadTime
   */
  buffers?: {
    appointment?: BufferConfig   // Appointment buffer (adds time around appointments)
    driveTime?: BufferConfig     // Drive time buffer (future: travel time between appointments)
    lunch?: BufferConfig         // Lunch buffer (blocks time for lunch breaks)
  }
  
  /**
   * Maximum work hours capacity filters (optional)
   * LEARNING: Consolidated capacity filters for day, calendar week, and rolling week limits
   * WHY: Groups related capacity settings together for consistency and better organization
   * PATTERN: Optional nested object with day, calendarWeek, and rollingWeek filters
   */
  maxWorkHours?: {
    day?: WorkCapacityFilter
    calendarWeek?: WorkCapacityFilter
    rollingWeek?: RollingWeekCapacityFilter
  }
  
  /**
   * IANA timezone string (optional)
   * LEARNING: Timezone used for all availability calculations
   * WHY: Allows admin to configure timezone instead of hardcoded default
   * PATTERN: Optional field, defaults to "America/New_York" if not set
   */
  timezone?: string
  
  /**
   * Duration rounding configuration (optional)
   * LEARNING: Controls how appointment durations are rounded
   * WHY: Allows admin to enable/disable rounding and configure rounding method and increment
   * PATTERN: Optional nested object with enabled flag, increment, and method
   */
  durationRounding?: {
    enabled: boolean
    increment?: number  // Minutes (defaults to minuteIncrement if not specified)
    method?: 'roundUp' | 'roundDown' | 'roundNearest'
  }
  
  /**
   * Differential perspectives configuration (optional)
   * LEARNING: Configures which attendees make an event "major" vs "minor" for differential scheduling
   * WHY: Makes differential scheduling configurable instead of hardcoded to inspector/client
   * PATTERN: Optional nested object with arrays of UserTypeBlock IDs and display labels
   */
  differentialPerspectives?: {
    majorAttendees?: GlobalEntityId[]  // UserTypeBlock IDs that make an event "major" (e.g., inspector)
    minorAttendees?: GlobalEntityId[]   // UserTypeBlock IDs that make an event "minor" (e.g., client)
    majorLabel?: string  // Display label for major perspective (e.g., "Inspector")
    minorLabel?: string  // Display label for minor perspective (e.g., "Client Formal Presentation")
    differentialGraphDefaultLabel?: string  // Label shown when no time slot is selected (e.g., "Select a Time Slot")
    majorStateLabel?: string  // State message when major perspective is selected (e.g., "Showing Major Times")
    minorStateLabel?: string  // State message when minor perspective is selected (e.g., "Showing Client FormalPresentation Times")
    selectTimeSlotLabel?: string  // Label for time slot selection (e.g., "Select a Time Slot")
  }
}

/**
 * LEARNING: Raw availability settings type from API response
 * WHY: Eliminates duplication between useAvailabilitySettings and availabilitySettings config
 * PATTERN: Extract shared type for API response structure
 */
export interface RawAvailabilitySettings {
  minuteIncrement: number
  rangeConstraints: {
    businessHours: RangeConstraint
    leadTime?: RangeConstraint
    dateRange?: RangeConstraint
  }
  buffers?: {
    appointment?: BufferConfig
    driveTime?: BufferConfig
    lunch?: BufferConfig
  }
  maxWorkHours?: {
    day?: WorkCapacityFilter
    calendarWeek?: WorkCapacityFilter
    rollingWeek?: RollingWeekCapacityFilter
  }
  timezone?: string
  durationRounding?: {
    enabled: boolean
    increment?: number
    method?: 'roundUp' | 'roundDown' | 'roundNearest'
  }
  differentialPerspectives?: {
    majorAttendees?: string[]
    minorAttendees?: string[]
    majorLabel?: string
    minorLabel?: string
    differentialGraphDefaultLabel?: string
    majorStateLabel?: string
    minorStateLabel?: string
    selectTimeSlotLabel?: string
  }
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

export async function getAvailabilitySettings(): Promise<AvailabilitySettings> {
  if (cachedSettings && isCacheValid()) {
    return cachedSettings.settings
  }
  

  try {
    const response = await apiClient.get('/business-settings/availability_settings')
    
    if (response.data && response.data.setting_value) {
      const rawSettings = response.data.setting_value as RawAvailabilitySettings
      
      // Validate settings structure - require current format only
      if (!rawSettings.rangeConstraints?.businessHours) {
        throw new Error('rangeConstraints.businessHours is required')
      }
      
      if (!rawSettings.minuteIncrement) {
        throw new Error('minuteIncrement is required')
      }
      
      const businessHoursConfig = rawSettings.rangeConstraints.businessHours.config as BusinessHoursConfig
      const businessHours = businessHoursConfig.hours
      
      // LEARNING: Server sends RFC3339 format directly in current structure
      // WHY: Server is source of truth for RFC3339 format, no conversion needed
      // PATTERN: Use settings directly from API response
      const convertedSettings: AvailabilitySettings = {
        businessHours: businessHours,
        minuteIncrement: rawSettings.minuteIncrement,
        rangeConstraints: rawSettings.rangeConstraints,
        buffers: rawSettings.buffers,
        maxWorkHours: rawSettings.maxWorkHours,
        timezone: rawSettings.timezone,
        durationRounding: rawSettings.durationRounding,
        differentialPerspectives: rawSettings.differentialPerspectives
      }
      
      cachedSettings = {
        settings: convertedSettings,
        cachedAt: Date.now()
      }
      
      return convertedSettings
    }
    
    throw new Error('Invalid API response: missing setting_value or required fields')
  } catch (error) {
    logger.error('Failed to fetch settings from API', { error })
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    throw new Error(`Failed to fetch availability settings: ${errorMessage}`)
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


