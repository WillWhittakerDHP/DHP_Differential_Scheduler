/**
 * Core types and constants for availability settings.
 */
import type { GlobalEntityId } from '@shared/types/primitiveBrands'
import type {
  ConstraintEnforcement,
  Coordinates,
  DefaultLocation,
  DriveTimeApplyTo,
  DriveTimeConfig,
  DurationRoundingConfig,
  RangeConstraintType,
  WorkCapacityFilter,
  RollingWeekCapacityFilter,
  IncomeCapacityFilter,
  RollingWeekIncomeCapacityFilter,
  RollingWeekDirection,
  LeadTimeConfig,
  BusinessHoursConfig,
  DateRangeConfig,
  RangeConstraint as SharedRangeConstraint,
  DayHours,
  BufferConfig,
  DriveTimeFeeConfig,
} from '@shared/types/availabilityTypes'
export type {
  ConstraintEnforcement,
  Coordinates,
  DefaultLocation,
  DriveTimeApplyTo,
  DriveTimeConfig,
  DurationRoundingConfig,
  RangeConstraintType,
  WorkCapacityFilter,
  RollingWeekCapacityFilter,
  IncomeCapacityFilter,
  RollingWeekIncomeCapacityFilter,
  RollingWeekDirection,
  LeadTimeConfig,
  BusinessHoursConfig,
  DateRangeConfig,
  BufferConfig,
  DriveTimeFeeConfig,
}
export type { DayHours }

/**
 * Range constraint (storage shape): shared type uses category for discriminated union.
 * We use the shared type; when building from API/forms, add category: 'range' for compatibility.
 */
export type RangeConstraint = SharedRangeConstraint

/** Fallback minor perspective event name when wizard_settings.minorLabel is not set. */
export const DEFAULT_MINOR_EVENT_NAME = 'Minor'

/**
 * Availability settings (computation only). Calendar and wizard display live in calendar_settings / wizard_settings.
 */
export interface AvailabilitySettings {
  businessHours: {
    0: DayHours
    1: DayHours
    2: DayHours
    3: DayHours
    4: DayHours
    5: DayHours
    6: DayHours
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
  defaultLocation?: DefaultLocation
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
    majorAttendees?: GlobalEntityId[]
    minorAttendees?: GlobalEntityId[]
  } & DifferentialPerspectivesLabels
  /** Calendar/hold config when merged from calendar_settings (e.g. hold duration for slot hold). */
  calendarConfig?: {
    holdDurationMinutes?: number
  }
  /** Billable drive-time pricing (distinct from overlap buffer drive minutes). */
  driveTimeFee?: DriveTimeFeeConfig
}

/** Optional wizard/display labels on differential perspectives (form state; not in API payload). */
export interface DifferentialPerspectivesLabels {
  majorLabel?: string
  minorLabel?: string
  differentialGraphDefaultLabel?: string
  moveableFallbackLabel?: string
  majorStateLabel?: string
  minorStateLabel?: string
  subStepLabelPickDay?: string
  subStepLabelOptions?: string
  subStepLabelPickTime?: string
  subStepLabelConfirmMoveable?: string
}

export interface RawAvailabilitySettings {
  minuteIncrement: number
  rangeConstraints: {
    businessHours: RangeConstraint | (Omit<RangeConstraint, 'category'> & { category?: 'range' })
    leadTime?: RangeConstraint | (Omit<RangeConstraint, 'category'> & { category?: 'range' })
    dateRange?: RangeConstraint | (Omit<RangeConstraint, 'category'> & { category?: 'range' })
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
  timezone?: string
  durationRounding?: DurationRoundingConfig
  differentialPerspectives?: {
    majorAttendees?: string[]
    minorAttendees?: string[]
  }
  defaultLocation?: DefaultLocation
  overlapSources?: {
    outOfOffice?: {
      enforcement: ConstraintEnforcement
    }
  }
  driveTimeFee?: DriveTimeFeeConfig
}
