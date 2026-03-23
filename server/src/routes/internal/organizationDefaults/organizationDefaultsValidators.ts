/**
 * Structural validation for PUT /organization-defaults (Phase 6.14).
 */
import type { OrganizationDefaults } from '../../../../../shared/types/organizationDefaults.js'

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v)
}

export function validateOrganizationDefaultsPayload(raw: unknown): raw is OrganizationDefaults {
  if (!isPlainObject(raw)) {
    return false
  }
  const tr = raw.timeAndRounding
  if (!isPlainObject(tr)) return false
  if (typeof tr.minuteIncrement !== 'number' || tr.minuteIncrement <= 0) return false
  const dr = tr.durationRounding
  if (!isPlainObject(dr)) return false
  if (typeof dr.enabled !== 'boolean') return false
  if (dr.increment !== undefined && (typeof dr.increment !== 'number' || dr.increment <= 0)) return false
  if (
    dr.method !== undefined &&
    dr.method !== 'roundUp' &&
    dr.method !== 'roundDown' &&
    dr.method !== 'roundNearest'
  ) {
    return false
  }

  const df = raw.driveTimeFee
  if (!isPlainObject(df)) return false
  if (typeof df.complimentaryDriveMinutes !== 'number' || Number.isNaN(df.complimentaryDriveMinutes)) {
    return false
  }
  if (typeof df.drivingRatePerHour !== 'number' || Number.isNaN(df.drivingRatePerHour)) return false
  if (typeof df.driveTimeRoundingMinutes !== 'number' || df.driveTimeRoundingMinutes <= 0) return false

  const ha = raw.holdsAndAdminEntry
  if (!isPlainObject(ha)) return false
  const nums = [
    ha.holdDurationMinutes,
    ha.holdDurationMin,
    ha.holdDurationMax,
    ha.holdDurationFallback,
  ]
  for (const n of nums) {
    if (typeof n !== 'number' || Number.isNaN(n)) return false
  }
  const adm = ha.adminEntryTimeout
  if (!isPlainObject(adm)) return false
  if (typeof adm.value !== 'number' || adm.value < 1) return false
  if (adm.unit !== 'days' && adm.unit !== 'weeks') return false

  if (raw.constraintBaselines !== undefined) {
    const cb = raw.constraintBaselines
    if (!isPlainObject(cb)) return false
    if (cb.leadTimeMinutes !== undefined) {
      if (typeof cb.leadTimeMinutes !== 'number' || cb.leadTimeMinutes < 0) return false
    }
  }

  return true
}
