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
import { createLogger } from '@/utils/logger'

// LEARNING: Use scoped logger for controllable debug output
// WHY: Prevents debug logs in production, allows scope-based filtering
// PATTERN: createLogger(scope) provides debug/info/warn/error methods
const logger = createLogger('timeAvailabilityManager')

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
  original: BusyTimeRange // Keep original for logging
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
  if (isNaN(start.getTime())) {
    logger.error('Invalid busy period start time', { busy })
    return false
  }
  if (isNaN(end.getTime())) {
    logger.error('Invalid busy period end time', { busy })
    return false
  }
  
  // Check start < end
  if (start >= end) {
    logger.warn('Invalid busy period: start >= end', { busy })
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
 * PATTERN: Iterate sorted periods, merge when overlapping/adjacent
 * 
 * @param sortedBusyTimes - Busy periods sorted by start time
 * @returns Merged busy periods (non-overlapping)
 */
function mergeBusyPeriods(sortedBusyTimes: BusyTimeRange[]): BusyTimeRange[] {
  if (sortedBusyTimes.length === 0) return []
  
  const merged: BusyTimeRange[] = [{ ...sortedBusyTimes[0] }]
  
  for (let i = 1; i < sortedBusyTimes.length; i++) {
    const current = sortedBusyTimes[i]
    const lastMerged = merged[merged.length - 1]
    
    const lastEnd = new Date(lastMerged.end)
    const currentStart = new Date(current.start)
    const currentEnd = new Date(current.end)
    
    // Check if current overlaps or is adjacent to lastMerged
    if (currentStart <= lastEnd) {
      // Merge: extend lastMerged.end to max(lastMerged.end, current.end)
      if (currentEnd > lastEnd) {
        lastMerged.end = current.end
      }
      logger.debug('Merged overlapping busy periods', { 
        original1: { start: lastMerged.start, end: lastMerged.end }, 
        original2: current,
        merged: { start: lastMerged.start, end: lastMerged.end }
      })
    } else {
      // No overlap, add as new merged period
      merged.push({ ...current })
    }
  }
  
  logger.debug('[Performance] Busy period merging', {
    original: sortedBusyTimes.length,
    merged: merged.length,
    reduction: sortedBusyTimes.length > 0 
      ? `${((1 - merged.length / sortedBusyTimes.length) * 100).toFixed(0)}%`
      : '0%'
  })
  
  return merged
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
  
  if (validBusyTimes.length < busyTimes.length) {
    logger.warn('Filtered invalid busy periods', {
      original: busyTimes.length,
      valid: validBusyTimes.length,
      filtered: busyTimes.length - validBusyTimes.length
    })
  }
  
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
export interface AvailabilityManagerResult {
  slots: TimeSlot[]  // P3-3: Use TimeSlot directly instead of TimeSlotWithAvailability
  earliestCompletion: RFC3339DateTime | null  // RFC3339 datetime of earliest available slot end time
}

/**
 * Parameters for generating slots with availability
 */
export interface GenerateSlotsWithAvailabilityParams {
  startBoundary: RFC3339DateTime         // RFC3339 datetime - earliest possible start
  endBoundary: RFC3339DateTime           // RFC3339 datetime - latest possible end
  duration: number                        // Required duration in minutes
  businessHours: BusinessHoursMap
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
 * Check if a slot overlaps with any busy periods
 * LEARNING: Pure function that checks availability
 * WHY: Separates availability checking from slot generation
 * PATTERN: Takes slot and pre-parsed busy periods, returns boolean
 * 
 * @param slotStart - Slot start time as Date
 * @param slotEnd - Slot end time as Date
 * @param parsedBusyTimes - Array of pre-parsed busy time ranges with cached Date objects
 * @returns true if slot is available (doesn't overlap busy), false if busy
 */
export function checkSlotAvailability(
  slotStart: Date,
  slotEnd: Date,
  parsedBusyTimes: ParsedBusyTimeRange[]
): boolean {
  if (parsedBusyTimes.length === 0) {
    return true
  }

  // LEARNING: Check if slot overlaps any busy period using cached Date objects
  // WHY: Slot is unavailable if it overlaps any busy time
  // PATTERN: Use timeRangesOverlap utility function with pre-parsed Date objects
  const overlapsBusy = parsedBusyTimes.some(busy => {
    return timeRangesOverlap(
      { start: slotStart, end: slotEnd },
      { start: busy.start, end: busy.end } // Use cached Date objects
    )
  })

  return !overlapsBusy
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
    businessHours,
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
      endBoundary,
      businessHours
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

  // Validate boundaries: start < end (check again after validation, return empty array if invalid)
  if (startBoundaryDate >= endBoundaryDate) {
    logger.debug('Invalid boundaries: start >= end', { startBoundary, endBoundary })
    return []
  }

  // Check if at least one day has business hours (return empty array if none)
  const hasAnyHours = Object.keys(businessHours).length > 0
  if (!hasAnyHours) {
    logger.warn('No business hours defined for any day')
    return []
  }

  const slots: TimeSlot[] = []

  // Iterate through each day from startBoundary to endBoundary
  // LEARNING: Use UTC methods to match UTC boundaries
  // WHY: Boundaries are UTC ISO strings, slots must be generated in UTC to align correctly
  // PATTERN: Use UTC date/time methods throughout slot generation
  const startDateOnly = new Date(startBoundaryDate)
  startDateOnly.setUTCHours(0, 0, 0, 0)
  
  const endDateOnly = new Date(endBoundaryDate)
  endDateOnly.setUTCHours(0, 0, 0, 0)
  endDateOnly.setUTCDate(endDateOnly.getUTCDate() + 1)
  
  const currentDate = new Date(startDateOnly)

  while (currentDate < endDateOnly) {
    // LEARNING: Get UTC date components, then create local time slots
    // WHY: Business hours are time-of-day in LOCAL timezone, but we iterate by UTC dates
    // PATTERN: Extract UTC date components, use them to create local time slots
    // NOTE: We use UTC components to ensure we're working with the correct calendar date
    const localYear = currentDate.getUTCFullYear()
    const localMonth = currentDate.getUTCMonth()
    const localDay = currentDate.getUTCDate()
    // P3-4: Use DayOfWeek type and getDayOfWeek utility
    // Calculate day of week from UTC date (getDay() returns local day, so create temp date for UTC day)
    const tempDate = new Date(Date.UTC(localYear, localMonth, localDay))
    const dayOfWeek: DayOfWeek = tempDate.getUTCDay() as DayOfWeek  // getUTCDay() always returns 0-6
    const dayHours = businessHours[dayOfWeek]

    if (!dayHours) {
      // No business hours for this day, skip to next day
      currentDate.setUTCDate(currentDate.getUTCDate() + 1)
      continue
    }

    // LEARNING: Use shared business hours parsing helper
    // WHY: Eliminates duplication between fitTimeSlots and generateAllTimeSlots (Issue #20)
    // PATTERN: Extract parsing logic to shared function
    const parsedHours = parseBusinessHours(dayHours, dayOfWeek)
    if (!parsedHours) {
      currentDate.setUTCDate(currentDate.getUTCDate() + 1)
      continue
    }

    const { endHour, endMinute, dayStartMinutes, dayEndMinutes } = parsedHours

    // Generate slots within business hours at configured intervals
    let currentMinutes = dayStartMinutes

    while (currentMinutes < dayEndMinutes) {
      // LEARNING: Create slot times in LOCAL timezone, then convert to UTC
      // WHY: Business hours are LOCAL time-of-day (admin sets "9 AM" meaning 9 AM in their timezone)
      // PATTERN: Create local datetime with business hours, convert to UTC for storage
      // Create slot start time in local timezone
      const slotStartLocal = new Date(localYear, localMonth, localDay, Math.floor(currentMinutes / 60), currentMinutes % 60, 0, 0)
      const slotStart = slotStartLocal // Will be converted to UTC via toISOString()

      // Create slot end time (add duration in local time, then convert)
      const slotEndLocal = new Date(slotStartLocal)
      slotEndLocal.setMinutes(slotEndLocal.getMinutes() + duration)
      const slotEnd = slotEndLocal

      // Check if slot extends past business hours end (using local time)
      const slotEndHourLocal = slotEndLocal.getHours()
      const slotEndMinuteLocal = slotEndLocal.getMinutes()
      const extendsPastHours = slotEndHourLocal > endHour || 
        (slotEndHourLocal === endHour && slotEndMinuteLocal > endMinute)

      // LEARNING: Generate slot if it meets boundary and business hour constraints
      // WHY: We generate ALL slots that could theoretically exist, availability is checked later
      // PATTERN: Check boundaries and business hours, but don't filter by busy times here

      // Filter: slot start must be >= startBoundary
      if (slotStart < startBoundaryDate) {
        currentMinutes += minuteIncrement
        continue
      }

      // Filter: slot start must be <= endBoundary
      if (slotStart > endBoundaryDate) {
        break
      }

      // Filter: slot end must be <= endBoundary
      if (slotEnd > endBoundaryDate) {
        currentMinutes += minuteIncrement
        continue
      }

      // Filter: slot end must be <= business hours end
      if (extendsPastHours) {
        break
      }

      // LEARNING: Generate slot regardless of busy times
      // WHY: Availability will be checked and marked separately
      // PATTERN: Create slot with all required fields
      // LEARNING: toISOString() always produces valid RFC3339 format (UTC with Z suffix)
      // WHY: Date.toISOString() is guaranteed to return RFC3339-compliant string
      // PATTERN: Use type assertion since we know the format is correct
      const slot: TimeSlot = {
        startTime: slotStart.toISOString() as RFC3339DateTime,
        endTime: slotEnd.toISOString() as RFC3339DateTime,
        duration,
        onSite: includeFlags.onSite,
        clientPresent: includeFlags.clientPresent,
        moveable: includeFlags.moveable,
        isAvailable: false  // Will be updated by markSlotAvailability
      }

      slots.push(slot)

      // Move to next interval
      currentMinutes += minuteIncrement
    }

    // Move to next day
    currentDate.setUTCDate(currentDate.getUTCDate() + 1)
  }

  return slots
}

/**
 * Mark slots with availability status
 * LEARNING: Checks each slot against busy periods and adds availability flag
 * WHY: Separates slot generation from availability checking
 * PATTERN: Map over slots, check availability, add flag
 * 
 * @param slots - Array of slots to mark
 * @param parsedBusyTimes - Array of pre-parsed busy time ranges with cached Date objects
 * @returns Slots with isAvailable flag
 */
export function markSlotAvailability(
  slots: TimeSlot[],
  parsedBusyTimes: ParsedBusyTimeRange[]
): TimeSlot[] {  // P3-3: Use TimeSlot directly instead of TimeSlotWithAvailability
  // LEARNING: Log first few slot availability checks with timezone info
  // WHY: Helps debug timezone alignment between busy periods and slots
  // PATTERN: Log sample checks with both UTC and local time for verification
  const sampleSlots = slots.slice(0, 5)
  if (sampleSlots.length > 0 && parsedBusyTimes.length > 0) {
    logger.debug('Checking slot availability:', {
      totalSlots: slots.length,
      busyTimesCount: parsedBusyTimes.length,
      sampleBusyTimes: parsedBusyTimes.slice(0, 3).map(bt => {
        return {
          startUTC: bt.original.start,
          endUTC: bt.original.end,
          startLocal: bt.start.toLocaleString(),
          endLocal: bt.end.toLocaleString(),
          startHourUTC: bt.start.getUTCHours(),
          startHourLocal: bt.start.getHours()
        }
      }),
      sampleSlots: sampleSlots.map(slot => {
        const slotStart = new Date(slot.startTime)
        const slotEnd = new Date(slot.endTime)
        const isAvailable = checkSlotAvailability(slotStart, slotEnd, parsedBusyTimes)
        return {
          startTimeUTC: slot.startTime,
          endTimeUTC: slot.endTime,
          startTimeLocal: slotStart.toLocaleString(),
          endTimeLocal: slotEnd.toLocaleString(),
          startHourUTC: slotStart.getUTCHours(),
          startHourLocal: slotStart.getHours(),
          isAvailable
        }
      })
    })
  }
  
  return slots.map(slot => {
    const slotStart = new Date(slot.startTime)
    const slotEnd = new Date(slot.endTime)
    
    const isAvailable = checkSlotAvailability(slotStart, slotEnd, parsedBusyTimes)
    
    return {
      ...slot,
      isAvailable
    }
  })
}

/**
 * Generate all time slots with availability status
 * LEARNING: Unified function that generates all slots and marks availability
 * WHY: Single source of truth for availability calculations
 * PATTERN: Generate all slots first, then mark availability
 * 
 * @param params - Parameters for slot generation
 * @returns Slots with availability flags and earliest completion time
 */
export function generateSlotsWithAvailability(
  params: GenerateSlotsWithAvailabilityParams
): AvailabilityManagerResult {
  const startTime = performance.now()
  const { busyTimes = [], ...otherParams } = params

  logger.debug('[Performance] Starting slot generation', {
    busyPeriodsCount: busyTimes.length,
    duration: params.duration,
    startBoundary: params.startBoundary
  })

  // LEARNING: Pre-process busy periods before parsing to Date objects
  // WHY: Validate, sort, and merge before caching (Category 4 optimization)
  // PATTERN: Validate → Sort → Merge → Parse to Date objects → Use in slot checks
  const processedBusyTimes = preprocessBusyPeriods(busyTimes)
  
  // LEARNING: Pre-parse busy periods once before slot generation (Category 4)
  // WHY: Avoid creating Date objects inside slot availability check loop
  // PATTERN: Parse once, use cached Date objects throughout
  const parsedBusyTimes = parseBusyPeriods(processedBusyTimes)

  // LEARNING: Generate all possible slots first
  // WHY: Ensures consistent slot generation regardless of busy periods
  // PATTERN: Generate all slots, then check availability
  const allSlots = generateAllTimeSlots(otherParams)

  // LEARNING: Mark availability for each slot using cached Date objects
  // WHY: Separates generation from availability checking
  // PATTERN: Map slots and add availability flag
  const slotsWithAvailability = markSlotAvailability(allSlots, parsedBusyTimes)

  // LEARNING: Find earliest available completion time
  // WHY: Only count available slots for earliest completion
  // PATTERN: Filter available slots, find earliest end time
  // PERFORMANCE: Use Date internally for efficient comparison, convert to RFC3339DateTime on return (Issue #18)
  const availableSlots = slotsWithAvailability.filter(slot => slot.isAvailable)
  const earliestCompletionDate: Date | null = availableSlots.length > 0
    ? availableSlots.reduce((earliestDate: Date | null, slot) => {
        const slotEnd = new Date(slot.endTime)
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

  const endTime = performance.now()
  logger.debug('[Performance] Slot generation complete', {
    duration: `${(endTime - startTime).toFixed(2)}ms`,
    slotsGenerated: slotsWithAvailability.length,
    availableSlots: availableSlots.length
  })

  return {
    slots: slotsWithAvailability,
    earliestCompletion
  }
}
