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
  ConstraintEnforcement,
  DriveTimeApplyTo
} from '@/configs/availabilitySettings'
import type { BusinessHoursMap } from './timeSlotFitter'
import { RANGE_CONSTRAINT_TYPES, TIME_BASIS_TYPES } from '@/constants/constraintTypes'

/**
 * Overlap constraint (buffer) interface
 * LEARNING: Unified structure for all buffer types (appointment, driveTimeTo, driveTimeFrom, lunch)
 * WHY: Consolidates buffer checking into single pathway
 * PATTERN: Interface with type, placement, enforcement, minutes, and optional applyTo
 * 
 * Note: driveTimeTo always has placement='before', driveTimeFrom always has placement='after'
 * The applyTo field controls WHEN the constraint is applied (first/last/all appointments)
 */
export interface OverlapConstraint {
  type: 'appointment' | 'driveTimeTo' | 'driveTimeFrom' | 'lunch'
  placement: 'off' | 'before' | 'after' | 'both'
  enforcement: ConstraintEnforcement
  minutes: number
  applyTo?: DriveTimeApplyTo  // Only for drive time constraints (driveTimeTo, driveTimeFrom)
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
  
  // WHY: Handle standard buffer types (appointment, lunch) with placement
  const standardBufferTypes: Array<'appointment' | 'lunch'> = ['appointment', 'lunch']
  
  standardBufferTypes.forEach(bufferType => {
    const buffer = settings.buffers?.[bufferType]
    if (!buffer || buffer.placement === 'off' || buffer.minutes <= 0) {
      return
    }
    
    // PATTERN: Check undefined BEFORE checking value to catch missing enforcement
    if (buffer.enforcement === undefined) {
      throw new Error(`Buffer enforcement is required for ${bufferType} buffer. Must be 'off', 'flexible', or 'hard'.`)
    }
    
    // PATTERN: After filtering out 'off', placement is guaranteed to be 'before' | 'after' | 'both'
    constraints.push({
      type: bufferType,
      placement: buffer.placement as 'before' | 'after' | 'both',
      enforcement: buffer.enforcement,
      minutes: buffer.minutes
    })
  })
  
  // WHY: Handle driveTimeTo with implicit placement='before' and applyTo configuration
  // PATTERN: driveTimeTo is semantic - always applied BEFORE the appointment (arrival time)
  const driveTimeTo = settings.buffers?.driveTimeTo
  if (driveTimeTo && driveTimeTo.applyTo !== 'none' && driveTimeTo.minutes > 0) {
    if (driveTimeTo.enforcement === undefined) {
      throw new Error(`Buffer enforcement is required for driveTimeTo buffer. Must be 'off', 'flexible', or 'hard'.`)
    }
    
    constraints.push({
      type: 'driveTimeTo',
      placement: 'before',  // Implicit - always before (travel TO appointment)
      enforcement: driveTimeTo.enforcement,
      minutes: driveTimeTo.minutes,
      applyTo: driveTimeTo.applyTo
    })
  }
  
  // WHY: Handle driveTimeFrom with implicit placement='after' and applyTo configuration
  // PATTERN: driveTimeFrom is semantic - always applied AFTER the appointment (departure time)
  const driveTimeFrom = settings.buffers?.driveTimeFrom
  if (driveTimeFrom && driveTimeFrom.applyTo !== 'none' && driveTimeFrom.minutes > 0) {
    if (driveTimeFrom.enforcement === undefined) {
      throw new Error(`Buffer enforcement is required for driveTimeFrom buffer. Must be 'off', 'flexible', or 'hard'.`)
    }
    
    constraints.push({
      type: 'driveTimeFrom',
      placement: 'after',  // Implicit - always after (travel FROM appointment)
      enforcement: driveTimeFrom.enforcement,
      minutes: driveTimeFrom.minutes,
      applyTo: driveTimeFrom.applyTo
    })
  }
  
  return constraints
}

export function extractCapacityConstraints(
  settings: AvailabilitySettings
): CapacityConstraint[] {
  // WHY: Single pattern for all capacity types reduces duplication and makes adding new types easier
  // PATTERN: Use map + filter + map to extract constraints immutably
  const capacityTypeMap: Array<{
    type: CapacityConstraint['type']
    settingsKey: 'day' | 'calendarWeek' | 'rollingWeek'
  }> = [
    { type: TIME_BASIS_TYPES.DAILY, settingsKey: 'day' },
    { type: TIME_BASIS_TYPES.CALENDAR_WEEK, settingsKey: 'calendarWeek' },
    { type: TIME_BASIS_TYPES.ROLLING_WEEK, settingsKey: 'rollingWeek' }
  ]
  
  return capacityTypeMap
    .map(({ type, settingsKey }) => {
      const filter = settings.maxWorkHours?.[settingsKey]
      if (!filter) {
        return null
      }
      
      // PATTERN: Check undefined BEFORE checking value to catch missing enforcement
      if (filter.enforcement === undefined) {
        throw new Error(`Capacity enforcement is required for ${type} constraint. Must be 'off', 'flexible', or 'hard'.`)
      }
      
      if (filter.enforcement === 'off') {
        return null
      }
      
      return {
        type,
        enforcement: filter.enforcement,
        maxHours: filter.maxHours,
        ...(type === TIME_BASIS_TYPES.ROLLING_WEEK && settingsKey === 'rollingWeek'
          ? { 
              direction: (settings.maxWorkHours?.rollingWeek as RollingWeekCapacityFilter | undefined)?.direction 
            }
          : {})
      } as CapacityConstraint
    })
    .filter((constraint): constraint is CapacityConstraint => constraint !== null)
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
  
  // LEARNING: Validate applyTo for drive time constraints
  // PATTERN: Only validate applyTo if constraint is a drive time type
  if (constraint.type === 'driveTimeTo' || constraint.type === 'driveTimeFrom') {
    if (constraint.applyTo !== undefined) {
      const validApplyTo: Array<DriveTimeApplyTo> = ['all', 'first_only', 'last_only', 'none']
      if (!validApplyTo.includes(constraint.applyTo)) {
        return { valid: false, error: 'Invalid overlap constraint applyTo value' }
      }
    }
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
