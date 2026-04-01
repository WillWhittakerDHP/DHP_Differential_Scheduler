/**
 * Shared Role Constants
 *
 * WHY: Eliminates duplication between client/src/constants/attendeeRoles.ts and
 *      server/src/constants/userRoles.ts; enables type-safe role matching
 * PATTERN: Exported const values for attendee (display) and user (DB/API) role strings
 *
 * Phase: Constants Consolidation Refactor
 */

/** Lowercase role value as stored in DB / API (e.g. `users.user_role`) */
export const USER_ROLE_CLIENT = 'client' as const
export const USER_ROLE_AGENT = 'agent' as const
export const USER_ROLE_TRANSACTION_MANAGER = 'transaction_manager' as const
/** Product rename from legacy `seller` (Phase 6.18.1) */
export const USER_ROLE_OWNER = 'owner' as const
export const USER_ROLE_INSPECTOR = 'inspector' as const
export const USER_ROLE_ADMIN = 'admin' as const

/** Single authoritative list for Joi, Sequelize ENUM, and cross-stack validation */
export const USER_ROLE_VALUES = [
  USER_ROLE_CLIENT,
  USER_ROLE_AGENT,
  USER_ROLE_TRANSACTION_MANAGER,
  USER_ROLE_OWNER,
  USER_ROLE_INSPECTOR,
  USER_ROLE_ADMIN,
] as const

export type UserRoleValue = (typeof USER_ROLE_VALUES)[number]

/** Display/canonical attendee role label (e.g. for UI or mapping) */
export const ATTENDEE_ROLE_CLIENT = 'Client' as const
export const ATTENDEE_ROLE_AGENT = 'Agent' as const
