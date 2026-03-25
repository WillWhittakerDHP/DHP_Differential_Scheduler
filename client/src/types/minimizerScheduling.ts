import type { SlotAvailabilityResult, SlotTimeBounds } from '@shared/types/availabilityTypes'


export interface ContingencyPeriod {
  /** null = user has not chosen Yes/No yet (no default selection). */
  hasContingency: boolean | null
  /** Native `type="date"` value — user's local calendar day (YYYY-MM-DD). */
  endDate: string | null
  /** Native `type="time"` value — user's local wall time (HH:mm). No implicit default when null. */
  endTime: string | null
}

export interface MinimizerSchedulingOptions {
  innerBoundary: string           // ISO datetime - end of onsite work
  outerBoundary: string           // ISO datetime - contingency deadline
  /** Total minimizer minutes (sum of all minimizer segments when N > 1). */
  minimizerDuration: number
  /** Name of the minimizer event/part shape used for UI labels (e.g., "Report Writing"). */
  partShapeName?: string
  availableSlots: MinimizerSlot[]
  earliestCompletion: string      // ISO datetime
  selectedSlotIndex: number | null
}

export interface MinimizerSlot extends SlotTimeBounds, Partial<SlotAvailabilityResult> {
  /** Relative day label (e.g. AVAILABILITY_SUBSTEP_UI.TODAY/TOMORROW or formatted date like "Jan 16"). */
  dayLabel: string
  timeLabel: string         // "2:00 PM - 3:30 PM"
}
