/**
 * Merge organization numeric defaults with calendar/availability overrides (Phase 6.14).
 * WHY: Single pure resolver for client + server; no Vue-only fallbacks.
 */

import type {
  DurationRoundingConfig,
  DriveTimeFeeConfig,
} from '../types/availabilityTypes'
import type { AdminEntryTimeout } from '../types/calendarTypes'
import type {
  CalendarNumericOverrides,
  HoldsAndAdminEntrySnapshot,
  OrganizationDefaults,
  ResolvedNumericPolicy,
} from '../types/organizationDefaults'

function mergeDurationRounding(
  org: DurationRoundingConfig,
  over: Partial<DurationRoundingConfig> | undefined
): DurationRoundingConfig {
  if (!over) return org
  return {
    enabled: over.enabled !== undefined ? over.enabled : org.enabled,
    increment: over.increment !== undefined ? over.increment : org.increment,
    method: over.method !== undefined ? over.method : org.method,
  }
}

function mergeDriveTimeFee(
  org: DriveTimeFeeConfig,
  over: Partial<DriveTimeFeeConfig> | undefined
): DriveTimeFeeConfig {
  if (!over) return org
  return {
    complimentaryDriveMinutes:
      over.complimentaryDriveMinutes !== undefined
        ? over.complimentaryDriveMinutes
        : org.complimentaryDriveMinutes,
    drivingRatePerHour:
      over.drivingRatePerHour !== undefined ? over.drivingRatePerHour : org.drivingRatePerHour,
    driveTimeRoundingMinutes:
      over.driveTimeRoundingMinutes !== undefined
        ? over.driveTimeRoundingMinutes
        : org.driveTimeRoundingMinutes,
  }
}

function mergeAdminEntryTimeout(
  org: AdminEntryTimeout,
  over: Partial<AdminEntryTimeout> | undefined
): AdminEntryTimeout {
  if (!over) return org
  return {
    value: over.value !== undefined ? over.value : org.value,
    unit: over.unit !== undefined ? over.unit : org.unit,
  }
}

function clampHoldDuration(snapshot: HoldsAndAdminEntrySnapshot): HoldsAndAdminEntrySnapshot {
  const holdMin = Math.min(snapshot.holdDurationMin, snapshot.holdDurationMax)
  const holdMax = Math.max(snapshot.holdDurationMin, snapshot.holdDurationMax)
  const minutes = Math.min(Math.max(snapshot.holdDurationMinutes, holdMin), holdMax)
  return {
    ...snapshot,
    holdDurationMin: holdMin,
    holdDurationMax: holdMax,
    holdDurationMinutes: minutes,
  }
}

function mergeHoldsAndAdminEntry(
  org: HoldsAndAdminEntrySnapshot,
  over: CalendarNumericOverrides['holdsAndAdminEntry'] | undefined
): HoldsAndAdminEntrySnapshot {
  if (!over) return clampHoldDuration({ ...org })
  const merged: HoldsAndAdminEntrySnapshot = {
    holdDurationMinutes:
      over.holdDurationMinutes !== undefined ? over.holdDurationMinutes : org.holdDurationMinutes,
    holdDurationMin: over.holdDurationMin !== undefined ? over.holdDurationMin : org.holdDurationMin,
    holdDurationMax: over.holdDurationMax !== undefined ? over.holdDurationMax : org.holdDurationMax,
    holdDurationFallback:
      over.holdDurationFallback !== undefined ? over.holdDurationFallback : org.holdDurationFallback,
    adminEntryTimeout: mergeAdminEntryTimeout(org.adminEntryTimeout, over.adminEntryTimeout),
  }
  return clampHoldDuration(merged)
}

function mergeConstraintBaselines(
  org: OrganizationDefaults['constraintBaselines'],
  over: CalendarNumericOverrides['constraintBaselines'] | undefined
): OrganizationDefaults['constraintBaselines'] {
  if (!over && !org) return undefined
  if (!over) return org
  const base = org ?? {}
  const overlapBufferMinutes = {
    ...base.overlapBufferMinutes,
    ...over.overlapBufferMinutes,
  }
  const capacity = {
    ...base.capacity,
    ...over.capacity,
  }
  const leadTimeMinutes =
    over.leadTimeMinutes !== undefined ? over.leadTimeMinutes : base.leadTimeMinutes

  const next: NonNullable<OrganizationDefaults['constraintBaselines']> = {}
  if (leadTimeMinutes !== undefined) next.leadTimeMinutes = leadTimeMinutes
  if (Object.keys(overlapBufferMinutes).length > 0) next.overlapBufferMinutes = overlapBufferMinutes
  if (Object.keys(capacity).length > 0) next.capacity = capacity

  return Object.keys(next).length > 0 ? next : undefined
}

/**
 * Merge persisted organization defaults with optional calendar/availability overrides.
 * Leaf `undefined` in overrides means “keep org default”. After merge, hold duration is clamped to [min, max].
 */
export function resolveOrganizationNumericPolicy(
  orgDefaults: OrganizationDefaults,
  overrides: CalendarNumericOverrides | undefined
): ResolvedNumericPolicy {
  const o = overrides
  const minuteIncrement =
    o?.timeAndRounding?.minuteIncrement !== undefined
      ? o.timeAndRounding.minuteIncrement
      : orgDefaults.timeAndRounding.minuteIncrement

  const durationRounding = mergeDurationRounding(
    orgDefaults.timeAndRounding.durationRounding,
    o?.timeAndRounding?.durationRounding
  )

  const driveTimeFee = mergeDriveTimeFee(orgDefaults.driveTimeFee, o?.driveTimeFee)

  const holdsAndAdminEntry = mergeHoldsAndAdminEntry(
    orgDefaults.holdsAndAdminEntry,
    o?.holdsAndAdminEntry
  )

  const constraintBaselines = mergeConstraintBaselines(
    orgDefaults.constraintBaselines,
    o?.constraintBaselines
  )

  const result: ResolvedNumericPolicy = {
    timeAndRounding: {
      minuteIncrement,
      durationRounding,
    },
    driveTimeFee,
    holdsAndAdminEntry,
  }

  if (constraintBaselines !== undefined) {
    result.constraintBaselines = constraintBaselines
  }

  return result
}
