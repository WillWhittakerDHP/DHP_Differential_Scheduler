/**
 * Constraint Extraction Helpers
 * 
 * LEARNING: Centralized constraint extraction logic to eliminate duplication
 * WHY: DRY principle - single source of truth for extracting constraints from AvailabilitySettings
 * PATTERN: Pure functions that extract and transform settings into constraint structures
 */

import type {
  AvailabilitySettings,
  RangeConstraint,
  RollingWeekCapacityFilter,
  ConstraintEnforcement
} from '@/configs/availabilitySettings'
import type { BusinessHoursMap } from './timeSlotFitter'
import { RANGE_CONSTRAINT_TYPES, TIME_BASIS_TYPES } from '@/constants/constraintTypes'

/**
 * Overlap constraint (buffer) interface
 * LEARNING: Unified structure for all buffer types (appointment, driveTime, lunch)
 * WHY: Consolidates buffer checking into single pathway
 * PATTERN: Interface with type, placement, enforcement, and minutes
 */
export interface OverlapConstraint {
  type: 'appointment' | 'driveTime' | 'lunch'
  placement: 'off' | 'before' | 'after' | 'both'
  enforcement: ConstraintEnforcement
  minutes: number
}

/**
 * Capacity constraint interface
 * LEARNING: Unified structure for all capacity filters (daily, calendar week, rolling week)
 * WHY: Consolidates capacity checking into single pathway
 * PATTERN: Interface with type, enforcement, maxHours, and optional direction
 */
export interface CapacityConstraint {
  type: 'daily' | 'calendarWeek' | 'rollingWeek'
  enforcement: ConstraintEnforcement
  maxHours: number
  direction?: 'past' | 'centered' | 'future'  // Only for rollingWeek
}

export function extractRangeConstraints(
  settings: AvailabilitySettings
): RangeConstraint[] {
  const constraints: RangeConstraint[] = []

  // PATTERN: Check for legacy fields, throw error directly to surface misconfiguration
  if (settings.businessHours && !settings.rangeConstraints?.[RANGE_CONSTRAINT_TYPES.BUSINESS_HOURS]) {
    throw new Error(`Legacy top-level businessHours field detected. Use rangeConstraints.${RANGE_CONSTRAINT_TYPES.BUSINESS_HOURS} instead.`)
  }

  // PATTERN: Check for required constraint, throw if missing
  if (!settings.rangeConstraints?.[RANGE_CONSTRAINT_TYPES.BUSINESS_HOURS]) {
    throw new Error(`Required rangeConstraints.${RANGE_CONSTRAINT_TYPES.BUSINESS_HOURS} is missing. Business hours must be provided in structured format.`)
  }

  // Extract businessHours constraint (now guaranteed to exist)
  const businessHoursConstraint = settings.rangeConstraints[RANGE_CONSTRAINT_TYPES.BUSINESS_HOURS]
  if (businessHoursConstraint) {
    constraints.push(businessHoursConstraint)
  }

  // Extract leadTime constraint (optional)
  const leadTimeConstraint = settings.rangeConstraints?.[RANGE_CONSTRAINT_TYPES.LEAD_TIME]
  if (leadTimeConstraint) {
    constraints.push(leadTimeConstraint)
  }

  // Extract dateRange constraint (optional but recommended)
  const dateRangeConstraint = settings.rangeConstraints?.[RANGE_CONSTRAINT_TYPES.DATE_RANGE]
  if (dateRangeConstraint) {
    constraints.push(dateRangeConstraint)
  }

  return constraints
}

export function extractOverlapConstraints(
  settings: AvailabilitySettings
): OverlapConstraint[] {
  const constraints: OverlapConstraint[] = []
  const bufferTypes: Array<'appointment' | 'driveTime' | 'lunch'> = ['appointment', 'driveTime', 'lunch']

  // WHY: Single pattern for all buffer types reduces duplication and makes adding new types easier
  // PATTERN: Loop over buffer types, extract and validate each buffer
  for (const bufferType of bufferTypes) {
    const buffer = settings.buffers?.[bufferType]
    if (buffer && buffer.placement !== 'off' && buffer.minutes > 0) {
      // PATTERN: Check undefined BEFORE checking value to catch missing enforcement
      if (buffer.enforcement === undefined) {
        throw new Error(`Buffer enforcement is required for ${bufferType} buffer. Must be 'off', 'flexible', or 'hard'.`)
      }
      
      constraints.push({
        type: bufferType,
        placement: buffer.placement,
        enforcement: buffer.enforcement,
        minutes: buffer.minutes
      })
    }
  }

  return constraints
}

