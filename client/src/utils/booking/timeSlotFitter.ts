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
import type { RFC3339DateTime, DayOfWeek } from '@/types/datetime'
import {
  generateSlotsWithAvailability
  // P3-3: Removed TimeSlotWithAvailability import - use TimeSlot directly
} from './timeAvailabilityManager'
import type { RangeConstraint } from '@/configs/availabilitySettings'
import type { OverlapConstraint, CapacityConstraint } from './constraintExtractors'
import { validateSlotGenerationParams } from './slotGenerationValidation'
import { extractBusinessHoursMinutes } from '@/composables/useLocalTime'

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
// P3-4: Use DayOfWeek type instead of inline union type
export type BusinessHoursMap = Partial<Record<DayOfWeek, DayBusinessHours>>

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
  /**
   * Range constraints (optional)
   * LEARNING: Time-based restrictions that filter slots by when they can occur
   * WHY: Consolidates business hours, leadTime, and date range boundaries into unified structure
   */
  rangeConstraints?: RangeConstraint[]
  /**
   * Overlap constraints (optional)
   * LEARNING: Time gaps around appointments to prevent overlaps
   * WHY: Consolidates all buffer types (appointment, driveTime, lunch) into unified structure
   */
  overlapConstraints?: OverlapConstraint[]
  /**
   * Capacity constraints (optional)
   * LEARNING: If provided, applies capacity limits to filter slots
   * WHY: Allows admin to configure work hours limits per day, calendar week, or rolling week
   */
  capacityConstraints?: CapacityConstraint[]
}

/**
 * Result from fitting time slots
 */
export interface FitTimeSlotsResult {
  slots: TimeSlot[]
  earliestCompletion: RFC3339DateTime | null  // RFC3339 datetime of earliest possible end time
}

/**
 * Parse date string to UTC Date object
 * Handles both 'YYYY-MM-DD' and ISO timestamp formats
 * 
 * LEARNING: Parses dates in UTC timezone, not local
 * WHY: All business logic should use UTC to avoid timezone issues
 * PATTERN: Extract date part and create Date object in UTC using Date.UTC()
 */
export function parseUTCDate(dateInput: string | Date): Date | null {
  // LEARNING: Handle both string and Date object inputs
  // WHY: selectedDate.value.start might be a Date object or string
  // PATTERN: Convert Date to string if needed, then parse
  // P2-8: Enhanced with validation to prevent Invalid Date objects
  let dateString: string
  if (dateInput instanceof Date) {
    // Validate Date object is valid
    if (isNaN(dateInput.getTime())) {
      logger.warn('Invalid Date object passed to parseUTCDate:', dateInput)
      return null
    }
    // Convert Date to YYYY-MM-DD string using UTC methods
    const year = dateInput.getUTCFullYear()
    const month = String(dateInput.getUTCMonth() + 1).padStart(2, '0')
    const day = String(dateInput.getUTCDate()).padStart(2, '0')
    dateString = `${year}-${month}-${day}`
  } else if (typeof dateInput === 'string') {
    dateString = dateInput
  } else {
    // Fallback: convert to string
    dateString = String(dateInput)
  }
  
  const datePart = dateString.includes('T') ? dateString.split('T')[0] : dateString
  
  // P2-8: Validate date string format (YYYY-MM-DD)
  // LEARNING: Validate format before parsing to prevent Invalid Date objects
  // WHY: Prevents NaN values and Invalid Date objects from malformed input
  // PATTERN: Check format regex, validate components, verify Date object
  if (!/^\d{4}-\d{2}-\d{2}$/.test(datePart)) {
    logger.warn('Invalid date string format:', datePart)
    return null
  }
  
  const [year, month, day] = datePart.split('-').map(Number)
  
  // Validate components are numbers
  if (isNaN(year) || isNaN(month) || isNaN(day)) {
    logger.warn('Invalid date components:', { year, month, day, datePart })
    return null
  }
  
  // Validate month and day ranges
  if (month < 1 || month > 12 || day < 1 || day > 31) {
    logger.warn('Invalid date component ranges:', { year, month, day, datePart })
    return null
  }
  
  // LEARNING: Use Date.UTC() to create date at UTC midnight
  // WHY: All business logic should use UTC to avoid timezone issues
  // PATTERN: Create Date using Date.UTC() for UTC midnight
  const date = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0))
  
  // Validate Date object is valid
  if (isNaN(date.getTime())) {
    logger.warn('Invalid Date object created:', { year, month, day, datePart })
    return null
  }
  
  return date
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
 * @param dayHours - Business hours for the day (RFC3339DateTime format only)
 * @param dayOfWeek - Day of week (for error messages)
 * @returns Parsed time components or null if invalid
 */
