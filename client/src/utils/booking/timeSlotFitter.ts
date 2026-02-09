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
import type { RFC3339DateTime, DayOfWeek } from '@/types/datetime'
import {
  generateSlotsWithAvailability
} from './slotAvailabilityManager'
import type { RangeConstraint, OverlapConstraint, CapacityConstraint } from '@shared/types/availabilityTypes'
import { createLogger } from '@/utils/logger'
import { validateSlotGenerationParams } from './slotGenerationValidation'
import {
  type BusinessHoursMap,
  type BusyTimeRange,
  type DayBusinessHours,
  timeRangesOverlap,
  parseBusinessHours
} from './timeSlotTypes'

const logger = createLogger('timeSlotFitter')

// Re-export types for backward compatibility
export type { BusinessHoursMap, BusyTimeRange, DayBusinessHours }

/**
 * Default include flags for TimeSlot objects
 * LEARNING: Explicit default values for includeFlags parameter
 * WHY: Clear, documented defaults that can be reused across the codebase
 * PATTERN: Exported constant that can be used by callers and tests
 */
export const DEFAULT_INCLUDE_FLAGS = {
  major: false,
  minor: false,
  moveable: false
} as const

// Types moved to timeSlotTypes.ts to break circular dependency

export interface FitTimeSlotsParams {
  startBoundary: RFC3339DateTime         // RFC3339 datetime - earliest possible start
  endBoundary: RFC3339DateTime           // RFC3339 datetime - latest possible end (slot must complete by this time)
  duration: number                       // Required duration in minutes
  businessHours?: BusinessHoursMap        // Business hours by day of week (optional if rangeConstraints provided)
  minuteIncrement: number                 // Usually 15
  busyTimes?: BusyTimeRange[]             // Optional exclusions
  includeFlags: {
    major: boolean
    minor: boolean
    moveable: boolean
  }
  rangeConstraints?: RangeConstraint[]
  overlapConstraints?: OverlapConstraint[]
  capacityConstraints?: CapacityConstraint[]
}

interface FitTimeSlotsResult {
  slots: TimeSlot[]
  earliestCompletion: RFC3339DateTime | null  // RFC3339 datetime of earliest possible end time
}

/**
 * Parse date string to UTC Date object
 * Handles both 'YYYY-MM-DD' and ISO timestamp formats
 * 
 * LEARNING: Parses dates in UTC timezone, not local
 * WHY: All business logic should use UTC to avoid timezone issues
 * PATTERN: Extract date part and create Date object in UTC using Date.UTC()
 */
export function parseUTCDate(dateInput: string | Date): Date | null {
  // PATTERN: Convert Date to string if needed, then parse
  let dateString: string
  if (dateInput instanceof Date) {
    // Validate Date object is valid
    if (isNaN(dateInput.getTime())) {
      logger.warn('Invalid Date object passed to parseUTCDate:', dateInput)
      return null
    }
    const year = dateInput.getUTCFullYear()
    const month = String(dateInput.getUTCMonth() + 1).padStart(2, '0')
    const day = String(dateInput.getUTCDate()).padStart(2, '0')
    dateString = `${year}-${month}-${day}`
  } else if (typeof dateInput === 'string') {
    dateString = dateInput
  } else {
    dateString = String(dateInput)
  }
  
  const datePart = dateString.includes('T') ? dateString.split('T')[0] : dateString
  
  // P2-8: Validate date string format (YYYY-MM-DD)
  // LEARNING: Validate format before parsing to prevent Invalid Date objects
  // PATTERN: Check format regex, validate components, verify Date object
  if (!/^\d{4}-\d{2}-\d{2}$/.test(datePart)) {
    logger.warn('Invalid date string format:', datePart)
    return null
  }
  
  const [year, month, day] = datePart.split('-').map(Number)
  
  // Validate components are numbers
  if (isNaN(year) || isNaN(month) || isNaN(day)) {
    logger.warn('Invalid date components:', { year, month, day, datePart })
    return null
  }
  
  // Validate month and day ranges
  if (month < 1 || month > 12 || day < 1 || day > 31) {
    logger.warn('Invalid date component ranges:', { year, month, day, datePart })
    return null
  }
  
  // LEARNING: Use Date.UTC() to create date at UTC midnight
  // WHY: All business logic should use UTC to avoid timezone issues
  // PATTERN: Create Date using Date.UTC() for UTC midnight
  const date = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0))
  
  // Validate Date object is valid
  if (isNaN(date.getTime())) {
    logger.warn('Invalid Date object created:', { year, month, day, datePart })
    return null
  }
  
  return date
}

