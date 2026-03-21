/** Invitation status values shared by client and server (attendee invitationStatus). */

/** Value for invitationStatus when the calendar invite was sent successfully. */
export const INVITATION_STATUS_SENT = 'sent' as const

/** Value for invitationStatus when sending the invite failed. */
export const INVITATION_STATUS_FAILED = 'failed' as const
