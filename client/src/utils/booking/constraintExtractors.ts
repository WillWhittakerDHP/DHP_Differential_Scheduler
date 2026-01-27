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

/**
 * Extract range constraints from availability settings
 * LEARNING: Pure read-and-map extraction - no fallbacks or legacy support
 * WHY: Single pathway for all time-based restrictions, fail fast on misconfiguration
 * PATTERN: Extract from structured rangeConstraints only, throw on legacy/top-level fields
 * 
 * @param settings - Availability settings with structured rangeConstraints
 * @returns Array of range constraints
 */
export function extractRangeConstraints(
  settings: AvailabilitySettings
): RangeConstraint[] {
  const constraints: RangeConstraint[] = []

  // LEARNING: Fail fast if legacy top-level businessHours exists without structured rangeConstraints
  // WHY: Prevents silent fallback behavior, forces explicit structured configuration
  // PATTERN: Check for legacy fields, throw error directly to surface misconfiguration
  if (settings.businessHours && !settings.rangeConstraints?.businessHours) {
    throw new Error('Legacy top-level businessHours field detected. Use rangeConstraints.businessHours instead.')
  }

  // LEARNING: Require businessHours constraint to be explicitly provided
  // WHY: Business hours are essential for slot generation, should be explicit
  // PATTERN: Check for required constraint, throw if missing
  if (!settings.rangeConstraints?.businessHours) {
    throw new Error('Required rangeConstraints.businessHours is missing. Business hours must be provided in structured format.')
  }

  // Extract businessHours constraint (now guaranteed to exist)
  constraints.push(settings.rangeConstraints.businessHours)

  // Extract leadTime constraint (optional)
  if (settings.rangeConstraints?.leadTime) {
    constraints.push(settings.rangeConstraints.leadTime)
  }

  // Extract dateRange constraint (optional but recommended)
  if (settings.rangeConstraints?.dateRange) {
    constraints.push(settings.rangeConstraints.dateRange)
  }

  return constraints
}

/**
 * Extract overlap constraints (buffers) from availability settings
 * LEARNING: Consolidates all buffer types into unified structure
 * WHY: Single pathway for all overlap prevention
 * PATTERN: Extract from buffers object, convert BufferConfig to OverlapConstraint
 * 
 * @param settings - Availability settings
 * @returns Array of overlap constraints
 */
export function extractOverlapConstraints(
  settings: AvailabilitySettings
): OverlapConstraint[] {
  const constraints: OverlapConstraint[] = []
  const bufferTypes: Array<'appointment' | 'driveTime' | 'lunch'> = ['appointment', 'driveTime', 'lunch']

  // LEARNING: Iterate over buffer types to eliminate repetitive code
  // WHY: Single pattern for all buffer types reduces duplication and makes adding new types easier
  // PATTERN: Loop over buffer types, extract and validate each buffer
  for (const bufferType of bufferTypes) {
    const buffer = settings.buffers?.[bufferType]
    if (buffer && buffer.placement !== 'off' && buffer.minutes > 0) {
      // LEARNING: Require explicit enforcement - no fallbacks
      // WHY: Enforces explicit configuration, prevents silent defaults
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

/**
 * Extract capacity constraints from availability settings
 * LEARNING: Consolidates all capacity filters into unified structure
 * WHY: Single pathway for all capacity checking
 * PATTERN: Extract from maxWorkHours object, convert to CapacityConstraint using loop pattern
 * 
 * @param settings - Availability settings
 * @returns Array of capacity constraints
 */
export function extractCapacityConstraints(
  settings: AvailabilitySettings
): CapacityConstraint[] {
  const constraints: CapacityConstraint[] = []
  
  // LEARNING: Map from constraint type to settings key
  // WHY: Single pattern for all capacity types reduces duplication and makes adding new types easier
  // PATTERN: Loop over capacity types, extract and validate each constraint
  const capacityTypeMap: Array<{
    type: CapacityConstraint['type']
    settingsKey: 'day' | 'calendarWeek' | 'rollingWeek'
  }> = [
    { type: 'daily', settingsKey: 'day' },
    { type: 'calendarWeek', settingsKey: 'calendarWeek' },
    { type: 'rollingWeek', settingsKey: 'rollingWeek' }
  ]
  
  for (const { type, settingsKey } of capacityTypeMap) {
    const filter = settings.maxWorkHours?.[settingsKey]
    if (filter) {
      // LEARNING: Require explicit enforcement - no fallbacks
      // WHY: Enforces explicit configuration, prevents silent defaults
      // PATTERN: Check undefined BEFORE checking value to catch missing enforcement
      if (filter.enforcement === undefined) {
        throw new Error(`Capacity enforcement is required for ${type} constraint. Must be 'off', 'flexible', or 'hard'.`)
      }
      
      // Skip 'off' constraints
      if (filter.enforcement === 'off') {
        continue
      }
      
      const constraint: CapacityConstraint = {
        type,
        enforcement: filter.enforcement,
        maxHours: filter.maxHours,
        ...(type === 'rollingWeek' && settingsKey === 'rollingWeek'
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
    case 'businessHours': {
      const config = constraint.config as { hours: BusinessHoursMap }
      if (!config?.hours || typeof config.hours !== 'object') {
        return { valid: false, error: 'Invalid businessHours constraint config' }
      }
      return { valid: true }
    }
    case 'leadTime': {
      const config = constraint.config as { minutes: number }
      if (typeof config?.minutes !== 'number' || config.minutes < 0) {
        return { valid: false, error: 'Invalid leadTime constraint config' }
      }
      return { valid: true }
    }
    case 'dateRange': {
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
  // WHY: Only active constraints (placement !== 'off') are validated
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
  if (constraint.type === 'rollingWeek' && constraint.direction) {
    const validDirections: Array<'past' | 'centered' | 'future'> = ['past', 'centered', 'future']
    if (!validDirections.includes(constraint.direction)) {
      return { valid: false, error: 'Invalid capacity constraint direction' }
    }
  }
  return { valid: true }
}