export function parseTimeToMinutes(timeString: string): number {
  const [hours, minutes] = timeString.split(':').map(Number)
  return hours * 60 + minutes
}


// Functions moved to timeSlotTypes.ts to break circular dependency

/**
 * Fit available time slots of a given duration into available time between boundaries
 * 
 * LEARNING: Generic time slot fitting that respects boundaries, business hours, and busy times
 * WHY: Reusable for appointment slots, available start times, AND moveable parts scheduling
 * PATTERN: Async utility function - may make API calls for capacity checking
 * 
 * P3-6: Renamed from fitTimeSlots to fitAvailableTimeSlots for clarity
 * 
 * ARCHITECTURE DECISION: Delegate Pattern for Slot Generation (Issue #20)
 * -----------------------------------------------------------------------
 * This function now delegates to generateSlotsWithAvailability() for core
 * slot generation, then filters to only available slots. This ensures:
 * 
 * 1. Single source of truth for slot generation logic
 * 2. Consistent behavior across fitAvailableTimeSlots and generateAllTimeSlots
 * 3. Easier maintenance (changes in one place)
 * 4. Same validation and error handling as before
 * 
 * RELATED: See Issue #20 in AVAILABILITY_REFACTOR_ANALYSIS.md
 * 
 * ARCHITECTURE DECISION: earliestCompletion Tracks Available Slots Only
 * -----------------------------------------------------------------------
 * Both fitAvailableTimeSlots and generateSlotsWithAvailability track earliest 
 * completion of AVAILABLE slots only (not all generated slots).  // P3-6: Updated function name
 * 
 * RATIONALE:
 * - More useful for UI (shows when next appointment can be booked)
 * - Aligns with user expectations ("When is the earliest I can schedule?")
 * - Consistent behavior across both functions
 * 
 * RELATED: See Issue #15 in AVAILABILITY_REFACTOR_ANALYSIS.md
 * 
 * Algorithm:
 * 1. Validate all input parameters (duration, minuteIncrement, boundaries, business hours)
 * 2. Delegate to generateSlotsWithAvailability() for core slot generation (async)
 * 3. Filter to only available slots (isAvailable === true)
 * 4. Return filtered slots + earliest available completion time
 * 
 * @param params - Parameters for fitting time slots
 * @returns Result with valid slots and earliest available completion time
 */
