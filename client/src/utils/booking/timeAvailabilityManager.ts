/**
 * Time Availability Manager
 * 
 * LEARNING: Unified utility for handling all free/busy period logic
 * WHY: Single source of truth for availability calculations (business hours, increments, calendar busy)
 * PATTERN: Pure utility functions - no side effects, no reactivity
 * 
 * This module consolidates all availability logic:
 * - Business hours (from AvailabilitySettings)
 * - Minute increments (from AvailabilitySettings)
 * - Calendar busy periods (from Google Calendar API or mock)
 * - Boundary constraints (date range limits)
 * 
 * ============================================================================
 * TIMEZONE STRATEGY (P0-2)
 * ============================================================================
 * 
 * 1. Boundaries (startBoundary, endBoundary): RFC3339 UTC strings
 *    - All boundary times are stored and passed as UTC ISO strings
 *    - Format: "2026-01-15T14:00:00Z" (RFC3339 with Z suffix for UTC)
 *    - WHY: Ensures consistent timezone handling across client and server
 * 
 * 2. Business Hours: RFC3339 with reference date (2000-01-01), interpreted as local time-of-day
 *    - Format: "2000-01-01T09:00:00Z" represents "9:00 AM" in local timezone
 *    - Admin sets business hours in their local timezone (e.g., "9 AM" = 9 AM local)
 *    - WHY: Business hours are time-of-day values, not absolute times
 * 
 * 3. Slot Generation:
 *    - Iterate days using UTC date components (to handle DST correctly)
 *    - Create slot times in LOCAL timezone (business hours are local)
 *    - Convert to UTC via toISOString() for storage and API communication
 *    - WHY: Ensures slots align with local business hours while maintaining UTC consistency
 * 
 * 4. Busy Periods: Always UTC (from Google Calendar API)
 *    - Google Calendar API returns busy periods in UTC
 *    - All busy period comparisons use UTC Date objects
 *    - WHY: Calendar APIs standardize on UTC for consistency
 * 
 * 5. Client-Server Consistency:
 *    - Client generates slots in local timezone, converts to UTC for API
 *    - Server receives UTC boundaries and converts to admin timezone for display
 *    - Both use UTC internally for calculations and comparisons
 *    - WHY: Prevents timezone mismatches between client and server
 * 
 * This ensures:
 * - Business hours work correctly regardless of timezone
 * - Slots align with local business hours
 * - Busy periods (UTC) can be compared with slots (UTC) correctly
 * - Client and server maintain consistency through UTC as the common format
 */

import type { TimeSlot } from '@/types/appointment'
import type { RFC3339DateTime, DayOfWeek } from '@/types/datetime'
import {
  type BusinessHoursMap,
  type BusyTimeRange,
  timeRangesOverlap,
  parseBusinessHours
} from './timeSlotFitter'
import { validateSlotGenerationParams } from './slotGenerationValidation'
import apiClient from '@/utils/api'
import type {
  RangeConstraint
} from '@/configs/availabilitySettings'
import type {
  OverlapConstraint,
  CapacityConstraint
} from './constraintExtractors'
import {
  validateRangeConstraint,
  validateOverlapConstraint,
  validateCapacityConstraint
} from './constraintExtractors'
import { rfc3339ToLocalMinutesFromMidnight } from '@/composables/useLocalTime'
import { RANGE_CONSTRAINT_TYPES, TIME_BASIS_TYPES } from '@/constants/constraintTypes'

/**
 * Custom error for constraint validation failures
 * LEARNING: Structured error type for hard failures with UI notification support
 * WHY: Allows callers to distinguish constraint errors from other errors
 * PATTERN: Extend Error with additional metadata
 */
export class ConstraintValidationError extends Error {
  constructor(
    message: string,
    public readonly constraintType: 'range' | 'overlap' | 'capacity',
    public readonly constraintIndex: number,
    public readonly validationError?: string
  ) {
    super(message)
    this.name = 'ConstraintValidationError'
  }
}

/**
 * P3-3: Removed redundant TimeSlotWithAvailability interface
 * LEARNING: TimeSlot already has isAvailable: boolean as required field
 * WHY: Eliminates redundant type definition
 * PATTERN: Use TimeSlot directly instead of extending it
 */

/**
 * Pre-parsed busy period with Date objects
 * LEARNING: Cache Date object creation for performance
 * WHY: Avoids re-parsing same busy periods for every slot check
 * PATTERN: Parse once at start, use cached Date objects throughout
 */
interface ParsedBusyTimeRange {
  start: Date
  end: Date
}

/**
 * Validate a single busy period
 * LEARNING: Check that start < end and times are valid
 * WHY: Invalid busy periods can cause incorrect availability
 * PATTERN: Validate before pre-processing, log errors
 * 
 * @param busy - Busy period to validate
 * @returns true if valid, false otherwise
 */
function validateBusyPeriod(busy: BusyTimeRange): boolean {
  const start = new Date(busy.start)
  const end = new Date(busy.end)
  
  // Check Date objects are valid
  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return false
  }
  
  // Check start < end
  if (start >= end) {
    return false
  }
  
  return true
}

/**
 * Sort busy periods by start time
 * LEARNING: Sorted busy periods enable efficient merging
 * WHY: Merging requires chronological order
 * PATTERN: Sort in place or create sorted copy
 * 
 * @param busyTimes - Busy periods to sort
 * @returns Sorted busy periods (by start time)
 */
function sortBusyPeriods(busyTimes: BusyTimeRange[]): BusyTimeRange[] {
  return [...busyTimes].sort((a, b) => {
    const aStart = new Date(a.start)
    const bStart = new Date(b.start)
    return aStart.getTime() - bStart.getTime()
  })
}

/**
 * Merge overlapping or adjacent busy periods
 * LEARNING: Reduces number of overlap checks during slot generation
 * WHY: Merging [10:00-11:00, 10:30-12:00] → [10:00-12:00] reduces checks
 * PATTERN: Use reduce to build merged array immutably
 * 
 * @param sortedBusyTimes - Busy periods sorted by start time
 * @returns Merged busy periods (non-overlapping)
 */
function mergeBusyPeriods(sortedBusyTimes: BusyTimeRange[]): BusyTimeRange[] {
  if (sortedBusyTimes.length === 0) return []
  
  // LEARNING: Use reduce to build merged array immutably
  // WHY: Avoids array mutations (push) and object mutations (property assignment)
  // PATTERN: Reduce with accumulator that creates new objects instead of mutating
  return sortedBusyTimes.slice(1).reduce((merged, current) => {
    const lastMerged = merged[merged.length - 1]
    const lastEnd = new Date(lastMerged.end)
    const currentStart = new Date(current.start)
    const currentEnd = new Date(current.end)
    
    // Check if current overlaps or is adjacent to lastMerged
    if (currentStart <= lastEnd) {
      // Merge: extend lastMerged.end to max(lastMerged.end, current.end)
      if (currentEnd > lastEnd) {
        // LEARNING: Create new object instead of mutating existing
        // WHY: Immutable pattern - don't mutate objects in arrays
        // PATTERN: Replace last element with new merged object
        return [
          ...merged.slice(0, -1),
          { ...lastMerged, end: current.end }
        ]
      }
      return merged
    } else {
      // No overlap, add as new merged period
      return [...merged, { ...current }]
    }
  }, [{ ...sortedBusyTimes[0] }])
}

