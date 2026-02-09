/**
 * Slot Pipeline - Public Entry Point
 * 
 * LEARNING: Public entry point for slot availability computation
 * WHY: Validates inputs and delegates to orchestrator for slot generation with availability marking
 * PATTERN: Pure utility functions - no side effects, no reactivity
 * 
 * This is the single source of truth for computing slots with availability.
 */

import type { TimeSlot } from '@/types/appointment'
import type { RFC3339DateTime } from '@/types/datetime'
import {
  orchestrateSlotAvailability
} from './slotAvailabilityOrchestrator'
import type { Constraint, RangeConstraint } from '@shared/types/availabilityTypes'
import { createLogger } from '@/utils/logger'
import { validateSlotGenerationParams } from './slotGenerationValidation'
import {
  type BusinessHoursMap,
  type BusyTimeRange,
  type DayBusinessHours,
} from './timeSlotTypes'

const logger = createLogger('slotPipeline')

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

export interface SlotAvailabilityParams {
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
  constraints?: Constraint[]
}

interface SlotAvailabilityResult {
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

/**
 * Compute slots with availability status
 * 
 * LEARNING: Single entry point for slot generation with availability marking
 * WHY: Replaces fitAvailableTimeSlots and fitAllTimeSlotsWithAvailability (near-duplicates)
 * PATTERN: Validates inputs, delegates to orchestrateSlotAvailability, returns ALL slots
 *   - Callers that only need available slots do .filter(s => s.isAvailable) at the call site
 *   - This is a trivial one-liner, not worth wrapping in a separate function
 * 
 * Algorithm:
 * 1. Validate all input parameters (duration, minuteIncrement, boundaries, business hours)
 * 2. Delegate to orchestrateSlotAvailability() for slot generation + constraint checking
 * 3. Return all slots with isAvailable flags + earliest available completion time
 * 
 * @param params - Parameters for computing slot availability
 * @param constraints - Pre-computed constraints (unified array from server)
 * @param options - Options including pre-computed drive times and capacity hours
 * @returns Result with all slots (available + busy) and earliest available completion time
 */
export function computeSlotAvailability(
  params: SlotAvailabilityParams,
  constraints: Constraint[] = []
): SlotAvailabilityResult {
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

  // Validate business hours - either from params or from range constraints in unified array
  const rangeConstraintBusinessHours = constraints
    .find((c): c is RangeConstraint => c.category === 'range' && c.type === 'businessHours')
  const effectiveBusinessHours = businessHours || 
    (rangeConstraintBusinessHours?.config as { hours?: BusinessHoursMap } | undefined)?.hours
  
  if (!effectiveBusinessHours || typeof effectiveBusinessHours !== 'object') {
    throw new Error('businessHours must be provided either directly or via constraints')
  }

  const hasAnyHours = Object.keys(effectiveBusinessHours).length > 0
  if (!hasAnyHours) {
    return { slots: [], earliestCompletion: null }
  }

  return orchestrateSlotAvailability(
    {
      startBoundary,
      endBoundary,
      duration,
      minuteIncrement,
      busyTimes,
      includeFlags
    },
    constraints
  )
}
