/**
 * Appointment API request/response types.
 * WHY: Separates API contracts from domain types to improve file cohesion; re-exported from appointment.ts for existing imports.
 */

import type { USER_ROLE_CLIENT, USER_ROLE_AGENT } from '@/constants/attendeeRoles'
import type { MoveableSchedulingOptions } from './moveableScheduling'
import type { ISO8601Date } from './datetime'
import type { AppointmentStatus } from './appointmentStatus'

export interface PropertyResponse {
  id: string
  address: string
  unit?: string | null
  city: string
  state: string
  zipCode: string
  mlsNumber?: string | null
  squareFootage?: number | null
  bedrooms?: number | null
  bathrooms?: number | null
  foundationAccess?: 'basement' | 'crawlspace' | 'slab' | null
  additionalUnits?: number | null
  createdAt: string
  updatedAt: string
}

export interface UserResponse {
  id: string
  firstName: string
  lastName: string
  email: string
  phone?: string | null
  userRole: typeof USER_ROLE_CLIENT | typeof USER_ROLE_AGENT | 'transaction_manager' | 'seller' | 'inspector'
  loginId?: string | null
  createdAt: string
  updatedAt: string
}

/**
 * Attendee request for calendar invitations
 * LEARNING: Flexible attendee structure for appointment creation
 * WHY: Supports both new attendees array and legacy clientId/agentId
 * SESSION: 2.1.3b - Appointment Attendees Architecture
 */
export interface AttendeeRequest {
  userId: string
  userTypeBlockInstanceId?: string | null
  shouldReceiveInvitation?: boolean
  /** For legacy support - if role is provided, server will look up the UserTypeBlock */
  role?: typeof USER_ROLE_CLIENT | typeof USER_ROLE_AGENT | 'transaction_manager' | 'seller' | 'inspector'
}

/**
 * Attendee response from API
 * LEARNING: Includes user details and invitation status
 * WHY: Frontend needs full context for displaying attendee information
 * SESSION: 2.1.3b - Appointment Attendees Architecture
 */
export interface AttendeeResponse {
  id: string
  appointmentId: string
  userId: string
  userTypeBlockInstanceId?: string | null
  shouldReceiveInvitation: boolean
  invitationStatus: 'pending' | 'sent' | 'accepted' | 'declined' | 'failed'
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
  selectedTimeSlots?: Array<{ startTime: string; endTime: string; duration?: number }> | null
  isQuoteMode?: boolean
  quotePdfUrl?: string | null
  status?: AppointmentStatus
  scheduledById?: string | null
  propertyDetails?: Record<string, unknown> | null
  moveableScheduling?: MoveableSchedulingOptions | null
  /** Attendees for calendar invitations */
  attendees?: AttendeeRequest[] | null
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
  scheduledBy?: UserResponse
  attendees?: AttendeeResponse[]
}
