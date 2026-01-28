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
import { toRFC3339DateTime, type RFC3339DateTime } from '@/types/datetime'
import { getAvailabilitySettings, type BusinessHoursConfig } from '@/configs/availabilitySettings'
import { fitAvailableTimeSlots, parseUTCDate, type BusinessHoursMap } from '@/utils/booking/timeSlotFitter'  // P3-6: Renamed for clarity
import { generateMockFreeBusyResponse, extractBusyTimesFromFreeBusyResponse } from '@/utils/booking/mockGoogleCalendar'
import { validateDateRange } from '@/utils/booking/dateRangeValidation'
import { DEFAULT_APPOINTMENT_DURATION_MINUTES } from '@/constants/scheduling'
import { createLogger } from '@/utils/logger'

// LEARNING: Use scoped logger for controllable debug output
// WHY: Prevents debug logs in production, allows scope-based filtering
// PATTERN: createLogger(scope) provides debug/info/warn/error methods
const logger = createLogger('timeSlotCalculations')

const isBusinessHoursConfig = (config: BusinessHoursConfig | { minutes: number } | { start: string; end: string }): config is BusinessHoursConfig => {
  return 'hours' in config
}

/**
 * Round duration up to the nearest 15-minute increment
 * LEARNING: Ceiling function for time durations
 * WHY: Ensures appointment durations align with standard time increments
 * PATTERN: Use Math.ceil to round up, then multiply by increment
 * 
 * @param duration - Duration in minutes
 * @param increment - Increment in minutes (default: 15)
 * @returns Duration rounded up to nearest increment
 * 
 * Examples:
 * - roundUpToIncrement(37) -> 45 (rounds 37 up to 45)
 * - roundUpToIncrement(90) -> 90 (already on increment)
 * - roundUpToIncrement(91) -> 105 (rounds 91 up to 105)
 * - roundUpToIncrement(400) -> 405 (rounds 400 up to 405)
 */
export function roundUpToIncrement(duration: number, increment: number = 15): number {
  if (duration <= 0) return increment
  return Math.ceil(duration / increment) * increment
}

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
    // P3-1: Use constant instead of magic number
    // Default to DEFAULT_APPOINTMENT_DURATION_MINUTES if no block instances selected
    return DEFAULT_APPOINTMENT_DURATION_MINUTES
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
  
  // P3-1: Use constant instead of magic number
  // Return calculated duration or default to DEFAULT_APPOINTMENT_DURATION_MINUTES if sum is 0
  return totalDuration > 0 ? totalDuration : DEFAULT_APPOINTMENT_DURATION_MINUTES
}

/**
 * Get calendar availability using mock Google Calendar free/busy data
 * LEARNING: Uses mock data generator to simulate Google Calendar API responses
 * WHY: Enables testing time slot filtering with blocked periods without real API integration
 * PATTERN: Generates mock busy periods and extracts them for use with fitAvailableTimeSlots()  // P3-6: Updated function name
 * 
 * FUTURE: When ready for real Google Calendar integration:
 * 1. Add environment/config flag (e.g., USE_MOCK_CALENDAR_DATA)
 * 2. Create googleCalendarApi.ts with real API calls
 * 3. Switch between mock and real based on flag
 * 4. Keep mock implementation for testing/development
 * 
 * @param dateRange - Object with start and end RFC3339 datetime strings
 * @returns Array of busy time ranges compatible with fitAvailableTimeSlots() busyTimes parameter  // P3-6: Updated function name
 * 
 * @example
 * ```typescript
 * const busyTimes = getCalendarAvailability({
 *   start: '2026-01-15T00:00:00Z',
 *   end: '2026-01-16T00:00:00Z'
 * })
 * // Returns: [{ start: '2026-01-15T10:00:00Z', end: '2026-01-15T11:00:00Z' }, ...]
 * ```
 */
