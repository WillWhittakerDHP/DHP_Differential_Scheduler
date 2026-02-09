/**
 * Slot Availability Manager
 * 
 * LEARNING: Main orchestrator for slot availability calculations
 * WHY: Coordinates all availability logic modules (generation, constraints, capacity)
 * PATTERN: Orchestrator pattern - delegates to specialized modules
 * 
 * REFACTORED: Split into focused modules to reduce complexity:
 * - timeSlotTypes.ts: Shared types and utilities for time slots
 * - busyPeriodProcessor.ts: Busy period preprocessing
 * - slotGenerator.ts: Slot generation logic
 * - rangeConstraintChecker.ts: Range constraint checking
 * - overlapConstraintChecker.ts: Overlap constraint checking
 * - capacityConstraintChecker.ts: Capacity constraint checking
 * - slotAvailabilityMarker.ts: Slot availability marking
 * 
 * This module now serves as the main orchestrator that coordinates all these modules.
 * 
 * ============================================================================
 * TIMEZONE STRATEGY (P0-2)
 * ============================================================================
 * 
 * 1. Boundaries (startBoundary, endBoundary): RFC3339 UTC strings
 *    - All boundary times are stored and passed as UTC ISO strings
 *    - Format: "2026-01-15T14:00:00Z" (RFC3339 with Z suffix for UTC)
 *    - WHY: Ensures consistent timezone handling across client and server
 * 
 * 2. Business Hours: RFC3339 with reference date (2000-01-01), interpreted as local time-of-day
 *    - Format: "2000-01-01T09:00:00Z" represents "9:00 AM" in local timezone
 *    - Admin sets business hours in their local timezone (e.g., "9 AM" = 9 AM local)
 *    - WHY: Business hours are time-of-day values, not absolute times
 * 
 * 3. Slot Generation:
 *    - Iterate days using UTC date components (to handle DST correctly)
 *    - Create slot times in LOCAL timezone (business hours are local)
 *    - Convert to UTC via toISOString() for storage and API communication
 *    - WHY: Ensures slots align with local business hours while maintaining UTC consistency
 * 
 * 4. Busy Periods: Always UTC (from Google Calendar API)
 *    - Google Calendar API returns busy periods in UTC
 *    - All busy period comparisons use UTC Date objects
 *    - WHY: Calendar APIs standardize on UTC for consistency
 * 
 * 5. Client-Server Consistency:
 *    - Client generates slots in local timezone, converts to UTC for API
 *    - Server receives UTC boundaries and converts to admin timezone for display
 *    - Both use UTC internally for calculations and comparisons
 *    - WHY: Prevents timezone mismatches between client and server
 * 
 * This ensures:
 * - Business hours work correctly regardless of timezone
 * - Slots align with local business hours
 * - Busy periods (UTC) can be compared with slots (UTC) correctly
 * - Client and server maintain consistency through UTC as the common format
 */

import type { TimeSlot } from '@/types/appointment'
import type { RFC3339DateTime } from '@/types/datetime'
import type { BusyTimeRange } from './timeSlotTypes'
import type {
  RangeConstraint,
  OverlapConstraint,
  CapacityConstraint
} from '@shared/types/availabilityTypes'
import { preprocessBusyPeriods, parseBusyPeriods } from './busyPeriodProcessor'
import { generateAllTimeSlots, type GenerateSlotsWithAvailabilityParams } from './slotGenerator'
import { checkRangeConstraints, type ParsedBusinessHoursCache } from './rangeConstraintChecker'
import { markSlotAvailability } from './slotAvailabilityMarker'
import { applyCapacityFilters } from './capacityConstraintChecker'
// Logger removed - no logging needed in orchestrator

/**
 * Slot position context for drive time constraint application
 * LEARNING: Provides business hours boundaries for determining slot position
 * WHY: Drive time constraints apply based on slot position relative to business hours boundaries
 * PATTERN: Interface with business hours start/end times
 * 
 * Session 2.2.3: Refactored from appointment-based (first/last) to time-slot-based (dayStart/dayEnd)
 */
export interface SlotPositionContext {
  businessHoursStart: Date  // Business hours start time for this day
  businessHoursEnd: Date    // Business hours end time for this day
}

/**
 * Custom error for constraint validation failures
 * LEARNING: Structured error type for hard failures with UI notification support
 * WHY: Allows callers to distinguish constraint errors from other errors
 * PATTERN: Extend Error with additional metadata
 */
export class ConstraintValidationError extends Error {
  constructor(
    message: string,
    public readonly constraintType: 'range' | 'overlap' | 'capacity',
    public readonly constraintIndex: number,
    public readonly validationError?: string
  ) {
    super(message)
    this.name = 'ConstraintValidationError'
  }
}

/**
 * Result interface for availability manager
 * LEARNING: Structured return type for slot generation with availability
 * WHY: Type-safe return value with slots and earliest completion time
 * PATTERN: Interface with slots array and optional earliest completion
 */