/**
 * Pre-process busy periods: validate, sort, and merge
 * LEARNING: Single function that prepares busy periods for slot generation
 * WHY: Ensures busy periods are valid and optimized before slot checks
 * PATTERN: Validate → Sort → Merge → Return processed periods
 * 
 * @param busyTimes - Raw busy periods from calendar or user input
 * @returns Validated, sorted, and merged busy periods
 */
export function preprocessBusyPeriods(busyTimes: BusyTimeRange[]): BusyTimeRange[] {
  if (busyTimes.length === 0) return []
  
  // Step 1: Validate and filter invalid periods
  const validBusyTimes = busyTimes.filter(validateBusyPeriod)
  
  if (validBusyTimes.length === 0) return []
  
  // Step 2: Sort by start time
  const sortedBusyTimes = sortBusyPeriods(validBusyTimes)
  
  // Step 3: Merge overlapping periods
  const mergedBusyTimes = mergeBusyPeriods(sortedBusyTimes)
  
  return mergedBusyTimes
}

/**
 * Parse busy periods to Date objects once
 * LEARNING: Performance optimization - parse busy periods once at start
 * WHY: Avoid creating new Date objects inside loops (50-80% reduction)
 * PATTERN: Map busy periods to cached Date objects before slot generation
 */
function parseBusyPeriods(busyTimes: BusyTimeRange[]): ParsedBusyTimeRange[] {
  return busyTimes.map(busy => ({
    start: new Date(busy.start),
    end: new Date(busy.end),
    original: busy
  }))
}

/**
 * Result from availability manager
 */
interface AvailabilityManagerResult {
  slots: TimeSlot[]  // P3-3: Use TimeSlot directly instead of TimeSlotWithAvailability
  earliestCompletion: RFC3339DateTime | null  // RFC3339 datetime of earliest available slot end time
}

/**
 * Parameters for generating slots with availability
 */
