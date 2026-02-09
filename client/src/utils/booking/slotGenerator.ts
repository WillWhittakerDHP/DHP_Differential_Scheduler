/**
 * Slot Generator
 * 
 * LEARNING: Handles time slot generation based on boundaries, increments, and duration
 * WHY: Separated from slotAvailabilityManager to reduce complexity and improve maintainability
 * PATTERN: Pure utility functions - no side effects
 */

import type { TimeSlot } from '@/types/appointment'
import type { RFC3339DateTime } from '@/types/datetime'
import { validateSlotGenerationParams } from './slotGenerationValidation'

/**
 * Parameters for slot generation
 * LEARNING: Structured parameters for slot generation
 * WHY: Type-safe parameter passing
 * PATTERN: Interface with required fields
 */
export interface GenerateSlotsWithAvailabilityParams {
  startBoundary: RFC3339DateTime         // RFC3339 datetime - earliest possible start
  endBoundary: RFC3339DateTime           // RFC3339 datetime - latest possible end
  duration: number                        // Required duration in minutes
  minuteIncrement: number                 // Usually 15
  busyTimes?: never                       // Not used in generation, only in availability checking
  includeFlags: {
    major: boolean
    minor: boolean
    moveable: boolean
  }
}

/**
 * Generate days in range
 * LEARNING: Extracted day iteration logic
 * WHY: Reduces nesting and improves readability
 * PATTERN: Pure recursive function
 * 
 * @param current - Current date
 * @param end - End date
 * @param acc - Accumulator array
 * @returns Array of dates in range
 */
function generateDaysInRange(current: Date, end: Date, acc: Date[] = []): Date[] {
  if (current >= end) return acc
  const next = new Date(Date.UTC(
    current.getUTCFullYear(),
    current.getUTCMonth(),
    current.getUTCDate() + 1
  ))
  return generateDaysInRange(next, end, [...acc, new Date(current)])
}

/**
 * Calculate initial slot start time for a day
 * LEARNING: Extracted initial slot start calculation logic
 * WHY: Reduces nesting and improves readability
 * PATTERN: Pure function with early returns
 * 
 * @param dayStart - Day start time (midnight UTC)
 * @param slotStartBoundary - Slot start boundary (clamped to startBoundaryDate)
 * @param minuteIncrement - Minute increment for slots
 * @returns Initial slot start time
 */
function calculateInitialSlotStart(
  dayStart: Date,
  slotStartBoundary: Date,
  minuteIncrement: number
): Date {
  if (slotStartBoundary <= dayStart) {
    return dayStart
  }
  
  const minutesSinceMidnight = slotStartBoundary.getUTCHours() * 60 + slotStartBoundary.getUTCMinutes()
  const roundedMinutes = Math.ceil(minutesSinceMidnight / minuteIncrement) * minuteIncrement
  
  return new Date(Date.UTC(
    dayStart.getUTCFullYear(),
    dayStart.getUTCMonth(),
    dayStart.getUTCDate(),
    Math.floor(roundedMinutes / 60),
    roundedMinutes % 60
  ))
}

/**
 * Generate slots for a single day
 * LEARNING: Extracted slot generation for single day logic
 * WHY: Reduces nesting and improves readability
 * PATTERN: Pure recursive function
 * 
 * @param slotStart - Current slot start time
 * @param slotEndBoundary - Slot end boundary for this day
 * @param endBoundaryDate - Overall end boundary
 * @param duration - Slot duration in minutes
 * @param minuteIncrement - Minute increment for slots
 * @param includeFlags - Include flags for slots
 * @param accumulatedSlots - Accumulator array
 * @returns Array of slots for this day
 */
function generateSlotsForDay(
  slotStart: Date,
  slotEndBoundary: Date,
  endBoundaryDate: Date,
  duration: number,
  minuteIncrement: number,
  includeFlags: { major: boolean; minor: boolean; moveable: boolean },
  accumulatedSlots: TimeSlot[]
): TimeSlot[] {
  if (slotStart >= slotEndBoundary) {
    return accumulatedSlots
  }
  
  // PATTERN: Calculate end time in minutes, then create new Date
  const slotStartMinutes = slotStart.getUTCMinutes() + duration
  const slotEnd = new Date(Date.UTC(
    slotStart.getUTCFullYear(),
    slotStart.getUTCMonth(),
    slotStart.getUTCDate(),
    slotStart.getUTCHours() + Math.floor(slotStartMinutes / 60),
    slotStartMinutes % 60
  ))
  
  const newSlots = slotEnd <= endBoundaryDate
    ? [...accumulatedSlots, {
        startTime: slotStart.toISOString() as RFC3339DateTime,
        endTime: slotEnd.toISOString() as RFC3339DateTime,
        duration,
        major: includeFlags.major,
        minor: includeFlags.minor,
        moveable: includeFlags.moveable,
        isAvailable: false  // Will be updated by markSlotAvailability
      }]
    : accumulatedSlots
  
  const nextSlotStartMinutes = slotStart.getUTCMinutes() + minuteIncrement
  const nextSlotStart = new Date(Date.UTC(
    slotStart.getUTCFullYear(),
    slotStart.getUTCMonth(),
    slotStart.getUTCDate(),
    slotStart.getUTCHours() + Math.floor(nextSlotStartMinutes / 60),
    nextSlotStartMinutes % 60
  ))
  
  return generateSlotsForDay(
    nextSlotStart,
    slotEndBoundary,
    endBoundaryDate,
    duration,
    minuteIncrement,
    includeFlags,
    newSlots
  )
}