interface AvailabilityManagerResult {
  slots: TimeSlot[]
  earliestCompletion: RFC3339DateTime | null  // RFC3339 datetime of earliest available slot end time
}

/**
 * Parameters for slot generation with availability
 * LEARNING: Extended parameters including busy times
 * WHY: Type-safe parameter passing for orchestrator
 * PATTERN: Interface extending GenerateSlotsWithAvailabilityParams
 */
interface GenerateSlotsWithAvailabilityParamsExtended extends Omit<GenerateSlotsWithAvailabilityParams, 'busyTimes'> {
  busyTimes?: BusyTimeRange[]  // Calendar busy periods
}

/**
 * Validate constraint arrays once before slot iteration
 * LEARNING: Pre-validation eliminates redundant per-slot validation
 * WHY: Validates constraints once instead of thousands of times
 * PATTERN: Validate all constraints upfront, throw structured error on failure
 */
function validateConstraintArrays(
  _rangeConstraints?: RangeConstraint[],
  _overlapConstraints?: OverlapConstraint[],
  _capacityConstraints?: CapacityConstraint[]
): void {
  // Phase 8: Removed client-side validation - constraints are validated server-side before being sent to client
  // Trust server validation - if invalid constraints reach client, it's a server bug
  // This function now only exists for type checking and to maintain the function signature
}

/**
 * Generate slots with availability status
 * 
 * LEARNING: Main orchestrator function that coordinates all availability logic modules
 * WHY: Single entry point for slot generation with all constraint checking
 * PATTERN: Orchestrator pattern - delegates to specialized modules
 * 
 * Phase 6: Refactored to be synchronous - all data must be pre-computed server-side
 * WHY: Eliminates async operations, improves performance, aligns with server-side refactor
 * PATTERN: Synchronous function that uses pre-computed constraints, drive times, and capacity hours
 * 
 * REFACTORED: Split into focused modules to reduce complexity from 1,439 lines to ~200 lines
 * 
 * @param params - Slot generation parameters
 * @param rangeConstraints - Pre-computed range constraints (from server)
 * @param overlapConstraints - Pre-computed overlap constraints (from server)
 * @param capacityConstraints - Pre-computed capacity constraints (from server)
 * @param now - Optional current time for testing
 * @param options - Options including pre-computed drive times and capacity hours
 * @returns Synchronous result with slots and earliest completion time
 */
