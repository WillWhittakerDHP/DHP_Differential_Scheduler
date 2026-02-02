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
} from './timeAvailabilityManager'
import type { RangeConstraint } from '@/configs/availabilitySettings'
import { createLogger } from '@/utils/logger'
import type { OverlapConstraint, CapacityConstraint } from './constraintExtractors'
import { validateSlotGenerationParams } from './slotGenerationValidation'
import { extractBusinessHoursMinutes } from '@/composables/useLocalTime'

const logger = createLogger('timeSlotFitter')

/**
 * Default include flags for TimeSlot objects
 * LEARNING: Explicit default values for includeFlags parameter
 * WHY: Clear, documented defaults that can be reused across the codebase
 * PATTERN: Exported constant that can be used by callers and tests
 */
export const DEFAULT_INCLUDE_FLAGS = {
  major: false,
  minor: false,
  moveable: false
} as const

/**
 * Business hours configuration for a single day
 * LEARNING: Uses RFC3339 format internally (with reference date for time-of-day)
 * WHY: Consistent format throughout codebase, matches Google Calendar API
 * PATTERN: RFC3339 datetime using fixed reference date (2000-01-01)
 */
interface DayBusinessHours {
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
export type BusinessHoursMap = Partial<Record<DayOfWeek, DayBusinessHours>>

export interface BusyTimeRange {
  start: RFC3339DateTime  // RFC3339 datetime string (ISO 8601 with timezone)
  end: RFC3339DateTime    // RFC3339 datetime string (ISO 8601 with timezone)
  placeId?: string        // Optional Google Place ID for drive time calculations (primary location identifier)
}

export interface FitTimeSlotsParams {
  startBoundary: RFC3339DateTime         // RFC3339 datetime - earliest possible start
  endBoundary: RFC3339DateTime           // RFC3339 datetime - latest possible end (slot must complete by this time)
  duration: number                       // Required duration in minutes
  businessHours?: BusinessHoursMap        // Business hours by day of week (optional if rangeConstraints provided)
  minuteIncrement: number                 // Usually 15
  busyTimes?: BusyTimeRange[]             // Optional exclusions
  includeFlags: {
    major: boolean
    minor: boolean
    moveable: boolean
  }
  rangeConstraints?: RangeConstraint[]
  overlapConstraints?: OverlapConstraint[]
  capacityConstraints?: CapacityConstraint[]
}

interface FitTimeSlotsResult {
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
  // PATTERN: Convert Date to string if needed, then parse
  let dateString: string
  if (dateInput instanceof Date) {
    // Validate Date object is valid
    if (isNaN(dateInput.getTime())) {
      logger.warn('Invalid Date object passed to parseUTCDate:', dateInput)
      return null
    }
    const year = dateInput.getUTCFullYear()
    const month = String(dateInput.getUTCMonth() + 1).padStart(2, '0')
    const day = String(dateInput.getUTCDate()).padStart(2, '0')
    dateString = `${year}-${month}-${day}`
  } else if (typeof dateInput === 'string') {
    dateString = dateInput
  } else {
    dateString = String(dateInput)
  }
  
  const datePart = dateString.includes('T') ? dateString.split('T')[0] : dateString
  
  // P2-8: Validate date string format (YYYY-MM-DD)
  // LEARNING: Validate format before parsing to prevent Invalid Date objects
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

export function parseTimeToMinutes(timeString: string): number {
  const [hours, minutes] = timeString.split(':').map(Number)
  return hours * 60 + minutes
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
  // PATTERN: Parse RFC3339 directly, extract UTC hours/minutes
  const startDate = new Date(dayHours.start as RFC3339DateTime)
  const endDate = new Date(dayHours.end as RFC3339DateTime)
  
  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    logger.warn(`Invalid RFC3339 datetime for day ${dayOfWeek}:`, dayHours)
    return null
  }
  
  // LEARNING: Business hours RFC3339 strings represent LOCAL time-of-day, not UTC
  // WHY: Admin sets business hours in their local timezone (e.g., "9 AM" = 9 AM local)
  // PATTERN: Use useLocalTime composable to extract local time-of-day
  const startTime = extractBusinessHoursMinutes(dayHours.start as RFC3339DateTime)
  const endTime = extractBusinessHoursMinutes(dayHours.end as RFC3339DateTime)
  const startHour = startTime.hours
  const startMinute = startTime.minutes
  const endHour = endTime.hours
  const endMinute = endTime.minutes

  if (isNaN(startHour) || isNaN(startMinute) || isNaN(endHour) || isNaN(endMinute)) {
    return null
  }

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
export async function fitAvailableTimeSlots(params: FitTimeSlotsParams): Promise<FitTimeSlotsResult> {
  const {
    startBoundary,
    endBoundary,
    duration,
    businessHours,
    minuteIncrement,
    busyTimes = [],
    includeFlags
  } = params

  // PATTERN: Use validateSlotGenerationParams to eliminate duplicate validation logic
  validateSlotGenerationParams({
    duration,
    minuteIncrement,
    startBoundary,
    endBoundary
  })

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

  // Validate business hours - either from params or from rangeConstraints
  const effectiveBusinessHours = businessHours || 
    (params.rangeConstraints?.find(rc => rc.type === 'businessHours')?.config as { hours?: BusinessHoursMap } | undefined)?.hours
  
  if (!effectiveBusinessHours || typeof effectiveBusinessHours !== 'object') {
    throw new Error('businessHours must be provided either directly or via rangeConstraints.businessHours.config.hours')
  }

  const hasAnyHours = Object.keys(effectiveBusinessHours).length > 0
  if (!hasAnyHours) {
    return { slots: [], earliestCompletion: null }
  }

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

  // PATTERN: Filter slots where isAvailable === true
  const availableSlots = result.slots.filter(slot => slot.isAvailable)

  // PATTERN: Use earliestCompletion directly from result
  return {
    slots: availableSlots,
    earliestCompletion: result.earliestCompletion
  }
}

interface FitTimeSlotsResultWithAvailability {
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
  capacityConstraints?: CapacityConstraint[],
  options?: {
    defaultLocation?: import('@/configs/availabilitySettings').DefaultLocation
    calendarEvents?: import('@/services/calendarApiService').CalendarEvent[]
    driveTimeDataSource?: 'default' | 'api' | 'both' | 'none'
  }
): Promise<FitTimeSlotsResultWithAvailability> {
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
    capacityConstraints || params.capacityConstraints,
    undefined, // now parameter
    options
  )
}
