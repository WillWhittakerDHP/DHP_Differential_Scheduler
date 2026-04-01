/**
 * WHY: After magic link verify there is often no `?redirect=`; staff should land in admin.
 * PATTERN: Align with server staff/privileged roles (ownership checks, internal staff).
 */
const STAFF_ROLES_FOR_ADMIN_HOME = new Set([
  'admin',
  'agent',
  'transaction_manager',
  'owner',
  'inspector',
])

/** Default path when no explicit `redirect` query — staff → `/admin`, others → `/`. */
export function defaultPostAuthPath(role: string | undefined): string {
  if (role === undefined || role === '') {
    return '/'
  }
  return STAFF_ROLES_FOR_ADMIN_HOME.has(role) ? '/admin' : '/'
}