interface GenerateSlotsWithAvailabilityParams {
  startBoundary: RFC3339DateTime         // RFC3339 datetime - earliest possible start
  endBoundary: RFC3339DateTime           // RFC3339 datetime - latest possible end
  duration: number                        // Required duration in minutes
  minuteIncrement: number                 // Usually 15
  busyTimes?: BusyTimeRange[]             // Calendar busy periods
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
 * Parsed business hours cache type
 */
type ParsedBusinessHoursCache = Map<DayOfWeek, ReturnType<typeof parseBusinessHours>>

/**
 * Check if a slot passes all range constraints
 * LEARNING: Unified function for checking time-based restrictions (business hours, leadTime, dateRange)
 * WHY: Single pathway for all range constraints, consolidates business hours, boundaries, and leadTime checking
 * PATTERN: Check each constraint type based on enforcement level, return violations for flexible constraints
 * 
 * @param slot - Slot to check
 * @param constraints - Array of range constraints to check
 * @param now - Current time (for leadTime constraint)
 * @param businessHoursCache - Optional cache of parsed business hours by day of week
 * @returns Object with passes boolean and violations array
 */
export function checkRangeConstraints(
  slot: TimeSlot,
  constraints: RangeConstraint[],
  now: Date = new Date(),
  businessHoursCache?: ParsedBusinessHoursCache,
  dates?: { start: Date; end: Date },
  _allSlots?: TimeSlot[]
): { passes: boolean; violations: string[] } {
  if (constraints.length === 0) {
    return { passes: true, violations: [] }
  }

  // LEARNING: Use cached Date objects if provided, otherwise create new ones
  // WHY: Avoids redundant Date object creation when dates are already computed
  // PATTERN: Accept optional cached dates parameter
  const slotStart = dates?.start || new Date(slot.startTime)
  const slotEnd = dates?.end || new Date(slot.endTime)

  /**
   * LEARNING: Extract constraint checking logic to pure function
   * WHY: Separates constraint evaluation from violation collection
   * PATTERN: Pure function returns passes boolean
   */
  const checkConstraint = (constraint: RangeConstraint): boolean => {
    switch (constraint.type) {
      case RANGE_CONSTRAINT_TYPES.BUSINESS_HOURS: {
        const config = constraint.config as { hours: BusinessHoursMap }
        
        // LEARNING: Use UTC day of week for business hours check
        // WHY: All business rules are UTC-only; UI performs the only localization
        // PATTERN: Use getUTCDay() for UTC day, not getDay()
        const dayOfWeek = slotStart.getUTCDay() as DayOfWeek
        const dayHours = config.hours[dayOfWeek]

        if (!dayHours) {
          // No business hours for this day - block if hard enforcement
          return constraint.enforcement !== 'hard'
        } else {
          // LEARNING: Use cached parsed hours if available, otherwise parse and cache
          // WHY: Avoids re-parsing same business hours for every slot on the same day
          // PATTERN: Check cache first, parse if not cached, use cached result
          let parsedHours: ReturnType<typeof parseBusinessHours> | null = null
          
          if (businessHoursCache && businessHoursCache.has(dayOfWeek)) {
            parsedHours = businessHoursCache.get(dayOfWeek)!
          } else {
            parsedHours = parseBusinessHours(dayHours, dayOfWeek)
            if (businessHoursCache && parsedHours) {
              businessHoursCache.set(dayOfWeek, parsedHours)
            }
          }

          if (!parsedHours) {
            throw new Error(`Failed to parse business hours for day ${dayOfWeek}`)
          }

          // LEARNING: Convert slot times to minutes from midnight (LOCAL time)
          // WHY: Business hours are interpreted as local time-of-day, so we must compare slots in local time
          // PATTERN: Use useLocalTime composable to convert RFC3339 to local minutes from midnight
          // NOTE: Slots are stored as UTC RFC3339, but represent local business hours, so we convert to local for comparison
          const slotStartMinutes = rfc3339ToLocalMinutesFromMidnight(slot.startTime)
          const slotEndMinutes = rfc3339ToLocalMinutesFromMidnight(slot.endTime)

          // Check if slot is within business hours (both in LOCAL time-of-day)
          return slotStartMinutes >= parsedHours.dayStartMinutes &&
                   slotEndMinutes <= parsedHours.dayEndMinutes
        }
      }

      case RANGE_CONSTRAINT_TYPES.LEAD_TIME: {
        // Check if slot starts at least leadTime minutes after now
        // LEARNING: Only apply leadTime to slots on or after today
        // WHY: Past dates shouldn't be blocked by leadTime - they're already in the past
        // PATTERN: Check if slot date is today or future before applying leadTime
        // LEARNING: Compare local times for leadTime constraint
        // WHY: Slots are UTC representations of local business hours, so we need to compare against local "now"
        // PATTERN: Slots store UTC times that represent local times, so we compare the UTC timestamps directly
        //          but we need to ensure we're comparing the right "now" - the local now converted to UTC
        const config = constraint.config as { minutes: number }
        
        // Check if slot is on or after today (ignore time, just compare dates) - use UTC dates
        const slotDateOnly = new Date(Date.UTC(slotStart.getUTCFullYear(), slotStart.getUTCMonth(), slotStart.getUTCDate()))
        const todayDateOnly = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
        
        if (slotDateOnly < todayDateOnly) {
          // Slot is in the past - don't apply leadTime constraint
          return true
        } else {
          // Slot is today or future - apply leadTime constraint
          // LEARNING: Compare UTC timestamps directly - both slotStart and now are UTC
          // WHY: Slots are UTC timestamps representing local times, and "now" is also UTC
          //      The comparison works correctly because both represent absolute moments in time
          // PATTERN: Calculate minStartTime in UTC, compare directly with slotStart (also UTC)
          const minStartTime = new Date(now.getTime() + config.minutes * 60 * 1000)
          return slotStart >= minStartTime
        }
      }

      case RANGE_CONSTRAINT_TYPES.DATE_RANGE: {
        // Check if slot is within date range boundaries (all UTC)
        const config = constraint.config as { start: string; end: string }
        const rangeStart = new Date(config.start)
        const rangeEnd = new Date(config.end)
        
        return slotStart >= rangeStart && slotEnd <= rangeEnd
      }
    }
  }

  // LEARNING: Use reduce to collect violations functionally
  // WHY: Avoids array mutations (push) - builds violations array immutably
  // PATTERN: Filter constraints, check each, collect violations, check for hard failures
  const activeConstraints = constraints.filter(c => c.enforcement !== 'off')
  
  // Check for hard enforcement failures first (early return)
  const hardFailure = activeConstraints.find(
    constraint => constraint.enforcement === 'hard' && !checkConstraint(constraint)
  )
  if (hardFailure) {
    return { passes: false, violations: [] }
  }

  // Collect flexible violations functionally
  const violations = activeConstraints
    .filter(constraint => 
      constraint.enforcement === 'flexible' && !checkConstraint(constraint)
    )
    .map(constraint => `range.${constraint.type}`)

  return { passes: true, violations }
}

/**
 * Check if a slot overlaps with any busy periods
 * LEARNING: Unified function for checking overlap constraints (buffers) with all buffer types
 * WHY: Single pathway for all overlap prevention, consolidates appointment, driveTime, and lunch buffers
 * PATTERN: Check each constraint individually to accurately attribute violations to the specific constraint that caused overlap
 * 
 * @param slotStart - Slot start time as Date
 * @param slotEnd - Slot end time as Date
 * @param parsedBusyTimes - Array of pre-parsed busy time ranges with cached Date objects
 * @param overlapConstraints - Array of overlap constraints (buffers) to apply
 * @returns Object with available boolean and violations array
 */
export function checkSlotAvailability(
  slotStart: Date,
  slotEnd: Date,
  parsedBusyTimes: ParsedBusyTimeRange[],
  overlapConstraints?: OverlapConstraint[]
): { available: boolean; violations: string[] } {
  if (parsedBusyTimes.length === 0) {
    return { available: true, violations: [] }
  }

  // If no overlap constraints, check basic overlap
  if (!overlapConstraints || overlapConstraints.length === 0) {
    const overlapsBusy = parsedBusyTimes.some(busy => {
      return timeRangesOverlap(
        { start: slotStart, end: slotEnd },
        { start: busy.start, end: busy.end }
      )
    })
    return { available: !overlapsBusy, violations: [] }
  }

  // LEARNING: Use functional approach to collect violations
  // WHY: Avoids array mutations (push) - builds violations array immutably
  // PATTERN: Filter constraints, check overlaps, collect violations, check for hard failures
  
  /**
   * LEARNING: Extract constraint overlap check to pure function
   * WHY: Separates overlap checking logic from violation collection
   * PATTERN: Pure function returns boolean
   */
  const checkConstraintOverlap = (constraint: OverlapConstraint): boolean => {
    const bufferMs = constraint.minutes * 60 * 1000
    let checkStart = slotStart
    let checkEnd = slotEnd

    if (constraint.placement === 'before' || constraint.placement === 'both') {
      checkStart = new Date(slotStart.getTime() - bufferMs)
    }

    if (constraint.placement === 'after' || constraint.placement === 'both') {
      checkEnd = new Date(slotEnd.getTime() + bufferMs)
    }

    return parsedBusyTimes.some(busy => {
      return timeRangesOverlap(
        { start: checkStart, end: checkEnd },
        { start: busy.start, end: busy.end }
      )
    })
  }

  // Check for hard enforcement failures first (early return)
  const hardFailure = overlapConstraints.find(
    constraint => constraint.enforcement === 'hard' && checkConstraintOverlap(constraint)
  )
  if (hardFailure) {
    return { available: false, violations: [] }
  }

  // Collect flexible violations functionally
  const violations = overlapConstraints
    .filter(constraint => 
      constraint.enforcement === 'flexible' && checkConstraintOverlap(constraint)
    )
    .map(constraint => `overlap.${constraint.type}`)

  // If we have flexible violations but no hard blocks, allow the slot
  return { available: true, violations }
}

/**
 * Generate all possible time slots based on business hours and increments
 * 
 * LEARNING: Generates ALL slots first, then availability is checked separately
 * WHY: Ensures consistent slot generation regardless of busy periods
 * PATTERN: Pure function that generates slots without filtering
 * 
 * DESIGN DECISION: Generate All Then Filter vs. Filter During Generation
 * -----------------------------------------------------------------------
 * This function uses the "generate all then filter" approach rather than 
 * filtering during generation. Benefits:
 * 
 * 1. CONSISTENCY: Generates same slots regardless of busy periods
 * 2. UI FLEXIBILITY: Allows showing unavailable slots (grayed out)
 * 3. DEBUGGING: Easier to see all potential slots vs. filtered slots
 * 4. TESTABILITY: Can test generation and filtering separately
 * 5. PERFORMANCE: Only parses busy periods once (with caching optimization)
 * 
 * Alternative approach (filter during generation) has drawbacks:
 * - Harder to debug (can't see filtered-out slots)
 * - UI can't show unavailable times
 * - Tightly couples generation with availability logic
 * 
 * RELATED: See Issue #12 in AVAILABILITY_REFACTOR_ANALYSIS.md
 * 
 * @param params - Parameters for slot generation
 * @returns Array of all possible slots (without availability flags)
 */
function generateAllTimeSlots(params: GenerateSlotsWithAvailabilityParams): TimeSlot[] {
  const {
    startBoundary,
    endBoundary,
    duration,
    minuteIncrement,
    includeFlags
  } = params

  // P2-5: Use shared slot generation validation
  // LEARNING: Comprehensive input validation prevents invalid slot generation
  // WHY: Invalid inputs can cause infinite loops, incorrect calculations, or runtime errors
  // PATTERN: Use validateSlotGenerationParams to eliminate duplicate validation logic
  try {
    validateSlotGenerationParams({
      duration,
      minuteIncrement,
      startBoundary,
      endBoundary
    })
  } catch (error) {
    // Re-throw validation errors as-is
    throw error
  }

  // LEARNING: Cache boundary Date objects before loop
  // WHY: Avoid creating same Date objects repeatedly in loop
  // PATTERN: Parse once at start, reuse throughout function
  const startBoundaryDate = new Date(startBoundary)
  const endBoundaryDate = new Date(endBoundary)

  // Validate boundaries: start < end (return empty array if invalid)
  if (startBoundaryDate >= endBoundaryDate) {
    return []
  }

  const slots: TimeSlot[] = []

  // Iterate through each day from startBoundary to endBoundary
  // LEARNING: Generate slots based only on boundaries and minuteIncrement
  // WHY: Business hours and dateRange are enforced in checkRangeConstraints, not during generation
  // PATTERN: Generate all slots at minuteIncrement intervals between boundaries
  const startDateOnly = new Date(startBoundaryDate)
  startDateOnly.setUTCHours(0, 0, 0, 0)
  
  const endDateOnly = new Date(endBoundaryDate)
  endDateOnly.setUTCHours(0, 0, 0, 0)
  endDateOnly.setUTCDate(endDateOnly.getUTCDate() + 1)
  
  const currentDate = new Date(startDateOnly)

  while (currentDate < endDateOnly) {
    // Generate slots for this day starting at midnight UTC
    const dayStart = new Date(currentDate)
    dayStart.setUTCHours(0, 0, 0, 0)
    
    const dayEnd = new Date(currentDate)
    dayEnd.setUTCHours(23, 59, 59, 999)
    
    // Clamp to actual boundaries
    const slotStartBoundary = dayStart < startBoundaryDate ? startBoundaryDate : dayStart
    const slotEndBoundary = dayEnd > endBoundaryDate ? endBoundaryDate : dayEnd
    
    // LEARNING: Always start slot generation at increment boundaries from midnight UTC
    // WHY: All days (including today) must start at increment boundaries (:00, :15, :30, :45)
    //      Slot generation is time-agnostic - current time filtering happens in constraint checking
    // PATTERN: If slotStartBoundary is clamped to startBoundaryDate, round UP to next increment boundary
    let currentSlotStart = new Date(dayStart) // Start from midnight at :00
    if (slotStartBoundary > dayStart) {
      // Calculate minutes since midnight
      const minutesSinceMidnight = slotStartBoundary.getUTCHours() * 60 + slotStartBoundary.getUTCMinutes()
      // Round UP to next increment boundary from midnight (or use current if already on boundary)
      const roundedMinutes = Math.ceil(minutesSinceMidnight / minuteIncrement) * minuteIncrement
      // Set time from midnight
      currentSlotStart.setUTCMinutes(roundedMinutes)
    }
    
    while (currentSlotStart < slotEndBoundary) {
      const slotEnd = new Date(currentSlotStart)
      slotEnd.setUTCMinutes(slotEnd.getUTCMinutes() + duration)
      
      // Only add slot if it fits within boundaries
      if (slotEnd <= endBoundaryDate) {
        const slot: TimeSlot = {
          startTime: currentSlotStart.toISOString() as RFC3339DateTime,
          endTime: slotEnd.toISOString() as RFC3339DateTime,
          duration,
          onSite: includeFlags.onSite,
          clientPresent: includeFlags.clientPresent,
          moveable: includeFlags.moveable,
          isAvailable: false  // Will be updated by markSlotAvailability
        }
        
        slots.push(slot)
      }
      
      // Move to next interval
      currentSlotStart = new Date(currentSlotStart)
      currentSlotStart.setUTCMinutes(currentSlotStart.getUTCMinutes() + minuteIncrement)
    }

    // Move to next day
    currentDate.setUTCDate(currentDate.getUTCDate() + 1)
  }

  return slots
}

/**
 * Extract date string (YYYY-MM-DD) from RFC3339 datetime
 * LEARNING: Helper to get date component for capacity checking
 * WHY: Capacity checks need date-only values, not full timestamps
 * PATTERN: Extract date portion from ISO string
 */
function extractDateFromRFC3339(rfc3339: RFC3339DateTime): string {
  return rfc3339.split('T')[0]
}

/**
 * Capacity key parts structure
 * LEARNING: Structured representation of capacity keys eliminates string parsing fragility
 * WHY: Type-safe key handling, easier to extend and test
 * PATTERN: Use structured object internally, convert to string only for Map keys
 */
type CapacityKeyParts = {
  type: 'daily' | 'calendarWeek' | 'rollingWeek'
  date: string
  direction?: 'past' | 'centered' | 'future'
}

/**
 * Build capacity key parts for a constraint and slot date
 * LEARNING: Centralized key generation eliminates duplication
 * WHY: Single source of truth for capacity key format
 * PATTERN: Pure function that generates structured key parts
 * 
 * @param constraint - Capacity constraint to build key for
 * @param slotDate - Date string (YYYY-MM-DD) extracted from slot
 * @returns Structured capacity key parts
 */
function buildCapacityKey(constraint: CapacityConstraint, slotDate: string): CapacityKeyParts {
  return {
    type: constraint.type,
    date: slotDate,
    direction: constraint.type === 'rollingWeek' ? (constraint.direction || 'past') : undefined
  }
}

/**
 * Convert capacity key parts to string for Map usage
 * LEARNING: Single conversion point for key stringification
 * WHY: Ensures consistent string format across all usage
 * PATTERN: Convert structured parts to string only when needed for Map keys
 * 
 * @param parts - Capacity key parts to convert
 * @returns String representation of capacity key
 */
function capacityKeyToString(parts: CapacityKeyParts): string {
  if (parts.direction) {
    return `${parts.type}:${parts.date}:${parts.direction}`
  }
  return `${parts.type}:${parts.date}`
}

/**
 * Merge violations with existing flexible violations
 * LEARNING: Centralized violation merging ensures consistency
 * WHY: Single source of truth for violation handling
 * PATTERN: Pure function that merges and formats violations
 * 
 * @param existing - Existing violations array (may be undefined)
 * @param newViolations - New violations to merge
 * @param passes - Whether the constraint check passed (default: true)
 * @returns Object with hasFlexibleViolations flag and merged violations array
 */
function mergeViolations(
  existing: string[] | undefined,
  newViolations: string[],
  passes: boolean = true
): { hasFlexibleViolations: boolean; flexibleViolations: string[] | undefined } {
  // LEARNING: When passes is false (hard fail), preserve existing violations
  // WHY: UI may want to display all constraint issues even if slot is blocked
  // PATTERN: Keep existing violations for display, don't merge new ones
  if (!passes) {
    return {
      hasFlexibleViolations: existing ? existing.length > 0 : false,
      flexibleViolations: existing
    }
  }
  const allViolations = [...(existing || []), ...newViolations]
  return {
    hasFlexibleViolations: allViolations.length > 0,
    flexibleViolations: allViolations.length > 0 ? allViolations : undefined
  }
}

/**
 * Cache entry with timestamp for TTL checking
 * LEARNING: Stores value with timestamp to enable automatic expiry
 * WHY: Prevents stale cache data from persisting indefinitely
 * PATTERN: Object with value and timestamp
 */
interface CacheEntry {
  value: number
  timestamp: number
}

/**
 * Cache TTL in milliseconds (5 minutes)
 * LEARNING: Configurable cache expiry time
 * WHY: Balances freshness with performance (avoids excessive API calls)
 * PATTERN: Constant for easy adjustment
 */
const CACHE_TTL_MS = 5 * 60 * 1000 // 5 minutes

/**
 * Cache for scheduled hours by date/week
 * LEARNING: Avoids redundant API calls for same date/week
 * WHY: Multiple slots may share same date/week, cache results
 * PATTERN: Map with date/week key to CacheEntry (value + timestamp)
 */
const scheduledHoursCache = new Map<string, CacheEntry>()

// Removed unused function: clearScheduledHoursCache
// LEARNING: Function was declared but never used
// WHY: Removes dead code to improve maintainability

/**
 * Get cached value if it exists and hasn't expired
 * LEARNING: Checks TTL before returning cached value
 * WHY: Ensures cache entries expire automatically
 * PATTERN: Check timestamp, delete if expired, return value if valid
 * 
 * @param key - Cache key to look up
 * @returns Cached value or undefined if not found/expired
 */
function getCachedValue(key: string): number | undefined {
  const entry = scheduledHoursCache.get(key)
  if (!entry) return undefined
  
  // Check TTL
  if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
    scheduledHoursCache.delete(key)
    return undefined
  }
  
