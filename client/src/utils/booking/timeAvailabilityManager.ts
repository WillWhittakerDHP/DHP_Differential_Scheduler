/**
 * Time Availability Manager
 * 
 * LEARNING: Unified utility for handling all free/busy period logic
 * WHY: Single source of truth for availability calculations (business hours, increments, calendar busy)
 * PATTERN: Pure utility functions - no side effects, no reactivity
 * 
 * This module consolidates all availability logic:
 * - Business hours (from AvailabilitySettings)
 * - Minute increments (from AvailabilitySettings)
 * - Calendar busy periods (from Google Calendar API or mock)
 * - Boundary constraints (date range limits)
 */

import type { TimeSlot } from '@/types/appointment'
import {
  type BusinessHoursMap,
  type BusyTimeRange,
  timeRangesOverlap,
  parseLocalDate
} from './timeSlotFitter'

/**
 * Time slot with availability status
 * LEARNING: Extends TimeSlot with availability flag
 * WHY: Allows UI to render busy slots as inactive instead of hiding them
 */
export interface TimeSlotWithAvailability extends TimeSlot {
  isAvailable: boolean
}

/**
 * Result from availability manager
 */
export interface AvailabilityManagerResult {
  slots: TimeSlotWithAvailability[]
  earliestCompletion: string | null  // ISO datetime of earliest available slot end time
}

/**
 * Parameters for generating slots with availability
 */
export interface GenerateSlotsWithAvailabilityParams {
  startBoundary: string         // ISO datetime - earliest possible start
  endBoundary: string           // ISO datetime - latest possible end
  duration: number              // Required duration in minutes
  businessHours: BusinessHoursMap
  minuteIncrement: number       // Usually 15
  busyTimes?: BusyTimeRange[]   // Calendar busy periods
  includeFlags?: {              // Optional TimeSlot flags
    onSite?: boolean
    clientPresent?: boolean
    moveable?: boolean
  }
}

/**
 * Check if a slot overlaps with any busy periods
 * LEARNING: Pure function that checks availability
 * WHY: Separates availability checking from slot generation
 * PATTERN: Takes slot and busy periods, returns boolean
 * 
 * @param slotStart - Slot start time as Date
 * @param slotEnd - Slot end time as Date
 * @param busyTimes - Array of busy time ranges
 * @returns true if slot is available (doesn't overlap busy), false if busy
 */
export function checkSlotAvailability(
  slotStart: Date,
  slotEnd: Date,
  busyTimes: BusyTimeRange[]
): boolean {
  if (busyTimes.length === 0) {
    return true
  }

  // LEARNING: Check if slot overlaps any busy period
  // WHY: Slot is unavailable if it overlaps any busy time
  // PATTERN: Use timeRangesOverlap utility function
  const overlapsBusy = busyTimes.some(busy => {
    const busyStart = new Date(busy.start)
    const busyEnd = new Date(busy.end)
    return timeRangesOverlap(
      { start: slotStart, end: slotEnd },
      { start: busyStart, end: busyEnd }
    )
  })

  return !overlapsBusy
}

/**
 * Generate all possible time slots based on business hours and increments
 * LEARNING: Generates ALL slots first, then availability is checked separately
 * WHY: Ensures consistent slot generation regardless of busy periods
 * PATTERN: Pure function that generates slots without filtering
 * 
 * @param params - Parameters for slot generation
 * @returns Array of all possible slots (without availability flags)
 */
