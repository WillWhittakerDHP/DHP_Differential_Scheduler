/**
 * Constants for invite orchestration (attendee status, default event text).
 * WHY: Centralize hardcoded strings for consistency and auditability.
 */
import { INVITATION_STATUS_FAILED, INVITATION_STATUS_SENT } from '@shared/constants/inviteStatusConstants.js'

export { INVITATION_STATUS_SENT, INVITATION_STATUS_FAILED }

/** Default event summary when no address is available (e.g. "Inspection Appointment"). */
export const DEFAULT_EVENT_SUMMARY_FALLBACK = 'Inspection Appointment' as const
