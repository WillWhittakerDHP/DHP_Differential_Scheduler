/**
 * Build {@link CalendarNumericOverrides} from live availability + calendar payloads.
 * WHY: Feed {@link resolveOrganizationNumericPolicy} on server and client with the same shape.
 */
import type { AvailabilitySettingsData } from '../types/availabilitySettingsDocument.js'
import type { CalendarSettingsData } from '../types/calendarSettingsDocument.js'
import type { CalendarNumericOverrides } from '../types/organizationDefaults.js'

function leadTimeMinutesFromAvailability(data: AvailabilitySettingsData): number | undefined {
  const lt = data.rangeConstraints?.leadTime
  if (lt?.category !== 'range' || lt.type !== 'leadTime') {
    return undefined
  }
  const cfg = lt.config as { minutes?: number }
  if (typeof cfg?.minutes === 'number' && !Number.isNaN(cfg.minutes)) {
    return Math.floor(cfg.minutes)
  }
  return undefined
}

/**
 * Maps current availability + calendar rows into override leaves for merge-at-read.
 * Full availability/calendar fields are passed so resolver output matches current behavior
 * until per-field “use org default” is modeled with `undefined` leaves.
 */
export function buildCalendarNumericOverridesFromAvailabilityAndCalendar(
  availability: AvailabilitySettingsData,
  calendar: CalendarSettingsData
): CalendarNumericOverrides {
  const fee = availability.driveTimeFee
  const lead = leadTimeMinutesFromAvailability(availability)

  const overrides: CalendarNumericOverrides = {
    timeAndRounding: {
      minuteIncrement: availability.minuteIncrement,
      ...(availability.durationRounding != null
        ? { durationRounding: availability.durationRounding }
        : {}),
    },
    holdsAndAdminEntry: {
      holdDurationMinutes: calendar.holdDurationMinutes,
      holdDurationMin: calendar.holdDurationMin,
      holdDurationMax: calendar.holdDurationMax,
      holdDurationFallback: calendar.holdDurationFallback,
      adminEntryTimeout: calendar.adminEntryTimeout,
    },
  }

  if (fee != null) {
    overrides.driveTimeFee = {
      complimentaryDriveMinutes: fee.complimentaryDriveMinutes,
      drivingRatePerHour: fee.drivingRatePerHour,
      driveTimeRoundingMinutes: fee.driveTimeRoundingMinutes,
    }
  }

  if (lead !== undefined) {
    overrides.constraintBaselines = { leadTimeMinutes: lead }
  }

  return overrides
}
