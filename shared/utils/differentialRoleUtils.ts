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
