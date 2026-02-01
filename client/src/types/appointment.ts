/**
 * WHY: Appointment Type Definitions
 *
 * LEARNING: TypeScript interfaces for appointment and availability API data
 * WHY: Ensures type safety when working with appointment and availability data
 * PATTERN: Match server-side model structure for consistency
 */

import type { MoveableSchedulingOptions } from './moveableScheduling'
import type { RFC3339DateTime, ISO8601Date } from './datetime'
import type { PartFinal } from '@/utils/booking/PartFinal'
import type { EventInstance, EventShape } from './events'

/**
 * Appointment status workflow type
 * LEARNING: Defines all possible appointment statuses in the workflow
 * WHY: Centralizes status values for type safety across the application
 * 
 * Status Descriptions:
 * - started: Non-quote mode appointment creation in progress
 * - held: Time slots held for clients who paid booking fee
 * - rescheduling: Non-quote mode rescheduling in progress
 * - quoted: Quote mode appointment creation in progress
 * - submitted: Submitted through app, awaiting confirmation
 * - confirmed: Submitted and confirmed
 * - cancelled: Soft-delete, still reschedulable
 * - deleted: Hard-delete
 * 
 * ============================================================================
 * TODO: FUTURE IMPLEMENTATION NOTES FOR STATUS WORKFLOW
 * ============================================================================
 * 
 * 1. HELD STATUS LOGIC (Booking Fee Integration)
 *    - Implement payment processing for booking fee
 *    - When client pays booking fee, time slots should be reserved/held
 *    - Auto-transition from 'started' -> 'held' when payment confirmed
 *    - Implement timeout logic: if held too long without confirmation, 
 *      auto-transition to 'cancelled' and release time slots
 *    - Related files: payment API, scheduler availability logic
 * 
 * 2. CONFIRMATION ROUTINE (Submitted -> Confirmed)
 *    - Implement confirmation workflow (manual and/or automated)
 *    - Manual: Admin reviews submitted appointments and confirms
 *    - Automated: Define business rules for auto-confirmation
 *    - Consider email/SMS notifications on confirmation
 *    - Related files: appointment API, notification system
 * 
 * 3. RESCHEDULING FLOW
 *    - UI for initiating reschedule from 'confirmed' status
 *    - Transition 'confirmed' -> 'rescheduling' when user starts reschedule
 *    - When new time selected, transition 'rescheduling' -> 'submitted'
 *    - Preserve original appointment data for reference
 *    - Related files: AppointmentsTable.vue, booking wizard
 * 
 * 4. SOFT DELETE VS HARD DELETE (Cancelled vs Deleted)
 *    - 'cancelled': Appointment still visible in history, can be rescheduled
 *    - 'deleted': Permanent removal from active views (may keep in audit log)
 *    - Define business rules for when to use each
 *    - Consider retention periods and GDPR compliance
 *    - Related files: appointment API, admin panel
 * 
 * 5. SCHEDULED BY TRACKING
 *    - Auto-populate scheduledById from current logged-in user
 *    - Track who engaged the scheduler (client, agent, admin)
 *    - Useful for audit trail and analytics
 *    - Related files: auth context, useAppointmentsTableModel
 * ============================================================================
 */
export type AppointmentStatus = 
  | 'started' 
  | 'held' 
  | 'rescheduling' 
  | 'quoted' 
  | 'submitted' 
  | 'confirmed' 
  | 'cancelled' 
  | 'deleted';

export const APPOINTMENT_STATUSES: AppointmentStatus[] = [
  'started',
  'held',
  'rescheduling',
  'quoted',
  'submitted',
  'confirmed',
  'cancelled',
  'deleted',
];

export interface TimeRange {
  startTime: RFC3339DateTime    // RFC3339 datetime string (ISO 8601 with timezone)
  endTime: RFC3339DateTime      // RFC3339 datetime string (ISO 8601 with timezone)
  duration: number               // minutes
}

export interface TimeSlot extends TimeRange {
  major: boolean
  minor: boolean
  moveable: boolean
  isAvailable: boolean  // true = available, false = busy/unavailable (required)
  hasFlexibleViolations?: boolean  // true if slot violates flexible constraints
  flexibleViolations?: string[]    // array of constraint types that were violated (e.g., ['businessHours', 'capacity.daily'])
}



export type PerspectiveKey = 'major' | 'minor' | 'nonDifferential'

/**
 * EventFinal: Aggregated event duration for a given event shape
 * LEARNING: Groups event durations by event shape, similar to PartFinal pattern
 * WHY: Eliminates hardcoded event names, enables fully generic event system
 * PATTERN: Plain interface with event shape reference and dual-track durations
 * 
 * DUAL-TRACK ARCHITECTURE: Stores both raw and rounded durations
 * WHY: Ensures mathematical consistency - rounded values sum correctly, differential offsets align
 */
