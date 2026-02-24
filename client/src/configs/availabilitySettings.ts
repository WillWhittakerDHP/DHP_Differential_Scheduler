/**
WHY: Ce...
 */
import type { GlobalEntityId } from '@shared/types/primitiveBrands'
import { toGlobalEntityId } from '@/types/entities'
import apiClient from '@/utils/api'
import { createLogger } from '@/utils/logger'
import type {
  ConstraintEnforcement,
  Coordinates,
  DefaultLocation,
  DriveTimeApplyTo,
  DriveTimeConfig,
  DurationRoundingConfig,
  RangeConstraintType,
  WorkCapacityFilter,
  RollingWeekCapacityFilter,
  IncomeCapacityFilter,
  RollingWeekIncomeCapacityFilter,
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

export type { ConstraintEnforcement, Coordinates, DefaultLocation, DriveTimeApplyTo, DriveTimeConfig, DurationRoundingConfig, RangeConstraintType, WorkCapacityFilter, RollingWeekCapacityFilter, IncomeCapacityFilter, RollingWeekIncomeCapacityFilter, RollingWeekDirection, LeadTimeConfig, BusinessHoursConfig, DateRangeConfig, BufferConfig }
export type { DayHours }

/**
 * Range constraint (storage shape): shared type uses category for discriminated union.
 * We use the shared type; when building from API/forms, add category: 'range' for compatibility.
 */
export type RangeConstraint = SharedRangeConstraint

export type { CalendarConfig, CalendarEntry, CalendarProvider }

/**
 * Default calendar configuration
 * Session 2.0.1: Added for calendar configuration
 * Session 2.X: Updated to use CalendarEntry[] array
 */
export const DEFAULT_CALENDAR_CONFIG: CalendarConfig = {
  enabled: false,
  provider: 'none',
  calendars: [],
  holdDurationMinutes: 15,
  holdDurationMin: 1,
  holdDurationMax: 60,
  holdDurationFallback: 15
}

/**
 * Availability settings interface
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
   */
  rangeConstraints?: {
    businessHours?: RangeConstraint  // Business hours per day (always enforced)
    leadTime?: RangeConstraint      // Lead time constraint (filters slots before now + minutes)
    dateRange?: RangeConstraint     // Date range boundaries (absolute start/end limits)
  }
  
  /**
   * Overlap constraints (buffers) (optional)
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
   */
  defaultLocation?: DefaultLocation
  
  /**
   * Maximum work hours capacity filters (optional)
   */
  maxWorkHours?: {
    day?: WorkCapacityFilter
    calendarWeek?: WorkCapacityFilter
    rollingWeek?: RollingWeekCapacityFilter
  }

  /**
Maximum income capacity filters (optional)
LEARNING: Income caps per...
   */
  maxIncome?: {
    day?: IncomeCapacityFilter
    calendarWeek?: IncomeCapacityFilter
    rollingWeek?: RollingWeekIncomeCapacityFilter
  }
  
  /**
Overlap source enforcement (optional)
WHY: Allows admin to toggle ou...
   */
  overlapSources?: {
    outOfOffice?: {
      enforcement: ConstraintEnforcement
    }
  }
  
  /**
IANA timezone string (optional)
LEARNING: Timezone used for all avai...
   */
  timezone?: string
  
  /**
   * Duration rounding configuration (optional); uses shared DurationRoundingConfig (TYPE_SIMILARITY 1.8).
   */
  durationRounding?: DurationRoundingConfig

  /**
   * Differential perspectives configuration (optional)
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
  maxIncome?: {
    day?: IncomeCapacityFilter
    calendarWeek?: IncomeCapacityFilter
    rollingWeek?: RollingWeekIncomeCapacityFilter
  }
  timezone?: string
  durationRounding?: DurationRoundingConfig
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
 */
interface CacheEntry {
  settings: AvailabilitySettings
  cachedAt: number  // timestamp (Date.now())
}

/**
 * In-memory cache for availability settings
 */
let cachedSettings: CacheEntry | null = null

/**
 * Cache TTL in milliseconds (default: 5 minutes)
 * P3-2: Extracted magic number to constant
 */
const DEFAULT_CACHE_TTL_MINUTES = 5
const CACHE_TTL_MS = import.meta.env.VITE_AVAILABILITY_CACHE_TTL 
  ? Number(import.meta.env.VITE_AVAILABILITY_CACHE_TTL) 
  : DEFAULT_CACHE_TTL_MINUTES * 60 * 1000  // Default: 5 minutes

/**
 * Check if cached settings are still valid
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
        maxIncome: rawSettings.maxIncome,
        timezone: rawSettings.timezone,
        durationRounding: rawSettings.durationRounding,
        differentialPerspectives: rawSettings.differentialPerspectives
          ? {
              ...rawSettings.differentialPerspectives,
              majorAttendees: rawSettings.differentialPerspectives.majorAttendees?.map(toGlobalEntityId),
              minorAttendees: rawSettings.differentialPerspectives.minorAttendees?.map(toGlobalEntityId),
            }
          : undefined,
        calendarConfig: rawSettings.calendarConfig,
        defaultLocation: rawSettings.defaultLocation,
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
 * WHY: Validate email format for calendar configuration
LEARNING: Basic email f...
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


// ─── Pure helpers for admin save/validate (load/save symmetry with getAvailabilitySettings) ─────

import { DAY_NAMES } from '@/constants/availabilitySettings'
import type { RFC3339DateTime } from '@shared/types/primitiveBrands'

/**
 * Validate that every day's business hours has end > start.
 * Pure function: no side effects, returns result object.
 */
export function validateBusinessHoursRange(
  businessHours: AvailabilitySettings['businessHours'],
  rfc3339ToHHmm: (rfc3339: RFC3339DateTime) => string
): { valid: boolean; errorMessage?: string } {
  for (let day = 0; day <= 6; day++) {
    const dayHours = businessHours[day as 0 | 1 | 2 | 3 | 4 | 5 | 6]
    const [startHour, startMin] = rfc3339ToHHmm(dayHours.start).split(':').map(Number)
    const [endHour, endMin] = rfc3339ToHHmm(dayHours.end).split(':').map(Number)
    if (endHour * 60 + endMin <= startHour * 60 + startMin) {
      return { valid: false, errorMessage: `${DAY_NAMES[day]}: End time must be after start time` }
    }
  }
  return { valid: true }
}

/**
 * Build the PUT payload for saving availability settings.
 * Pure function: takes form state, returns the request body.
 */
export function buildAvailabilityPayload(
  formData: AvailabilitySettings,
  autoConfirmEnabled: boolean
): { setting_value: Record<string, unknown>; auto_confirm_enabled: boolean } {
  const settingsToSave: Record<string, unknown> = {
    businessHours: formData.businessHours,
    minuteIncrement: formData.minuteIncrement,
  }

  if (formData.rangeConstraints) {
    const rc = { ...formData.rangeConstraints }
    const bhConstraint = rc.businessHours
    if (bhConstraint && bhConstraint.config && 'hours' in bhConstraint.config) {
      (bhConstraint.config as BusinessHoursConfig).hours = formData.businessHours
    }
    settingsToSave.rangeConstraints = rc
  } else {
    settingsToSave.rangeConstraints = {
      businessHours: {
        category: 'range' as const,
        type: 'businessHours' as const,
        enforcement: 'hard' as const,
        config: { hours: formData.businessHours },
      },
    }
  }

  if (formData.buffers) settingsToSave.buffers = formData.buffers
  if (formData.overlapSources) settingsToSave.overlapSources = formData.overlapSources
  if (formData.maxWorkHours) settingsToSave.maxWorkHours = formData.maxWorkHours
  if (formData.timezone) settingsToSave.timezone = formData.timezone
  if (formData.durationRounding) settingsToSave.durationRounding = formData.durationRounding
  if (formData.differentialPerspectives) settingsToSave.differentialPerspectives = formData.differentialPerspectives
  if (formData.calendarConfig) settingsToSave.calendarConfig = formData.calendarConfig
  if (formData.defaultLocation) settingsToSave.defaultLocation = formData.defaultLocation

  return { setting_value: settingsToSave, auto_confirm_enabled: autoConfirmEnabled }
}


