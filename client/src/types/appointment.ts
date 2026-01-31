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

/**
 * Array of all appointment status values for use in select dropdowns
 */
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

/**
 * TimeRange: Pure time range (no characteristics)
 * Used for totals and display
 */
export interface TimeRange {
  startTime: RFC3339DateTime    // RFC3339 datetime string (ISO 8601 with timezone)
  endTime: RFC3339DateTime      // RFC3339 datetime string (ISO 8601 with timezone)
  duration: number               // minutes
}

/**
 * TimeSlot: Time range with part characteristics
 * Used for category-specific slots
 * 
 * P0-2: Timezone handling
 * - startTime and endTime are RFC3339 UTC strings (e.g., "2026-01-15T14:00:00Z")
 * - All times are stored in UTC for consistency between client and server
 * - Display times are converted to local timezone in UI components
 */
export interface TimeSlot extends TimeRange {
  major: boolean
  minor: boolean
  moveable: boolean
  isAvailable: boolean  // true = available, false = busy/unavailable (required)
  hasFlexibleViolations?: boolean  // true if slot violates flexible constraints
  flexibleViolations?: string[]    // array of constraint types that were violated (e.g., ['businessHours', 'capacity.daily'])
}



/**
 * PerspectiveKey: Keys for deriving display times
 * Logic names (not UI labels)
 */
export type PerspectiveKey = 'major' | 'minor' | 'nonDifferential'

/**
 * EventFinal: Aggregated event duration for a given event shape
 * LEARNING: Groups event durations by event shape, similar to PartFinal pattern
 * WHY: Eliminates hardcoded event names, enables fully generic event system
 * PATTERN: Plain interface with event shape reference and calculated duration
 */
export interface EventFinal {
  eventShape: EventShape  // The event shape definition (e.g., major event, minor event, Moveable)
  duration: number        // Calculated duration for this event in minutes
}

/**
 * SlotShape: Durations needed to create AppointmentSlot time ranges
 * LEARNING: Contains durations only - no times, no flags
 * WHY: Separates duration calculations from time range creation
 * PATTERN: Pure duration data that can be applied to any start time
 * 
 * Session Event Refactor: Uses EventFinal[] array instead of Record<string, number>
 * WHY: Enables fully generic event system - no hardcoded event names, matches PartFinal[] pattern
 * PATTERN: Array of EventFinal objects, each containing event shape and duration
 */
export interface SlotShape {
  totalDuration: number        // Sum of all finalizedParts.baseTime
  eventFinals: EventFinal[]   // Array of event shapes with their durations (e.g., [{ eventShape: majorEvent, duration: 120 }, ...])
  differentialOffset: number    // Duration offset when major event exists but minor event does not
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
  // Source of truth: finalized parts grouped by part shape only
  finalizedParts: PartFinal[]
  
  // Slot shape: durations needed to create AppointmentSlot time ranges
  slotShape: SlotShape
  
  // Event assignments for each part shape (appointment-level feature)
  // LEARNING: Events are appointment features, parts just determine which events apply
  // WHY: Events configured at shape level, stored here for efficient lookup during SlotShape calculation
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
  
  // Reference to AppointmentShape (contains SlotShape, avoids duplication)
  // LEARNING: Reference instead of duplicating SlotShape in each slot
  // WHY: Memory efficiency - many slots share same shape, avoids duplicating 5 numbers per slot
  // PATTERN: Reference shape, access slotShape via shape.slotShape
  // NOTE: Access pattern: slot.shape.slotShape.totalDuration (one level deeper, but no duplication)
  shape: AppointmentShape
  
  // Base start time for this slot
  startTime: string
  
  // Precomputed time ranges (accessed frequently, so precompute for performance)
  // LEARNING: Clear naming - these are TimeRanges, not durations
  // WHY: Makes it clear these are time ranges with start/end times, not duration numbers
  // WHY: Precomputed because accessed frequently in UI (graphBars, derivePerspective, etc.)
  totalTimeRange: TimeRange | null          // From shape.slotShape.totalDuration + startTime
  eventTimeRanges: Record<string, TimeRange | null>  // Map of event shape name to TimeRange (e.g., { "majorEvent": {...}, "minorEvent": {...}, "Moveable": {...} })
}

