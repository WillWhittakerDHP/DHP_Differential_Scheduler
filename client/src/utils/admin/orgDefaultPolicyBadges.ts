/**
 * WHY: Compare persisted Business Controls availability/calendar fields to Organization defaults
 * for minimal “Org default” / “Override” chips (Phase 6.14.3).
 */
import type { OrganizationDefaults } from '@shared/types/organizationDefaults'

/**
 * @returns `true` if slot increment matches org baseline, `false` if org is loaded and differs, `null` if org unavailable.
 */
export function minuteIncrementMatchesOrg(
  minuteIncrement: number,
  org: OrganizationDefaults | null | undefined
): boolean | null {
  if (org == null) {
    return null
  }
  return minuteIncrement === org.timeAndRounding.minuteIncrement
}

/**
 * Compare availability duration rounding to org {@link OrganizationDefaults#timeAndRounding.durationRounding}.
 * Uses org increment fallback to org minute increment when rounding increment is unset (same as merge semantics).
 */
export function durationRoundingMatchesOrg(
  enabled: boolean,
  increment: number,
  method: string,
  org: OrganizationDefaults | null | undefined
): boolean | null {
  if (org == null) {
    return null
  }
  const dr = org.timeAndRounding.durationRounding
  if (dr.enabled !== enabled) {
    return false
  }
  if (!enabled) {
    return true
  }
  const effectiveOrgIncrement = dr.increment ?? org.timeAndRounding.minuteIncrement
  const effectiveOrgMethod = dr.method ?? 'roundNearest'
  return increment === effectiveOrgIncrement && method === effectiveOrgMethod
}
