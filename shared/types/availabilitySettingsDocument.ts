/**
 * Canonical wire/assembled shape for availability settings (admin + booking).
 * Nested enums/config types live in availabilityTypes.ts.
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
  DriveTimeFeeConfig,
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
  DriveTimeFeeConfig,
}

/** Availability-only config (calendar and wizard display live in calendar / wizard settings). */
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
  /** Computation only; display labels live in wizard_settings. */
  differentialPerspectives?: {
    majorAttendees?: string[]
    minorAttendees?: string[]
  }
  defaultLocation?: DefaultLocation
  driveTimeFee?: DriveTimeFeeConfig
}