/**
 * Generate all possible time slots based on business hours and increments
 * 
 * LEARNING: Generates ALL slots first, then availability is checked separately
 * WHY: Ensures consistent slot generation regardless of busy periods
 * PATTERN: Pure function that generates slots without filtering
 * 
 * DESIGN DECISION: Generate All Then Filter vs. Filter During Generation
 * -----------------------------------------------------------------------
 * This function uses the "generate all then filter" approach rather than 
 * filtering during generation. Benefits:
 * 
 * 1. CONSISTENCY: Generates same slots regardless of busy periods
 * 2. UI FLEXIBILITY: Allows showing unavailable slots (grayed out)
 * 3. DEBUGGING: Easier to see all potential slots vs. filtered slots
 * 4. TESTABILITY: Can test generation and filtering separately
 * 5. PERFORMANCE: Only parses busy periods once (with caching optimization)
 * 
 * REFACTORED: Extracted helper functions to reduce function length from 165 lines to <50 per function
 * 
 * @param params - Parameters for slot generation
 * @returns Array of all possible slots (without availability flags)
 */
export function generateAllTimeSlots(params: GenerateSlotsWithAvailabilityParams): TimeSlot[] {
  const {
    startBoundary,
    endBoundary,
    duration,
    minuteIncrement,
    includeFlags
  } = params

  // PATTERN: Use validateSlotGenerationParams to eliminate duplicate validation logic
  validateSlotGenerationParams({
    duration,
    minuteIncrement,
    startBoundary,
    endBoundary
  })

  // PATTERN: Parse once at start, reuse throughout function
  const startBoundaryDate = new Date(startBoundary)
  const endBoundaryDate = new Date(endBoundary)

  // Validate boundaries: start < end (return empty array if invalid)
  if (startBoundaryDate >= endBoundaryDate) {
    return []
  }

  // PATTERN: Generate all slots at minuteIncrement intervals between boundaries
  // PATTERN: Use Date.UTC constructor to create new Date objects
  const startDateOnly = new Date(Date.UTC(
    startBoundaryDate.getUTCFullYear(),
    startBoundaryDate.getUTCMonth(),
    startBoundaryDate.getUTCDate(),
    0, 0, 0, 0
  ))
  
  const endDateOnly = new Date(Date.UTC(
    endBoundaryDate.getUTCFullYear(),
    endBoundaryDate.getUTCMonth(),
    endBoundaryDate.getUTCDate() + 1,
    0, 0, 0, 0
  ))

  // PATTERN: Generate array of days functionally using recursive helper, then reduce to slots array
  const days = generateDaysInRange(startDateOnly, endDateOnly)
  
  const slots = days.reduce((acc, currentDate) => {
    // PATTERN: Use Date.UTC constructor to create new Date objects
    const dayStart = new Date(Date.UTC(
      currentDate.getUTCFullYear(),
      currentDate.getUTCMonth(),
      currentDate.getUTCDate(),
      0, 0, 0, 0
    ))
    
    const dayEnd = new Date(Date.UTC(
      currentDate.getUTCFullYear(),
      currentDate.getUTCMonth(),
      currentDate.getUTCDate(),
      23, 59, 59, 999
    ))
    
    const slotStartBoundary = dayStart < startBoundaryDate ? startBoundaryDate : dayStart
    const slotEndBoundary = dayEnd > endBoundaryDate ? endBoundaryDate : dayEnd
    
    const initialSlotStart = calculateInitialSlotStart(dayStart, slotStartBoundary, minuteIncrement)
    
    const daySlots = generateSlotsForDay(
      initialSlotStart,
      slotEndBoundary,
      endBoundaryDate,
      duration,
      minuteIncrement,
      includeFlags,
      []
    )
    
    return [...acc, ...daySlots]
  }, [] as TimeSlot[])

  return slots
}