  return entry.value
}

/**
 * Set cached value with current timestamp
 * LEARNING: Stores value with timestamp for TTL checking
 * WHY: Enables automatic cache expiry
 * PATTERN: Store object with value and timestamp
 * 
 * @param key - Cache key to store
 * @param value - Value to cache
 */
function setCachedValue(key: string, value: number): void {
  scheduledHoursCache.set(key, { value, timestamp: Date.now() })
}

/**
 * Fetch scheduled hours for a specific date
 * LEARNING: Calls GET /availability/scheduled-hours API endpoint to get scheduled hours, with caching
 * WHY: Capacity checking needs current scheduled hours from database appointments
 * PATTERN: Check cache first, call API if not cached, cache result
 * 
 * ASYNCHRONOUS WORKFLOW SUPPORT:
 * - Calls GET /availability/scheduled-hours endpoint which queries database appointments
 * - Endpoint returns hours from appointments with status 'submitted' or 'confirmed' (not Google Calendar events)
 * - Supports asynchronous appointment creation workflow where appointments exist in DB before calendar sync
 * - See: client/src/types/appointment.ts for AppointmentStatus union type definition
 */
async function fetchScheduledHoursForDate(date: string): Promise<number> {
  const cacheKey = `date:${date}`
  const cached = getCachedValue(cacheKey)
  if (cached !== undefined) {
    return cached
  }

  const response = await apiClient.get('/availability/scheduled-hours', {
    params: { date }
  })
  const hours = response.data.hours || 0
  setCachedValue(cacheKey, hours)
  return hours
}