export function extractCapacityConstraints(
  settings: AvailabilitySettings
): CapacityConstraint[] {
  const constraints: CapacityConstraint[] = []
  
  // WHY: Single pattern for all capacity types reduces duplication and makes adding new types easier
  // PATTERN: Loop over capacity types, extract and validate each constraint
  const capacityTypeMap: Array<{
    type: CapacityConstraint['type']
    settingsKey: 'day' | 'calendarWeek' | 'rollingWeek'
  }> = [
    { type: TIME_BASIS_TYPES.DAILY, settingsKey: 'day' },
    { type: TIME_BASIS_TYPES.CALENDAR_WEEK, settingsKey: 'calendarWeek' },
    { type: TIME_BASIS_TYPES.ROLLING_WEEK, settingsKey: 'rollingWeek' }
  ]
  
  for (const { type, settingsKey } of capacityTypeMap) {
    const filter = settings.maxWorkHours?.[settingsKey]
    if (filter) {
      // PATTERN: Check undefined BEFORE checking value to catch missing enforcement
      if (filter.enforcement === undefined) {
        throw new Error(`Capacity enforcement is required for ${type} constraint. Must be 'off', 'flexible', or 'hard'.`)
      }
      
      if (filter.enforcement === 'off') {
        continue
      }
      
      const constraint: CapacityConstraint = {
        type,
        enforcement: filter.enforcement,
        maxHours: filter.maxHours,
        ...(type === TIME_BASIS_TYPES.ROLLING_WEEK && settingsKey === 'rollingWeek'
          ? { 
              direction: (settings.maxWorkHours?.rollingWeek as RollingWeekCapacityFilter | undefined)?.direction 
            }
          : {})
      }
      constraints.push(constraint)
    }
  }
  
  return constraints
}

/**
 * Validate range constraint configuration
 * LEARNING: Centralized validation for range constraints
 * WHY: Ensures consistent validation across all range constraint types
 * PATTERN: Type-specific validation with error logging
 * 
 * @param constraint - Range constraint to validate
 * @returns Object with valid boolean and optional error message
 */
export function validateRangeConstraint(constraint: RangeConstraint): { valid: boolean; error?: string } {
  switch (constraint.type) {
    case RANGE_CONSTRAINT_TYPES.BUSINESS_HOURS: {
      const config = constraint.config as { hours: BusinessHoursMap }
      if (!config?.hours || typeof config.hours !== 'object') {
        return { valid: false, error: `Invalid ${RANGE_CONSTRAINT_TYPES.BUSINESS_HOURS} constraint config` }
      }
      return { valid: true }
    }
    case RANGE_CONSTRAINT_TYPES.LEAD_TIME: {
      const config = constraint.config as { minutes: number }
      if (typeof config?.minutes !== 'number' || config.minutes < 0) {
        return { valid: false, error: `Invalid ${RANGE_CONSTRAINT_TYPES.LEAD_TIME} constraint config` }
      }
      return { valid: true }
    }
    case RANGE_CONSTRAINT_TYPES.DATE_RANGE: {
      const config = constraint.config as { start: string; end: string }
      if (!config?.start || !config?.end || typeof config.start !== 'string' || typeof config.end !== 'string') {
        return { valid: false, error: 'Invalid dateRange constraint config' }
      }
      const rangeStart = new Date(config.start)
      const rangeEnd = new Date(config.end)
      if (isNaN(rangeStart.getTime()) || isNaN(rangeEnd.getTime())) {
        return { valid: false, error: 'Invalid dateRange dates' }
      }
      return { valid: true }
    }
  }
}

/**
 * Validate overlap constraint configuration
 * LEARNING: Centralized validation for overlap constraints
 * WHY: Ensures consistent validation across all overlap constraint types
 * PATTERN: Type-specific validation with error logging
 * 
 * @param constraint - Overlap constraint to validate
 * @returns Object with valid boolean and optional error message
 */
export function validateOverlapConstraint(constraint: OverlapConstraint): { valid: boolean; error?: string } {
  if (typeof constraint.minutes !== 'number' || constraint.minutes < 0) {
    return { valid: false, error: 'Invalid overlap constraint minutes' }
  }
  // LEARNING: Validate placement, excluding 'off' since it's filtered before validation
  // PATTERN: Check placement is one of the active placement values
  const validPlacements: Array<'before' | 'after' | 'both'> = ['before', 'after', 'both']
  if (constraint.placement !== 'off' && !validPlacements.includes(constraint.placement)) {
    return { valid: false, error: 'Invalid overlap constraint placement' }
  }
  return { valid: true }
}

/**
 * Validate capacity constraint configuration
 * LEARNING: Centralized validation for capacity constraints
 * WHY: Ensures consistent validation across all capacity constraint types
 * PATTERN: Type-specific validation with error logging
 * 
 * @param constraint - Capacity constraint to validate
 * @returns Object with valid boolean and optional error message
 */
export function validateCapacityConstraint(constraint: CapacityConstraint): { valid: boolean; error?: string } {
  if (typeof constraint.maxHours !== 'number' || constraint.maxHours < 0) {
    return { valid: false, error: 'Invalid capacity constraint maxHours' }
  }
  if (constraint.type === TIME_BASIS_TYPES.ROLLING_WEEK && constraint.direction) {
    const validDirections: Array<'past' | 'centered' | 'future'> = ['past', 'centered', 'future']
    if (!validDirections.includes(constraint.direction)) {
      return { valid: false, error: 'Invalid capacity constraint direction' }
    }
  }
  return { valid: true }
}
