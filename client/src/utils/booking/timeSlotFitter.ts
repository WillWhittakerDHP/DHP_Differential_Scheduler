/**
 * Time Slot Fitter Utility
 * 
 * LEARNING: Generic time slot fitting that respects boundaries, business hours, and busy times
 * WHY: Reusable for appointment slots, available start times, AND moveable parts scheduling
 * PATTERN: Pure utility functions - no side effects, no reactivity
 * 
 * This is the single source of truth for fitting a duration into available time.
 */

import type { TimeSlot } from '@/types/appointment'
import type { RFC3339DateTime } from '@/types/datetime'
import {
  generateSlotsWithAvailability,
  type TimeSlotWithAvailability
} from './timeAvailabilityManager'
import { createLogger } from '@/utils/logger'

// LEARNING: Use scoped logger for controllable debug output
// WHY: Prevents debug logs in production, allows scope-based filtering
// PATTERN: createLogger(scope) provides debug/info/warn/error methods
const logger = createLogger('timeSlotFitter')

/**
 * Default include flags for TimeSlot objects
 * LEARNING: Explicit default values for includeFlags parameter
 * WHY: Clear, documented defaults that can be reused across the codebase
 * PATTERN: Exported constant that can be used by callers and tests
 */
export const DEFAULT_INCLUDE_FLAGS = {
  onSite: false,
  clientPresent: false,
  moveable: false
} as const

/**
 * Business hours configuration for a single day
 * LEARNING: Uses RFC3339 format internally (with reference date for time-of-day)
 * WHY: Consistent format throughout codebase, matches Google Calendar API
 * PATTERN: RFC3339 datetime using fixed reference date (2000-01-01)
 */
export interface DayBusinessHours {
  start: RFC3339DateTime  // RFC3339 format with reference date (e.g., "2000-01-01T08:00:00Z" for "08:00")
  end: RFC3339DateTime    // RFC3339 format with reference date (e.g., "2000-01-01T17:00:00Z" for "17:00")
}

/**
 * Business hours by day of week (0 = Sunday, 6 = Saturday)
 * 
 * LEARNING: Days can be omitted to represent closed days
 * WHY: Not all businesses operate 7 days per week
 * PATTERN: Partial record - missing keys indicate closed days
 * 
 * @example
 * // Open Monday-Friday only
 * const businessHours: BusinessHoursMap = {
 *   1: { start: "2000-01-01T09:00:00Z", end: "2000-01-01T17:00:00Z" },
 *   2: { start: "2000-01-01T09:00:00Z", end: "2000-01-01T17:00:00Z" },
 *   3: { start: "2000-01-01T09:00:00Z", end: "2000-01-01T17:00:00Z" },
 *   4: { start: "2000-01-01T09:00:00Z", end: "2000-01-01T17:00:00Z" },
 *   5: { start: "2000-01-01T09:00:00Z", end: "2000-01-01T17:00:00Z" }
 *   // Saturday (6) and Sunday (0) omitted = closed
 * }
 */
export type BusinessHoursMap = Partial<Record<0 | 1 | 2 | 3 | 4 | 5 | 6, DayBusinessHours>>

/**
 * Busy time range to exclude from available slots
 */
export interface BusyTimeRange {
  start: RFC3339DateTime  // RFC3339 datetime string (ISO 8601 with timezone)
  end: RFC3339DateTime    // RFC3339 datetime string (ISO 8601 with timezone)
}

/**
 * Parameters for fitting time slots
 */
export interface FitTimeSlotsParams {
  startBoundary: RFC3339DateTime         // RFC3339 datetime - earliest possible start
  endBoundary: RFC3339DateTime           // RFC3339 datetime - latest possible end (slot must complete by this time)
  duration: number                       // Required duration in minutes
  businessHours: BusinessHoursMap
  minuteIncrement: number                 // Usually 15
  busyTimes?: BusyTimeRange[]             // Optional exclusions
  /**
   * Flags to include in TimeSlot objects
   * @default { onSite: false, clientPresent: false, moveable: false }
   */
  includeFlags: {
    onSite: boolean
    clientPresent: boolean
    moveable: boolean
  }
}

/**
 * Result from fitting time slots
 */
export interface FitTimeSlotsResult {
  slots: TimeSlot[]
  earliestCompletion: RFC3339DateTime | null  // RFC3339 datetime of earliest possible end time
}