/**
 * Fetch scheduled hours for calendar week containing date
 * LEARNING: Calls API to get scheduled hours for Monday-Sunday week
 * WHY: Calendar week capacity filter needs weekly hours
 * PATTERN: Check cache first, call API if not cached, cache result
 */
async function fetchScheduledHoursForCalendarWeek(date: string): Promise<number> {
  const cacheKey = `calendarWeek:${date}`
  const cached = getCachedValue(cacheKey)
  if (cached !== undefined) {
    return cached
  }

  const response = await apiClient.get('/availability/scheduled-hours', {
    params: { calendarWeek: date }
  })
  const hours = response.data.hours || 0
  setCachedValue(cacheKey, hours)
  return hours
}

/**
 * Fetch scheduled hours for rolling week
 * LEARNING: Calls GET /availability/scheduled-hours API endpoint to get scheduled hours for rolling 7-day window, with caching
 * WHY: Rolling week capacity filter needs rolling window hours from database appointments
 * PATTERN: Check cache first, call API if not cached, cache result
 * 
 * ASYNCHRONOUS WORKFLOW SUPPORT:
 * - Calls GET /availability/scheduled-hours endpoint which queries database appointments
 * - Endpoint returns hours from appointments with status 'submitted' or 'confirmed' (not Google Calendar events)
 * - Supports asynchronous appointment creation workflow where appointments exist in DB before calendar sync
 * - See: client/src/types/appointment.ts for AppointmentStatus union type definition
 */
async function fetchScheduledHoursForRollingWeek(
  date: string,
  direction: 'past' | 'centered' | 'future'
): Promise<number> {
  const cacheKey = `rollingWeek:${date}:${direction}`
  const cached = getCachedValue(cacheKey)
  if (cached !== undefined) {
    return cached
  }

  const response = await apiClient.get('/availability/scheduled-hours', {
    params: { rollingWeek: date, direction }
  })
  const hours = response.data.hours || 0
  setCachedValue(cacheKey, hours)
  return hours
}

/**
 * LEARNING: Constraint checking has mixed sync/async patterns
 * 
 * - checkRangeConstraints: Synchronous (no external data needed)
 *   - Business hours, leadTime, and dateRange checks use only local data
 *   - Fast and deterministic
 * 
 * - checkSlotAvailability: Synchronous (uses pre-parsed busy times)
 *   - Overlap checks use cached Date objects from pre-processing
 *   - Fast and deterministic
 * 
 * - applyCapacityFilters: Async (requires API call for scheduled hours)
 *   - Capacity checking needs real-time data from server
 *   - Batching already partially addresses performance (fetch once per unique date/week)
 * 
 * WHY: Capacity checking needs real-time data from server that changes as appointments are created/deleted.
 * 
 * FUTURE: Consider pre-fetching all capacity data in batches at start of slot generation
 * to enable fully synchronous constraint checking. This would require:
 * - Collecting all unique dates/weeks before slot generation
 * - Fetching all capacity data upfront
 * - Passing capacity data to synchronous check function
 * 
 * This architectural inconsistency is acceptable for now because:
 * - Batching minimizes API calls (one per unique date/week, not per slot)
 * - Capacity checks only run for available slots (already filtered by sync checks)
 * - The async nature is isolated to capacity checking only
 */

