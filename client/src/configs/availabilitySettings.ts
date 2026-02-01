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
 * Drive time application rules
 * LEARNING: Controls when drive time buffers are applied
 * WHY: First/last appointment of day may need different handling than middle appointments
 * PATTERN: Enum-like string literal union type
 * 
 * - 'all': Apply to all appointments (default for between-appointment travel)
 * - 'first_only': Only apply to first appointment of day (travel FROM home/office)
 * - 'last_only': Only apply to last appointment of day (travel TO home/office)
 * - 'none': Disabled - don't apply this buffer
 */
export type DriveTimeApplyTo = 'all' | 'first_only' | 'last_only' | 'none'

/**
 * Drive time buffer configuration
 * LEARNING: Semantic buffer for travel time with application rules
 * WHY: driveTimeTo/driveTimeFrom have implicit placement (before/after) - no ambiguity
 * PATTERN: Interface with minutes, enforcement, and applyTo (no placement needed)
 * 
 * Unlike BufferConfig which has explicit 'placement', DriveTimeConfig uses semantic naming:
 * - driveTimeTo: Travel time to arrive at appointment (always applied BEFORE)
 * - driveTimeFrom: Travel time to depart from appointment (always applied AFTER)
 */
export interface DriveTimeConfig {
  minutes: number
  enforcement: ConstraintEnforcement
  applyTo: DriveTimeApplyTo
}

/**
 * Default location for drive time calculations
 * LEARNING: Starting/ending point for first/last appointment drive times
 * WHY: Needed to calculate travel time from home/office to first appointment
 * PATTERN: Interface with address string and optional coordinates for future Google Maps integration
 * 
 * This is used as:
 * - Starting point for travel to first appointment of the day
 * - Ending point for travel from last appointment of the day
 */
export interface DefaultLocation {
  address: string           // Full address string (e.g., "123 Main St, City, State ZIP")
  label?: string            // Optional label like "Home Office", "Shop", etc.
  coordinates?: {           // Optional - for future Google Maps integration (Phase 2.2)
    lat: number
    lng: number
  }
}

/**
 * Calendar provider type
 * LEARNING: Identifies the calendar service provider
 * WHY: Supports multiple calendar providers (Google, Outlook)
 * PATTERN: Enum-like string literal union type
 * Session 2.0.1: Added for calendar configuration
 */
export type CalendarProvider = 'google' | 'outlook' | 'none'

/**
 * Calendar configuration
 * LEARNING: Configuration for which calendars to check for free-busy data
 * WHY: Allows admin to configure multiple calendar sources for availability checking
 * PATTERN: Labeled fields matching mock data IDs for consistency
 * Session 2.0.1: Added for Google Calendar API integration
 * 
 * Calendar labels match mock data IDs (client/src/utils/booking/mockGoogleCalendar.ts):
 * - primary: Main calendar (user's primary Google/Outlook calendar)
 * - work: Work calendar (optional)
 * - personal: Personal calendar (optional)
 */
export interface CalendarConfig {
  enabled: boolean
  provider: CalendarProvider
  calendars: {
    primary: string    // e.g., "will@districthomepro.com"
    work: string       // Optional, empty if not used
    personal: string   // Optional, empty if not used
  }
}

/**
 * Default calendar configuration
 * LEARNING: Default values when no calendar config is set
 * WHY: Provides sensible defaults (disabled, no provider, empty emails)
 * Session 2.0.1: Added for calendar configuration
 */
export const DEFAULT_CALENDAR_CONFIG: CalendarConfig = {
  enabled: false,
  provider: 'none',
  calendars: {
    primary: '',
    work: '',
    personal: ''
  }
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
   * PATTERN: Optional nested object with appointment, driveTimeTo, driveTimeFrom, and lunch buffers
   * 
   * Note: leadTime moved to rangeConstraints.leadTime
   * Note: Legacy 'driveTime' replaced with semantic 'driveTimeTo'/'driveTimeFrom' in drive time buffer refactor
   */
  buffers?: {
    appointment?: BufferConfig      // Appointment buffer (adds time around appointments)
    driveTimeTo?: DriveTimeConfig   // Travel time TO arrive at appointment (applied BEFORE)
    driveTimeFrom?: DriveTimeConfig // Travel time FROM appointment (applied AFTER)
    lunch?: BufferConfig            // Lunch buffer (blocks time for lunch breaks)
    // driveTime?: BufferConfig     // DEPRECATED: Use driveTimeTo/driveTimeFrom instead
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
    driveTimeTo?: DriveTimeConfig   // Travel time TO arrive at appointment
    driveTimeFrom?: DriveTimeConfig // Travel time FROM appointment
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
        differentialPerspectives: rawSettings.differentialPerspectives,
        // Session 2.1.2: Include calendarConfig from raw settings
        calendarConfig: rawSettings.calendarConfig,
        // Drive time buffer refactor: Include defaultLocation for drive time calculations
        defaultLocation: rawSettings.defaultLocation
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
 * Extract non-empty calendar emails as array
 * LEARNING: Converts CalendarConfig.calendars object to string array
 * WHY: API calls need array of email strings, not labeled object
 * PATTERN: Filter out empty strings, return array
 * Session 2.0.1: Added for Google Calendar API integration
 * 
 * @param config - CalendarConfig object (optional)
 * @returns Array of non-empty calendar email strings
 * 
 * @example
 * const config: CalendarConfig = {
 *   enabled: true,
 *   provider: 'google',
 *   calendars: { primary: 'a@b.com', work: '', personal: 'c@d.com' }
 * }
 * getCalendarEmailsArray(config) // Returns ['a@b.com', 'c@d.com']
 */
export function getCalendarEmailsArray(config: CalendarConfig | undefined): string[] {
  if (!config || !config.enabled) {
    return []
  }
  
  const emails = [
    config.calendars.primary,
    config.calendars.work,
    config.calendars.personal
  ]
  
  return emails.filter(email => email && email.trim() !== '')
}


