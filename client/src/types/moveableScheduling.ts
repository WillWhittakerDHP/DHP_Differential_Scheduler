import type { SlotTimeBounds } from '@shared/types/availabilityTypes'


export interface ContingencyPeriod {
  hasContingency: boolean
  endDate: string | null    // ISO date string (YYYY-MM-DD)
  endTime: string | null    // Time string (HH:mm)
}

export interface MoveableSchedulingOptions {
  innerBoundary: string           // ISO datetime - end of onsite work
  outerBoundary: string           // ISO datetime - contingency deadline
  moveableDuration: number        // minutes
  /** Name of the moveable event/part shape used for UI labels (e.g., "Report Writing"). */
  partShapeName?: string
  availableSlots: MoveableSlot[]
  earliestCompletion: string      // ISO datetime
  selectedSlotIndex: number | null
}

export interface MoveableSlot extends SlotTimeBounds {
  /** Relative day label (e.g. AVAILABILITY_SUBSTEP_UI.TODAY/TOMORROW or formatted date like "Jan 16"). */
  dayLabel: string
  timeLabel: string         // "2:00 PM - 3:30 PM"
  /** When set from server/computed slots; omitted when no constraint data (defaults to available). */
  isAvailable?: boolean
  /** Constraint violation codes when isAvailable is false (e.g. from ComputedSlot.violations). */
  violations?: string[]
}
