/**
 * Organization-level numeric policy defaults and merge-at-read types (Phase 6.14).
 * WHY: Single JSON-serializable contract for org defaults vs calendar/availability overrides.
 * PATTERN: Reuse shared availability/calendar shapes; document merge rules in FIELD_INVENTORY below.
 */

import type {
  DurationRoundingConfig,
  DriveTimeFeeConfig,
} from './availabilityTypes'
import type { AdminEntryTimeout } from './calendarTypes'

/**
 * Hold + admin-entry fields aligned with {@link CalendarConfig} numeric hold policy.
 */
export interface HoldsAndAdminEntrySnapshot {
  holdDurationMinutes: number
  holdDurationMin: number
  holdDurationMax: number
  holdDurationFallback: number
  adminEntryTimeout: AdminEntryTimeout
}

/**
 * Optional org baselines for constraint math (minutes / caps). Wired incrementally in later tasks.
 */
export interface ConstraintBaselinesSnapshot {
  /** From rangeConstraints.leadTime when config is LeadTimeConfig. */
  leadTimeMinutes?: number
  overlapBufferMinutes?: {
    appointment?: number
    driveToCandidate?: number
    driveFromCandidate?: number
    lunch?: number
  }
  capacity?: {
    maxHoursDaily?: number
    maxIncomeDaily?: number
  }
}

/**
 * Full numeric policy snapshot: org defaults and post-merge resolved values share this shape.
 */
export interface OrganizationNumericPolicySnapshot {
  timeAndRounding: {
    minuteIncrement: number
    durationRounding: DurationRoundingConfig
  }
  driveTimeFee: DriveTimeFeeConfig
  holdsAndAdminEntry: HoldsAndAdminEntrySnapshot
  constraintBaselines?: ConstraintBaselinesSnapshot
}

/** Canonical defaults persisted for the organization (merge base). */
export type OrganizationDefaults = OrganizationNumericPolicySnapshot

/** Output of {@link resolveOrganizationNumericPolicy} (same structure as merged snapshot). */
export type ResolvedNumericPolicy = OrganizationNumericPolicySnapshot

/**
 * Partial overrides from calendar / availability payloads. `undefined` at a leaf means
 * “use organization default”; explicit numbers (including `0` where valid) replace the default.
 */
export interface CalendarNumericOverrides {
  timeAndRounding?: {
    minuteIncrement?: number
    durationRounding?: Partial<DurationRoundingConfig>
  }
  driveTimeFee?: Partial<DriveTimeFeeConfig>
  holdsAndAdminEntry?: {
    holdDurationMinutes?: number
    holdDurationMin?: number
    holdDurationMax?: number
    holdDurationFallback?: number
    adminEntryTimeout?: Partial<AdminEntryTimeout>
  }
  constraintBaselines?: {
    leadTimeMinutes?: number
    overlapBufferMinutes?: Partial<NonNullable<ConstraintBaselinesSnapshot['overlapBufferMinutes']>>
    capacity?: Partial<NonNullable<ConstraintBaselinesSnapshot['capacity']>>
  }
}

/**
 * FIELD_INVENTORY — default vs override sources (documentation for 6.14.1.2 wiring).
 *
 * | Policy field | Org default source | Override source | Merge / notes |
 * |--------------|-------------------|-----------------|---------------|
 * | minuteIncrement | OrganizationDefaults.timeAndRounding | availability payload / calendar | Leaf number; 0 invalid for grid — validate at save |
 * | durationRounding.* | OrganizationDefaults.timeAndRounding.durationRounding | partial | Per-field merge; `enabled` false still merges other fields if set |
 * | driveTimeFee.* | OrganizationDefaults.driveTimeFee | partial | complimentaryDriveMinutes may be 0 (valid) |
 * | hold duration | holdsAndAdminEntry | CalendarConfig | After merge, clamp holdDurationMinutes to [min,max]; use fallback when input missing |
 * | adminEntryTimeout | holdsAndAdminEntry | CalendarConfig | Replace unit/value together when both provided |
 * | leadTime / buffers / capacity | constraintBaselines | availability constraints | Incremental; optional in v1 resolver |
 */
export const FIELD_INVENTORY_DOC = 'organizationDefaults.FIELD_INVENTORY' as const
