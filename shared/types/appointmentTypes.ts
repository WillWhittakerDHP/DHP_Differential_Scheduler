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

/**
 * One row for the admin entry dropdown (Edit quote / Reschedule).
 * Session 6.8.6 — list-appointments API returns an array of these.
 * Client/agent names are resolved from users (same as admin appointments table).
 */
export interface AdminEntryAppointmentItem {
  id: string
  address: string
  /** User ID of the client attendee; resolve display name via users lookup. */
  clientUserId: string | null
  /** User ID of the agent/inspector attendee; resolve display name via users lookup. */
  agentUserId: string | null
}
