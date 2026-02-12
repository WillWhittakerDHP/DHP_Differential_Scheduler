/**
 * User and attendee role constants (server re-export from shared)
 *
 * WHY: Single source of truth for user/attendee role strings used in API and DB
 * PATTERN: Re-export from shared/constants/roleConstants.ts
 */

export {
  USER_ROLE_CLIENT,
  USER_ROLE_AGENT,
  ATTENDEE_ROLE_CLIENT,
  ATTENDEE_ROLE_AGENT,
} from '../../../shared/constants/roleConstants.js'