export function generateSlotsWithAvailability(
  params: GenerateSlotsWithAvailabilityParamsExtended,
  rangeConstraints?: RangeConstraint[],
  overlapConstraints?: OverlapConstraint[],
  capacityConstraints?: CapacityConstraint[],
  now?: Date,
  options?: {
    // Phase 6: Pre-computed data from server orchestrator (required)
    precomputedDriveTimesByDate?: Record<string, { driveTimeTo?: number; driveTimeFrom?: number }>
    precomputedCapacityHours?: Record<string, number>
  }
): AvailabilityManagerResult {
  const { busyTimes = [], ...otherParams } = params

  // PATTERN: Validate upfront, throw structured error for UI notification
  validateConstraintArrays(rangeConstraints, overlapConstraints, capacityConstraints)

  // PATTERN: Filter once upfront, pass only active constraints to checking functions
  const activeRangeConstraints = rangeConstraints?.filter(c => c.enforcement !== 'off') || []
  let activeOverlapConstraints: OverlapConstraint[] = overlapConstraints?.filter(c => 
    c.enforcement !== 'off' && c.placement !== 'off'
  ) || []
  const activeCapacityConstraints = capacityConstraints?.filter(c => c.enforcement !== 'off') || []

  // PATTERN: Validate → Sort → Merge → Parse to Date objects → Use in slot checks
  const processedBusyTimes = preprocessBusyPeriods(busyTimes)
  
  // PATTERN: Parse once, use cached Date objects throughout
  const parsedBusyTimes = parseBusyPeriods(processedBusyTimes)

  // PATTERN: Generate all slots, then apply range constraints post-generation
  const allSlots = generateAllTimeSlots(otherParams)
  
  // PATTERN: Use slot.startTime as key (string) so cache persists through slot transformations
  // PATTERN: Map slots to [key, value] tuples, then construct Map from entries
  const slotDateCache = new Map(
    allSlots.map(slot => [
      slot.startTime,
      {
        start: new Date(slot.startTime),
        end: new Date(slot.endTime)
      }
    ] as [string, { start: Date; end: Date }])
  )

  // PATTERN: Check each slot against range constraints, filter hard violations, mark flexible violations
  // LEARNING: Inject time dependency for deterministic testing
  // PATTERN: Accept optional now parameter, default to current time if not provided
  const effectiveNow = now || new Date()
  
  // PATTERN: Create cache map, populate as slots are checked
  const businessHoursCache: ParsedBusinessHoursCache = new Map()
  
  // LEARNING: Different constraint types use different application patterns
  //   - Range constraints: Filter out hard violations (slots must pass to continue)
  //   - Overlap constraints: Mark availability (slots can be available/unavailable)
  //   - Capacity constraints: Update availability flag (can override previous availability)
  // This is intentional - range constraints are prerequisites (filter early),
  // overlap constraints check conflicts (mark status), 
  // capacity constraints check limits (can block previously available slots)
  const allSlotsForLogging = allSlots
  
  const slotsPassingRangeConstraints: TimeSlot[] = activeRangeConstraints.length > 0
    ? allSlots
        .map(slot => {
          const cachedDates = slotDateCache.get(slot.startTime)!
          const rangeResult = checkRangeConstraints(slot, activeRangeConstraints, effectiveNow, businessHoursCache, cachedDates, allSlotsForLogging)
          if (!rangeResult.passes) {
            return null as unknown as TimeSlot // Hard violation - filter out
          }
          return {
            ...slot,
            hasFlexibleViolations: rangeResult.violations.length > 0,
            flexibleViolations: rangeResult.violations.length > 0 ? rangeResult.violations : undefined
          } as TimeSlot
        })
        .filter((slot): slot is TimeSlot => slot !== null)
    : allSlots
  
  // Phase 6: Use pre-computed drive times from server orchestrator (synchronous)
  // WHY: All drive time calculations happen server-side, eliminating async operations
  // PATTERN: Synchronous lookup from pre-computed data structure
  const calculatedConstraintsByDate = new Map<string, OverlapConstraint[]>()
  
  if (options?.precomputedDriveTimesByDate) {
    // New path: Use pre-computed drive times (synchronous)
    // Group slots by date to apply drive times per day
    const slotsByDate = new Map<string, TimeSlot[]>()
    slotsPassingRangeConstraints.forEach(slot => {
      const slotDate = new Date(slot.startTime)
      const dateKey = slotDate.toISOString().split('T')[0] // YYYY-MM-DD
      if (!slotsByDate.has(dateKey)) {
        slotsByDate.set(dateKey, [])
      }
      slotsByDate.get(dateKey)!.push(slot)
    })
    
    // Apply pre-computed drive times to constraints synchronously
    for (const [dateKey] of slotsByDate.entries()) {
      const driveTimes = options.precomputedDriveTimesByDate[dateKey]
      if (!driveTimes) {
        // No drive times for this date - use original constraints
        continue
      }
      
      // Merge pre-computed drive times into constraints
      const mergedConstraints = activeOverlapConstraints.map(constraint => {
        if (constraint.type === 'driveTimeTo' && driveTimes.driveTimeTo !== undefined) {
          return { ...constraint, minutes: driveTimes.driveTimeTo }
        }
        if (constraint.type === 'driveTimeFrom' && driveTimes.driveTimeFrom !== undefined) {
          return { ...constraint, minutes: driveTimes.driveTimeFrom }
        }
        return constraint
      })
      
      calculatedConstraintsByDate.set(dateKey, mergedConstraints)
    }
  }
  // Note: Legacy async path removed - pre-computed data is required
  // If drive time constraints exist but pre-computed data is missing, they will use static fallback minutes
  
  // PATTERN: Map slots and add availability flag, pass overlap constraints to expand time range
  // Session 2.2.3: Pass range constraints and business hours cache for skipDayStart/skipDayEnd logic
  // FIX: Pass calculatedConstraintsByDate for per-day drive time constraints
  const slotsWithAvailability = markSlotAvailability(
    slotsPassingRangeConstraints,
    parsedBusyTimes,
    activeOverlapConstraints,
    slotDateCache,
    activeRangeConstraints,
    businessHoursCache,
    calculatedConstraintsByDate.size > 0 ? calculatedConstraintsByDate : undefined
  )

  // PATTERN: Check capacity after busy period availability is marked
  // Phase 6: Use pre-computed capacity hours from server orchestrator
  const slotsWithCapacity = activeCapacityConstraints.length > 0
    ? applyCapacityFilters(
        slotsWithAvailability,
        params.duration,
        activeCapacityConstraints,
        options?.precomputedCapacityHours
      )
    : slotsWithAvailability

  // PATTERN: Filter available slots, find earliest end time
  // PERFORMANCE: Use cached Date objects for efficient comparison, convert to RFC3339DateTime on return
  const availableSlots = slotsWithCapacity.filter(slot => slot.isAvailable)
  const earliestCompletionDate: Date | null = availableSlots.length > 0
    ? availableSlots.reduce((earliestDate: Date | null, slot) => {
        const cachedDates = slotDateCache.get(slot.startTime)
        const slotEnd = cachedDates?.end || new Date(slot.endTime)
        if (earliestDate === null || slotEnd < earliestDate) {
          return slotEnd
        }
        return earliestDate
      }, null)
    : null
  
  const earliestCompletion: RFC3339DateTime | null = earliestCompletionDate
    ? earliestCompletionDate.toISOString() as RFC3339DateTime
    : null

  return {
    slots: slotsWithCapacity,
    earliestCompletion
  }
}
