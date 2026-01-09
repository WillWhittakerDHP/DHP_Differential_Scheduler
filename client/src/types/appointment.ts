/**
 * WHY: Appointment Type Definitions
 *
 * LEARNING: TypeScript interfaces for appointment and availability API data
 * WHY: Ensures type safety when working with appointment and availability data
 * PATTERN: Match server-side model structure for consistency
 */

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

export interface TimeSlot {
  slotStart: string; // ISO date string
  slotEnd: string; // ISO date string
  duration: number; // Duration in minutes
}

/**
 * AvailabilityRequest interface for API request
 * LEARNING: Request payload for fetching available time slots
 * WHY: Type-safe request structure for availability API
 */
export interface AvailabilityRequest {
  serviceId: string;
  dateRange: {
    start: string; // ISO date string
    end: string; // ISO date string
  };
  duration: number; // Duration in minutes
  timezone?: string; // Optional timezone (defaults to server default)
}

/**
 * AvailabilityResponse interface for API response
 * LEARNING: Response structure from availability API
 * WHY: Type-safe response handling
 */
export interface AvailabilityResponse {
  availabilities: TimeSlot[];
}

/**
 * Part Instance Snapshot Type
 * LEARNING: Represents a snapshot of part instance data at booking time
 * WHY: Preserves pricing/time data for historical accuracy
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
  serviceSnapshots?: Record<string, BlockInstanceSnapshot> | null; // JSONB object - snapshots of selected services at booking time
  propertySnapshots?: Record<string, BlockInstanceSnapshot> | null; // JSONB object - snapshots of selected property type blocks at booking time
  optionTypeBlockSnapshots?: Record<string, BlockInstanceSnapshot> | null; // Deprecated, use optionSnapshots
  optionSnapshots?: Record<string, BlockInstanceSnapshot> | null; // JSONB object - snapshots of selected availability options at booking time
  selectedDate?: string | null; // ISO date string (DATEONLY)
  selectedDateRangeEnd?: string | null; // ISO date string (DATEONLY)
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
  serviceSnapshots?: Record<string, BlockInstanceSnapshot> | null; // JSONB object - snapshots of selected services at booking time
  propertySnapshots?: Record<string, BlockInstanceSnapshot> | null; // JSONB object - snapshots of selected property type blocks at booking time
  optionTypeBlockSnapshots?: Record<string, BlockInstanceSnapshot> | null; // Deprecated, use optionSnapshots
  optionSnapshots?: Record<string, BlockInstanceSnapshot> | null; // JSONB object - snapshots of selected availability options at booking time
  selectedDate?: string | null;
  selectedDateRangeEnd?: string | null;
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

