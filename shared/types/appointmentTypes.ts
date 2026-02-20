/**
 * Shared appointment-related types for client and server.
 */
import { USER_ROLE_CLIENT, USER_ROLE_AGENT } from '../constants/roleConstants'

/** Attendee request for calendar invitations; single source for client and server. */
export interface AttendeeRequest {
  userId: string
  userTypeBlockInstanceId?: string | null
  shouldReceiveInvitation?: boolean
  role?: typeof USER_ROLE_CLIENT | typeof USER_ROLE_AGENT | 'transaction_manager' | 'seller' | 'inspector'
}
