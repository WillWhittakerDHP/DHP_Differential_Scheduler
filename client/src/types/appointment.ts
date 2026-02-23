/**
 *
 */

import type { SlotTimeBounds } from '@shared/types/availabilityTypes'
import type { PartFinal } from '@/utils/booking/PartFinal'
import type { BlockFinal } from '@/utils/booking/bookingFinalTypes'
import type { EventInstance, EventShape } from './events'

export type { AppointmentStatus } from './appointmentStatus'
export { APPOINTMENT_STATUSES } from './appointmentStatus'

/** Extends shared SlotTimeBounds for single source of truth. */
export type TimeRange = SlotTimeBounds

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
 * WHY: EventFinal: Aggregated event duration for a given event shape
LEARNING: ...
 */
export interface EventFinal {
  eventShape: EventShape  // The event shape definition (e.g., major event, minor event, Moveable)
  rawDuration: number     // Sum of raw baseTime from parts assigned to this event
  roundedDuration: number // Event duration rounded once from sum of raw part baseTimes
}

/**
 * WHY: SlotShape: Durations needed to create AppointmentSlot time ranges

Sessi...
 */
export interface SlotShape {
  rawDuration: number           // Sum of all finalizedParts.baseTime (raw)
  roundedDuration: number        // Authoritative slot span: duration from slot start to latest event end, rounded once
  eventFinals: EventFinal[]     // Array of event shapes with dual-track durations
  rawDifferentialOffset: number      // Raw duration offset: major.rawDuration - minor.rawDuration
  roundedDifferentialOffset: number  // Rounded duration offset: major.roundedDuration - minor.roundedDuration
}

/**
 * AppointmentShape: Time-independent structure (durations + finalized blocks/parts)
 * Calculated once from block instances, then applied to each available start time
 * 
 * This is the "what does this appointment look like?" answer
 * 
 * 
 * BlockFinal Refactor: Added finalizedBlocks as source of truth
 *
 */
export interface AppointmentShape {
  finalizedBlocks: BlockFinal[]  // New: source of truth - finalized blocks
  finalizedParts: PartFinal[]    // Derived from finalizedBlocks for backward compatibility
  
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
 */
export interface AppointmentSlot {
  buttonIndex: number  // UI grid position (0-based)
  isAvailable: boolean  // true = available, false = busy/unavailable
  flexibleViolations?: string[]  // Constraint types that blocked this slot (e.g., ['leadTime', 'capacity.daily'])
  orderIndex?: number  // Optional: normalized position for multiple appointments (0-based)
  
  // PATTERN: Reference shape, access slotShape via shape.slotShape
  shape: AppointmentShape
  
  startTime: string
  
  // Precomputed time ranges (accessed frequently, so precompute for performance)
  // WHY: Precomputed because accessed frequently in UI (graphBars, derivePerspective, etc.)
  totalTimeRange: TimeRange | null          // From shape.slotShape.roundedDuration + startTime (uses rounded for display)
  eventTimeRanges: Record<string, TimeRange | null>  // Map of event shape name to TimeRange
}

/**
 * AppointmentSlots type - array of AppointmentSlot objects
 */
export type AppointmentSlots = AppointmentSlot[]

export type {
  AttendeeResponse,
  UserResponse,
  PropertyResponse,
  AppointmentRequest,
  AppointmentResponse,
} from './appointmentApi'