/**
 * Mark slots with availability status
 * LEARNING: Checks each slot against busy periods and overlap constraints, adds availability flag
 * WHY: Separates slot generation from availability checking
 * PATTERN: Map over slots, check availability with overlap constraints, add flag
 * 
 * @param slots - Array of slots to mark
 * @param parsedBusyTimes - Array of pre-parsed busy time ranges with cached Date objects
 * @param overlapConstraints - Optional array of overlap constraints (buffers) to apply
 * @returns Slots with isAvailable flag
 */
export function markSlotAvailability(
  slots: TimeSlot[],
  parsedBusyTimes: ParsedBusyTimeRange[],
  overlapConstraints?: OverlapConstraint[],
  dateCache?: Map<string, { start: Date; end: Date }>
): TimeSlot[] {
  return slots.map((slot) => {
    // LEARNING: Use cached Date objects if provided, otherwise create new ones
    // WHY: Avoids redundant Date object creation when dates are already computed
    // PATTERN: Accept optional date cache map using slot.startTime as key
    const cachedDates = dateCache?.get(slot.startTime)
    const slotStart = cachedDates?.start || new Date(slot.startTime)
    const slotEnd = cachedDates?.end || new Date(slot.endTime)
    const availabilityResult = checkSlotAvailability(slotStart, slotEnd, parsedBusyTimes, overlapConstraints)
    
    const mergedViolations = mergeViolations(slot.flexibleViolations, availabilityResult.violations, availabilityResult.available)
    
    return {
      ...slot,
      isAvailable: availabilityResult.available,
      hasFlexibleViolations: mergedViolations.hasFlexibleViolations,
      flexibleViolations: mergedViolations.flexibleViolations
    }
  })
}

/**
 * Apply capacity filters to slots
 * LEARNING: Checks capacity limits for each slot and updates availability flag
 * WHY: Separates capacity checking from busy period checking
 * PATTERN: Batch capacity checks by unique date/week keys to reduce API calls
 * 
 * ============================================================================
 * ASYNCHRONOUS APPOINTMENT CREATION WORKFLOW SUPPORT
 * ============================================================================
 * 
 * This function applies capacity constraints by calling the server endpoint
 * GET /availability/scheduled-hours, which queries database appointments directly
 * (not Google Calendar events). This supports asynchronous appointment creation
 * workflows where appointments exist in the database with 'submitted' or 'confirmed'
 * status before being synced to Google Calendar.
 * 
 * APPOINTMENT STATUS WORKFLOW:
 * - 'started': Non-quote mode appointment creation in progress (NOT COUNTED)
 * - 'submitted': Submitted through app, awaiting confirmation (COUNTED)
 * - 'confirmed': Submitted and confirmed (COUNTED)
 * 
 * See: client/src/types/appointment.ts for AppointmentStatus union type definition
 * 
 * SEPARATION OF CONCERNS:
 * - Free-busy checking: Uses Google Calendar API to check external calendar events
 * - Capacity checking: Uses database appointments (this function) to check internal workflow state
 * 
 * WHY BOTH ARE NEEDED:
 * - Free-busy blocks slots based on calendar events (external, already synced)
 * - Capacity blocks slots based on database appointments (internal, including pending/confirmed but not-yet-synced)
 * 
 * The server endpoint (GET /availability/scheduled-hours) queries database appointments
 * and only counts appointments with status 'submitted' or 'confirmed'. This ensures
 * capacity limits are enforced during the asynchronous workflow period before Google Calendar sync.
 * 
 * @param slots - Array of slots to check (already marked with busy period availability)
 * @param duration - Appointment duration in minutes
 * @param capacityConstraints - Optional array of capacity constraints (daily, calendar week, rolling week)
 * @returns Slots with capacity filters applied
 */
