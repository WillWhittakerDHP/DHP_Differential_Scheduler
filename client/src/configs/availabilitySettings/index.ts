/**
 * Availability settings config — barrel re-export.
 * Split by domain: types, constraints, businessHours, calendar, api.
 */
export {
  DEFAULT_CALENDAR_CONFIG,
  DEFAULT_MINOR_EVENT_NAME,
  type AvailabilitySettings,
  type RawAvailabilitySettings,
  type RangeConstraint,
  type CalendarConfig,
  type CalendarEntry,
  type CalendarProvider,
  type AdminEntryTimeout,
  type AdminEntryTimeoutUnit,
  type ConstraintEnforcement,
  type Coordinates,
  type DefaultLocation,
  type DriveTimeApplyTo,
  type DriveTimeConfig,
  type DurationRoundingConfig,
  type RangeConstraintType,
  type WorkCapacityFilter,
  type RollingWeekCapacityFilter,
  type IncomeCapacityFilter,
  type RollingWeekIncomeCapacityFilter,
  type RollingWeekDirection,
  type LeadTimeConfig,
  type BusinessHoursConfig,
  type DateRangeConfig,
  type BufferConfig,
  type DayHours,
} from './types'

export { ensureRangeConstraintCategory } from './constraints'
export { validateBusinessHoursRange } from './businessHours'
export { isValidCalendarEmail, getReadFromCalendars } from './calendar'
export {
  getAvailabilitySettings,
  invalidateAvailabilitySettingsCache,
  buildAvailabilityPayload,
} from './api'
