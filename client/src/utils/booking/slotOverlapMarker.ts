/**
 * Slot Overlap Marker
 * 
 * LEARNING: Handles marking slot availability based on busy periods and overlap constraints
 * WHY: Separated from slotAvailabilityOrchestrator to reduce complexity and improve maintainability
 * PATTERN: Pure utility functions - no side effects
 */

import type { TimeSlot } from '@/types/appointment'
import type { RangeConstraint, OverlapConstraint } from '@shared/types/availabilityTypes'
import type { DayOfWeek } from '@/types/datetime'
import type { BusinessHoursMap } from './timeSlotTypes'
import type { ParsedBusyTimeRange } from './timeSlotTypes'
import type { ParsedBusinessHoursCache } from './rangeConstraintChecker'
import type { SlotPositionContext } from './slotAvailabilityOrchestrator'
import { parseBusinessHours } from './timeSlotTypes'
import { checkSlotAvailability } from './overlapConstraintChecker'
import { RANGE_CONSTRAINT_TYPES } from '@/constants/constraintTypes'
import { createLogger } from '@/utils/logger'
import { mergeViolations } from '@shared/utils/constraintUtils'

const logger = createLogger('slotOverlapMarker')

/**
 * Options for marking slot overlap availability
 * LEARNING: Options object pattern for functions with many optional parameters
 * WHY: Improves readability and reduces parameter order errors
 * PATTERN: Single options object instead of multiple positional parameters
 */
export interface SlotOverlapMarkingOptions {
  overlapConstraints?: OverlapConstraint[]
  dateCache?: Map<string, { start: Date; end: Date }>
  rangeConstraints?: RangeConstraint[]
  businessHoursCache?: ParsedBusinessHoursCache
}

/**
 * Build slot position context from business hours
 * LEARNING: Extracted position context building logic
 * WHY: Reduces nesting and improves readability
 * PATTERN: Pure function with early returns
 * 
 * @param slotStart - Slot start time
 * @param businessHoursConfig - Business hours configuration
 * @param businessHoursCache - Optional cache of parsed business hours
 * @returns Slot position context or undefined
 */
function buildPositionContext(
  slotStart: Date,
  businessHoursConfig: { hours: BusinessHoursMap } | undefined,
  businessHoursCache?: ParsedBusinessHoursCache
): SlotPositionContext | undefined {
  if (!businessHoursConfig || !businessHoursCache) {
    return undefined
  }

  const dayOfWeek = slotStart.getUTCDay() as DayOfWeek
  const dayHours = businessHoursConfig.hours[dayOfWeek]
  
  if (!dayHours) {
    return undefined
  }

  // PATTERN: Check cache first, parse if not cached
  let parsedHours: ReturnType<typeof parseBusinessHours> | null = null
  
  if (businessHoursCache.has(dayOfWeek)) {
    parsedHours = businessHoursCache.get(dayOfWeek)!
  } else {
    parsedHours = parseBusinessHours(dayHours, dayOfWeek)
    if (parsedHours) {
      businessHoursCache.set(dayOfWeek, parsedHours)
    }
  }
  
  if (!parsedHours) {
    return undefined
  }

  // LEARNING: Convert business hours time-of-day to Date objects for this specific day
  // WHY: Business hours are stored as time-of-day (RFC3339 with reference date), need actual dates
  // PATTERN: Extract UTC components, create UTC Date objects using Date.UTC()
  const slotYear = slotStart.getUTCFullYear()
  const slotMonth = slotStart.getUTCMonth()
  const slotDay = slotStart.getUTCDate()
  
  // Create UTC Date objects with business hours times
  const businessHoursStartUTC = new Date(Date.UTC(slotYear, slotMonth, slotDay, parsedHours.startHour, parsedHours.startMinute, 0, 0))
  const businessHoursEndUTC = new Date(Date.UTC(slotYear, slotMonth, slotDay, parsedHours.endHour, parsedHours.endMinute, 0, 0))
  
  // Validate dates before using
  if (isNaN(businessHoursStartUTC.getTime()) || isNaN(businessHoursEndUTC.getTime())) {
    return undefined
  }

  // Return Date objects directly (Date objects are UTC internally)
  return {
    businessHoursStart: businessHoursStartUTC,
    businessHoursEnd: businessHoursEndUTC
  }
}

/**
 * Mark slots with availability status
 * LEARNING: Checks each slot against busy periods and overlap constraints, adds availability flag
 * WHY: Separates slot generation from availability checking
 * PATTERN: Map over slots, check availability with overlap constraints, add flag
 * 
 * REFACTORED: Extracted helper functions to reduce nesting and improve readability
 * REFACTORED: Options object pattern for better readability and maintainability
 * 
 * @param slots - Array of slots to mark
 * @param parsedBusyTimes - Array of pre-parsed busy time ranges with cached Date objects
 * @param options - Optional configuration object
 * @returns Slots with isAvailable flag
 */
export function markSlotAvailability(
  slots: TimeSlot[],
  parsedBusyTimes: ParsedBusyTimeRange[],
  options?: SlotOverlapMarkingOptions
): TimeSlot[] {
  const {
    overlapConstraints,
    dateCache,
    rangeConstraints,
    businessHoursCache
  } = options || {}
  
  // LEARNING: Extract business hours constraint for building position context
  // WHY: Drive time constraints need business hours boundaries for skipDayStart/skipDayEnd logic
  const businessHoursConstraint = rangeConstraints?.find(
    c => c.type === RANGE_CONSTRAINT_TYPES.BUSINESS_HOURS
  )
  const businessHoursConfig = businessHoursConstraint?.config as { hours: BusinessHoursMap } | undefined

  return slots.map((slot) => {
    // PATTERN: Accept optional date cache map using slot.startTime as key
    const cachedDates = dateCache?.get(slot.startTime)
    const slotStart = cachedDates?.start || new Date(slot.startTime)
    const slotEnd = cachedDates?.end || new Date(slot.endTime)
    
    // LEARNING: Build SlotPositionContext from business hours for this slot's day
    // WHY: Drive time constraints need business hours boundaries for skipDayStart/skipDayEnd logic
    // PATTERN: Extract business hours for slot's day of week, parse, convert to Date objects
    // FIX: Wrap in try-catch to ensure slots are always returned even if context building fails
    let positionContext: SlotPositionContext | undefined
    try {
      positionContext = buildPositionContext(slotStart, businessHoursConfig, businessHoursCache)
    } catch (error) {
      // LEARNING: Log error but continue - position context is optional
      // WHY: Don't prevent slot generation if context building fails
      logger.warn(
        '[markSlotAvailability] Failed to build position context, continuing without it',
        { error: error instanceof Error ? error.message : String(error), slotStart: slot.startTime }
      )
    }
    
    const availabilityResult = checkSlotAvailability(
      slotStart, 
      slotEnd, 
      parsedBusyTimes, 
      overlapConstraints,
      positionContext
    )
    
    const mergedViolations = mergeViolations(slot.flexibleViolations, availabilityResult.violations)
    
    return {
      ...slot,
      isAvailable: availabilityResult.passes,
      hasFlexibleViolations: mergedViolations.hasFlexibleViolations,
      flexibleViolations: mergedViolations.flexibleViolations
    }
  })
}
