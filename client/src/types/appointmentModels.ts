
import type { SlotTimeBounds } from '@shared/types/availabilityTypes'
import type { PartFinal } from '@/utils/booking/PartFinal'
import type { BlockFinal } from '@/types/booking/blockFinal'
import type { EventInstance, EventShape } from './events'
import type { DifferentialRole, DifferentialRoleStorage } from '@shared/types/differentialRole'

/** Minimal-slot generator / calendar row perspective — same literals as DB differential role (excl. none). */
export type TimeSlotPerspectiveKind = DifferentialRoleStorage

export interface TimeSlot extends SlotTimeBounds {
  slotKind: TimeSlotPerspectiveKind
  isAvailable: boolean
  hasFlexibleViolations?: boolean
  flexibleViolations?: string[]
}

export type PerspectiveKey = 'major' | 'minor' | 'nonDifferential'

export interface EventFinal {
  eventShape: EventShape
  rawDuration: number
  roundedDuration: number
}

export interface SlotShape {
  rawDuration: number
  roundedDuration: number
  eventFinals: EventFinal[]
  rawDifferentialOffset: number
  roundedDifferentialOffset: number
}

export interface AppointmentShape {
  finalizedBlocks: BlockFinal[]
  finalizedParts: PartFinal[]
  slotShape: SlotShape
  eventAssignmentsByPartShape: Record<string, EventInstance[]>
  differentialEventRoleOverrides?: Record<string, DifferentialRole>
}

export interface AppointmentSlot {
  buttonIndex: number
  isAvailable: boolean
  flexibleViolations?: string[]
  orderIndex?: number
  shape: AppointmentShape
  startTime: string
  totalTimeRange: SlotTimeBounds | null
  eventTimeRanges: Record<string, SlotTimeBounds | null>
  driveToCandidate?: number
  driveFromCandidate?: number
}

export type AppointmentSlots = AppointmentSlot[]
