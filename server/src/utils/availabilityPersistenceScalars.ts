/**
 * WHY: Pure scalars / filters for availability relational persistence (keeps repository thinner).
 */

import type { AvailabilitySettingsData } from '../../../shared/types/availabilitySettingsDocument.js'

export interface DriveTimeFeeRowScalars {
  driveTimeFeeComplimentaryMinutes: number
  driveTimeFeeRatePerHour: number
  driveTimeFeeRoundingMinutes: number
}

export function driveTimeFeeScalarsForRow(
  fee: AvailabilitySettingsData['driveTimeFee']
): DriveTimeFeeRowScalars {
  const driveTimeFeeComplimentaryMinutes =
    fee == null || fee.complimentaryDriveMinutes == null ? 0 : fee.complimentaryDriveMinutes
  const driveTimeFeeRatePerHour = fee == null || fee.drivingRatePerHour == null ? 0 : fee.drivingRatePerHour
  const roundingRaw = fee == null ? undefined : fee.driveTimeRoundingMinutes
  const driveTimeFeeRoundingMinutes = roundingRaw === undefined || roundingRaw === null ? 15 : roundingRaw
  return { driveTimeFeeComplimentaryMinutes, driveTimeFeeRatePerHour, driveTimeFeeRoundingMinutes }
}

interface SanitizedDifferentialAttendees {
  majorSanitized: string[]
  minorSanitized: string[]
  droppedMajor: string[]
  droppedMinor: string[]
}

export function sanitizeDifferentialAttendeeIdsForPersist(
  dp: AvailabilitySettingsData['differentialPerspectives'],
  allowedDifferentialIds: Set<string>
): SanitizedDifferentialAttendees {
  const rawMajor = dp != null && Array.isArray(dp.majorAttendees) ? dp.majorAttendees : []
  const rawMinor = dp != null && Array.isArray(dp.minorAttendees) ? dp.minorAttendees : []
  const majorSanitized = rawMajor.filter((v) => allowedDifferentialIds.has(String(v)))
  const minorSanitized = rawMinor.filter((v) => allowedDifferentialIds.has(String(v)))
  return {
    majorSanitized,
    minorSanitized,
    droppedMajor: rawMajor.filter((v) => !allowedDifferentialIds.has(String(v))),
    droppedMinor: rawMinor.filter((v) => !allowedDifferentialIds.has(String(v))),
  }
}