function generateAllTimeSlots(params: GenerateSlotsWithAvailabilityParams): TimeSlot[] {
  const {
    startBoundary,
    endBoundary,
    duration,
    businessHours,
    minuteIncrement,
    includeFlags = { onSite: false, clientPresent: false, moveable: false }
  } = params

  const slots: TimeSlot[] = []

  // Parse boundaries as Date objects
  const startBoundaryDate = new Date(startBoundary)
  const endBoundaryDate = new Date(endBoundary)

  // Validate boundaries
  if (startBoundaryDate >= endBoundaryDate) {
    return []
  }

  // Iterate through each day from startBoundary to endBoundary
  const startDateOnly = new Date(startBoundaryDate)
  startDateOnly.setHours(0, 0, 0, 0)
  
  const endDateOnly = new Date(endBoundaryDate)
  endDateOnly.setHours(0, 0, 0, 0)
  endDateOnly.setDate(endDateOnly.getDate() + 1)
  
  const currentDate = new Date(startDateOnly)

  while (currentDate < endDateOnly) {
    const dayOfWeek = currentDate.getDay() as 0 | 1 | 2 | 3 | 4 | 5 | 6
    const dayHours = businessHours[dayOfWeek]

    if (!dayHours) {
      // No business hours for this day, skip to next day
      currentDate.setDate(currentDate.getDate() + 1)
      continue
    }

    // Parse business hours for this day
    const [startHour, startMinute] = dayHours.start.split(':').map(Number)
    const [endHour, endMinute] = dayHours.end.split(':').map(Number)

    // Validate parsed times
    if (isNaN(startHour) || isNaN(startMinute) || isNaN(endHour) || isNaN(endMinute)) {
      console.warn(`[generateAllTimeSlots] Invalid time format for day ${dayOfWeek}:`, dayHours)
      currentDate.setDate(currentDate.getDate() + 1)
      continue
    }

    // Calculate day start and end in minutes from midnight
    const dayStartMinutes = startHour * 60 + startMinute
    const dayEndMinutes = endHour * 60 + endMinute

    // Validate end time is after start time
    if (dayEndMinutes <= dayStartMinutes) {
      console.warn(`[generateAllTimeSlots] Invalid business hours for day ${dayOfWeek}: end must be after start`)
      currentDate.setDate(currentDate.getDate() + 1)
      continue
    }

    // Generate slots within business hours at configured intervals
    let currentMinutes = dayStartMinutes

    while (currentMinutes < dayEndMinutes) {
      // Create slot start time
      const slotStart = new Date(currentDate)
      slotStart.setHours(Math.floor(currentMinutes / 60), currentMinutes % 60, 0, 0)

      // Create slot end time
      const slotEnd = new Date(slotStart)
      slotEnd.setMinutes(slotEnd.getMinutes() + duration)

      // Check if slot extends past business hours end
      const slotEndHour = slotEnd.getHours()
      const slotEndMinute = slotEnd.getMinutes()
      const extendsPastHours = slotEndHour > endHour || 
        (slotEndHour === endHour && slotEndMinute > endMinute)

      // LEARNING: Generate slot if it meets boundary and business hour constraints
      // WHY: We generate ALL slots that could theoretically exist, availability is checked later
      // PATTERN: Check boundaries and business hours, but don't filter by busy times here

      // Filter: slot start must be >= startBoundary
      if (slotStart < startBoundaryDate) {
        currentMinutes += minuteIncrement
        continue
      }

      // Filter: slot start must be <= endBoundary
      if (slotStart > endBoundaryDate) {
        break
      }

      // Filter: slot end must be <= endBoundary
      if (slotEnd > endBoundaryDate) {
        currentMinutes += minuteIncrement
        continue
      }

      // Filter: slot end must be <= business hours end
      if (extendsPastHours) {
        break
      }

      // LEARNING: Generate slot regardless of busy times
      // WHY: Availability will be checked and marked separately
      // PATTERN: Create slot with all required fields
      const slot: TimeSlot = {
        startTime: slotStart.toISOString(),
        endTime: slotEnd.toISOString(),
        duration,
        onSite: includeFlags.onSite ?? false,
        clientPresent: includeFlags.clientPresent ?? false,
        moveable: includeFlags.moveable ?? false
      }

      slots.push(slot)

      // Move to next interval
      currentMinutes += minuteIncrement
    }

    // Move to next day
    currentDate.setDate(currentDate.getDate() + 1)
  }

  return slots
}

/**
 * Mark slots with availability status
 * LEARNING: Checks each slot against busy periods and adds availability flag
 * WHY: Separates slot generation from availability checking
 * PATTERN: Map over slots, check availability, add flag
 * 
 * @param slots - Array of slots to mark
 * @param busyTimes - Array of busy time ranges
 * @returns Slots with isAvailable flag
 */
export function markSlotAvailability(
  slots: TimeSlot[],
  busyTimes: BusyTimeRange[]
): TimeSlotWithAvailability[] {
  return slots.map(slot => {
    const slotStart = new Date(slot.startTime)
    const slotEnd = new Date(slot.endTime)
    
    const isAvailable = checkSlotAvailability(slotStart, slotEnd, busyTimes)
    
    return {
      ...slot,
      isAvailable
    }
  })
}

/**
 * Generate all time slots with availability status
 * LEARNING: Unified function that generates all slots and marks availability
 * WHY: Single source of truth for availability calculations
 * PATTERN: Generate all slots first, then mark availability
 * 
 * @param params - Parameters for slot generation
 * @returns Slots with availability flags and earliest completion time
 */
export function generateSlotsWithAvailability(
  params: GenerateSlotsWithAvailabilityParams
): AvailabilityManagerResult {
  const { busyTimes = [] } = params

  // LEARNING: Generate all possible slots first
  // WHY: Ensures consistent slot generation regardless of busy periods
  // PATTERN: Generate all slots, then check availability
  const allSlots = generateAllTimeSlots(params)

  // LEARNING: Mark availability for each slot
  // WHY: Separates generation from availability checking
  // PATTERN: Map slots and add availability flag
  const slotsWithAvailability = markSlotAvailability(allSlots, busyTimes)

  // LEARNING: Find earliest available completion time
  // WHY: Only count available slots for earliest completion
  // PATTERN: Filter available slots, find earliest end time
  const availableSlots = slotsWithAvailability.filter(slot => slot.isAvailable)
  const earliestCompletion = availableSlots.length > 0
    ? availableSlots.reduce((earliest, slot) => {
        const slotEnd = new Date(slot.endTime)
        const earliestEnd = new Date(earliest.endTime)
        return slotEnd < earliestEnd ? slot : earliest
      }).endTime
    : null

  return {
    slots: slotsWithAvailability,
    earliestCompletion
  }
}
