/**
 * Shared Role Constants
 *
 * WHY: Eliminates duplication between client/src/constants/attendeeRoles.ts and
 *      server/src/constants/userRoles.ts; enables type-safe role matching
 * PATTERN: Exported const values for attendee (display) and user (DB/API) role strings
 *
 * Phase: Constants Consolidation Refactor
 */

/** Lowercase role value as stored in DB / API (e.g. Users.role) */
export const USER_ROLE_CLIENT = 'client' as const
export const USER_ROLE_AGENT = 'agent' as const

/** Display/canonical attendee role label (e.g. for UI or mapping) */
export const ATTENDEE_ROLE_CLIENT = 'Client' as const
export const ATTENDEE_ROLE_AGENT = 'Agent' as const
