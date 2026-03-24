/**
 * Merge partial persisted JSON with factory defaults so all leaves exist (Phase 6.14).
 */
import type { OrganizationDefaults } from '../types/organizationDefaults.js'
import { createDefaultOrganizationDefaults } from './defaultOrganizationDefaults.js'

export function normalizeOrganizationDefaults(
  raw: OrganizationDefaults | null | undefined
): OrganizationDefaults {
  const base = createDefaultOrganizationDefaults()
  if (!raw) {
    return base
  }
  return {
    ...base,
    ...raw,
    timeAndRounding: {
      ...base.timeAndRounding,
      ...raw.timeAndRounding,
      durationRounding: {
        ...base.timeAndRounding.durationRounding,
        ...raw.timeAndRounding.durationRounding,
      },
    },
    driveTimeFee: { ...base.driveTimeFee, ...raw.driveTimeFee },
    holdsAndAdminEntry: {
      ...base.holdsAndAdminEntry,
      ...raw.holdsAndAdminEntry,
      adminEntryTimeout: {
        ...base.holdsAndAdminEntry.adminEntryTimeout,
        ...raw.holdsAndAdminEntry.adminEntryTimeout,
      },
    },
    constraintBaselines:
      raw.constraintBaselines != null
        ? { ...base.constraintBaselines, ...raw.constraintBaselines }
        : base.constraintBaselines,
  }
}
