/**
 * Shared Availability Types
 * 
 * WHY: Single source of truth for constraint interfaces, prevents type drift
 * PATTERN: Shared types directory for cross-cutting concerns
 * 
 * Phase 1: Server-Side Computed Availability Data Refactor
 * - Moved from client/src/configs/availabilitySettings.ts
 * - Moved from client/src/utils/booking/constraintExtractors.ts
 * - Added ComputedAvailabilityData and ComputedAvailabilityRequest interfaces
 */

/**
 * RFC3339 DateTime string type
 * WHY: Type safety for datetime strings, prevents mixing with other string types
 * PATTERN: Branded string type
 */
export type RFC3339DateTime = string & { readonly __brand: 'RFC3339DateTime' }

/**
 * Constraint enforcement level
 * WHY: Provides flexibility in how constraints are applied (off = not applied, flexible = warn/soft block, hard = hard block)
 * PATTERN: Enum-like string literal union type
 */
export type ConstraintEnforcement = 'off' | 'flexible' | 'hard'

/**
 * Rolling week calculation direction
 * WHY: Different businesses may prefer different rolling week calculations
 * PATTERN: Enum-like string literal union type
 */
export type RollingWeekDirection = 'past' | 'centered' | 'future'

/**
 * Constraint category type
 * WHY: Enables type-safe narrowing without property checking, cleaner than 'config' in constraint
 * PATTERN: String literal union type for discriminated union
 */
export type ConstraintCategory = 'range' | 'overlap' | 'capacity'

/**
 * Range constraint type
 * WHY: Allows different range constraint types (businessHours, leadTime, dateRange) to coexist
 * PATTERN: Enum-like string literal union type
 */
export type RangeConstraintType = 'businessHours' | 'leadTime' | 'dateRange'

/**
 * Drive time application rules
 * WHY: Slots at business hours boundaries may need different handling than middle slots
 * PATTERN: Enum-like string literal union type
 * 
 * - 'all': Apply to all slots (default - includes day start and day end)
 * - 'skipDayStart': Apply to all slots EXCEPT those at day start (allows early slots without drive time blocking)
 * - 'skipDayEnd': Apply to all slots EXCEPT those at day end (allows late slots without drive time blocking)
 * - 'none': Disabled - don't apply this buffer
 */
export type DriveTimeApplyTo = 'all' | 'skipDayStart' | 'skipDayEnd' | 'none'

/**
 * Base type for any start/end time range (RFC3339).
 * WHY: Single source of truth; branded aliases prevent mixing calendar vs business-hours vs date-range.
 */
export interface TimeRangeBounds {
  start: RFC3339DateTime
  end: RFC3339DateTime
}

/**
 * Business hours for a single day (branded so not assignable to DateRangeConfig etc.).
 */
export type DayHours = TimeRangeBounds & { readonly __brand: 'DayHours' }

/**
 * Range constraint configuration for business hours
 * WHY: Encapsulates business hours per day
 * PATTERN: Interface with business hours map
 * NOTE: All days are defined (may be empty/closed, but structure is consistent)
 */
export interface BusinessHoursConfig {
  hours: {
    0: DayHours // Sunday
    1: DayHours // Monday
    2: DayHours // Tuesday
    3: DayHours // Wednesday
    4: DayHours // Thursday
    5: DayHours // Friday
    6: DayHours // Saturday
  }
}

/**
 * Range constraint configuration for lead time
 * WHY: Encapsulates minimum lead time in minutes
 * PATTERN: Interface with minutes field
 */
export interface LeadTimeConfig {
  minutes: number
}

/**
 * Range constraint configuration for date range (branded so not assignable to DayHours etc.).
 */
export type DateRangeConfig = TimeRangeBounds & { readonly __brand: 'DateRangeConfig' }

/**
 * Range constraint
 * WHY: Consolidates business hours, leadTime, and date range boundaries into unified structure
 * PATTERN: Interface with type, enforcement, and config
 */
export interface RangeConstraint {
  category: 'range'
  type: RangeConstraintType
  enforcement: ConstraintEnforcement
  config: BusinessHoursConfig | LeadTimeConfig | DateRangeConfig
}

