/**
 * Moveable Parts Scheduling Types
 * 
 * LEARNING: Type definitions for moveable parts scheduling feature
 * WHY: Type-safe structures for contingency periods and moveable scheduling options
 * PATTERN: Interfaces and constants for moveable parts workflow
 * Session 1.4.15: Moveable Parts Scheduling Modal
 */

/**
 * User's contingency period preferences
 */
export interface ContingencyPeriod {
  hasContingency: boolean
  endDate: string | null    // ISO date string (YYYY-MM-DD)
  endTime: string | null    // Time string (HH:mm)
}

/**
 * Computed moveable scheduling options
 */
export interface MoveableSchedulingOptions {
  innerBoundary: string           // ISO datetime - end of onsite work
  outerBoundary: string           // ISO datetime - contingency deadline
  moveableDuration: number        // minutes
  availableSlots: MoveableSlot[]
  earliestCompletion: string      // ISO datetime
  selectedSlotIndex: number | null
}

/**
 * Single moveable time slot option
 */
export interface MoveableSlot {
  startTime: string         // ISO datetime
  endTime: string           // ISO datetime
  duration: number          // minutes
  dayLabel: string          // "Today", "Tomorrow", "Jan 16"
  timeLabel: string         // "2:00 PM - 3:30 PM"
}

/**
 * Default contingency period (no deadline specified)
 */
export const DEFAULT_CONTINGENCY: ContingencyPeriod = {
  hasContingency: false,
  endDate: null,
  endTime: null
}

/**
 * Default outer boundary offset (days from appointment date)
 * Used when user doesn't specify a contingency deadline
 */
export const DEFAULT_OUTER_BOUNDARY_DAYS = 3
