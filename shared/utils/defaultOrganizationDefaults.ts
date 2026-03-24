/**
 * Baseline {@link OrganizationDefaults} when none persisted (Phase 6.14).
 * WHY: Aligns with app defaults in business-settings + calendar-settings repositories.
 */
import type { OrganizationDefaults } from '../types/organizationDefaults.js'

export function createDefaultOrganizationDefaults(): OrganizationDefaults {
  return {
    timeAndRounding: {
      minuteIncrement: 15,
      durationRounding: {
        enabled: false,
        increment: 15,
        method: 'roundUp',
      },
    },
    driveTimeFee: {
      complimentaryDriveMinutes: 0,
      drivingRatePerHour: 0,
      driveTimeRoundingMinutes: 15,
    },
    holdsAndAdminEntry: {
      holdDurationMinutes: 15,
      holdDurationMin: 1,
      holdDurationMax: 60,
      holdDurationFallback: 15,
      adminEntryTimeout: { value: 30, unit: 'days' },
    },
    constraintBaselines: {
      leadTimeMinutes: 60,
    },
  }
}
