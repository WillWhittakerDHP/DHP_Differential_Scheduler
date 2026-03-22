import type { AppointmentFeeBreakdownPayload } from '@shared/types/appointmentFeeTypes'
import type { MoveableSchedulingOptions } from './moveableScheduling'
import type { ISO8601Date } from '@shared/types/primitiveBrands'
import type { AppointmentStatus } from './appointmentStatus'
import type { PropertyResponse } from './property'
import type { UserResponse } from './user'

export type { PropertyResponse, UserResponse }

import { INVITATION_STATUS_FAILED, INVITATION_STATUS_SENT } from '@shared/constants/inviteStatusConstants'
import type { AppointmentSelectedTimeSlotPayload, AttendeeRequest } from '@shared/types/appointmentTypes'

export interface AttendeeResponse {
  id: string
  appointmentId: string
  userId: string
  userTypeBlockInstanceId?: string | null
  shouldReceiveInvitation: boolean
  invitationStatus: 'pending' | typeof INVITATION_STATUS_SENT | 'accepted' | 'declined' | typeof INVITATION_STATUS_FAILED
  googleEventId?: string | null
  createdAt: string
  updatedAt: string
  /** The actual user with contact information */
  user?: UserResponse
  /** The user type (role) BlockInstance */
  userTypeBlockInstance?: {
    id: string
    name: string
  }
}

/**
 * AppointmentRequest - Data sent when creating/updating an appointment
 * SESSION: 2.1.3b - Cleaned up deprecated fields
 */
export interface AppointmentRequest {
  propertyVersionId?: string | null
  userTypeBlockId?: string | null
  selectedServiceIds?: string[] | null
  serviceQuantities?: Record<string, number> | null
  selectedPropertyIds?: string[] | null
  propertyQuantities?: Record<string, number> | null
  selectedOptionIds?: string[] | null
  optionQuantities?: Record<string, number> | null
  serviceSnapshotIds?: string[] | null
  propertySnapshotIds?: string[] | null
  optionSnapshotIds?: string[] | null
  selectedDate?: ISO8601Date | null
  selectedDateRangeEnd?: ISO8601Date | null
  selectedTimeSlots?: AppointmentSelectedTimeSlotPayload[] | null
  isQuoteMode?: boolean
  quotePdfUrl?: string | null
  status?: AppointmentStatus
  scheduledById?: string | null
  propertyDetails?: Record<string, unknown> | null
  moveableScheduling?: MoveableSchedulingOptions | null
  /** Attendees for calendar invitations */
  attendees?: AttendeeRequest[] | null
  /** Fee breakdown for persistence (summary + per-block entries); server persists in afterCreate */
  feeBreakdown?: AppointmentFeeBreakdownPayload | null
  /** Hold duration in minutes (1–60). Server computes heldUntil from this. Only used when status = 'held'. */
  holdDurationMinutes?: number
  /** Admin constraint overrides — keys match slot computation constraints. ENACTMENT(Feature 7): requireRole('admin') gates this. */
  overrideConstraints?: Record<string, boolean> | null
}

/**
 * AppointmentResponse - Data returned from appointment API
 * SESSION: 2.1.3b - Cleaned up deprecated fields
 */
export interface AppointmentResponse {
  id: string
  propertyVersionId?: string | null
  userTypeId?: string | null
  selectedServiceIds?: string[] | null
  serviceQuantities?: Record<string, number> | null
  selectedPropertyIds?: string[] | null
  propertyQuantities?: Record<string, number> | null
  selectedOptionIds?: string[] | null
  optionQuantities?: Record<string, number> | null
  serviceSnapshotIds?: string[] | null
  propertySnapshotIds?: string[] | null
  optionSnapshotIds?: string[] | null
  selectedDate?: ISO8601Date | null
  selectedDateRangeEnd?: ISO8601Date | null
  selectedTimeSlots?: Array<Record<string, unknown>> | null
  isQuoteMode: boolean
  quotePdfUrl?: string | null
  status: AppointmentStatus
  scheduledById?: string | null
  propertyDetails?: Record<string, unknown> | null
  moveableScheduling?: MoveableSchedulingOptions | null
  createdAt: string
  updatedAt: string
  propertyVersion?: {
    id: string
    addressId: string
    address?: PropertyResponse
    propertyDetails?: Array<PropertyResponse>
  }
  /** FK → users.id — who placed the hold (populated when status = 'held') */
  heldBy?: string | null
  /** ISO timestamp — when the hold expires (populated when status = 'held') */
  heldUntil?: string | null
  scheduledBy?: UserResponse
  /** The User who placed the hold, eagerly loaded when status = 'held' */
  heldByUser?: UserResponse
  /** Admin constraint overrides applied to this appointment */
  overrideConstraints?: Record<string, boolean> | null
  /** ISO timestamp — when status transitioned to 'submitted' */
  submittedAt?: string | null
  /** ISO timestamp — when status transitioned to 'confirmed' */
  confirmedAt?: string | null
  /** FK → users.id — who confirmed (populated by Feature 7 auth) */
  confirmedBy?: string | null
  attendees?: AttendeeResponse[]
}
