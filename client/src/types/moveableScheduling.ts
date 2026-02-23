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
  availableSlots: MoveableSlot[]
  earliestCompletion: string      // ISO datetime
  selectedSlotIndex: number | null
}

export interface MoveableSlot extends SlotTimeBounds {
  dayLabel: string          // "Today", "Tomorrow", "Jan 16"
  timeLabel: string         // "2:00 PM - 3:30 PM"
}

export const DEFAULT_CONTINGENCY: ContingencyPeriod = {
  hasContingency: false,
  endDate: null,
  endTime: null
}

export const DEFAULT_OUTER_BOUNDARY_DAYS = 3
