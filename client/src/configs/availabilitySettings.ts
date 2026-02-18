/**
 * WHY: Availability Settings Configuration
 *
LEARNING: Client-side settings for time slot generation and business hours
WHY: Centralizes business hours and time slot configuration (admin-configurable via Business Controls tab)
PATTERN: TypeScript interface with default values, fetches from API with defaults when not yet loaded
Session 1.3.7: Created to replace hardcoded values in generateTimeSlots
Session 1.4.1: Updated to fetch from API instead of hardcoded defaults
 * Type similarity UNIFY: availability types imported from shared (single source of truth).
 */
import { toGlobalEntityId, type GlobalEntityId } from '@/types/entities'
import apiClient from '@/utils/api'
import { createLogger } from '@/utils/logger'
import type {
  ConstraintEnforcement,
  Coordinates,
  DefaultLocation,
  DriveTimeApplyTo,
  DriveTimeConfig,
  RangeConstraintType,
  WorkCapacityFilter,
  RollingWeekCapacityFilter,
  RollingWeekDirection,
  LeadTimeConfig,
  BusinessHoursConfig,
  DateRangeConfig,
  RangeConstraint as SharedRangeConstraint,
  DayHours,
  BufferConfig
} from '@shared/types/availabilityTypes'
import type { CalendarConfig, CalendarEntry, CalendarProvider } from '@shared/types/calendarTypes'

const logger = createLogger('availabilitySettings')

// Re-export shared types so existing imports from this file keep working
export type { ConstraintEnforcement, Coordinates, DefaultLocation, DriveTimeApplyTo, DriveTimeConfig, RangeConstraintType, WorkCapacityFilter, RollingWeekCapacityFilter, RollingWeekDirection, LeadTimeConfig, BusinessHoursConfig, DateRangeConfig, BufferConfig }
export type { DayHours }

/**
 * Range constraint (storage shape): shared type uses category for discriminated union.
 * We use the shared type; when building from API/forms, add category: 'range' for compatibility.
 */
export type RangeConstraint = SharedRangeConstraint

// Re-export calendar types from shared (Phase 1.2 type-similarity)
export type { CalendarConfig, CalendarEntry, CalendarProvider }

/**
 * Default calendar configuration
 * LEARNING: Default values when no calendar config is set
 * WHY: Provides sensible defaults (disabled, no provider, empty array)
 * Session 2.0.1: Added for calendar configuration
 * Session 2.X: Updated to use CalendarEntry[] array
 */