export async function fitAvailableTimeSlots(params: FitTimeSlotsParams): Promise<FitTimeSlotsResult> {
  const {
    startBoundary,
    endBoundary,
    duration,
    businessHours,
    minuteIncrement,
    busyTimes = [],
    includeFlags
  } = params

  // PATTERN: Use validateSlotGenerationParams to eliminate duplicate validation logic
  validateSlotGenerationParams({
    duration,
    minuteIncrement,
    startBoundary,
    endBoundary
  })

  const startBoundaryDate = new Date(startBoundary)
  const endBoundaryDate = new Date(endBoundary)

  // Validate Date objects are valid
  if (isNaN(startBoundaryDate.getTime())) {
    throw new Error('startBoundary must be a valid RFC3339 datetime')
  }
  if (isNaN(endBoundaryDate.getTime())) {
    throw new Error('endBoundary must be a valid RFC3339 datetime')
  }

  // Validate boundaries: start < end
  if (startBoundaryDate >= endBoundaryDate) {
    return { slots: [], earliestCompletion: null }
  }

  // Validate business hours - either from params or from rangeConstraints
  const effectiveBusinessHours = businessHours || 
    (params.rangeConstraints?.find(rc => rc.type === 'businessHours')?.config as { hours?: BusinessHoursMap } | undefined)?.hours
  
  if (!effectiveBusinessHours || typeof effectiveBusinessHours !== 'object') {
    throw new Error('businessHours must be provided either directly or via rangeConstraints.businessHours.config.hours')
  }

  const hasAnyHours = Object.keys(effectiveBusinessHours).length > 0
  if (!hasAnyHours) {
    return { slots: [], earliestCompletion: null }
  }

  // PATTERN: Generate all slots with availability, then filter to available only
  // Phase 6: Function is now synchronous (all data pre-computed server-side)
  const result = generateSlotsWithAvailability(
    {
      startBoundary,
      endBoundary,
      duration,
      minuteIncrement,
      busyTimes,
      includeFlags
    },
    params.rangeConstraints,
    params.overlapConstraints,
    params.capacityConstraints
  )

  // PATTERN: Filter slots where isAvailable === true
  const availableSlots = result.slots.filter(slot => slot.isAvailable)

  // PATTERN: Use earliestCompletion directly from result
  return {
    slots: availableSlots,
    earliestCompletion: result.earliestCompletion
  }
}

interface FitTimeSlotsResultWithAvailability {
  slots: TimeSlot[]  // P3-3: Use TimeSlot directly instead of TimeSlotWithAvailability
  earliestCompletion: RFC3339DateTime | null  // RFC3339 datetime of earliest available slot end time
}

/**
 * Fit all time slots with availability status (all slots, marked as available/busy)
 * 
 * LEARNING: Generates ALL possible slots and marks them with availability status
 * WHY: Enables UI to render busy slots as inactive instead of hiding them
 * PATTERN: Uses unified availability manager for consistent slot generation (async)
 * 
 * P3-6: Renamed from fitTimeSlotsWithAvailability to fitAllTimeSlotsWithAvailability for clarity
 * 
 * This is the new unified approach that:
 * 1. Generates all slots based on business hours + increments
 * 2. Checks availability against calendar busy periods
 * 3. Checks capacity limits if configured
 * 4. Returns all slots with isAvailable flags
 * 
 * @param params - Parameters for fitting time slots
 * @returns Result with all slots (available + busy) and earliest available completion time
 */
/**
 * Fit all time slots with availability status
 * 
 * Phase 6: Refactored to be synchronous - delegates to synchronous generateSlotsWithAvailability
 * WHY: All data is pre-computed server-side, eliminating async operations
 * 
 * @param params - Parameters for fitting time slots
 * @param rangeConstraints - Pre-computed range constraints (from server)
 * @param overlapConstraints - Pre-computed overlap constraints (from server)
 * @param capacityConstraints - Pre-computed capacity constraints (from server)
 * @param options - Options including pre-computed drive times and capacity hours
 * @returns Synchronous result with all slots (available + busy) and earliest available completion time
 */
export function fitAllTimeSlotsWithAvailability(
  params: FitTimeSlotsParams,
  rangeConstraints?: RangeConstraint[],
  overlapConstraints?: OverlapConstraint[],
  capacityConstraints?: CapacityConstraint[],
  options?: {
    // Phase 6: Pre-computed data from server orchestrator (required)
    precomputedDriveTimesByDate?: Record<string, { driveTimeTo?: number; driveTimeFrom?: number }>
    precomputedCapacityHours?: Record<string, number>
  }
): FitTimeSlotsResultWithAvailability {
  // PATTERN: Delegate to availability manager with constraint arrays (now synchronous)
  return generateSlotsWithAvailability(
    {
      startBoundary: params.startBoundary,
      endBoundary: params.endBoundary,
      duration: params.duration,
      minuteIncrement: params.minuteIncrement,
      busyTimes: params.busyTimes,
      includeFlags: params.includeFlags
    },
    rangeConstraints || params.rangeConstraints,
    overlapConstraints || params.overlapConstraints,
    capacityConstraints || params.capacityConstraints,
    undefined, // now parameter
    options
  )
}
