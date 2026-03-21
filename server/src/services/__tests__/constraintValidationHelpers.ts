/**
WHY: Validators are only used in...
 */
import type {
  RangeConstraint,
  OverlapConstraint,
  CapacityConstraint,
  DriveTimeApplyTo,
  RollingWeekDirection,
  BusinessHoursConfig,
  RangeConstraintType,
} from '../../../../shared/types/availabilityTypes.js'
import {
  RANGE_CONSTRAINT_TYPES,
  TIME_BASIS_TYPES,
} from '../../../../shared/constants/constraintConstants.js'

export type ValidationResult = { valid: boolean; error?: string }

/** Centralized validation error message (reduces hardcoded magic strings). */
function createValidationError(constraintType: string, field: string): string {
  return `Invalid ${constraintType} constraint ${field}`
}

function validateBusinessHoursConfig(config: unknown): ValidationResult {
  const c = config as BusinessHoursConfig
  if (!c?.hours || typeof c.hours !== 'object') {
    return { valid: false, error: createValidationError(RANGE_CONSTRAINT_TYPES.BUSINESS_HOURS, 'config') }
  }
  return { valid: true }
}

function validateLeadTimeConfig(config: unknown): ValidationResult {
  const c = config as { minutes: number }
  if (typeof c?.minutes !== 'number' || c.minutes < 0) {
    return { valid: false, error: createValidationError(RANGE_CONSTRAINT_TYPES.LEAD_TIME, 'config') }
  }
  return { valid: true }
}

function validateDateRangeConfig(config: unknown): ValidationResult {
  const c = config as { start: string; end: string }
  if (!c?.start || !c?.end || typeof c.start !== 'string' || typeof c.end !== 'string') {
    return { valid: false, error: createValidationError('dateRange', 'config') }
  }
  const rangeStart = new Date(c.start)
  const rangeEnd = new Date(c.end)
  if (isNaN(rangeStart.getTime()) || isNaN(rangeEnd.getTime())) {
    return { valid: false, error: createValidationError('dateRange', 'dates') }
  }
  return { valid: true }
}

const RANGE_VALIDATORS: Record<RangeConstraintType, (config: unknown) => ValidationResult> = {
  [RANGE_CONSTRAINT_TYPES.BUSINESS_HOURS]: validateBusinessHoursConfig,
  [RANGE_CONSTRAINT_TYPES.LEAD_TIME]: validateLeadTimeConfig,
  [RANGE_CONSTRAINT_TYPES.DATE_RANGE]: validateDateRangeConfig,
}

/** Validate range constraint configuration (test helper). */
export function validateRangeConstraint(constraint: RangeConstraint): ValidationResult {
  return RANGE_VALIDATORS[constraint.type](constraint.config)
}

/**
 * Validate overlap constraint configuration (test helper)
 */
export function validateOverlapConstraint(constraint: OverlapConstraint): ValidationResult {
  if (typeof constraint.minutes !== 'number' || constraint.minutes < 0) {
    return { valid: false, error: createValidationError('overlap', 'minutes') }
  }
  const validPlacements: Array<'before' | 'after' | 'both'> = ['before', 'after', 'both']
  if (constraint.placement !== 'off' && !validPlacements.includes(constraint.placement)) {
    return { valid: false, error: createValidationError('overlap', 'placement') }
  }
  if (constraint.type === 'driveToCandidate' || constraint.type === 'driveFromCandidate') {
    if (constraint.applyTo !== undefined) {
      const validApplyTo: Array<DriveTimeApplyTo> = ['all', 'skipDayStart', 'skipDayEnd', 'none']
      if (!validApplyTo.includes(constraint.applyTo)) {
        return { valid: false, error: createValidationError('overlap', 'applyTo value') }
      }
    }
  }
  return { valid: true }
}

/**
 * Validate capacity constraint configuration (test helper)
 */
export function validateCapacityConstraint(constraint: CapacityConstraint): ValidationResult {
  if (typeof constraint.maxHours !== 'number' || constraint.maxHours < 0) {
    return { valid: false, error: createValidationError('capacity', 'maxHours') }
  }
  if (constraint.type === TIME_BASIS_TYPES.ROLLING_WEEK && constraint.direction) {
    const validDirections: Array<RollingWeekDirection> = ['past', 'centered', 'future']
    if (!validDirections.includes(constraint.direction)) {
      return { valid: false, error: createValidationError('capacity', 'direction') }
    }
  }
  return { valid: true }
}