/**
 * Parse date string to local Date object
 * Handles both 'YYYY-MM-DD' and ISO timestamp formats
 * 
 * LEARNING: Parses dates in local timezone, not UTC
 * WHY: When we do new Date('2026-01-09'), it creates UTC midnight, which becomes previous day in timezones behind UTC
 * PATTERN: Extract date part and create Date object in local timezone
 */
export function parseLocalDate(dateInput: string | Date): Date {
  // LEARNING: Handle both string and Date object inputs
  // WHY: selectedDate.value.start might be a Date object or string
  // PATTERN: Convert Date to string if needed, then parse
  let dateString: string
  if (dateInput instanceof Date) {
    // Convert Date to YYYY-MM-DD string
    const year = dateInput.getFullYear()
    const month = String(dateInput.getMonth() + 1).padStart(2, '0')
    const day = String(dateInput.getDate()).padStart(2, '0')
    dateString = `${year}-${month}-${day}`
  } else if (typeof dateInput === 'string') {
    dateString = dateInput
  } else {
    // Fallback: convert to string
    dateString = String(dateInput)
  }
  
  const datePart = dateString.includes('T') ? dateString.split('T')[0] : dateString
  const [year, month, day] = datePart.split('-').map(Number)
  return new Date(year, month - 1, day) // month is 0-indexed, creates date at local midnight
}

/**
 * Parse "HH:mm" time string to minutes from midnight
 * 
 * LEARNING: Converts time string to numeric minutes for calculations
 * WHY: Easier to work with minutes for time arithmetic
 */
export function parseTimeToMinutes(timeString: string): number {
  const [hours, minutes] = timeString.split(':').map(Number)
  return hours * 60 + minutes
}

/**
 * Check if a day of week is a closed day (no business hours)
 * 
 * LEARNING: Type guard for closed days
 * WHY: Makes closed-day intent explicit
 * PATTERN: Check if day key exists in BusinessHoursMap
 * 
 * @param dayOfWeek - Day of week (0 = Sunday, 6 = Saturday)
 * @param businessHours - Business hours map
 * @returns true if the day is closed (no hours defined), false if open
 */
export function isClosedDay(
  dayOfWeek: 0 | 1 | 2 | 3 | 4 | 5 | 6,
  businessHours: BusinessHoursMap
): boolean {
  return !businessHours[dayOfWeek]
}

/**
 * Check if two time ranges overlap
 * 
 * LEARNING: Extracted overlap detection for reuse
 * WHY: Used by fitTimeSlots and potentially other utilities
 * PATTERN: Two ranges overlap if one starts before the other ends
 */
export function timeRangesOverlap(
  range1: { start: Date; end: Date },
  range2: { start: Date; end: Date }
): boolean {
  return (range1.start < range2.end && range1.end > range2.start)
}

/**
 * Parse business hours for a day and return time components
 * LEARNING: Shared business hours parsing logic
 * WHY: Eliminates duplication between fitTimeSlots and generateAllTimeSlots (Issue #20)
 * PATTERN: Pure function that extracts and validates business hours
 * 
 * ARCHITECTURE DECISION: Eliminate Round-Trip Conversion (Issue #13)
 * -----------------------------------------------------------------------
 * This function now parses RFC3339 directly to minutes without converting
 * to HH:mm first. This eliminates the round-trip conversion:
 * 
 * Before: RFC3339 → HH:mm → parse → minutes
 * After:  RFC3339 → parse → minutes
 * 
 * RELATED: See Issue #13 in AVAILABILITY_REFACTOR_ANALYSIS.md
 * 
 * @param dayHours - Business hours for the day (RFC3339DateTime or HH:mm format for backward compatibility)
 * @param dayOfWeek - Day of week (for error messages)
 * @returns Parsed time components or null if invalid
 */