export const DEFAULT_CALENDAR_CONFIG: CalendarConfig = {
  enabled: false,
  provider: 'none',
  calendars: []
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
   * PATTERN: Optional nested object with appointment, driveToCandidate, driveFromCandidate, and lunch buffers
   * 
   * Note: leadTime moved to rangeConstraints.leadTime
   * Note: Legacy 'driveTime' replaced with semantic 'driveToCandidate'/'driveFromCandidate' in drive time buffer refactor
   */
  buffers?: {
    appointment?: BufferConfig      // Appointment buffer (adds time around appointments)
    driveToCandidate?: DriveTimeConfig   // Travel time TO arrive at appointment (applied BEFORE)
    driveFromCandidate?: DriveTimeConfig // Travel time FROM appointment (applied AFTER)
    lunch?: BufferConfig            // Lunch buffer (blocks time for lunch breaks)
    // driveTime?: BufferConfig     // DEPRECATED: Use driveToCandidate/driveFromCandidate instead
  }
  
  /**
   * Default location for drive time calculations (optional)
   * LEARNING: Starting/ending point for first/last appointment drive times
   * WHY: Needed to calculate travel time from home/office to first appointment and back
   * PATTERN: Optional field with address and optional coordinates for Google Maps integration
   */
  defaultLocation?: DefaultLocation
  
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
   * Overlap source enforcement (optional)
   * LEARNING: Controls whether specific event sources participate in overlap blocking
   * WHY: Allows admin to toggle out-of-office events as blockers without changing data fetching
   * PATTERN: Each source has an enforcement level (off = ignored, flexible = warn, hard = block)
   */
  overlapSources?: {
    outOfOffice?: {
      enforcement: ConstraintEnforcement
    }
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
  
  /**
   * Calendar configuration (optional)
   * LEARNING: Configuration for which calendars to check for free-busy data
   * WHY: Allows admin to configure calendar integration for availability checking
   * PATTERN: Optional nested object with enabled flag, provider, and calendar emails
   * Session 2.0.1: Added for Google Calendar API integration
   */
  calendarConfig?: CalendarConfig
}

/** API may omit category; normalize to shared RangeConstraint (category: 'range') when reading. */
function ensureRangeConstraintCategory(rc: RawAvailabilitySettings['rangeConstraints']): AvailabilitySettings['rangeConstraints'] {
  if (!rc) return undefined
  const withCategory = (c: RangeConstraint | (Omit<RangeConstraint, 'category'> & { category?: 'range' })): RangeConstraint =>
    ('category' in c && c.category === 'range' ? c : { ...c, category: 'range' as const }) as RangeConstraint
  return {
    businessHours: rc.businessHours ? withCategory(rc.businessHours) : undefined,
    leadTime: rc.leadTime ? withCategory(rc.leadTime) : undefined,
    dateRange: rc.dateRange ? withCategory(rc.dateRange) : undefined
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
    businessHours: RangeConstraint | (Omit<RangeConstraint, 'category'> & { category?: 'range' })
    leadTime?: RangeConstraint | (Omit<RangeConstraint, 'category'> & { category?: 'range' })
    dateRange?: RangeConstraint | (Omit<RangeConstraint, 'category'> & { category?: 'range' })
  }
  buffers?: {
    appointment?: BufferConfig
    driveToCandidate?: DriveTimeConfig   // Travel time TO arrive at appointment
    driveFromCandidate?: DriveTimeConfig // Travel time FROM appointment
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
  calendarConfig?: CalendarConfig
  defaultLocation?: DefaultLocation
  overlapSources?: {
    outOfOffice?: {
      enforcement: ConstraintEnforcement
    }
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
      // Ensure shared RangeConstraint shape (category: 'range') for API responses that may omit it
      const rangeConstraints = ensureRangeConstraintCategory(rawSettings.rangeConstraints)
      // LEARNING: Server sends RFC3339 format directly in current structure
      // WHY: Server is source of truth for RFC3339 format, no conversion needed
      // PATTERN: Use settings directly from API response
      const convertedSettings: AvailabilitySettings = {
        businessHours: businessHours,
        minuteIncrement: rawSettings.minuteIncrement,
        rangeConstraints,
        buffers: rawSettings.buffers,
        maxWorkHours: rawSettings.maxWorkHours,
        timezone: rawSettings.timezone,
        durationRounding: rawSettings.durationRounding,
        differentialPerspectives: rawSettings.differentialPerspectives
          ? {
              ...rawSettings.differentialPerspectives,
              majorAttendees: rawSettings.differentialPerspectives.majorAttendees?.map(toGlobalEntityId),
              minorAttendees: rawSettings.differentialPerspectives.minorAttendees?.map(toGlobalEntityId),
            }
          : undefined,
        // Session 2.1.2: Include calendarConfig from raw settings
        calendarConfig: rawSettings.calendarConfig,
        // Drive time buffer refactor: Include defaultLocation for drive time calculations
        defaultLocation: rawSettings.defaultLocation,
        // OOO enforcement: Include overlapSources for out-of-office toggle
        overlapSources: rawSettings.overlapSources
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

/**
 * Validate email format for calendar configuration
 * LEARNING: Basic email format validation
 * WHY: Ensures calendar emails are valid before saving
 * PATTERN: Returns true if valid or empty (optional fields)
 * Session 2.0.1: Added for calendar configuration validation
 * 
 * @param email - Email address to validate
 * @returns true if email is valid format or empty string (optional)
 */
export function isValidCalendarEmail(email: string): boolean {
  if (!email || email.trim() === '') {
    return true  // Empty is valid (optional field)
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email.trim())
}

/**
 * Extract calendar emails that are configured for reading (readFrom: true)
 * LEARNING: Returns emails from calendars marked for availability checking
 * WHY: Free-busy API calls need array of email strings for calendars to check
 * PATTERN: Filter calendars by readFrom flag, return email array
 * Session 2.0.1: Added for Google Calendar API integration
 * Session 2.X: Updated to use CalendarEntry[] with readFrom flag
 * 
 * @param config - CalendarConfig object (optional)
 * @returns Array of calendar email strings where readFrom is true
 * 
 * @example
 * const config: CalendarConfig = {
 *   enabled: true,
 *   provider: 'google',
 *   calendars: [
 *     { email: 'a@b.com', readFrom: true, writeTo: false },
 *     { email: 'c@d.com', readFrom: true, writeTo: true }
 *   ]
 * }
 * getReadFromCalendars(config) // Returns ['a@b.com', 'c@d.com']
 */
export function getReadFromCalendars(config: CalendarConfig | undefined): string[] {
  if (!config || !config.enabled || !Array.isArray(config.calendars)) {
    return []
  }
  
  return config.calendars
    .filter(entry => entry.readFrom && entry.email && entry.email.trim() !== '')
    .map(entry => entry.email.trim())
}

/**
 * Extract the calendar email configured for writing (writeTo: true)
 * LEARNING: Returns single email from calendar marked for event creation
 * WHY: Event creation needs single calendar ID where appointments are created
 * PATTERN: Find first calendar with writeTo flag, return email or undefined
 * Session 2.X: Added for writeTo calendar configuration
 * 
 * @param config - CalendarConfig object (optional)
 * @returns Calendar email string where writeTo is true, or undefined if none
 * 
 * @example
 * const config: CalendarConfig = {
 *   enabled: true,
 *   provider: 'google',
 *   calendars: [
 *     { email: 'a@b.com', readFrom: true, writeTo: false },
 *     { email: 'c@d.com', readFrom: true, writeTo: true }
 *   ]
 * }
 * getWriteToCalendar(config) // Returns 'c@d.com'
 */
export function getWriteToCalendar(config: CalendarConfig | undefined): string | undefined {
  if (!config || !config.enabled || !Array.isArray(config.calendars)) {
    return undefined
  }
  
  const writeToEntry = config.calendars.find(entry => entry.writeTo && entry.email && entry.email.trim() !== '')
  return writeToEntry?.email.trim()
}

/**
 * Extract non-empty calendar emails as array
 * LEARNING: Converts CalendarConfig.calendars to string array (all calendars, regardless of permissions)
 * WHY: Some code may need all calendar emails without filtering by readFrom
 * PATTERN: Returns all non-empty emails from calendar entries
 * Session 2.0.1: Added for Google Calendar API integration
 * Session 2.X: Updated to use CalendarEntry[] array, delegates to getReadFromCalendars for consistency
 * 
 * @param config - CalendarConfig object (optional)
 * @returns Array of non-empty calendar email strings
 */
export function getCalendarEmailsArray(config: CalendarConfig | undefined): string[] {
  // Returns readFrom calendars (most common use case)
  return getReadFromCalendars(config)
}



