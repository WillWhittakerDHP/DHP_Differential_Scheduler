/**
 * Canonical wire/assembled shape for availability settings (admin + booking).
 */
import type {
  ConstraintEnforcement,
  RollingWeekDirection,
  WorkCapacityFilter,
  RollingWeekCapacityFilter,
  IncomeCapacityFilter,
  RollingWeekIncomeCapacityFilter,
  RangeConstraintType,
  RangeConstraint,
  BufferConfig,
  DriveTimeApplyTo,
  DriveTimeConfig,
  DefaultLocation,
  DurationRoundingConfig,
} from './availabilityTypes.js'

export type {
  ConstraintEnforcement,
  RollingWeekDirection,
  WorkCapacityFilter,
  RollingWeekCapacityFilter,
  IncomeCapacityFilter,
  RollingWeekIncomeCapacityFilter,
  RangeConstraintType,
  RangeConstraint,
  BufferConfig,
  DriveTimeApplyTo,
  DriveTimeConfig,
  DefaultLocation,
  DurationRoundingConfig,
}

export interface AvailabilitySettingsData {
  businessHours: {
    0: { start: string; end: string }
    1: { start: string; end: string }
    2: { start: string; end: string }
    3: { start: string; end: string }
    4: { start: string; end: string }
    5: { start: string; end: string }
    6: { start: string; end: string }
  }
  minuteIncrement: number
  rangeConstraints?: {
    businessHours?: RangeConstraint
    leadTime?: RangeConstraint
    dateRange?: RangeConstraint
  }
  buffers?: {
    appointment?: BufferConfig
    driveToCandidate?: DriveTimeConfig
    driveFromCandidate?: DriveTimeConfig
    lunch?: BufferConfig
  }
  maxWorkHours?: {
    day?: WorkCapacityFilter
    calendarWeek?: WorkCapacityFilter
    rollingWeek?: RollingWeekCapacityFilter
  }
  maxIncome?: {
    day?: IncomeCapacityFilter
    calendarWeek?: IncomeCapacityFilter
    rollingWeek?: RollingWeekIncomeCapacityFilter
  }
  overlapSources?: {
    outOfOffice?: {
      enforcement: ConstraintEnforcement
    }
  }
  timezone?: string
  durationRounding?: DurationRoundingConfig
  differentialPerspectives?: {
    majorAttendees?: string[]
    minorAttendees?: string[]
  }
  defaultLocation?: DefaultLocation
}
