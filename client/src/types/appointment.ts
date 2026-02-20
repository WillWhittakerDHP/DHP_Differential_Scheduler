/**
 * WHY: Appointment Type Definitions
 *
 * LEARNING: TypeScript interfaces for appointment and availability API data
 * WHY: Ensures type safety when working with appointment and availability data
 * PATTERN: Match server-side model structure for consistency
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
 * EventFinal: Aggregated event duration for a given event shape
 * LEARNING: Groups event durations by event shape, similar to PartFinal pattern
 * WHY: Eliminates hardcoded event names, enables fully generic event system
 * PATTERN: Plain interface with event shape reference and dual-track durations
 * 
 * DUAL-TRACK ARCHITECTURE: Stores both raw and rounded durations
 * WHY: Ensures mathematical consistency - rounded values computed correctly, differential offsets align
 * 
 * ROUNDING STRATEGY: Rounding happens ONCE per event after summing raw part baseTimes
 * WHY: Prevents double rounding inflation - round(sum of parts) != sum(round(part))
 */
export interface EventFinal {
  eventShape: EventShape  // The event shape definition (e.g., major event, minor event, Moveable)
  rawDuration: number     // Sum of raw baseTime from parts assigned to this event
  roundedDuration: number // Event duration rounded once from sum of raw part baseTimes
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
 * WHY: Ensures mathematical consistency - rounded values computed correctly, differential offsets align
 * 
 * ROUNDING STRATEGY: Rounding happens at event level (once per event), not at part level
 * WHY: Prevents double rounding inflation - round(sum of parts) != sum(round(part))
 * 
 * SLOT SPAN SEMANTICS: roundedDuration = max(eventFinal.roundedDuration) = slot span from start to latest event end
 * WHY: In differential services, events overlap - slot ends when the longest event ends, not when events sum
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
 * LEARNING: Holds finalized blocks (source of truth) and SlotShape (durations)
 * WHY: Finalized blocks preserve block-level context, SlotShape provides precomputed durations
 * PATTERN: Source data (finalizedBlocks) + computed totals (slotShape)
 * 
 * BlockFinal Refactor: Added finalizedBlocks as source of truth
 * WHY: Makes it explicit that we're finalizing blocks, preserving block-level context
 * PATTERN: finalizedBlocks is source of truth, finalizedParts is derived for backward compatibility
 * @audit-allow:deprecation:compat-marker - Intentional compat note for finalizedParts vs finalizedBlocks
 *
 * LEARNING: Events are appointment-level features, not part-level properties
 * WHY: Events are configured at shape level (PartShape → EventInstance), parts determine which events apply
 * PATTERN: Store EventInstance[] keyed by partShape name on AppointmentShape
 */
export interface AppointmentShape {
  finalizedBlocks: BlockFinal[]  // New: source of truth - finalized blocks
  // @audit-allow:deprecation:compat-marker - Intentional compat note for finalizedParts vs finalizedBlocks
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
 * LEARNING: References AppointmentShape and contains precomputed TimeRanges
 * WHY: Memory efficient - many slots share same shape, avoids duplicating SlotShape
 * PATTERN: Reference shape, precompute TimeRanges for frequent UI access
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
 * LEARNING: Represents all time slots for an appointment
 * WHY: Provides consistent structure for multiple appointment slots
 * PATTERN: Array of AppointmentSlot objects
 */
export type AppointmentSlots = AppointmentSlot[]

export type {
  AttendeeResponse,
  UserResponse,
  PropertyResponse,
  AppointmentRequest,
  AppointmentResponse,
} from './appointmentApi'