async function applyCapacityFilters(
  slots: TimeSlot[],
  duration: number,
  capacityConstraints?: CapacityConstraint[]
): Promise<TimeSlot[]> {
  // If no capacity constraints, return slots as-is
  if (!capacityConstraints || capacityConstraints.length === 0) {
    return slots
  }

  // LEARNING: Batch capacity checks by grouping slots that need same date/week queries
  // WHY: Reduces API calls by checking unique dates/weeks once
  // PATTERN: Collect unique capacity keys, fetch hours once per key, apply cached results to all slots
  
  // Filter to only available slots (capacity only matters for available slots)
  const availableSlots = slots.filter(slot => slot.isAvailable)
  if (availableSlots.length === 0) {
    return slots
  }

  // Filter constraints to only active ones
  const activeCapacityConstraints = capacityConstraints.filter(c => c.enforcement !== 'off')
  if (activeCapacityConstraints.length === 0) {
    return slots
  }

  // LEARNING: Pre-build slot-to-keys map during batching to avoid rebuilding keys
  // WHY: Capacity keys are built twice - once for batching, once for application
  // PATTERN: Build map of slot startTime to array of key strings during batching phase
  const slotKeysMap = new Map<string, string[]>()
  const capacityKeyPartsSet = new Set<string>()
  const keyPartsMap = new Map<string, CapacityKeyParts>()
  
  // LEARNING: Use map to build slotKeys functionally
  // WHY: Avoids array mutations (push) - builds slotKeys array immutably
  // PATTERN: Map slots to keys, then process keys for batching
  availableSlots.forEach((slot) => {
    const slotDate = extractDateFromRFC3339(slot.startTime)
    
    // LEARNING: Use map to build slotKeys array functionally
    // WHY: Avoids array mutations (push)
    // PATTERN: Map constraints to key strings, then process each key
    const slotKeys = activeCapacityConstraints.map((constraint) => {
      const keyParts = buildCapacityKey(constraint, slotDate)
      const keyString = capacityKeyToString(keyParts)
      capacityKeyPartsSet.add(keyString)
      keyPartsMap.set(keyString, keyParts)
      return keyString
    })
    
    slotKeysMap.set(slot.startTime, slotKeys)
  })

  // Fetch scheduled hours for all unique keys
  // LEARNING: These fetch functions call GET /availability/scheduled-hours endpoint
  // WHY: Server endpoint queries database appointments (status 'submitted' or 'confirmed'), not Google Calendar events
  // PATTERN: Supports asynchronous appointment workflow where appointments exist in DB before calendar sync
  // See: client/src/types/appointment.ts for AppointmentStatus union type definition
  const capacityHoursByKey = new Map<string, number>()
  await Promise.all(
    Array.from(capacityKeyPartsSet).map(async (keyString) => {
      const keyParts = keyPartsMap.get(keyString)!
      let hours = 0
      
      switch (keyParts.type) {
        case TIME_BASIS_TYPES.DAILY:
          hours = await fetchScheduledHoursForDate(keyParts.date)
          break
        case TIME_BASIS_TYPES.CALENDAR_WEEK:
          hours = await fetchScheduledHoursForCalendarWeek(keyParts.date)
          break
        case TIME_BASIS_TYPES.ROLLING_WEEK:
          hours = await fetchScheduledHoursForRollingWeek(
            keyParts.date,
            keyParts.direction || 'past'
          )
          break
      }
      
      capacityHoursByKey.set(keyString, hours)
    })
  )

  // Apply capacity checks using cached hours
  const slotDurationHours = duration / 60
  const slotsWithCapacity = slots.map((slot) => {
    // Only check capacity for slots that are already available
    if (!slot.isAvailable) {
      return slot
    }

    // LEARNING: Use pre-built keys from batching phase
    // WHY: Avoids rebuilding capacity keys that were already computed during batching
    // PATTERN: Look up keys from slotKeysMap instead of rebuilding them
    const slotKeys = slotKeysMap.get(slot.startTime) || []

    /**
     * LEARNING: Extract constraint checking logic to pure function
     * WHY: Separates constraint evaluation from violation collection
     * PATTERN: Pure function returns { passes, violations }
     */
    const checkCapacityConstraints = (): { passes: boolean; violations: string[] } => {
      // Check for hard enforcement failures first (early return)
      const hardFailure = slotKeys.some((keyString, i) => {
        const constraint = activeCapacityConstraints[i]
        if (constraint.enforcement !== 'hard') return false
        const currentHours = capacityHoursByKey.get(keyString) || 0
        return currentHours + slotDurationHours > constraint.maxHours
      })

      if (hardFailure) {
        return { passes: false, violations: [] }
      }

      // Check flexible constraints - block if limit already exceeded
      const flexibleBlocked = slotKeys.some((keyString, i) => {
        const constraint = activeCapacityConstraints[i]
        if (constraint.enforcement !== 'flexible') return false
        const currentHours = capacityHoursByKey.get(keyString) || 0
        return currentHours >= constraint.maxHours
      })

      if (flexibleBlocked) {
        return { passes: false, violations: [] }
      }

      // Collect flexible violations functionally
      const violations = slotKeys
        .map((keyString, i) => {
          const constraint = activeCapacityConstraints[i]
          if (constraint.enforcement !== 'flexible') return null
          const currentHours = capacityHoursByKey.get(keyString) || 0
          // Mark violation if appointment would cause limit to be exceeded
          if (currentHours + slotDurationHours > constraint.maxHours) {
            return `capacity.${constraint.type}`
          }
          return null
        })
        .filter((v): v is string => v !== null)

      return { passes: true, violations }
    }

    const { passes, violations } = checkCapacityConstraints()

    // Merge capacity violations with existing flexible violations
    const mergedViolations = mergeViolations(slot.flexibleViolations, violations, passes)

    return {
      ...slot,
      isAvailable: slot.isAvailable && passes,
      hasFlexibleViolations: mergedViolations.hasFlexibleViolations || slot.hasFlexibleViolations,
      flexibleViolations: mergedViolations.flexibleViolations
    }
  })

  return slotsWithCapacity
}

/**
 * Generate all time slots with availability status
 * LEARNING: Unified function that generates all slots and marks availability
 * WHY: Single source of truth for availability calculations
 * PATTERN: Generate all slots first, apply range constraints, mark availability with overlap constraints, then check capacity
 * 
 * @param params - Parameters for slot generation
 * @param rangeConstraints - Optional array of range constraints (business hours, leadTime, dateRange)
 * @param overlapConstraints - Optional array of overlap constraints (buffers)
 * @param capacityConstraints - Optional array of capacity constraints (daily, calendar week, rolling week)
 * @param now - Optional current time for deterministic testing (defaults to new Date())
 * @returns Slots with availability flags and earliest completion time
 */
/**
 * Validate constraint arrays once before slot iteration
 * LEARNING: Pre-validation eliminates redundant per-slot validation
 * WHY: Validates constraints once instead of thousands of times
 * PATTERN: Validate all constraints upfront, throw structured error on failure
 */
function validateConstraintArrays(
  rangeConstraints?: RangeConstraint[],
  overlapConstraints?: OverlapConstraint[],
  capacityConstraints?: CapacityConstraint[]
): void {
  // LEARNING: Filter to only active constraints before validation
  // WHY: Avoids unnecessary validation of 'off' constraints
  // PATTERN: Filter first, then validate only active constraints
  const activeRangeConstraints = rangeConstraints?.filter(c => c.enforcement !== 'off') || []
  const activeOverlapConstraints = overlapConstraints?.filter(c => 
    c.enforcement !== 'off' && c.placement !== 'off'
  ) || []
  const activeCapacityConstraints = capacityConstraints?.filter(c => c.enforcement !== 'off') || []

  // LEARNING: Use find to check for validation failures functionally
  // WHY: Avoids forEach with side effects - find first failure, throw if found
  // PATTERN: Use find + early throw instead of forEach + throw
  
  const rangeFailure = activeRangeConstraints.find((constraint) => {
    const validation = validateRangeConstraint(constraint)
    return !validation.valid
  })
  if (rangeFailure) {
    const index = activeRangeConstraints.indexOf(rangeFailure)
    const validation = validateRangeConstraint(rangeFailure)
    throw new ConstraintValidationError(
      `Invalid range constraint at index ${index}: ${validation.error || 'unknown error'}`,
      'range',
      index,
      validation.error
    )
  }

  const overlapFailure = activeOverlapConstraints.find((constraint) => {
    const validation = validateOverlapConstraint(constraint)
    return !validation.valid
  })
  if (overlapFailure) {
    const index = activeOverlapConstraints.indexOf(overlapFailure)
    const validation = validateOverlapConstraint(overlapFailure)
    throw new ConstraintValidationError(
      `Invalid overlap constraint at index ${index}: ${validation.error || 'unknown error'}`,
      'overlap',
      index,
      validation.error
    )
  }

  const capacityFailure = activeCapacityConstraints.find((constraint) => {
    const validation = validateCapacityConstraint(constraint)
    return !validation.valid
  })
  if (capacityFailure) {
    const index = activeCapacityConstraints.indexOf(capacityFailure)
    const validation = validateCapacityConstraint(capacityFailure)
    throw new ConstraintValidationError(
      `Invalid capacity constraint at index ${index}: ${validation.error || 'unknown error'}`,
      'capacity',
      index,
      validation.error
    )
  }
}