/**
 * AppointmentSlots type - array of AppointmentSlot objects
 * LEARNING: Represents all time slots for an appointment
 * WHY: Provides consistent structure for multiple appointment slots
 * PATTERN: Array of AppointmentSlot objects
 */
export type AppointmentSlots = AppointmentSlot[]

// Removed unused exports: AvailabilityRequest, AvailabilityResponse
// LEARNING: These types were exported but never imported elsewhere
// WHY: Removes dead code to improve maintainability

/**
 * Part Instance Snapshot Type
 * LEARNING: Represents a snapshot of part instance data at booking time
 * WHY: Preserves pricing/time data for historical accuracy
 * NOTE: Still used in deprecated fields of AppointmentRequest/AppointmentResponse
 */
export interface PartInstanceSnapshot {
  id: string
  name: string
  baseFee: number
  baseTime: number
  rateOverBaseFee: number
  rateOverBaseTime: number
}

/**
 * Block Instance Snapshot Type
 * LEARNING: Represents a snapshot of block instance data at booking time
 * WHY: Preserves pricing/names for historical accuracy
 * NOTE: Still used in deprecated fields of AppointmentRequest/AppointmentResponse
 */
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
 * AppointmentRequest interface for appointment creation
 * LEARNING: Request payload for creating appointments
 * WHY: Type-safe appointment creation structure matching server model
 * NOTE: propertyVersionId is the new field, propertyId is deprecated but kept for migration compatibility
 */
export interface AppointmentRequest {
  propertyVersionId?: string | null; // New field (PropertyVersion ID)
  propertyId?: string | null; // Deprecated, kept for migration compatibility
  userTypeBlockId?: string | null;
  selectedServiceIds?: string[] | null; // JSONB array - replaces baseServiceId
  serviceQuantities?: Record<string, number> | null; // JSONB object - quantity multipliers for services
  selectedPropertyTypeBlockIds?: string[] | null; // JSONB array - replaces propertyTypeBlockId (deprecated, use selectedPropertyIds)
  selectedPropertyIds?: string[] | null; // JSONB array - replaces selectedPropertyTypeBlockIds (Property block shape)
  propertyQuantities?: Record<string, number> | null; // JSONB object - quantity multipliers for property type blocks
  selectedOptionTypeBlocks?: string[] | null; // Deprecated, use selectedOptionIds
  selectedOptionIds?: string[] | null; // JSONB array - replaces selectedOptionTypeBlocks (Option block shape)
  optionQuantities?: Record<string, number> | null; // JSONB object - quantity multipliers for availability options
  serviceSnapshots?: Record<string, BlockInstanceSnapshot> | null; // JSONB object - snapshots of selected services at booking time (deprecated - use serviceSnapshotIds)
  propertySnapshots?: Record<string, BlockInstanceSnapshot> | null; // JSONB object - snapshots of selected property type blocks at booking time (deprecated - use propertySnapshotIds)
  optionTypeBlockSnapshots?: Record<string, BlockInstanceSnapshot> | null; // Deprecated, use optionSnapshots
  optionSnapshots?: Record<string, BlockInstanceSnapshot> | null; // JSONB object - snapshots of selected availability options at booking time (deprecated - use optionSnapshotIds)
  serviceSnapshotIds?: string[] | null; // UUID array - references block_instance_versions for selected services
  propertySnapshotIds?: string[] | null; // UUID array - references block_instance_versions for selected property type blocks
  optionSnapshotIds?: string[] | null; // UUID array - references block_instance_versions for selected availability options
  selectedDate?: ISO8601Date | null; // ISO 8601 date format (YYYY-MM-DD)
  selectedDateRangeEnd?: ISO8601Date | null; // ISO 8601 date format (YYYY-MM-DD)
  selectedTimeSlots?: Array<{ time: string; duration: number }> | null;
  isQuoteMode?: boolean;
  quotePdfUrl?: string | null;
  status?: AppointmentStatus;
  clientId?: string | null;
  agentId?: string | null;
  /** Tracks which user engaged/interacted with the scheduler to create this appointment */
  scheduledById?: string | null;
  additionalContacts?: Array<Record<string, unknown>> | null;
  propertyDetails?: Record<string, unknown> | null;
  moveableScheduling?: MoveableSchedulingOptions | null;
}

/**
 * Property interface for appointment relationships
 * LEARNING: Property data structure from appointment API relationships
 * WHY: Type-safe property data handling
 */
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