export function parseBusinessHours(
  dayHours: DayBusinessHours | { start: string; end: string },
  dayOfWeek: number
): { startHour: number; startMinute: number; endHour: number; endMinute: number; dayStartMinutes: number; dayEndMinutes: number } | null {
  let startHour: number
  let startMinute: number
  let endHour: number
  let endMinute: number
  
  // LEARNING: Parse RFC3339 directly to hours/minutes without HH:mm conversion
  // WHY: Eliminates round-trip conversion (RFC3339 → HH:mm → parse) - Issue #13
  // PATTERN: Check format and parse accordingly, but avoid intermediate HH:mm conversion
  if (typeof dayHours.start === 'string' && dayHours.start.includes(':') && !dayHours.start.includes('T')) {
    // HH:mm format (backward compatibility for tests)
    const [startH, startM] = dayHours.start.split(':').map(Number)
    const [endH, endM] = (dayHours.end as string).split(':').map(Number)
    startHour = startH
    startMinute = startM
    endHour = endH
    endMinute = endM
  } else {
    // RFC3339 format - parse directly from Date object
    // LEARNING: Parse RFC3339 directly without converting to HH:mm first
    // WHY: Eliminates unnecessary round-trip conversion (Issue #13)
    // PATTERN: Create Date object from RFC3339, extract UTC hours/minutes directly
    const startDate = new Date(dayHours.start as RFC3339DateTime)
    const endDate = new Date(dayHours.end as RFC3339DateTime)
    
    // Validate Date objects
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      logger.warn(`Invalid RFC3339 datetime for day ${dayOfWeek}:`, dayHours)
      return null
    }
    
    startHour = startDate.getUTCHours()
    startMinute = startDate.getUTCMinutes()
    endHour = endDate.getUTCHours()
    endMinute = endDate.getUTCMinutes()
  }

  // Validate parsed times
  if (isNaN(startHour) || isNaN(startMinute) || isNaN(endHour) || isNaN(endMinute)) {
    logger.warn(`Invalid time format for day ${dayOfWeek}:`, dayHours)
    return null
  }

  // Calculate day start and end in minutes from midnight
  const dayStartMinutes = startHour * 60 + startMinute
  const dayEndMinutes = endHour * 60 + endMinute

  // Validate end time is after start time
  if (dayEndMinutes <= dayStartMinutes) {
    logger.warn(`Invalid business hours for day ${dayOfWeek}: end must be after start`)
    return null
  }

  return { startHour, startMinute, endHour, endMinute, dayStartMinutes, dayEndMinutes }
}

/**
 * Fit time slots of a given duration into available time between boundaries
 * 
 * LEARNING: Generic time slot fitting that respects boundaries, business hours, and busy times
 * WHY: Reusable for appointment slots, available start times, AND moveable parts scheduling
 * PATTERN: Pure utility function - no side effects, no reactivity
 * 
 * ARCHITECTURE DECISION: Delegate Pattern for Slot Generation (Issue #20)
 * -----------------------------------------------------------------------
 * This function now delegates to generateSlotsWithAvailability() for core
 * slot generation, then filters to only available slots. This ensures:
 * 
 * 1. Single source of truth for slot generation logic
 * 2. Consistent behavior across fitTimeSlots and generateAllTimeSlots
 * 3. Easier maintenance (changes in one place)
 * 4. Same validation and error handling as before
 * 
 * RELATED: See Issue #20 in AVAILABILITY_REFACTOR_ANALYSIS.md
 * 
 * ARCHITECTURE DECISION: earliestCompletion Tracks Available Slots Only
 * -----------------------------------------------------------------------
 * Both fitTimeSlots and generateSlotsWithAvailability track earliest 
 * completion of AVAILABLE slots only (not all generated slots).
 * 
 * RATIONALE:
 * - More useful for UI (shows when next appointment can be booked)
 * - Aligns with user expectations ("When is the earliest I can schedule?")
 * - Consistent behavior across both functions
 * 
 * RELATED: See Issue #15 in AVAILABILITY_REFACTOR_ANALYSIS.md
 * 
 * Algorithm:
 * 1. Validate all input parameters (duration, minuteIncrement, boundaries, business hours)
 * 2. Delegate to generateSlotsWithAvailability() for core slot generation
 * 3. Filter to only available slots (isAvailable === true)
 * 4. Return filtered slots + earliest available completion time
 * 
 * @param params - Parameters for fitting time slots
 * @returns Result with valid slots and earliest available completion time
 */
