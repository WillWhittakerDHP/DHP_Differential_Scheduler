/**
 * Server-Side Constraint Extractor
 * 
 * LEARNING: Ported constraint extraction logic from client to server
 * WHY: Server orchestrator needs to extract constraints from AvailabilitySettings
 * PATTERN: Pure functions that extract and transform settings into constraint structures
 * 
 * Phase 2: Server-Side Computed Availability Data Refactor
 * - Ported from client/src/utils/booking/constraintExtractors.ts
 * - Uses shared types from @shared/types/availabilityTypes
 */

import type {
  RangeConstraint,
  OverlapConstraint,
  CapacityConstraint,
  Constraint,
  ConstraintEnforcement,
  DriveTimeApplyTo,
  RollingWeekDirection,
  BusinessHoursConfig,
  RFC3339DateTime,
} from '../../../shared/types/availabilityTypes.js'
import {
  RANGE_CONSTRAINT_TYPES,
  TIME_BASIS_TYPES,
} from '../../../shared/constants/constraintConstants.js'
import type { 
  AvailabilitySettingsData,
  RangeConstraint as DbRangeConstraint,
} from '../db/models/admin/business_settings'

/**
 * Require enforcement to be defined
 * LEARNING: Centralized enforcement validation eliminates duplication
 * WHY: Ensures consistent error messages and reduces repetition
 * PATTERN: Helper function that throws if enforcement is undefined
 * 
 * @param enforcement - Enforcement value to validate
 * @param label - Label for error message (e.g., "appointment buffer", "driveToCandidate buffer", "daily constraint")
 */
function requireEnforcement(enforcement: unknown, label: string): void {
  if (enforcement === undefined) {
    throw new Error(`Enforcement is required for ${label}. Must be 'off', 'flexible', or 'hard'.`)
  }
}

/**
 * Convert database model RangeConstraint to shared RangeConstraint
 * LEARNING: Converts plain string types to RFC3339DateTime branded types
 * WHY: Database models use plain strings, shared types use branded types for type safety
 * PATTERN: Type conversion function with proper casting
 */
function convertRangeConstraint(dbConstraint: DbRangeConstraint): RangeConstraint {
  // For businessHours config, convert DayHours strings to RFC3339DateTime
  if (dbConstraint.type === 'businessHours' && 'hours' in dbConstraint.config) {
    const convertedHours: BusinessHoursConfig['hours'] = {} as BusinessHoursConfig['hours']
    for (let day = 0; day <= 6; day++) {
      const dayHours = dbConstraint.config.hours[day as keyof typeof dbConstraint.config.hours]
      if (dayHours) {
        convertedHours[day as keyof BusinessHoursConfig['hours']] = {
          start: dayHours.start as RFC3339DateTime,
          end: dayHours.end as RFC3339DateTime,
        }
      }
    }
    return {
      category: 'range',
      type: dbConstraint.type,
      enforcement: dbConstraint.enforcement,
      config: {
        hours: convertedHours,
      } as BusinessHoursConfig,
    }
  }
  
  // For dateRange config, convert strings to RFC3339DateTime
  if (dbConstraint.type === 'dateRange' && 'start' in dbConstraint.config) {
    return {
      category: 'range',
      type: dbConstraint.type,
      enforcement: dbConstraint.enforcement,
      config: {
        start: dbConstraint.config.start as RFC3339DateTime,
        end: dbConstraint.config.end as RFC3339DateTime,
      },
    }
  }
  
  // For leadTime config, no conversion needed (just minutes)
  return {
    category: 'range',
    ...dbConstraint,
  } as RangeConstraint
}

/**
 * Extract range constraints from availability settings
 * LEARNING: Extracts businessHours, leadTime, and dateRange constraints
 * WHY: Consolidates time-based restrictions into unified structure
 * PATTERN: Pure function that transforms settings into constraint array
 */
export function extractRangeConstraints(
  settings: AvailabilitySettingsData
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
    constraints.push(convertRangeConstraint(businessHoursConstraint))
  }

  // Extract leadTime constraint (optional)
  const leadTimeConstraint = settings.rangeConstraints?.[RANGE_CONSTRAINT_TYPES.LEAD_TIME]
  if (leadTimeConstraint) {
    constraints.push(convertRangeConstraint(leadTimeConstraint))
  }

  // Extract dateRange constraint (optional but recommended)
  const dateRangeConstraint = settings.rangeConstraints?.[RANGE_CONSTRAINT_TYPES.DATE_RANGE]
  if (dateRangeConstraint) {
    constraints.push(convertRangeConstraint(dateRangeConstraint))
  }

  return constraints
}

/**
 * Extract overlap constraints (buffers) from availability settings
 * LEARNING: Extracts appointment, driveToCandidate, driveFromCandidate, and lunch buffers
 * WHY: Consolidates buffer checking into single pathway
 * PATTERN: Pure function that transforms settings into constraint array
 */
/**
 * Helper to extract a single drive time constraint
 * LEARNING: Consolidates driveToCandidate/driveFromCandidate extraction logic
 * WHY: Eliminates duplication between driveToCandidate and driveFromCandidate blocks
 * PATTERN: Pure function that extracts constraint if valid
 */