export async function generateSlotsWithAvailability(
  params: GenerateSlotsWithAvailabilityParams,
  rangeConstraints?: RangeConstraint[],
  overlapConstraints?: OverlapConstraint[],
  capacityConstraints?: CapacityConstraint[],
  now?: Date
): Promise<AvailabilityManagerResult> {
  const { busyTimes = [], ...otherParams } = params

  // LEARNING: Pre-validate all constraint arrays once before slot generation
  // WHY: Validates constraints once instead of per-slot, hard-fails on invalid config
  // PATTERN: Validate upfront, throw structured error for UI notification
  validateConstraintArrays(rangeConstraints, overlapConstraints, capacityConstraints)

  // LEARNING: Filter 'off' constraints once before slot iteration
  // WHY: Avoids redundant checks in individual constraint checking functions
  // PATTERN: Filter once upfront, pass only active constraints to checking functions
  const activeRangeConstraints = rangeConstraints?.filter(c => c.enforcement !== 'off') || []
  const activeOverlapConstraints: OverlapConstraint[] = overlapConstraints?.filter(c => 
    c.enforcement !== 'off' && c.placement !== 'off'
  ) || []
  const activeCapacityConstraints = capacityConstraints?.filter(c => c.enforcement !== 'off') || []

  // LEARNING: Pre-process busy periods before parsing to Date objects
  // WHY: Validate, sort, and merge before caching
  // PATTERN: Validate → Sort → Merge → Parse to Date objects → Use in slot checks
  const processedBusyTimes = preprocessBusyPeriods(busyTimes)
  
  // LEARNING: Pre-parse busy periods once before slot generation
  // WHY: Avoid creating Date objects inside slot availability check loop
  // PATTERN: Parse once, use cached Date objects throughout
  const parsedBusyTimes = parseBusyPeriods(processedBusyTimes)

  // LEARNING: Generate all possible slots first (without filtering by boundaries or business hours)
  // WHY: Ensures consistent slot generation regardless of constraints
  // PATTERN: Generate all slots, then apply range constraints post-generation
  const allSlots = generateAllTimeSlots(otherParams)
  
  // LEARNING: Pre-populate Date cache for all slots to avoid redundant creation
  // WHY: Date objects are created multiple times for same slot (range checks, overlap checks, earliest completion)
  // PATTERN: Use slot.startTime as key (string) so cache persists through slot transformations
  // LEARNING: Use Map constructor with map to build cache functionally
  // WHY: Avoids Map mutations (set) - builds Map immutably using constructor
  // PATTERN: Map slots to [key, value] tuples, then construct Map from entries
  const slotDateCache = new Map(
    allSlots.map(slot => [
      slot.startTime,
      {
        start: new Date(slot.startTime),
        end: new Date(slot.endTime)
      }
    ] as [string, { start: Date; end: Date }])
  )

  // LEARNING: Apply range constraints (business hours, leadTime, dateRange) post-generation
  // WHY: Single pathway for all time-based restrictions
  // PATTERN: Check each slot against range constraints, filter hard violations, mark flexible violations
  // LEARNING: Inject time dependency for deterministic testing
  // WHY: Allows tests to use fixed time values instead of relying on current time
  // PATTERN: Accept optional now parameter, default to current time if not provided
  const effectiveNow = now || new Date()
  
  // LEARNING: Build business hours cache once for all slots
  // WHY: Avoids re-parsing same business hours for every slot on the same day
  // PATTERN: Create cache map, populate as slots are checked
  const businessHoursCache: ParsedBusinessHoursCache = new Map()
  
  // LEARNING: Different constraint types use different application patterns
  // WHY: Each constraint type has different semantics and requirements
  // PATTERN: 
  //   - Range constraints: Filter out hard violations (slots must pass to continue)
  //   - Overlap constraints: Mark availability (slots can be available/unavailable)
  //   - Capacity constraints: Update availability flag (can override previous availability)
  // 
  // This is intentional - range constraints are prerequisites (filter early),
  // overlap constraints check conflicts (mark status), 
  // capacity constraints check limits (can block previously available slots)
  // Store allSlots reference for logging
  const allSlotsForLogging = allSlots
  
  const slotsPassingRangeConstraints: TimeSlot[] = activeRangeConstraints.length > 0
    ? allSlots
        .map(slot => {
          const cachedDates = slotDateCache.get(slot.startTime)!
          const rangeResult = checkRangeConstraints(slot, activeRangeConstraints, effectiveNow, businessHoursCache, cachedDates, allSlotsForLogging)
          if (!rangeResult.passes) {
            return null as unknown as TimeSlot // Hard violation - filter out
          }
          // Mark flexible violations
          return {
            ...slot,
            hasFlexibleViolations: rangeResult.violations.length > 0,
            flexibleViolations: rangeResult.violations.length > 0 ? rangeResult.violations : undefined
          } as TimeSlot
        })
        .filter((slot): slot is TimeSlot => slot !== null)
    : allSlots
  
  // LEARNING: Mark availability for each slot using cached Date objects with overlap constraints
  // WHY: Separates generation from availability checking, applies buffers when checking overlaps
  // PATTERN: Map slots and add availability flag, pass overlap constraints to expand time range
  const slotsWithAvailability = markSlotAvailability(slotsPassingRangeConstraints, parsedBusyTimes, activeOverlapConstraints, slotDateCache)

  // LEARNING: Apply capacity filters if provided
  // WHY: Capacity checking is separate concern from busy period checking
  // PATTERN: Check capacity after busy period availability is marked
  const slotsWithCapacity = activeCapacityConstraints.length > 0
    ? await applyCapacityFilters(slotsWithAvailability, params.duration, activeCapacityConstraints)
    : slotsWithAvailability

  // LEARNING: Find earliest available completion time
  // WHY: Only count available slots for earliest completion
  // PATTERN: Filter available slots, find earliest end time
  // PERFORMANCE: Use cached Date objects for efficient comparison, convert to RFC3339DateTime on return
  const availableSlots = slotsWithCapacity.filter(slot => slot.isAvailable)
  const earliestCompletionDate: Date | null = availableSlots.length > 0
    ? availableSlots.reduce((earliestDate: Date | null, slot) => {
        const cachedDates = slotDateCache.get(slot.startTime)
        const slotEnd = cachedDates?.end || new Date(slot.endTime)
        if (earliestDate === null || slotEnd < earliestDate) {
          return slotEnd
        }
        return earliestDate
      }, null)
    : null
  
  // Convert Date to RFC3339DateTime on return (public API)
  const earliestCompletion: RFC3339DateTime | null = earliestCompletionDate
    ? earliestCompletionDate.toISOString() as RFC3339DateTime
    : null

  return {
    slots: slotsWithCapacity,
    earliestCompletion
  }
}
