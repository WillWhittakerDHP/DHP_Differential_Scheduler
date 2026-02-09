/**
 * Slot Availability Marker
 * 
 * LEARNING: Handles marking slot availability based on busy periods and overlap constraints
 * WHY: Separated from slotAvailabilityManager to reduce complexity and improve maintainability
 * PATTERN: Pure utility functions - no side effects
 */

import type { TimeSlot } from '@/types/appointment'
import type { RangeConstraint, OverlapConstraint } from '@shared/types/availabilityTypes'
import type { DayOfWeek } from '@/types/datetime'
import type { BusinessHoursMap } from './timeSlotTypes'
import type { ParsedBusyTimeRange } from './overlapConstraintChecker'
import type { ParsedBusinessHoursCache } from './rangeConstraintChecker'
import type { SlotPositionContext } from './slotAvailabilityManager'
import { parseBusinessHours } from './timeSlotTypes'
import { checkSlotAvailability } from './overlapConstraintChecker'
import { RANGE_CONSTRAINT_TYPES } from '@/constants/constraintTypes'
import { createLogger } from '@/utils/logger'

const logger = createLogger('slotAvailabilityMarker')

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
  _passes: boolean = true
): { hasFlexibleViolations: boolean; flexibleViolations: string[] | undefined } {
  // PATTERN: Always merge violations for debugging overlay, regardless of pass/fail
  // WHY: Even hard failures should record their violation type for visibility
  const allViolations = [...(existing || []), ...newViolations]
  return {
    hasFlexibleViolations: allViolations.length > 0,
    flexibleViolations: allViolations.length > 0 ? allViolations : undefined
  }
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
  // PATTERN: Extract local hours/minutes, create Date for slot's date, convert to UTC
  const slotYear = slotStart.getUTCFullYear()
  const slotMonth = slotStart.getUTCMonth()
  const slotDay = slotStart.getUTCDate()
  
  // Create local Date objects with business hours times
  const businessHoursStartLocal = new Date(slotYear, slotMonth, slotDay, parsedHours.startHour, parsedHours.startMinute, 0, 0)
  const businessHoursEndLocal = new Date(slotYear, slotMonth, slotDay, parsedHours.endHour, parsedHours.endMinute, 0, 0)
  
  // Validate dates before using
  if (isNaN(businessHoursStartLocal.getTime()) || isNaN(businessHoursEndLocal.getTime())) {
    return undefined
  }

  // Convert to UTC (matching slot timezone handling)
  return {
    businessHoursStart: new Date(businessHoursStartLocal.toISOString()),
    businessHoursEnd: new Date(businessHoursEndLocal.toISOString())
  }
}

/**
 * Mark slots with availability status
 * LEARNING: Checks each slot against busy periods and overlap constraints, adds availability flag
 * WHY: Separates slot generation from availability checking
 * PATTERN: Map over slots, check availability with overlap constraints, add flag
 * 
 * REFACTORED: Extracted helper functions to reduce nesting and improve readability
 * 
 * @param slots - Array of slots to mark
 * @param parsedBusyTimes - Array of pre-parsed busy time ranges with cached Date objects
 * @param overlapConstraints - Optional array of overlap constraints (buffers) to apply
 * @param dateCache - Optional cache of slot Date objects
 * @param rangeConstraints - Optional array of range constraints for building position context
 * @param businessHoursCache - Optional cache of parsed business hours by day of week
 * @param calculatedConstraintsByDate - Optional map of date keys to calculated constraints (for per-day drive times)
 * @returns Slots with isAvailable flag
 */
export function markSlotAvailability(
  slots: TimeSlot[],
  parsedBusyTimes: ParsedBusyTimeRange[],
  overlapConstraints?: OverlapConstraint[],
  dateCache?: Map<string, { start: Date; end: Date }>,
  rangeConstraints?: RangeConstraint[],
  businessHoursCache?: ParsedBusinessHoursCache,
  calculatedConstraintsByDate?: Map<string, OverlapConstraint[]>
): TimeSlot[] {
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
    
    // LEARNING: Use per-day calculated constraints if available (for drive time API values)
    // WHY: Drive times may differ per day based on calendar events
    // PATTERN: Look up constraints by date key, fallback to provided constraints
    let constraintsForSlot = overlapConstraints
    if (calculatedConstraintsByDate) {
      const slotDate = new Date(slot.startTime)
      const dateKey = slotDate.toISOString().split('T')[0] // YYYY-MM-DD
      const calculatedConstraints = calculatedConstraintsByDate.get(dateKey)
      if (calculatedConstraints) {
        constraintsForSlot = calculatedConstraints
      }
    }
    
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
      constraintsForSlot,
      positionContext
    )
    
    const mergedViolations = mergeViolations(slot.flexibleViolations, availabilityResult.violations, availabilityResult.available)
    
    return {
      ...slot,
      isAvailable: availabilityResult.available,
      hasFlexibleViolations: mergedViolations.hasFlexibleViolations,
      flexibleViolations: mergedViolations.flexibleViolations
    }
  })
}
