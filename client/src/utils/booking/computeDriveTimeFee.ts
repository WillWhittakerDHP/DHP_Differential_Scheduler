/**
 * Pure drive-time **billing** fee from admin settings (Phase 6.11).
 * WHY: Separates pricing math from UI/composables; matches phase guide formula (nearest rounding).
 */
import type { DriveTimeFeeConfig } from '@shared/types/availabilityTypes'

/** Defaults when API omits `driveTimeFee` (aligned with admin load path). */
export const DEFAULT_DRIVE_TIME_FEE_CONFIG: DriveTimeFeeConfig = {
  complimentaryDriveMinutes: 0,
  drivingRatePerHour: 0,
  driveTimeRoundingMinutes: 15,
}

/**
 * Merge partial API/config with defaults; coerce invalid rounding increment to default (> 0 required for billing).
 */
export function mergeDriveTimeFeeConfig(
  raw: DriveTimeFeeConfig | null | undefined
): DriveTimeFeeConfig {
  const merged: DriveTimeFeeConfig = {
    ...DEFAULT_DRIVE_TIME_FEE_CONFIG,
    ...raw,
  }
  if (
    typeof merged.driveTimeRoundingMinutes !== 'number' ||
    !Number.isFinite(merged.driveTimeRoundingMinutes) ||
    merged.driveTimeRoundingMinutes <= 0
  ) {
    merged.driveTimeRoundingMinutes = DEFAULT_DRIVE_TIME_FEE_CONFIG.driveTimeRoundingMinutes
  }
  if (typeof merged.complimentaryDriveMinutes !== 'number' || !Number.isFinite(merged.complimentaryDriveMinutes)) {
    merged.complimentaryDriveMinutes = DEFAULT_DRIVE_TIME_FEE_CONFIG.complimentaryDriveMinutes
  }
  if (typeof merged.drivingRatePerHour !== 'number' || !Number.isFinite(merged.drivingRatePerHour)) {
    merged.drivingRatePerHour = DEFAULT_DRIVE_TIME_FEE_CONFIG.drivingRatePerHour
  }
  return merged
}

interface ComputeDriveTimeFeeResult {
  /** Minutes charged after subtracting complimentary (before rounding). */
  billableMinutesRaw: number
  /** Billable minutes after rounding to nearest `driveTimeRoundingMinutes`. */
  billableMinutesRounded: number
  /** Dollar amount: (rounded / 60) × drivingRatePerHour. */
  fee: number
}

function assertFiniteNonNegative(name: string, value: number): void {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) {
    throw new Error(`computeDriveTimeFee: ${name} must be a finite number >= 0`)
  }
}

/**
 * Round positive `value` to the nearest multiple of `increment` (Phase 6.11 guide).
 * Zero stays zero.
 */
function roundBillableDriveMinutesToNearest(value: number, increment: number): number {
  if (value === 0) {
    return 0
  }
  if (typeof increment !== 'number' || !Number.isFinite(increment) || increment <= 0) {
    throw new Error('computeDriveTimeFee: driveTimeRoundingMinutes must be a finite number > 0')
  }
  return Math.round(value / increment) * increment
}

/**
 * Compute drive-time fee from total drive minutes and {@link DriveTimeFeeConfig}.
 *
 * Formula (phase-6.11-guide):
 * - billable = max(0, total − complimentary)
 * - rounded = nearest multiple of rounding minutes
 * - fee = (rounded / 60) × rate per hour
 */
export function computeDriveTimeFee(
  totalDriveMinutes: number,
  settings: DriveTimeFeeConfig
): ComputeDriveTimeFeeResult {
  assertFiniteNonNegative('totalDriveMinutes', totalDriveMinutes)
  assertFiniteNonNegative('complimentaryDriveMinutes', settings.complimentaryDriveMinutes)
  assertFiniteNonNegative('drivingRatePerHour', settings.drivingRatePerHour)

  const increment = settings.driveTimeRoundingMinutes
  if (typeof increment !== 'number' || !Number.isFinite(increment) || increment <= 0) {
    throw new Error('computeDriveTimeFee: driveTimeRoundingMinutes must be a finite number > 0')
  }

  const billableMinutesRaw = Math.max(0, totalDriveMinutes - settings.complimentaryDriveMinutes)
  const billableMinutesRounded = roundBillableDriveMinutesToNearest(billableMinutesRaw, increment)
  const fee = (billableMinutesRounded / 60) * settings.drivingRatePerHour

  if (!Number.isFinite(fee)) {
    throw new Error('computeDriveTimeFee: fee is not finite (check inputs)')
  }

  return {
    billableMinutesRaw,
    billableMinutesRounded,
    fee,
  }
}
