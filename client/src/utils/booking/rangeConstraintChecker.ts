/**
 * Range Constraint Checker
 * 
 * LEARNING: Handles range constraint checking (business hours, lead time, date range)
 * WHY: Separated from slotAvailabilityManager to reduce complexity and improve maintainability
 * PATTERN: Pure utility functions - no side effects
 */

import type { TimeSlot } from '@/types/appointment'
import type { RangeConstraint } from '@shared/types/availabilityTypes'
import type { DayOfWeek } from '@/types/datetime'
import type { BusinessHoursMap } from './timeSlotTypes'
import { parseBusinessHours } from './timeSlotTypes'
import { RANGE_CONSTRAINT_TYPES } from '@/constants/constraintTypes'
import { rfc3339ToLocalMinutesFromMidnight } from '@/composables/useLocalTime'

/**
 * Cache for parsed business hours by day of week
 * LEARNING: Performance optimization - parse business hours once per day
 * WHY: Avoids repeated parsing of RFC3339 strings during slot checks
 * PATTERN: Map from day of week to parsed hours
 */
export type ParsedBusinessHoursCache = Map<DayOfWeek, ReturnType<typeof parseBusinessHours>>

/**
 * Check business hours constraint
 * LEARNING: Extracted business hours checking logic
 * WHY: Reduces nesting and improves readability
 * PATTERN: Pure function with early returns
 * 
 * @param slot - Slot to check
 * @param slotStart - Slot start time as Date
 * @param dayHours - Business hours for the day
 * @param dayOfWeek - Day of week
 * @param businessHoursCache - Optional cache of parsed business hours
 * @returns true if slot is within business hours
 */
function checkBusinessHoursConstraint(
  slot: TimeSlot,
  _slotStart: Date,
  dayHours: { start: string; end: string } | undefined,
  dayOfWeek: DayOfWeek,
  businessHoursCache?: ParsedBusinessHoursCache
): boolean {
  if (!dayHours) {
    return false
  }

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

  // WHY: Business hours are interpreted as local time-of-day, so we must compare slots in local time
  // PATTERN: Use useLocalTime composable to convert RFC3339 to local minutes from midnight
  const slotStartMinutes = rfc3339ToLocalMinutesFromMidnight(slot.startTime)
  const slotEndMinutes = rfc3339ToLocalMinutesFromMidnight(slot.endTime)

  return slotStartMinutes >= parsedHours.dayStartMinutes &&
           slotEndMinutes <= parsedHours.dayEndMinutes
}

/**
 * Check lead time constraint
 * LEARNING: Extracted lead time checking logic
 * WHY: Reduces nesting and improves readability
 * PATTERN: Pure function with early returns
 * 
 * @param slotStart - Slot start time as Date
 * @param now - Current time
 * @param minutes - Required lead time in minutes
 * @returns true if slot meets lead time requirement
 */
function checkLeadTimeConstraint(
  slotStart: Date,
  now: Date,
  minutes: number
): boolean {
  // PATTERN: Check if slot date is today or future before applying leadTime
  // WHY: Slots are UTC representations of local business hours, so we need to compare against local "now"
  // PATTERN: Slots store UTC times that represent local times, so we compare the UTC timestamps directly
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
    const minStartTime = new Date(now.getTime() + minutes * 60 * 1000)
    return slotStart >= minStartTime
  }
}

/**
 * Check date range constraint
 * LEARNING: Extracted date range checking logic
 * WHY: Reduces nesting and improves readability
 * PATTERN: Pure function with early returns
 * 
 * @param slotStart - Slot start time as Date
 * @param slotEnd - Slot end time as Date
 * @param rangeStart - Range start time
 * @param rangeEnd - Range end time
 * @returns true if slot is within date range
 */
function checkDateRangeConstraint(
  slotStart: Date,
  slotEnd: Date,
  rangeStart: Date,
  rangeEnd: Date
): boolean {
  return slotStart >= rangeStart && slotEnd <= rangeEnd
}

/**
 * Check if a slot passes all range constraints
 * LEARNING: Unified function for checking time-based restrictions (business hours, leadTime, dateRange)
 * WHY: Single pathway for all range constraints, consolidates business hours, boundaries, and leadTime checking
 * PATTERN: Check each constraint type based on enforcement level, return violations for flexible constraints
 * 
 * REFACTORED: Extracted helper functions to reduce nesting from 14 levels to <3
 * 
 * @param slot - Slot to check
 * @param constraints - Array of range constraints to check
 * @param now - Current time (for leadTime constraint)
 * @param businessHoursCache - Optional cache of parsed business hours by day of week
 * @param dates - Optional pre-parsed slot dates
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
          return constraint.enforcement !== 'hard'
        } else {
          return checkBusinessHoursConstraint(slot, slotStart, dayHours, dayOfWeek, businessHoursCache)
        }
      }

      case RANGE_CONSTRAINT_TYPES.LEAD_TIME: {
        const config = constraint.config as { minutes: number }
        return checkLeadTimeConstraint(slotStart, now, config.minutes)
      }

      case RANGE_CONSTRAINT_TYPES.DATE_RANGE: {
        const config = constraint.config as { start: string; end: string }
        const rangeStart = new Date(config.start)
        const rangeEnd = new Date(config.end)
        return checkDateRangeConstraint(slotStart, slotEnd, rangeStart, rangeEnd)
      }
    }
  }

  // PATTERN: Filter constraints, check each, collect violations, check for hard failures
  const activeConstraints = constraints.filter(c => c.enforcement !== 'off')
  
  const hardFailure = activeConstraints.find(
    constraint => constraint.enforcement === 'hard' && !checkConstraint(constraint)
  )
  if (hardFailure) {
    return { passes: false, violations: [] }
  }

  const violations = activeConstraints
    .filter(constraint => 
      constraint.enforcement === 'flexible' && !checkConstraint(constraint)
    )
    .map(constraint => `range.${constraint.type}`)

  return { passes: true, violations }
}