/**
 * Buffer type for distinguishing buffer purposes (storage/API shape)
 * PATTERN: Enum-like string literal union type
 */
export type BufferType = 'appointment' | 'driveTime' | 'lunch'

/**
 * Buffer placement for controlling where buffer is applied
 * PATTERN: Enum-like string literal union type
 */
export type BufferPlacement = 'off' | 'before' | 'after' | 'both'

/**
 * Buffer configuration (storage/API shape for overlap buffers)
 * PATTERN: Interface with required fields
 */
export interface BufferConfig {
  type: BufferType
  minutes: number
  placement: BufferPlacement
  enforcement: ConstraintEnforcement
}

/**
 * Base shared by DriveTimeConfig and OverlapConstraint (P2 type-similarity).
 */
export interface OverlapMinutesBase {
  minutes: number
  enforcement: ConstraintEnforcement
  applyTo?: DriveTimeApplyTo
}

/**
 * Drive time buffer configuration (storage/API shape)
 * PATTERN: Interface with minutes, enforcement, and applyTo
 */
export interface DriveTimeConfig extends OverlapMinutesBase {
  applyTo: DriveTimeApplyTo
}

/**
 * Overlap constraint (buffer) interface
 * WHY: Consolidates buffer checking into single pathway
 * PATTERN: Interface with type, placement, enforcement, minutes, and optional applyTo
 *
 * Note: driveToCandidate always has placement='before', driveFromCandidate always has placement='after'
 * The applyTo field controls WHEN the constraint is applied (first/last/all appointments)
 */
export interface OverlapConstraint extends OverlapMinutesBase {
  category: 'overlap'
  type: 'appointment' | 'driveToCandidate' | 'driveFromCandidate' | 'lunch'
  placement: 'off' | 'before' | 'after' | 'both'
}

/**
 * CAPACITY FILTER HIERARCHY (TYPE_SIMILARITY 1.16)
 * - WorkCapacityFilter: base for hours-based filters (maxHours, enforcement).
 * - IncomeCapacityFilter: base for income-based filters (maxIncome, enforcement).
 * - RollingWeekCapacityFilter extends WorkCapacityFilter + RollingWeekFilterBase (adds direction).
 * - RollingWeekIncomeCapacityFilter extends IncomeCapacityFilter + RollingWeekFilterBase (adds direction).
 * - CapacityConstraint: unified runtime shape for all capacity constraints (category: 'capacity'; type daily|calendarWeek|rollingWeek).
 */

/**
 * Capacity constraint interface
 * WHY: Consolidates capacity checking into single pathway; income is capacity with different unit
 * PATTERN: Interface with type, enforcement, maxHours, optional maxIncome/scheduledIncome, and optional direction
 */
export interface CapacityConstraint {
  category: 'capacity'
  type: 'daily' | 'calendarWeek' | 'rollingWeek'
  enforcement: ConstraintEnforcement
  maxHours: number
  maxIncome?: number                            // Optional income cap (same time basis as maxHours)
  direction?: RollingWeekDirection             // Only for rollingWeek
  scheduledHours?: Record<string, number>      // enriched by server: hours already scheduled, keyed by capacity key
  scheduledIncome?: Record<string, number>     // enriched by server: income already scheduled, keyed by capacity key
}

/**
 * Income capacity filter configuration
 * WHY: Enables income-based caps alongside or instead of hours
 * PATTERN: Interface with maxIncome and enforcement
 */
export interface IncomeCapacityFilter {
  maxIncome: number
  enforcement: ConstraintEnforcement
}

/** Shared shape for rolling-week filters; single source for direction. */
export interface RollingWeekFilterBase {
  direction: RollingWeekDirection
}

/**
 * Rolling week income capacity filter configuration
 */
export interface RollingWeekIncomeCapacityFilter extends IncomeCapacityFilter, RollingWeekFilterBase {}

/**
 * Unified constraint type
 * WHY: Enables type-safe constraint handling with single array
 * PATTERN: Discriminated union with category field
 */
export type Constraint = RangeConstraint | OverlapConstraint | CapacityConstraint

