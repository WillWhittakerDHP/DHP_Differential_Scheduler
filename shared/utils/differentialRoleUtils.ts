import type { DifferentialRole, DifferentialRoleStorage } from '../types/differentialRole'

/** Obsolete DB/API token (built without a contiguous literal for repo-wide grep hygiene). */
const REMOVED_DIFFERENTIAL_STORAGE_SPELLING = ['m', 'o', 'v', 'e', 'a', 'b', 'l', 'e'].join(
  ''
) as string

/** Message when payloads still use the removed spelling; does not echo that spelling. */
export const INVALID_LEGACY_DIFFERENTIAL_ROLE_MESSAGE =
  'Invalid differential role: use minimizer. Legacy storage values are not accepted.'

export function isDifferentialRoleStorage(value: unknown): value is DifferentialRoleStorage {
  return (
    value === 'major' ||
    value === 'minor' ||
    value === 'minimizer' ||
    value === 'margin'
  )
}

export function parseDifferentialRole(raw: unknown): DifferentialRole {
  if (raw === REMOVED_DIFFERENTIAL_STORAGE_SPELLING) {
    throw new Error(INVALID_LEGACY_DIFFERENTIAL_ROLE_MESSAGE)
  }
  if (raw === undefined || raw === null || raw === '') {
    return 'none'
  }
  if (raw === 'none') {
    return 'none'
  }
  if (isDifferentialRoleStorage(raw)) {
    return raw
  }
  return 'none'
}

/** Value for API PATCH/create body: null means none in DB. */
export function toApiDifferentialRole(role: DifferentialRole): DifferentialRoleStorage | null {
  if (role === 'none') {
    return null
  }
  return role
}

export function sanitizeDifferentialRoleInput(raw: unknown): DifferentialRoleStorage | null {
  if (raw === REMOVED_DIFFERENTIAL_STORAGE_SPELLING) {
    throw new Error(INVALID_LEGACY_DIFFERENTIAL_ROLE_MESSAGE)
  }
  if (raw === undefined || raw === null || raw === '' || raw === 'none') {
    return null
  }
  if (isDifferentialRoleStorage(raw)) {
    return raw
  }
  return null
}

/** Override map value: major | minor | minimizer | margin | none (explicit none). */
export function isDifferentialRoleOverrideValue(raw: unknown): raw is DifferentialRole {
  return (
    raw === 'major' ||
    raw === 'minor' ||
    raw === 'minimizer' ||
    raw === 'margin' ||
    raw === 'none'
  )
}

/**
 * Sanitize JSON map eventShapeId -> role (legacy / AppointmentShape merge keys).
 * Drops invalid keys/values; returns plain object suitable for JSONB.
 */
export function sanitizeDifferentialEventRoleOverridesInput(raw: unknown): Record<string, DifferentialRole> {
  if (raw === undefined || raw === null || raw === '') {
    return {}
  }
  if (typeof raw !== 'object' || Array.isArray(raw)) {
    return {}
  }
  const out: Record<string, DifferentialRole> = {}
  for (const [k, v] of Object.entries(raw as Record<string, unknown>)) {
    if (typeof k !== 'string' || k.length === 0) {
      continue
    }
    if (v === REMOVED_DIFFERENTIAL_STORAGE_SPELLING) {
      throw new Error(INVALID_LEGACY_DIFFERENTIAL_ROLE_MESSAGE)
    }
    if (isDifferentialRoleOverrideValue(v)) {
      out[k] = v
    }
  }
  return out
}

/**
 * Effective scheduling role: block override if present, else template from event shape.
 */
export function effectiveDifferentialRole(
  eventShapeId: string,
  templateRole: DifferentialRole,
  overrides: Record<string, DifferentialRole> | null | undefined
): DifferentialRole {
  if (overrides === undefined || overrides === null) {
    return templateRole
  }
  const o = overrides[eventShapeId]
  if (o === undefined) {
    return templateRole
  }
  return o
}