export function parseBusinessHours(
  dayHours: DayBusinessHours | { start: string; end: string },
  dayOfWeek: number
): { startHour: number; startMinute: number; endHour: number; endMinute: number; dayStartMinutes: number; dayEndMinutes: number } | null {
  // LEARNING: Only accept RFC3339 format - no HH:mm support
  // WHY: HH:mm conversion should only happen at UI boundary, not in business logic
  // PATTERN: Parse RFC3339 directly, extract UTC hours/minutes
  const startDate = new Date(dayHours.start as RFC3339DateTime)
  const endDate = new Date(dayHours.end as RFC3339DateTime)
  
  // Validate Date objects
  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    logger.warn(`Invalid RFC3339 datetime for day ${dayOfWeek}:`, dayHours)
    return null
  }
  
  // LEARNING: Business hours RFC3339 strings represent LOCAL time-of-day, not UTC
  // WHY: Admin sets business hours in their local timezone (e.g., "9 AM" = 9 AM local)
  // PATTERN: Use useLocalTime composable to extract local time-of-day
  // NOTE: The RFC3339 string "2000-01-01T09:00:00Z" represents "9:00 AM local", not "9:00 AM UTC"
  //       When admin sets 9:00 AM local, it's stored as 9:00 AM UTC in the RFC3339 string,
  //       but we interpret it as local time-of-day for comparison with slots
  const startTime = extractBusinessHoursMinutes(dayHours.start as RFC3339DateTime)
  const endTime = extractBusinessHoursMinutes(dayHours.end as RFC3339DateTime)
  const startHour = startTime.hours
  const startMinute = startTime.minutes
  const endHour = endTime.hours
  const endMinute = endTime.minutes

  // Validate parsed times
  if (isNaN(startHour) || isNaN(startMinute) || isNaN(endHour) || isNaN(endMinute)) {
    return null
  }

  // Calculate day start and end in minutes from midnight
  const dayStartMinutes = startHour * 60 + startMinute
  const dayEndMinutes = endHour * 60 + endMinute

  // Validate end time is after start time
  if (dayEndMinutes <= dayStartMinutes) {
    return null
  }

  return { startHour, startMinute, endHour, endMinute, dayStartMinutes, dayEndMinutes }
}

/**
 * Fit available time slots of a given duration into available time between boundaries
 * 
 * LEARNING: Generic time slot fitting that respects boundaries, business hours, and busy times
 * WHY: Reusable for appointment slots, available start times, AND moveable parts scheduling
 * PATTERN: Async utility function - may make API calls for capacity checking
 * 
 * P3-6: Renamed from fitTimeSlots to fitAvailableTimeSlots for clarity
 * 
 * ARCHITECTURE DECISION: Delegate Pattern for Slot Generation (Issue #20)
 * -----------------------------------------------------------------------
 * This function now delegates to generateSlotsWithAvailability() for core
 * slot generation, then filters to only available slots. This ensures:
 * 
 * 1. Single source of truth for slot generation logic
 * 2. Consistent behavior across fitAvailableTimeSlots and generateAllTimeSlots
 * 3. Easier maintenance (changes in one place)
 * 4. Same validation and error handling as before
 * 
 * RELATED: See Issue #20 in AVAILABILITY_REFACTOR_ANALYSIS.md
 * 
 * ARCHITECTURE DECISION: earliestCompletion Tracks Available Slots Only
 * -----------------------------------------------------------------------
 * Both fitAvailableTimeSlots and generateSlotsWithAvailability track earliest 
 * completion of AVAILABLE slots only (not all generated slots).  // P3-6: Updated function name
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
 * 2. Delegate to generateSlotsWithAvailability() for core slot generation (async)
 * 3. Filter to only available slots (isAvailable === true)
 * 4. Return filtered slots + earliest available completion time
 * 
 * @param params - Parameters for fitting time slots
 * @returns Result with valid slots and earliest available completion time
 */
