/**
 * WHY: Phase 8.7 — single map from `checkOwnership(resourceName, …)` strings to ownership semantics.
 * Task 8.7.1.2 middleware reads this registry; unknown `resourceName` must fail closed (log + error).
 */
import type { Model, ModelStatic } from 'sequelize'
import { Appointment, User } from '../config/app.js'

/** How to compare `req.user.id` to a loaded Sequelize row (8.7.1.2). */
type OwnershipOwnerResolution =
  | { mode: 'column'; field: string }
  | { mode: 'row_pk_is_user' }

export type OwnershipRegistryEntry =
  | {
      kind: 'sequelize'
      model: ModelStatic<Model>
      owner: OwnershipOwnerResolution
      notes?: string
    }
  | { kind: 'dynamic_entity'; notes?: string }
  | { kind: 'special'; reason: string }

/**
 * Every `resourceName` currently passed to `checkOwnership` (manual calls + `createCrudRouter`).
 * Keep in sync with `rg "checkOwnership\\(" server` and `resourceName:` in CRUD configs.
 */
const OWNERSHIP_RESOURCE_NAMES = [
  'appointment',
  'appointmentFeeSummary',
  'beta feedback',
  'business rule',
  'businessSetting',
  'calendarSetting',
  'entity',
  'property',
  'property feature mapping',
  'property field mapping',
  'propertyType',
  'user',
  'wizardSetting',
] as const

type OwnershipResourceName = (typeof OWNERSHIP_RESOURCE_NAMES)[number]

const OWNERSHIP_REGISTRY: Record<OwnershipResourceName, OwnershipRegistryEntry> = {
  appointment: {
    kind: 'sequelize',
    model: Appointment,
    owner: { mode: 'column', field: 'scheduledById' },
    notes:
      'Uses `scheduledById` as primary “owner” for mutating appointments; `heldBy` is hold-slot semantics. Revisit if org/shared-calendar rules change.',
  },
  appointmentFeeSummary: {
    kind: 'special',
    reason:
      'Row links via `appointmentId`; enforce by resolving parent `Appointment` ownership (same user as appointment `scheduledById` / product rule).',
  },
  'beta feedback': {
    kind: 'special',
    reason:
      'No `userId` column; reporter fields only. Gate with `requireRole` / admin policy in 8.7.2 rather than per-row user match.',
  },
  'business rule': {
    kind: 'special',
    reason: 'Scoped to `blockInstanceId`; no per-user owner — admin or block-level policy in 8.7.2.',
  },
  businessSetting: {
    kind: 'special',
    reason:
      'Availability settings via repository (`key` param, not `findByPk` on a single settings model). Custom resolver in 8.7.1.2.',
  },
  calendarSetting: {
    kind: 'special',
    reason:
      'Singleton `calendar_settings` — no per-user owner column. Route PUT uses `checkOwnership("calendarSetting","id")` but path has no `:id`; treat as admin-only in 8.7.2.',
  },
  entity: {
    kind: 'dynamic_entity',
    notes: 'Model + owner semantics from `req.entityConfig` after `entityTypeParamHandler`.',
  },
  property: {
    kind: 'special',
    reason:
      '`PropertyVersion` has no `userId`; ownership may chain through `Address` or be admin-global. Define policy in 8.7.2.',
  },
  'property feature mapping': {
    kind: 'special',
    reason: 'Admin integration config (`PropertyFeatureMapping`) — no per-user owner column.',
  },
  'property field mapping': {
    kind: 'special',
    reason: 'Admin integration config (`PropertyFieldMapping`) — no per-user owner column.',
  },
  propertyType: {
    kind: 'special',
    reason:
      '`PropertyVersionType` row is keyed by param `typeId` (junction). Enforce via parent `PropertyVersion` / property policy after `findByPk(typeId)` in 8.7.1.2.',
  },
  user: {
    kind: 'sequelize',
    model: User,
    owner: { mode: 'row_pk_is_user' },
    notes: 'Users may only mutate their own row: `row.id === req.user.id`.',
  },
  wizardSetting: {
    kind: 'special',
    reason: 'Singleton `wizard_settings` — same pattern as `calendarSetting`.',
  },
}

/** Lookup for 8.7.1.2. Returns `undefined` when `resourceName` is not registered (fail closed). */
export function getOwnershipRegistryEntry(resourceName: string): OwnershipRegistryEntry | undefined {
  if (!isOwnershipResourceName(resourceName)) {
    return undefined
  }
  return OWNERSHIP_REGISTRY[resourceName]
}

function isOwnershipResourceName(name: string): name is OwnershipResourceName {
  return (OWNERSHIP_RESOURCE_NAMES as readonly string[]).includes(name)
}