function extractDriveTimeConstraint(
  settings: AvailabilitySettingsData,
  type: 'driveToCandidate' | 'driveFromCandidate',
  placement: 'before' | 'after'
): OverlapConstraint | null {
  const driveTime = settings.buffers?.[type]
  if (!driveTime || driveTime.applyTo === 'none' || driveTime.minutes <= 0) {
    return null
  }
  
  // PATTERN: Check undefined BEFORE checking value to catch missing enforcement
  requireEnforcement(driveTime.enforcement, `${type} buffer`)
  
  return {
    category: 'overlap',
    type,
    placement,  // Implicit - driveToCandidate is always 'before', driveFromCandidate is always 'after'
    enforcement: driveTime.enforcement,
    minutes: driveTime.minutes,
    applyTo: driveTime.applyTo
  }
}

export function extractOverlapConstraints(
  settings: AvailabilitySettingsData
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
    requireEnforcement(buffer.enforcement, `${bufferType} buffer`)
    
    // PATTERN: After filtering out 'off', placement is guaranteed to be 'before' | 'after' | 'both'
    constraints.push({
      category: 'overlap',
      type: bufferType,
      placement: buffer.placement as 'before' | 'after' | 'both',
      enforcement: buffer.enforcement,
      minutes: buffer.minutes
    })
  })
  
  // WHY: Handle drive time types with implicit placement and applyTo configuration
  // PATTERN: Use loop pattern matching standard buffers for consistency
  const driveTimeConfigs: Array<{ type: 'driveToCandidate' | 'driveFromCandidate'; placement: 'before' | 'after' }> = [
    { type: 'driveToCandidate', placement: 'before' },   // Implicit - always before (travel TO appointment)
    { type: 'driveFromCandidate', placement: 'after' }   // Implicit - always after (travel FROM appointment)
  ]
  
  driveTimeConfigs.forEach(({ type, placement }) => {
    const constraint = extractDriveTimeConstraint(settings, type, placement)
    if (constraint) {
      constraints.push(constraint)
    }
  })
  
  return constraints
}

/**
 * Extract capacity constraints from availability settings
 * LEARNING: Extracts daily, calendarWeek, and rollingWeek capacity filters
 * WHY: Consolidates capacity checking into single pathway
 * PATTERN: Pure function that transforms settings into constraint array
 */
export function extractCapacityConstraints(
  settings: AvailabilitySettingsData
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
      requireEnforcement(filter.enforcement, `${type} constraint`)
      
      if (filter.enforcement === 'off') {
        return null
      }
      
      return {
        category: 'capacity',
        type,
        enforcement: filter.enforcement,
        maxHours: filter.maxHours,
        ...(type === TIME_BASIS_TYPES.ROLLING_WEEK && settingsKey === 'rollingWeek' && 'direction' in filter
          ? { 
              direction: (filter as { direction?: RollingWeekDirection }).direction 
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
 * NOTE: Currently only used in tests. Consider:
 * - Option 1: Wire into extraction pipeline (validate after extracting, before returning)
 * - Option 2: Move to test helpers (if validation is only needed for tests)
 * 
 * @param constraint - Range constraint to validate
 * @returns Object with valid boolean and optional error message
 */
export function validateRangeConstraint(constraint: RangeConstraint): { valid: boolean; error?: string } {
  switch (constraint.type) {
    case RANGE_CONSTRAINT_TYPES.BUSINESS_HOURS: {
      const config = constraint.config as BusinessHoursConfig
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
 * NOTE: Currently only used in tests. See validateRangeConstraint for architectural decision notes.
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
  if (constraint.type === 'driveToCandidate' || constraint.type === 'driveFromCandidate') {
    if (constraint.applyTo !== undefined) {
      const validApplyTo: Array<DriveTimeApplyTo> = ['all', 'skipDayStart', 'skipDayEnd', 'none']
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
 * NOTE: Currently only used in tests. See validateRangeConstraint for architectural decision notes.
 * 
 * @param constraint - Capacity constraint to validate
 * @returns Object with valid boolean and optional error message
 */
export function validateCapacityConstraint(constraint: CapacityConstraint): { valid: boolean; error?: string } {
  if (typeof constraint.maxHours !== 'number' || constraint.maxHours < 0) {
    return { valid: false, error: 'Invalid capacity constraint maxHours' }
  }
  if (constraint.type === TIME_BASIS_TYPES.ROLLING_WEEK && constraint.direction) {
    const validDirections: Array<RollingWeekDirection> = ['past', 'centered', 'future']
    if (!validDirections.includes(constraint.direction)) {
      return { valid: false, error: 'Invalid capacity constraint direction' }
    }
  }
  return { valid: true }
}

/**
 * Extract all constraints from availability settings
 * LEARNING: Unified extraction function that combines all constraint types
 * WHY: Enables single extraction call and unified constraint array
 * PATTERN: Spreads results from individual extractors into single array
 * 
 * @param settings - Availability settings data
 * @returns Unified array of all constraints
 */
export function extractConstraints(settings: AvailabilitySettingsData): Constraint[] {
  return [
    ...extractRangeConstraints(settings),
    ...extractOverlapConstraints(settings),
    ...extractCapacityConstraints(settings)
  ]
}