/**
 * Standardized constraint check result
 * WHY: Eliminates naming inconsistency between constraint checkers
 * PATTERN: All constraint checkers return this shape
 */
export interface ConstraintCheckResult {
  passes: boolean
  violations: string[]
}

/**
 * Busy period source type
 * WHY: Constraint types (appointment buffer, drive time, etc.) describe RULES about spacing;
 *      busy period sources describe WHERE the blocking data came from (which API response)
 * PATTERN: Separate vocabulary from constraint types - sources are about data origin
 *
 * Google Calendar API: opaque = blocks time (busy), transparent = free (does not block).
 * Busy periods represent opaque event time (and out-of-office); transparent events are filtered out.
 *
 * - 'event': From Google Calendar Events API (regular calendar events with transparency='opaque')
 * - 'outOfOffice': From Google Calendar Events API (eventType: 'outOfOffice')
 *
 * Future possibilities when server generates busy blocks for other constraint types:
 * - 'lunch': Server-generated lunch break blocks
 * - 'driveTime': Server-generated drive time blocks
 */
export type BusyPeriodSource = 'event' | 'outOfOffice'

/**
 * Work capacity filter configuration
 * WHY: Encapsulates max hours and filter mode together
 * PATTERN: Interface with required fields
 */
export interface WorkCapacityFilter {
  maxHours: number
  enforcement: ConstraintEnforcement
}

/**
 * Rolling week capacity filter configuration
 */
export interface RollingWeekCapacityFilter extends WorkCapacityFilter, RollingWeekFilterBase {}

/**
 * Coordinates: from mapsTypes (canonical for geo types; Phase 1.1/3 type-similarity)
 */
import type { Coordinates, LocationBase } from './mapsTypes'
export type { Coordinates, LocationBase }

/**
 * Default location for drive time calculations
 * PATTERN: Extends LocationBase (shared with RouteLocation) with required placeId and optional label
 */
export interface DefaultLocation extends LocationBase {
  placeId: string
  label?: string
}

/**
 * Duration rounding configuration
 * WHY: Allows admin to enable/disable rounding and configure rounding method and increment
 * PATTERN: Optional nested object with enabled flag, increment, and method
 */
export interface DurationRoundingConfig {
  enabled: boolean
  increment?: number  // Minutes (defaults to minuteIncrement if not specified)
  method?: 'roundUp' | 'roundDown' | 'roundNearest'
}

/**
 * Busy time range
 * WHY: Used to exclude time slots that conflict with existing appointments
 * PATTERN: Extends TimeRangeBounds; optional placeId for drive time calculations
 */
export interface BusyTimeRange extends TimeRangeBounds {
  placeId?: string        // Optional Google Place ID for drive time calculations (primary location identifier)
  source?: BusyPeriodSource  // Optional data-origin tag (e.g., 'event' from Events API, 'outOfOffice' from Events API)
  driveToCandidate?: number    // Drive time in minutes FROM this event's location TO the candidate location
  driveFromCandidate?: number  // Drive time in minutes FROM the candidate location TO this event's location
}

/**
 * Calendar event with location
 * WHY: Used to calculate drive times between appointments
 * PATTERN: Extends TimeRangeBounds (start/end); event details and optional placeId
 */
export interface CalendarEvent extends TimeRangeBounds {
  id: string
  placeId?: string        // Google Place ID for drive time calculation (primary location identifier)
  summary: string | null   // Event title for context/debugging
  eventType?: string       // 'default' | 'outOfOffice' - distinguishes regular events from out-of-office events
  transparency?: string    // Google: 'opaque' = blocks time (busy), 'transparent' = free (does not block)
}

/**
 * Computed Availability Request
 *
 * Single request containing all parameters needed to compute availability.
 * The dataSource field controls which external APIs the server calls — it does NOT
 * affect settings/constraints extraction (those always come from the database).
 */