export function getCalendarAvailability(dateRange: { start: RFC3339DateTime; end: RFC3339DateTime }): Array<{ start: RFC3339DateTime; end: RFC3339DateTime }> {
  // LEARNING: Determine earliest start time for busy periods
  // WHY: If date is today, busy periods should start from current time (not midnight)
  // PATTERN: Check if start datetime is today, use current time if so
  const now = new Date()
  const todayStart = new Date(now)
  todayStart.setUTCHours(0, 0, 0, 0)
  const startDateOnly = new Date(dateRange.start)
  startDateOnly.setUTCHours(0, 0, 0, 0)
  const isToday = startDateOnly.getTime() === todayStart.getTime()
  
  const earliestStartTime = isToday ? toRFC3339DateTime(now) : dateRange.start
  
  // LEARNING: Return empty if earliest start time is significantly in the past
  // WHY: Past dates can't render in UI, no busy periods needed
  // PATTERN: Check earliestStartTime (not dateRange.start) because for today we use current time
  const earliestStartDateTime = new Date(earliestStartTime)
  const timeDifferenceMs = now.getTime() - earliestStartDateTime.getTime()
  const isSignificantlyPast = timeDifferenceMs > 1000 // More than 1 second in the past
  
  if (isSignificantlyPast) {
    return [] // Past dates can't render in UI, no busy periods needed
  }
  
  // P2-3: Use shared date range validation utility
  // LEARNING: Validate date range using shared utility
  // WHY: Ensures consistent validation across codebase
  // PATTERN: Use validateDateRange to check and normalize date range
  const validatedRange = validateDateRange(dateRange)
  if (!validatedRange) {
    // validateDateRange logs warnings internally
    return []
  }
  
  // Use validated range for date parsing
  const startDate = new Date(validatedRange.start)
  const endDate = new Date(validatedRange.end)
  
  try {
    const mockResponse = generateMockFreeBusyResponse(dateRange, {
      periodsPerCalendar: 3,  // 3 busy periods per calendar
      minDurationMinutes: 30,  // Minimum 30 minutes
      maxDurationMinutes: 120,  // Maximum 2 hours
      calendarIds: ['primary', 'work', 'personal']  // Multiple calendars
    })
    
    // Extract busy times from all calendars, merging overlapping periods
    // LEARNING: Merge overlapping periods to avoid double-counting
    // WHY: Multiple calendars may have overlapping events
    // PATTERN: Extract and merge for accurate availability calculation
    const busyTimes = extractBusyTimesFromFreeBusyResponse(mockResponse, true)
    

    return busyTimes
  } catch (error) {
    // LEARNING: Handle errors gracefully
    // WHY: Mock generation might fail with invalid date ranges
    // PATTERN: Log error and return empty array (all times available)
    logger.error('Error generating mock calendar data:', error)
    return []
  }
}

/**
 * Generate time slots for a date range
 * LEARNING: Now delegates to fitAvailableTimeSlots() for core logic  // P3-6: Updated function name
 * WHY: Single source of truth for time slot fitting
 * PATTERN: Thin wrapper that fetches settings and calls core utility
 * Session 1.3.7: Updated to use settings config instead of hardcoded values
 * Session 1.4.1: Updated to async to fetch settings from API
 * Session 1.4.14: Refactored to use fitAvailableTimeSlots() core utility  // P3-6: Updated function name
 * 
 * @param dateRange - Object with start and end ISO date strings
 * @param duration - Appointment duration in minutes
 * @param busyTimes - Array of busy time ranges to exclude (optional)
 * @returns Promise<TimeSlot[]> - Array of TimeSlot objects
 */
export async function generateTimeSlots(
  dateRange: { start: RFC3339DateTime; end: RFC3339DateTime },
  duration: number,
  busyTimes: Array<{ start: RFC3339DateTime; end: RFC3339DateTime }> = []
): Promise<TimeSlot[]> {
  // LEARNING: Get availability settings from API
  // WHY: Uses admin-configurable business hours and time increments from database instead of hardcoded values
  // PATTERN: Load settings asynchronously from API, use throughout function
  const settings = await getAvailabilitySettings()
  
  // LEARNING: Check if date is in the past
  // WHY: Past dates shouldn't generate slots
  // LEARNING: Use UTC methods for all date operations
  // WHY: All business logic should use UTC to avoid timezone issues
  const now = new Date()
  const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0))
  const startDate = parseUTCDate(dateRange.start)
  if (!startDate) {
    logger.warn('Invalid start date in dateRange:', dateRange.start)
    return []
  }
  const startDateOnly = new Date(Date.UTC(startDate.getUTCFullYear(), startDate.getUTCMonth(), startDate.getUTCDate(), 0, 0, 0, 0))
  
  // LEARNING: Extract businessHours from structured rangeConstraints
  // WHY: No top-level businessHours fallback - must use structured format
  // PATTERN: Get businessHours from rangeConstraints.businessHours.config.hours
  const businessHoursConfig = settings.rangeConstraints?.businessHours?.config
  const businessHours = businessHoursConfig && isBusinessHoursConfig(businessHoursConfig)
    ? businessHoursConfig.hours
    : null
  if (!businessHours) {
    throw new Error('businessHours must be provided in rangeConstraints.businessHours.config.hours')
  }
  
  // LEARNING: Use fitAvailableTimeSlots() core utility for slot generation  // P3-6: Updated function name
  // WHY: Single source of truth for time slot fitting logic
  // PATTERN: Delegate to core utility with appropriate boundaries
  const result = await fitAvailableTimeSlots({  // P3-6: Renamed for clarity
    startBoundary: dateRange.start,
    endBoundary: dateRange.end,
    duration,
    businessHours,
    minuteIncrement: settings.minuteIncrement,
    busyTimes,
    includeFlags: { onSite: false, clientPresent: false, moveable: false }
  })
  
  return result.slots
}


