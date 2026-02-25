/**
 * Constants for invite orchestration (attendee status, default event text).
 * WHY: Centralize hardcoded strings for consistency and auditability.
 */

/** Value for invitationStatus when the calendar invite was sent successfully. */
export const INVITATION_STATUS_SENT = 'sent' as const

/** Value for invitationStatus when sending the invite failed. */
export const INVITATION_STATUS_FAILED = 'failed' as const

/** Default event summary when no address is available (e.g. "Inspection Appointment"). */
export const DEFAULT_EVENT_SUMMARY_FALLBACK = 'Inspection Appointment' as const