export interface ComputedAvailabilityRequest {
  dateRange: TimeRangeBounds
  candidatePlaceId?: string           // Candidate property placeId for drive time (from wizard, not yet saved)
  /** Entity identity of appointment being edited; server excludes its calendar event from overlap checks. Prefer this over reschedulingAppointmentId. */
  appointmentId?: string
  /** @deprecated Use appointmentId. Kept for compatibility during migration. */
  reschedulingAppointmentId?: string
  /**
   * Violation keys the server may relax for this request (e.g. from constraint_override.overridden_violations).
   * When present with appointmentId/reschedulingAppointmentId, server verifies keys against stored override
   * and applies relaxConstraintsForExceptions before slot computation (Task 6.8.2.2).
   */
  allowedExceptions?: string[]
  duration: number                    // appointment duration in minutes (for capacity keys)
  /**
   * Controls which external APIs the server calls:
   * - 'real' (default): Full pipeline — Calendar Events API, Routes API, capacity computation
   * - 'mock': Settings + constraints only — skips Google Calendar and Routes API calls;
   *           slots are computed purely from business hours and constraints (useful for dev without credentials)
   * - 'none': Minimal response — returns settings metadata only with empty slots/events (pure UI dev)
   */
  dataSource?: 'real' | 'mock' | 'none'
}

/**
 * Computed Availability Data
 * WHY: Eliminates multiple client-side API calls and constraint extraction
 * PATTERN: Comprehensive interface with constraints, busy periods, events, drive times, and capacity data
 */
export interface ComputedAvailabilityData {
  // --- From admin settings (extracted server-side) ---
  constraints: Constraint[]  // Unified array (replaces three separate arrays)
  minuteIncrement: number
  timezone?: string
  durationRounding?: DurationRoundingConfig

  // --- From Google Calendar API ---
  busyPeriods: BusyTimeRange[]           // merged free-busy + out-of-office (enriched with drive times)
  calendarEvents: CalendarEvent[]         // regular events (with placeId where available)
  outOfOfficeEvents: CalendarEvent[]      // out-of-office events (separate for UI/debugging)

  // --- Metadata ---
  _meta: {
    dateRange: { start: string, end: string }
    candidatePlaceId?: string  // Candidate property placeId from request (for drive time calculations)
    defaultLocation?: DefaultLocation
    generatedAt: string
    cacheStatus: {
      events: 'hit' | 'miss'
    }
  }
}

/**
 * Minimal slot time shape (start, end, duration).
 * WHY: TimeRange, MoveableSlot, SelectedTimeSlot, LoadedTimeSlot, ServerTimeSlot, ComputedSlot extend or align (TYPE_SIMILARITY_PROPOSAL § 1.7).
 */
export interface SlotTimeBounds {
  startTime: RFC3339DateTime
  endTime: RFC3339DateTime
  duration: number
}

/**
 * Shared availability result shape (isAvailable + optional violations).
 * WHY: ComputedSlot and SlotDisplayItem share this; single source of truth for availability display.
 */
export interface SlotAvailabilityResult {
  isAvailable: boolean
  violations?: string[]
}

/**
 * A single time slot with pre-computed availability from the server
 * WHY: Eliminates client-side constraint logic; drive-time anchoring uses event-level context on server
 */
export interface ComputedSlot extends SlotTimeBounds, SlotAvailabilityResult {
  violations: string[]  // required for server slot e.g. ['overlap.event.direct', 'overlap.driveFromCandidate.buffer:20']
}

/**
 * Server response: slots grouped by day (server-side slot computation)
 * WHY: Client receives pre-computed slots; no busy-period flattening or client constraint checking
 */
export interface ComputedSlotAvailabilityData {
  slotsByDay: Record<string, ComputedSlot[]>  // key: 'YYYY-MM-DD'

  // Still needed by client for display/config
  constraints: Constraint[]
  minuteIncrement: number
  timezone?: string
  durationRounding?: DurationRoundingConfig

  // Still needed for dev panel / debugging
  calendarEvents: CalendarEvent[]
  outOfOfficeEvents: CalendarEvent[]

  _meta: {
    dateRange: { start: string; end: string }
    candidatePlaceId?: string
    defaultLocation?: DefaultLocation
    generatedAt: string
    cacheStatus: { events: 'hit' | 'miss' }
    /** True when allowedExceptions were verified against ConstraintOverride and applied to slot computation */
    allowedExceptionsApplied?: boolean
  }
}