export interface EventFinal {
  eventShape: EventShape  // The event shape definition (e.g., major event, minor event, Moveable)
  rawDuration: number     // Sum of raw baseTime from parts (renamed from duration)
  roundedDuration: number // Sum of roundedTime from parts
}

/**
 * SlotShape: Durations needed to create AppointmentSlot time ranges
 * LEARNING: Contains durations only - no times, no flags
 * WHY: Separates duration calculations from time range creation
 * PATTERN: Pure duration data that can be applied to any start time
 * 
 * Session Event Refactor: Uses EventFinal[] array instead of Record<string, number>
 * WHY: Enables fully generic event system - no hardcoded event names, matches PartFinal[] pattern
 * PATTERN: Array of EventFinal objects, each containing event shape and dual-track durations
 * 
 * DUAL-TRACK ARCHITECTURE: Stores both raw and rounded durations at every level
 * WHY: Ensures mathematical consistency - rounded values sum correctly, differential offsets align
 * PATTERN: Round at part level, sum rounded values upward, store both tracks
 */
export interface SlotShape {
  rawDuration: number           // Sum of all finalizedParts.baseTime (raw)
  roundedDuration: number        // Sum of all finalizedParts.roundedTime (rounded)
  eventFinals: EventFinal[]     // Array of event shapes with dual-track durations
  rawDifferentialOffset: number      // Raw duration offset: major.rawDuration - minor.rawDuration
  roundedDifferentialOffset: number  // Rounded duration offset: major.roundedDuration - minor.roundedDuration
}

/**
 * AppointmentShape: Time-independent structure (durations + finalized parts)
 * Calculated once from block instances, then applied to each available start time
 * 
 * This is the "what does this appointment look like?" answer
 * 
 * LEARNING: Holds finalized parts (source of truth) and SlotShape (durations)
 * WHY: Finalized parts are the source of truth, SlotShape provides precomputed durations
 * PATTERN: Source data (finalizedParts) + computed totals (slotShape)
 * 
 * LEARNING: Events are appointment-level features, not part-level properties
 * WHY: Events are configured at shape level (PartShape → EventInstance), parts determine which events apply
 * PATTERN: Store EventInstance[] keyed by partShape name on AppointmentShape
 */
export interface AppointmentShape {
  finalizedParts: PartFinal[]
  
  slotShape: SlotShape
  
  // PATTERN: Map partShape name → EventInstance[] for that shape
  eventAssignmentsByPartShape: Record<string, EventInstance[]>
}

/**
 * AppointmentSlot: Shape applied to a specific start time
 * Contains actual TimeRanges with start/end times
 * 
 * This is the "when does this appointment happen?" answer
 * 
 * LEARNING: References AppointmentShape and contains precomputed TimeRanges
 * WHY: Memory efficient - many slots share same shape, avoids duplicating SlotShape
 * PATTERN: Reference shape, precompute TimeRanges for frequent UI access
 */
export interface AppointmentSlot {
  buttonIndex: number  // UI grid position (0-based)
  isAvailable: boolean  // true = available, false = busy/unavailable
  orderIndex?: number  // Optional: normalized position for multiple appointments (0-based)
  
  // PATTERN: Reference shape, access slotShape via shape.slotShape
  shape: AppointmentShape
  
  startTime: string
  
  // Precomputed time ranges (accessed frequently, so precompute for performance)
  // WHY: Precomputed because accessed frequently in UI (graphBars, derivePerspective, etc.)
  totalTimeRange: TimeRange | null          // From shape.slotShape.roundedDuration + startTime (uses rounded for display)
  eventTimeRanges: Record<string, TimeRange | null>  // Map of event shape name to TimeRange (e.g., { "majorEvent": {...}, "minorEvent": {...}, "Moveable": {...} })
  
  // Legacy properties for backward compatibility during migration (onSite->major rename)
  // PATTERN: Legacy properties that map to eventTimeRanges entries
  majorTimeRange?: TimeRange | null  // Legacy: Maps to eventTimeRanges['Major']
  minorTimeRange?: TimeRange | null  // Legacy: Maps to eventTimeRanges['Minor']
  moveableTimeRange?: TimeRange | null  // Legacy: Maps to eventTimeRanges['Moveable']
}

/**
 * AppointmentSlots type - array of AppointmentSlot objects
 * LEARNING: Represents all time slots for an appointment
 * WHY: Provides consistent structure for multiple appointment slots
 * PATTERN: Array of AppointmentSlot objects
 */
export type AppointmentSlots = AppointmentSlot[]


export interface PartInstanceSnapshot {
  id: string
  name: string
  baseFee: number
  baseTime: number
  rateOverBaseFee: number
  rateOverBaseTime: number
}

