/**
 * Slot Availability Orchestrator
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
 * - slotOverlapMarker.ts: Slot overlap availability marking
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
  Constraint,
} from '@shared/types/availabilityTypes'
import { filterActiveConstraints, groupConstraintsByCategory } from '@shared/utils/constraintUtils'
import { preprocessBusyPeriods, parseBusyPeriods } from './busyPeriodProcessor'
import { generateAllTimeSlots, type SlotGenerationParams } from './slotGenerator'
import { checkRangeConstraints, type ParsedBusinessHoursCache } from './rangeConstraintChecker'
import { markSlotAvailability } from './slotOverlapMarker'
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
 * NOTE: Exported for use by callers (useAvailability, useAvailableStartTimes) - not thrown within this orchestrator
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
 * Result interface for orchestrator
 * LEARNING: Structured return type for slot generation with availability
 * WHY: Type-safe return value with slots and earliest completion time
 * PATTERN: Interface with slots array and optional earliest completion
 */
interface OrchestratedSlotResult {
  slots: TimeSlot[]
  earliestCompletion: RFC3339DateTime | null  // RFC3339 datetime of earliest available slot end time
}

/**
 * Parameters for orchestrator
 * LEARNING: Extended parameters including busy times
 * WHY: Type-safe parameter passing for orchestrator
 * PATTERN: Interface extending SlotGenerationParams
 */
interface OrchestratorParams extends Omit<SlotGenerationParams, 'busyTimes'> {
  busyTimes?: BusyTimeRange[]  // Calendar busy periods
}

/**
 * Orchestrate slot availability computation
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
 * @param constraints - Pre-computed constraints (unified array from server, enriched with scheduledHours)
 * @param now - Optional current time for testing
 * @returns Synchronous result with slots and earliest completion time
 */
export function orchestrateSlotAvailability(
  params: OrchestratorParams,
  constraints: Constraint[],
  now?: Date
): OrchestratedSlotResult {
  const { busyTimes = [], ...otherParams } = params

  // PATTERN: Filter once upfront using unified filtering function
  const activeConstraints = filterActiveConstraints(constraints)
  
  // PATTERN: Group by category for type-specific application
  const { range: activeRangeConstraints, overlap: activeOverlapConstraints, capacity: activeCapacityConstraints } = groupConstraintsByCategory(activeConstraints)

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
  const slotsPassingRangeConstraints: TimeSlot[] = activeRangeConstraints.length > 0
    ? allSlots
        .map(slot => {
          const cachedDates = slotDateCache.get(slot.startTime) ?? { start: new Date(slot.startTime), end: new Date(slot.endTime) }
          const rangeResult = checkRangeConstraints(slot, activeRangeConstraints, effectiveNow, businessHoursCache, cachedDates)
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
  
  // PATTERN: Map slots and add availability flag, pass overlap constraints to expand time range
  // Session 2.2.3: Pass range constraints and business hours cache for skipDayStart/skipDayEnd logic
  const slotsWithAvailability = markSlotAvailability(
    slotsPassingRangeConstraints,
    parsedBusyTimes,
    {
      overlapConstraints: activeOverlapConstraints,
      dateCache: slotDateCache,
      rangeConstraints: activeRangeConstraints,
      businessHoursCache
    }
  )

  // PATTERN: Check capacity after busy period availability is marked
  // Capacity constraints are enriched with scheduledHours by the server
  const slotsWithCapacity = activeCapacityConstraints.length > 0
    ? applyCapacityFilters(
        slotsWithAvailability,
        params.duration,
        activeCapacityConstraints
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
