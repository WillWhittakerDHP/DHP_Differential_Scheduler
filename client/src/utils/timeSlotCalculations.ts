/**
 * Time Slot Calculation Utilities
 * 
 * LEARNING: Client-side time slot calculation functions
 * WHY: Calculate time slots from part instances without API dependency
 * PATTERN: Pure functions for time slot generation and duration calculation
 * Session 1.3.7: Client-Side Availability Calculations
 */

import type { TimeSlot } from '@/types/appointment'
import type { BookingBlockInstance } from '@/utils/transformers/globalToBookingTransformer'
import { getAvailabilitySettings } from '@/configs/availabilitySettings'

/**
 * Calculate duration from accumulated block instances
 * LEARNING: Sums all baseTime values from partInstances across all selected block instances
 * WHY: Duration includes time from base service, property type blocks, and availability options
 * PATTERN: Reduce block instances to sum of all part instances' baseTime values
 * Session 1.3.7: Refactored to handle all block instance types (service, property type block, availability options)
 * 
 * @param blockInstances - Array of BookingBlockInstance objects (service, property type block, availability options)
 * @returns Total duration in minutes, defaults to 90 if no block instances or part instances
 */
export function calculateDurationFromBlockInstances(blockInstances: BookingBlockInstance[]): number {
  if (!blockInstances || blockInstances.length === 0) {
    // Default to 90 minutes (1.5 hours) if no block instances selected
    return 90
  }
  
  // LEARNING: Sum baseTime from all part instances across all block instances
  // WHY: Duration accumulates from base service + property type block + availability options
  // PATTERN: Reduce block instances, then reduce part instances within each block
  const totalDuration = blockInstances.reduce((total, blockInstance) => {
    if (!blockInstance.partInstances || blockInstance.partInstances.length === 0) {
      return total
    }
    const blockDuration = blockInstance.partInstances.reduce((sum, partInstance) => {
      return sum + (partInstance.baseTime || 0)
    }, 0)
    return total + blockDuration
  }, 0)
  
  // Return calculated duration or default to 90 minutes if sum is 0
  return totalDuration > 0 ? totalDuration : 90
}

/**
 * @deprecated Use calculateDurationFromBlockInstances instead
 * Calculate duration from part instances (legacy - single block instance)
 * LEARNING: Kept for backward compatibility during migration
 * WHY: Some code may still reference this function
 * PATTERN: Wraps calculateDurationFromBlockInstances with single block instance
 */
export function calculateDurationFromPartInstances(service: BookingBlockInstance | null): number {
  return calculateDurationFromBlockInstances(service ? [service] : [])
}

/**
 * Get calendar availability (currently returns dummy data)
 * LEARNING: Structure for future Google Calendar integration
 * WHY: Enables filtering out busy times when generating slots
 * PATTERN: Returns available time ranges (currently all times available)
 * Session 1.3.7: dateRange parameter defined but not yet used for filtering
 * 
 * @param dateRange - Object with start and end ISO date strings
 * @returns Array of busy time ranges (currently empty - all times available)
 * 
 * TODO: Session 1.3.7+ - Implement dateRange filtering
 * - Filter busy times to only include those within the provided dateRange
 * - Ensure dateRange validation (start must be >= today)
 * - Integrate with Google Calendar API to fetch actual busy times
 * - Handle timezone conversions properly
 */
export function getCalendarAvailability(dateRange: { start: string; end: string }): Array<{ start: string; end: string }> {
  // TODO: Session 1.3.7+ - Integrate with Google Calendar API
  // TODO: Filter busy times by dateRange (currently returns all times as available)
  // For now, return empty array (all times available) - meets testing needs
  // Note: dateRange parameter (start: ${dateRange.start}, end: ${dateRange.end}) will be used when Google Calendar integration is implemented
   
  void dateRange // Suppress unused parameter warning - will be used for filtering when implemented
  return []
}

/**
 * Generate time slots for a date range
 * LEARNING: Creates time slots based on date range, duration, and admin settings
 * WHY: Generates available time slots for appointment booking using configurable business hours
 * PATTERN: Generate slots using settings from availabilitySettings config, filter busy times
 * Session 1.3.7: Updated to use settings config instead of hardcoded values
 * Session 1.4.1: Updated to async to fetch settings from API
 * 
 * @param dateRange - Object with start and end ISO date strings
 * @param duration - Appointment duration in minutes
 * @param busyTimes - Array of busy time ranges to exclude (optional)
 * @returns Promise<TimeSlot[]> - Array of TimeSlot objects
 */
