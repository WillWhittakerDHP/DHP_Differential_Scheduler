
import type { SlotTimeBounds } from '@shared/types/availabilityTypes'
import type { PartFinal } from '@/utils/booking/PartFinal'
import type { BlockFinal } from '@/types/booking/blockFinal'
import type { EventInstance, EventShape } from './events'

export type { AppointmentStatus } from './appointmentStatus'
export { APPOINTMENT_STATUSES, VALID_STATUS_TRANSITIONS, getValidNextStatuses } from '@/constants/appointmentStatus'

/** Extends shared SlotTimeBounds for single source of truth. */
export type TimeRange = SlotTimeBounds

/** Minimal-slot generator / calendar row perspective (mutually exclusive). */
export type TimeSlotPerspectiveKind = 'major' | 'minor' | 'moveable'

export interface TimeSlot extends TimeRange {
  slotKind: TimeSlotPerspectiveKind
  isAvailable: boolean  // true = available, false = busy/unavailable (required)
  hasFlexibleViolations?: boolean  // true if slot violates flexible constraints
  flexibleViolations?: string[]    // array of constraint types that were violated (e.g., ['businessHours', 'capacity.daily'])
}



export type PerspectiveKey = 'major' | 'minor' | 'nonDifferential'

export interface EventFinal {
  eventShape: EventShape  // The event shape definition (e.g., major event, minor event, Moveable)
  rawDuration: number     // Sum of raw baseTime from parts assigned to this event
  roundedDuration: number // Event duration rounded once from sum of raw part baseTimes
}

export interface SlotShape {
  rawDuration: number           // Sum of all finalizedParts.baseTime (raw)
  roundedDuration: number        // Authoritative slot span: duration from slot start to latest event end, rounded once
  eventFinals: EventFinal[]     // Array of event shapes with dual-track durations
  rawDifferentialOffset: number      // Raw duration offset: major.rawDuration - minor.rawDuration
  roundedDifferentialOffset: number  // Rounded duration offset: major.roundedDuration - minor.roundedDuration
}

export interface AppointmentShape {
  finalizedBlocks: BlockFinal[]  // New: source of truth - finalized blocks
  finalizedParts: PartFinal[]    // Derived from finalizedBlocks
  
  slotShape: SlotShape
  
  // PATTERN: Map partShape name → EventInstance[] for that shape
  eventAssignmentsByPartShape: Record<string, EventInstance[]>
}

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
  /** From computed slot: default location → candidate and candidate → default (minutes). */
  driveToCandidate?: number
  driveFromCandidate?: number
}

export type AppointmentSlots = AppointmentSlot[]

export type {
  AttendeeResponse,
  UserResponse,
  PropertyResponse,
  AppointmentRequest,
  AppointmentResponse,
} from './appointmentApi'
