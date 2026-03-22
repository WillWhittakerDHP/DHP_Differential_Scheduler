import type { DifferentialRole, DifferentialRoleStorage } from '../types/differentialRole'

export function isDifferentialRoleStorage(value: unknown): value is DifferentialRoleStorage {
  return (
    value === 'major' ||
    value === 'minor' ||
    value === 'moveable'
  )
}

export function parseDifferentialRole(raw: unknown): DifferentialRole {
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
  if (raw === undefined || raw === null || raw === '' || raw === 'none') {
    return null
  }
  if (isDifferentialRoleStorage(raw)) {
    return raw
  }
  return null
}

/** Override map value: major | minor | moveable | none (explicit none). */
export function isDifferentialRoleOverrideValue(raw: unknown): raw is DifferentialRole {
  return raw === 'major' || raw === 'minor' || raw === 'moveable' || raw === 'none'
}

/**
 * Sanitize JSON map eventShapeId -> role for block_instances.differential_event_role_overrides.
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
