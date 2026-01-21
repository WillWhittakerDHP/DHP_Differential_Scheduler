/**
 * Time Slot Fitter Utility
 * 
 * LEARNING: Generic time slot fitting that respects boundaries, business hours, and busy times
 * WHY: Reusable for appointment slots, available start times, AND moveable parts scheduling
 * PATTERN: Pure utility functions - no side effects, no reactivity
 * 
 * This is the single source of truth for fitting a duration into available time.
 */

import type { TimeSlot } from '@/types/appointment'
import {
  generateSlotsWithAvailability,
  type TimeSlotWithAvailability,
  type AvailabilityManagerResult
} from './timeAvailabilityManager'

/**
 * Business hours configuration for a single day
 */
export interface DayBusinessHours {
  start: string  // "HH:mm" format (e.g., "08:00")
  end: string    // "HH:mm" format (e.g., "17:00")
}

/**
 * Business hours by day of week (0 = Sunday, 6 = Saturday)
 */
export type BusinessHoursMap = Record<0 | 1 | 2 | 3 | 4 | 5 | 6, DayBusinessHours>

/**
 * Busy time range to exclude from available slots
 */
export interface BusyTimeRange {
  start: string  // ISO datetime
  end: string    // ISO datetime
}

/**
 * Parameters for fitting time slots
 */
export interface FitTimeSlotsParams {
  startBoundary: string         // ISO datetime - earliest possible start
  endBoundary: string           // ISO datetime - latest possible end (slot must complete by this time)
  duration: number              // Required duration in minutes
  businessHours: BusinessHoursMap
  minuteIncrement: number       // Usually 15
  busyTimes?: BusyTimeRange[]   // Optional exclusions
  includeFlags?: {              // Optional TimeSlot flags
    onSite?: boolean
    clientPresent?: boolean
    moveable?: boolean
  }
}

/**
 * Result from fitting time slots
 */
export interface FitTimeSlotsResult {
  slots: TimeSlot[]
  earliestCompletion: string | null  // ISO datetime of earliest possible end time
}

/**
 * Parse date string to local Date object
 * Handles both 'YYYY-MM-DD' and ISO timestamp formats
 * 
 * LEARNING: Parses dates in local timezone, not UTC
 * WHY: When we do new Date('2026-01-09'), it creates UTC midnight, which becomes previous day in timezones behind UTC
 * PATTERN: Extract date part and create Date object in local timezone
 */
export function parseLocalDate(dateString: string): Date {
  const datePart = dateString.includes('T') ? dateString.split('T')[0] : dateString
  const [year, month, day] = datePart.split('-').map(Number)
  return new Date(year, month - 1, day) // month is 0-indexed, creates date at local midnight
}

/**
 * Parse "HH:mm" time string to minutes from midnight
 * 
 * LEARNING: Converts time string to numeric minutes for calculations
 * WHY: Easier to work with minutes for time arithmetic
 */
export function parseTimeToMinutes(timeString: string): number {
  const [hours, minutes] = timeString.split(':').map(Number)
  return hours * 60 + minutes
}

/**
 * Check if two time ranges overlap
 * 
 * LEARNING: Extracted overlap detection for reuse
 * WHY: Used by fitTimeSlots and potentially other utilities
 * PATTERN: Two ranges overlap if one starts before the other ends
 */
export function timeRangesOverlap(
  range1: { start: Date; end: Date },
  range2: { start: Date; end: Date }
): boolean {
  return (range1.start < range2.end && range1.end > range2.start)
}

/**
 * Fit time slots of a given duration into available time between boundaries
 * 
 * LEARNING: Generic time slot fitting that respects boundaries, business hours, and busy times
 * WHY: Reusable for appointment slots, available start times, AND moveable parts scheduling
 * PATTERN: Pure utility function - no side effects, no reactivity
 * 
 * Algorithm:
 * 1. Parse start and end boundaries as Date objects
 * 2. Iterate through each day from startBoundary to endBoundary
 * 3. For each day, get business hours for that day of week
 * 4. Generate slots at minuteIncrement intervals within business hours
 * 5. Filter: slot start >= startBoundary
 * 6. Filter: slot end <= endBoundary
 * 7. Filter: slot end <= business hours end for that day
 * 8. Filter: slot doesn't overlap busy times
 * 9. Return valid slots + earliest completion time
 * 
 * @param params - Parameters for fitting time slots
 * @returns Result with valid slots and earliest completion time
 */