export interface BlockInstanceSnapshot {
  id: string
  name: string
  icon: string
  baseSqFt: number
  allowMultiple: boolean
  differential: boolean
  partInstances: PartInstanceSnapshot[]
}

/**
 * Attendee request for calendar invitations
 * LEARNING: Flexible attendee structure for appointment creation
 * WHY: Supports both new attendees array and legacy clientId/agentId
 * SESSION: 2.1.3b - Appointment Attendees Architecture
 */
export interface AttendeeRequest {
  userId: string;
  userTypeBlockInstanceId?: string | null;
  shouldReceiveInvitation?: boolean;
  /** For legacy support - if role is provided, server will look up the UserTypeBlock */
  role?: 'client' | 'agent' | 'transaction_manager' | 'seller' | 'inspector';
}

/**
 * AppointmentRequest - Data sent when creating/updating an appointment
 * SESSION: 2.1.3b - Cleaned up deprecated fields
 */
export interface AppointmentRequest {
  propertyVersionId?: string | null;
  userTypeBlockId?: string | null;
  selectedServiceIds?: string[] | null;
  serviceQuantities?: Record<string, number> | null;
  selectedPropertyIds?: string[] | null;
  propertyQuantities?: Record<string, number> | null;
  selectedOptionIds?: string[] | null;
  optionQuantities?: Record<string, number> | null;
  serviceSnapshotIds?: string[] | null;
  propertySnapshotIds?: string[] | null;
  optionSnapshotIds?: string[] | null;
  selectedDate?: ISO8601Date | null;
  selectedDateRangeEnd?: ISO8601Date | null;
  selectedTimeSlots?: Array<{ startTime: string; endTime: string; duration?: number }> | null;
  isQuoteMode?: boolean;
  quotePdfUrl?: string | null;
  status?: AppointmentStatus;
  scheduledById?: string | null;
  propertyDetails?: Record<string, unknown> | null;
  moveableScheduling?: MoveableSchedulingOptions | null;
  /** Attendees for calendar invitations */
  attendees?: AttendeeRequest[] | null;
}

export interface PropertyResponse {
  id: string;
  address: string;
  unit?: string | null;
  city: string;
  state: string;
  zipCode: string;
  mlsNumber?: string | null;
  squareFootage?: number | null;
  bedrooms?: number | null;
  bathrooms?: number | null;
  foundationAccess?: 'basement' | 'crawlspace' | 'slab' | null;
  additionalUnits?: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface UserResponse {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  userRole: 'client' | 'agent' | 'transaction_manager' | 'seller' | 'inspector';
  loginId?: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * Attendee response from API
 * LEARNING: Includes user details and invitation status
 * WHY: Frontend needs full context for displaying attendee information
 * SESSION: 2.1.3b - Appointment Attendees Architecture
 */
export interface AttendeeResponse {
  id: string;
  appointmentId: string;
  userId: string;
  userTypeBlockInstanceId?: string | null;
  shouldReceiveInvitation: boolean;
  invitationStatus: 'pending' | 'sent' | 'accepted' | 'declined' | 'failed';
  googleEventId?: string | null;
  createdAt: string;
  updatedAt: string;
  /** The actual user with contact information */
  user?: UserResponse;
  /** The user type (role) BlockInstance */
  userTypeBlockInstance?: {
    id: string;
    name: string;
  };
}

/**
 * AppointmentResponse - Data returned from appointment API
 * SESSION: 2.1.3b - Cleaned up deprecated fields
 */
export interface AppointmentResponse {
  id: string;
  propertyVersionId?: string | null;
  userTypeId?: string | null;
  selectedServiceIds?: string[] | null;
  serviceQuantities?: Record<string, number> | null;
  selectedPropertyIds?: string[] | null;
  propertyQuantities?: Record<string, number> | null;
  selectedOptionIds?: string[] | null;
  optionQuantities?: Record<string, number> | null;
  serviceSnapshotIds?: string[] | null;
  propertySnapshotIds?: string[] | null;
  optionSnapshotIds?: string[] | null;
  selectedDate?: ISO8601Date | null;
  selectedDateRangeEnd?: ISO8601Date | null;
  selectedTimeSlots?: Array<Record<string, unknown>> | null;
  isQuoteMode: boolean;
  quotePdfUrl?: string | null;
  status: AppointmentStatus;
  scheduledById?: string | null;
  propertyDetails?: Record<string, unknown> | null;
  moveableScheduling?: MoveableSchedulingOptions | null;
  createdAt: string;
  updatedAt: string;
  propertyVersion?: {
    id: string;
    addressId: string;
    address?: PropertyResponse;
    propertyDetails?: Array<PropertyResponse>;
  };
  scheduledBy?: UserResponse;
  attendees?: AttendeeResponse[];
}