/**
 * User interface for appointment relationships
 * LEARNING: User data structure from appointment API relationships
 * WHY: Type-safe user data handling
 */
export interface UserResponse {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  userRole: 'client' | 'agent' | 'transaction_manager' | 'seller';
  loginId?: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * AppointmentResponse interface matching server model
 * LEARNING: Response structure from appointment API
 * WHY: Type-safe appointment response handling
 * Phase 1.2.3: Added property, client, and agent relationships
 * Session 1.3.8: Updated to use propertyVersionId (propertyId deprecated but kept for compatibility)
 */
export interface AppointmentResponse {
  id: string;
  propertyVersionId?: string | null; // New field (PropertyVersion ID)
  propertyId?: string | null; // Deprecated, kept for migration compatibility
  userTypeId?: string | null; // Actual field from API (maps to user_type_id in database)
  userTypeBlockId?: string | null; // Deprecated, kept for backward compatibility
  /**
   * Deprecated: legacy single-service field.
   * Replaced by `selectedServiceIds` (JSONB array).
   */
  baseServiceId?: string | null;
  selectedServiceIds?: string[] | null; // JSONB array - replaces baseServiceId
  serviceQuantities?: Record<string, number> | null; // JSONB object - quantity multipliers for services
  /**
   * Deprecated: legacy single property-adjustment field.
   * Replaced by `selectedPropertyTypeBlockIds` (JSONB array).
   */
  propertyTypeBlockId?: string | null;
  selectedPropertyTypeBlockIds?: string[] | null; // JSONB array - replaces propertyTypeBlockId (deprecated, use selectedPropertyIds)
  selectedPropertyIds?: string[] | null; // JSONB array - replaces selectedPropertyTypeBlockIds (Property block shape)
  propertyQuantities?: Record<string, number> | null; // JSONB object - quantity multipliers for property type blocks
  selectedOptionTypeBlocks?: string[] | null; // Deprecated, use selectedOptionIds
  selectedOptionIds?: string[] | null; // JSONB array - replaces selectedOptionTypeBlocks (Option block shape)
  optionQuantities?: Record<string, number> | null; // JSONB object - quantity multipliers for availability options
  serviceSnapshots?: Record<string, BlockInstanceSnapshot> | null; // JSONB object - snapshots of selected services at booking time (deprecated - use serviceSnapshotIds)
  propertySnapshots?: Record<string, BlockInstanceSnapshot> | null; // JSONB object - snapshots of selected property type blocks at booking time (deprecated - use propertySnapshotIds)
  optionTypeBlockSnapshots?: Record<string, BlockInstanceSnapshot> | null; // Deprecated, use optionSnapshots
  optionSnapshots?: Record<string, BlockInstanceSnapshot> | null; // JSONB object - snapshots of selected availability options at booking time (deprecated - use optionSnapshotIds)
  serviceSnapshotIds?: string[] | null; // UUID array - references block_instance_versions for selected services
  propertySnapshotIds?: string[] | null; // UUID array - references block_instance_versions for selected property type blocks
  optionSnapshotIds?: string[] | null; // UUID array - references block_instance_versions for selected availability options
  selectedDate?: ISO8601Date | null;
  selectedDateRangeEnd?: ISO8601Date | null;
  selectedTimeSlots?: Array<Record<string, unknown>> | null;
  isQuoteMode: boolean;
  quotePdfUrl?: string | null;
  status: AppointmentStatus;
  clientId?: string | null;
  agentId?: string | null;
  /** Tracks which user engaged/interacted with the scheduler to create this appointment */
  scheduledById?: string | null;
  additionalContacts?: Array<Record<string, unknown>> | null;
  propertyDetails?: Record<string, unknown> | null;
  moveableScheduling?: MoveableSchedulingOptions | null;
  createdAt: string;
  updatedAt: string;
  // Relationships (included in API response)
  propertyVersion?: {
    id: string;
    addressId: string;
    address?: PropertyResponse;
    propertyDetails?: Array<PropertyResponse>;
  };
  property?: PropertyResponse; // Deprecated, kept for migration compatibility
  client?: UserResponse;
  agent?: UserResponse;
  /** User who engaged/interacted with the scheduler (relationship) */
  scheduledBy?: UserResponse;
}