export function fitTimeSlots(params: FitTimeSlotsParams): FitTimeSlotsResult {
  const {
    startBoundary,
    endBoundary,
    duration,
    businessHours,
    minuteIncrement,
    busyTimes = [],
    includeFlags = { onSite: false, clientPresent: false, moveable: false }
  } = params

  const slots: TimeSlot[] = []
  let earliestCompletion: string | null = null

  // Parse boundaries as Date objects
  const startBoundaryDate = new Date(startBoundary)
  const endBoundaryDate = new Date(endBoundary)

  // Validate boundaries
  if (startBoundaryDate >= endBoundaryDate) {
    return { slots: [], earliestCompletion: null }
  }

  // Iterate through each day from startBoundary to endBoundary
  // LEARNING: Use date-only comparison to iterate through days
  // WHY: Need to process each day between boundaries, regardless of time
  // PATTERN: Extract date part and compare dates, not datetimes
  const startDateOnly = new Date(startBoundaryDate)
  startDateOnly.setHours(0, 0, 0, 0)
  
  const endDateOnly = new Date(endBoundaryDate)
  endDateOnly.setHours(0, 0, 0, 0)
  // Add one day to include the end day
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
      console.warn(`[fitTimeSlots] Invalid time format for day ${dayOfWeek}:`, dayHours)
      currentDate.setDate(currentDate.getDate() + 1)
      continue
    }

    // Calculate day start and end in minutes from midnight
    const dayStartMinutes = startHour * 60 + startMinute
    const dayEndMinutes = endHour * 60 + endMinute

    // Validate end time is after start time
    if (dayEndMinutes <= dayStartMinutes) {
      console.warn(`[fitTimeSlots] Invalid business hours for day ${dayOfWeek}: end must be after start`)
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

      // Filter: slot start must be >= startBoundary
      if (slotStart < startBoundaryDate) {
        // Move to next interval
        currentMinutes += minuteIncrement
        continue
      }

      // Filter: slot start must be <= endBoundary
      // LEARNING: Check start first, then end
      // WHY: If start is after boundary, no point checking end
      // PATTERN: Check start boundary before end boundary
      if (slotStart > endBoundaryDate) {
        // This slot starts after endBoundary, stop generating for this day
        break
      }

      // Filter: slot end must be <= endBoundary
      if (slotEnd > endBoundaryDate) {
        // This slot extends past endBoundary, skip it but continue (might have more slots that fit)
        currentMinutes += minuteIncrement
        continue
      }

      // Filter: slot end must be <= business hours end
      if (extendsPastHours) {
        // This slot extends past business hours, stop generating for this day
        break
      }

      // Filter: slot must not overlap busy times
      const overlapsBusy = busyTimes.some(busy => {
        const busyStart = new Date(busy.start)
        const busyEnd = new Date(busy.end)
        return timeRangesOverlap(
          { start: slotStart, end: slotEnd },
          { start: busyStart, end: busyEnd }
        )
      })

      if (overlapsBusy) {
        // This slot overlaps a busy time, skip it
        currentMinutes += minuteIncrement
        continue
      }

      // Slot is valid - add it
      const slot: TimeSlot = {
        startTime: slotStart.toISOString(),
        endTime: slotEnd.toISOString(),
        duration,
        onSite: includeFlags.onSite ?? false,
        clientPresent: includeFlags.clientPresent ?? false,
        moveable: includeFlags.moveable ?? false
      }

      slots.push(slot)

      // Track earliest completion time
      if (earliestCompletion === null || slotEnd < new Date(earliestCompletion)) {
        earliestCompletion = slotEnd.toISOString()
      }

      // Move to next interval
      currentMinutes += minuteIncrement
    }

    // Move to next day
    currentDate.setDate(currentDate.getDate() + 1)
  }

  return {
    slots,
    earliestCompletion
  }
}

/**
 * Result from fitting time slots with availability flags
 */
export interface FitTimeSlotsResultWithAvailability {
  slots: TimeSlotWithAvailability[]
  earliestCompletion: string | null  // ISO datetime of earliest available slot end time
}

/**
 * Fit time slots with availability status (all slots, marked as available/busy)
 * 
 * LEARNING: Generates ALL possible slots and marks them with availability status
 * WHY: Enables UI to render busy slots as inactive instead of hiding them
 * PATTERN: Uses unified availability manager for consistent slot generation
 * 
 * This is the new unified approach that:
 * 1. Generates all slots based on business hours + increments
 * 2. Checks availability against calendar busy periods
 * 3. Returns all slots with isAvailable flags
 * 
 * @param params - Parameters for fitting time slots
 * @returns Result with all slots (available + busy) and earliest available completion time
 */
export function fitTimeSlotsWithAvailability(
  params: FitTimeSlotsParams
): FitTimeSlotsResultWithAvailability {
  // LEARNING: Use unified availability manager
  // WHY: Single source of truth for all availability logic
  // PATTERN: Delegate to availability manager
  return generateSlotsWithAvailability({
    startBoundary: params.startBoundary,
    endBoundary: params.endBoundary,
    duration: params.duration,
    businessHours: params.businessHours,
    minuteIncrement: params.minuteIncrement,
    busyTimes: params.busyTimes,
    includeFlags: params.includeFlags
  })
}