export function fitTimeSlots(params: FitTimeSlotsParams): FitTimeSlotsResult {
  const {
    startBoundary,
    endBoundary,
    duration,
    businessHours,
    minuteIncrement,
    busyTimes = [],
    includeFlags
  } = params

  // LEARNING: Comprehensive input validation prevents invalid slot generation
  // WHY: Invalid inputs can cause infinite loops, incorrect calculations, or runtime errors
  // PATTERN: Validate all parameters before processing, throw descriptive errors

  // Validate duration
  if (!duration || duration <= 0) {
    logger.error('Invalid duration: must be > 0', { duration })
    throw new Error('duration must be greater than 0')
  }
  if (!Number.isInteger(duration)) {
    logger.warn('Non-integer duration will be rounded', { duration })
  }

  // Validate minuteIncrement
  if (!minuteIncrement || minuteIncrement <= 0) {
    logger.error('Invalid minuteIncrement: must be > 0', { minuteIncrement })
    throw new Error('minuteIncrement must be greater than 0')
  }
  if (!Number.isInteger(minuteIncrement)) {
    logger.error('Invalid minuteIncrement: must be an integer', { minuteIncrement })
    throw new Error('minuteIncrement must be a positive integer')
  }
  if (minuteIncrement > 60) {
    logger.warn('Large minuteIncrement may result in few slots', { minuteIncrement })
  }

  // Validate boundaries
  if (!startBoundary || !endBoundary) {
    logger.error('Missing boundary parameters')
    throw new Error('startBoundary and endBoundary are required')
  }

  // Parse boundaries as Date objects for validation
  const startBoundaryDate = new Date(startBoundary)
  const endBoundaryDate = new Date(endBoundary)

  // Validate Date objects are valid
  if (isNaN(startBoundaryDate.getTime())) {
    logger.error('Invalid startBoundary datetime', { startBoundary })
    throw new Error('startBoundary must be a valid RFC3339 datetime')
  }
  if (isNaN(endBoundaryDate.getTime())) {
    logger.error('Invalid endBoundary datetime', { endBoundary })
    throw new Error('endBoundary must be a valid RFC3339 datetime')
  }

  // Validate boundaries: start < end
  if (startBoundaryDate >= endBoundaryDate) {
    logger.debug('Invalid boundaries: start >= end', { startBoundary, endBoundary })
    return { slots: [], earliestCompletion: null }
  }

  // Validate business hours
  if (!businessHours || typeof businessHours !== 'object') {
    logger.error('Invalid businessHours: must be an object')
    throw new Error('businessHours must be a BusinessHoursMap object')
  }

  // Check if at least one day has business hours
  const hasAnyHours = Object.keys(businessHours).length > 0
  if (!hasAnyHours) {
    logger.warn('No business hours defined for any day')
    return { slots: [], earliestCompletion: null }
  }

  // LEARNING: Delegate to unified availability manager for slot generation
  // WHY: Single source of truth for slot generation logic (Issue #20)
  // PATTERN: Generate all slots with availability, then filter to available only
  const result = generateSlotsWithAvailability({
    startBoundary,
    endBoundary,
    duration,
    businessHours,
    minuteIncrement,
    busyTimes,
    includeFlags
  })

  // LEARNING: Filter to only available slots
  // WHY: fitTimeSlots returns only available slots (not all slots like generateSlotsWithAvailability)
  // PATTERN: Filter slots where isAvailable === true
  const availableSlots = result.slots.filter(slot => slot.isAvailable)

  // LEARNING: earliestCompletion already tracks available slots only
  // WHY: generateSlotsWithAvailability already filters to available slots for earliestCompletion
  // PATTERN: Use earliestCompletion directly from result
  return {
    slots: availableSlots,
    earliestCompletion: result.earliestCompletion
  }
}

/**
 * Result from fitting time slots with availability flags
 */
export interface FitTimeSlotsResultWithAvailability {
  slots: TimeSlotWithAvailability[]
  earliestCompletion: RFC3339DateTime | null  // RFC3339 datetime of earliest available slot end time
}

/**
 * Fit time slots with availability status (all slots, marked as available/busy)
 * 
 * LEARNING: Generates ALL possible slots and marks them with availability status
 * WHY: Enables UI to render busy slots as inactive instead of hiding them
 * PATTERN: Uses unified availability manager for consistent slot generation
 * 
 * This is the new unified approach that:
 * 1. Generates all slots based on business hours + increments
 * 2. Checks availability against calendar busy periods
 * 3. Returns all slots with isAvailable flags
 * 
 * @param params - Parameters for fitting time slots
 * @returns Result with all slots (available + busy) and earliest available completion time
 */
export function fitTimeSlotsWithAvailability(
  params: FitTimeSlotsParams
): FitTimeSlotsResultWithAvailability {
  // LEARNING: Use unified availability manager
  // WHY: Single source of truth for all availability logic
  // PATTERN: Delegate to availability manager
  return generateSlotsWithAvailability({
    startBoundary: params.startBoundary,
    endBoundary: params.endBoundary,
    duration: params.duration,
    businessHours: params.businessHours,
    minuteIncrement: params.minuteIncrement,
    busyTimes: params.busyTimes,
    includeFlags: params.includeFlags
  })
}
