/**
 * Attendee Role Constants
 *
 * LEARNING: Re-exports shared role constants for client-side use
 * WHY: Maintains backward compatibility with existing client imports while using shared source
 * PATTERN: Re-export from shared constants (see shared/constants/roleConstants.ts)
 */

export {
  USER_ROLE_CLIENT,
  USER_ROLE_AGENT,
  ATTENDEE_ROLE_CLIENT,
  ATTENDEE_ROLE_AGENT,
} from '@shared/constants/roleConstants'