// P3-6: Renamed for clarity - returns only available slots
export async function fitAvailableTimeSlots(params: FitTimeSlotsParams): Promise<FitTimeSlotsResult> {
  const {
    startBoundary,
    endBoundary,
    duration,
    minuteIncrement,
    busyTimes = [],
    includeFlags
  } = params

  // P2-5: Use shared slot generation validation
  // LEARNING: Comprehensive input validation prevents invalid slot generation
  // WHY: Invalid inputs can cause infinite loops, incorrect calculations, or runtime errors
  // PATTERN: Use validateSlotGenerationParams to eliminate duplicate validation logic
  validateSlotGenerationParams({
    duration,
    minuteIncrement,
    startBoundary,
    endBoundary
  })

  // Parse boundaries as Date objects for validation
  const startBoundaryDate = new Date(startBoundary)
  const endBoundaryDate = new Date(endBoundary)

  // Validate Date objects are valid
  if (isNaN(startBoundaryDate.getTime())) {
    throw new Error('startBoundary must be a valid RFC3339 datetime')
  }
  if (isNaN(endBoundaryDate.getTime())) {
    throw new Error('endBoundary must be a valid RFC3339 datetime')
  }

  // Validate boundaries: start < end
  if (startBoundaryDate >= endBoundaryDate) {
    return { slots: [], earliestCompletion: null }
  }

  // Validate business hours
  if (!businessHours || typeof businessHours !== 'object') {
    throw new Error('businessHours must be a BusinessHoursMap object')
  }

  // Check if at least one day has business hours
  const hasAnyHours = Object.keys(businessHours).length > 0
  if (!hasAnyHours) {
    return { slots: [], earliestCompletion: null }
  }

  // LEARNING: Delegate to unified availability manager for slot generation
  // WHY: Single source of truth for slot generation logic (Issue #20)
  // PATTERN: Generate all slots with availability, then filter to available only
  const result = await generateSlotsWithAvailability(
    {
      startBoundary,
      endBoundary,
      duration,
      minuteIncrement,
      busyTimes,
      includeFlags
    },
    params.rangeConstraints,
    params.overlapConstraints,
    params.capacityConstraints
  )

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
  slots: TimeSlot[]  // P3-3: Use TimeSlot directly instead of TimeSlotWithAvailability
  earliestCompletion: RFC3339DateTime | null  // RFC3339 datetime of earliest available slot end time
}

/**
 * Fit all time slots with availability status (all slots, marked as available/busy)
 * 
 * LEARNING: Generates ALL possible slots and marks them with availability status
 * WHY: Enables UI to render busy slots as inactive instead of hiding them
 * PATTERN: Uses unified availability manager for consistent slot generation (async)
 * 
 * P3-6: Renamed from fitTimeSlotsWithAvailability to fitAllTimeSlotsWithAvailability for clarity
 * 
 * This is the new unified approach that:
 * 1. Generates all slots based on business hours + increments
 * 2. Checks availability against calendar busy periods
 * 3. Checks capacity limits if configured
 * 4. Returns all slots with isAvailable flags
 * 
 * @param params - Parameters for fitting time slots
 * @returns Result with all slots (available + busy) and earliest available completion time
 */
export async function fitAllTimeSlotsWithAvailability(
  params: FitTimeSlotsParams,
  rangeConstraints?: RangeConstraint[],
  overlapConstraints?: OverlapConstraint[],
  capacityConstraints?: CapacityConstraint[]
): Promise<FitTimeSlotsResultWithAvailability> {
  // LEARNING: Use unified availability manager
  // WHY: Single source of truth for all availability logic
  // PATTERN: Delegate to availability manager with constraint arrays
  return await generateSlotsWithAvailability(
    {
      startBoundary: params.startBoundary,
      endBoundary: params.endBoundary,
      duration: params.duration,
      minuteIncrement: params.minuteIncrement,
      busyTimes: params.busyTimes,
      includeFlags: params.includeFlags
    },
    rangeConstraints || params.rangeConstraints,
    overlapConstraints || params.overlapConstraints,
    capacityConstraints || params.capacityConstraints
  )
}
