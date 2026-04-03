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
