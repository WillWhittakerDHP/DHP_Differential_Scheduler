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
} from '@shared/types/availabilityTypes'
import type { CalendarConfig, CalendarEntry, CalendarProvider } from '@shared/types/calendarTypes'

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
}
export type { DayHours }

/**
 * Range constraint (storage shape): shared type uses category for discriminated union.
 * We use the shared type; when building from API/forms, add category: 'range' for compatibility.
 */
export type RangeConstraint = SharedRangeConstraint

export type { CalendarConfig, CalendarEntry, CalendarProvider }

/**
 * Default calendar configuration
 */
export const DEFAULT_CALENDAR_CONFIG: CalendarConfig = {
  enabled: false,
  provider: 'none',
  calendars: [],
  holdDurationMinutes: 15,
  holdDurationMin: 1,
  holdDurationMax: 60,
  holdDurationFallback: 15,
}

/** Fallback minor perspective event name when differentialPerspectives.minorLabel is not set. */
export const DEFAULT_MINOR_EVENT_NAME = 'Minor'

/**
 * Availability settings interface
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
    majorLabel?: string
    minorLabel?: string
    differentialGraphDefaultLabel?: string
    majorStateLabel?: string
    minorStateLabel?: string
    selectTimeSlotLabel?: string
  }
  calendarConfig?: CalendarConfig
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
    majorLabel?: string
    minorLabel?: string
    differentialGraphDefaultLabel?: string
    majorStateLabel?: string
    minorStateLabel?: string
    selectTimeSlotLabel?: string
  }
  calendarConfig?: CalendarConfig
  defaultLocation?: DefaultLocation
  overlapSources?: {
    outOfOffice?: {
      enforcement: ConstraintEnforcement
    }
  }
}