export async function generateTimeSlots(
  dateRange: { start: string; end: string },
  duration: number,
  busyTimes: Array<{ start: string; end: string }> = []
): Promise<TimeSlot[]> {
  const slots: TimeSlot[] = []
  
  // LEARNING: Parse dates in local timezone, not UTC
  // WHY: When we do new Date('2026-01-09'), it creates UTC midnight, which becomes previous day in timezones behind UTC
  // PATTERN: Parse YYYY-MM-DD string (or ISO date string) and create Date object in local timezone
  const parseLocalDate = (dateString: string): Date => {
    // Handle both 'YYYY-MM-DD' and 'YYYY-MM-DDTHH:MM:SSZ' formats
    // WHY: Tests and API may provide ISO format, but we need to extract just the date part
    const datePart = dateString.includes('T') ? dateString.split('T')[0] : dateString
    const [year, month, day] = datePart.split('-').map(Number)
    return new Date(year, month - 1, day) // month is 0-indexed, creates date at local midnight
  }
  
  const startDate = parseLocalDate(dateRange.start)
  const endDate = parseLocalDate(dateRange.end)
  
  // LEARNING: Get availability settings from API
  // WHY: Uses admin-configurable business hours and time increments from database instead of hardcoded values
  // PATTERN: Load settings asynchronously from API, use throughout function
  const settings = await getAvailabilitySettings()
  
  // LEARNING: Check if date is in the past
  // WHY: Past dates shouldn't generate slots
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const startDateOnly = new Date(startDate)
  startDateOnly.setHours(0, 0, 0, 0)
  
  // LEARNING: Generate slots using settings from config
  // WHY: Business hours and increments are now configurable via admin settings
  // PATTERN: Iterate through date range, generate slots for each day using day-specific hours
  const currentDate = new Date(startDate)
  
  while (currentDate < endDate) {
    // LEARNING: Get business hours for current day of week
    // WHY: Different days may have different business hours (e.g., shorter weekend hours)
    // PATTERN: Use day of week (0-6) to index businessHours object
    const dayOfWeek = currentDate.getDay() as 0 | 1 | 2 | 3 | 4 | 5 | 6
    const dayHours = settings.businessHours[dayOfWeek]
    
    // LEARNING: Parse start and end times from settings (format: "HH:MM")
    // WHY: Convert string times to hours and minutes for Date manipulation
    // PATTERN: Split "HH:MM" string and parse to numbers
    const [startHour, startMinute] = dayHours.start.split(':').map(Number)
    const [endHour, endMinute] = dayHours.end.split(':').map(Number)
    
    // LEARNING: Generate slots within business hours at configured intervals
    // WHY: Creates time slots at minuteIncrement intervals (e.g., every 15 minutes)
    // PATTERN: Nested loops for hours and minutes at increment intervals
    for (let hour = startHour; hour <= endHour; hour++) {
      const maxMinute = hour === endHour ? endMinute : 60
      for (let minute = (hour === startHour ? startMinute : 0); minute < maxMinute; minute += settings.minuteIncrement) {
        const slotStart = new Date(currentDate)
        slotStart.setHours(hour, minute, 0, 0)
        
        const slotEnd = new Date(slotStart)
        slotEnd.setMinutes(slotEnd.getMinutes() + duration)
        
        // LEARNING: Check if slot extends past business hours
        // WHY: Ensure appointment doesn't extend beyond available hours
        // PATTERN: Compare slotEnd time to day's end time
        const slotEndHour = slotEnd.getHours()
        const slotEndMinute = slotEnd.getMinutes()
        const extendsPastHours = slotEndHour > endHour || 
          (slotEndHour === endHour && slotEndMinute > endMinute)
        
        // LEARNING: Check if slot overlaps with busy times
        // WHY: Filter out slots that conflict with existing appointments
        // PATTERN: Check if slotStart or slotEnd falls within any busy time range
        const isBusy = busyTimes.some(busy => {
          const busyStart = new Date(busy.start)
          const busyEnd = new Date(busy.end)
          // Slot is busy if it overlaps with busy time range
          return (slotStart >= busyStart && slotStart < busyEnd) ||
                 (slotEnd > busyStart && slotEnd <= busyEnd) ||
                 (slotStart <= busyStart && slotEnd >= busyEnd)
        })
        
        // LEARNING: Only add slot if it's not busy and doesn't extend past business hours
        // WHY: Ensures all slots are valid and available
        // PATTERN: Multiple conditions must be met to add slot
        if (!isBusy && !extendsPastHours) {
          slots.push({
            slotStart: slotStart.toISOString(),
            slotEnd: slotEnd.toISOString(),
            duration
          })
        }
      }
    }
    
    // Move to next day
    currentDate.setDate(currentDate.getDate() + 1)
  }
  
  return slots
}

