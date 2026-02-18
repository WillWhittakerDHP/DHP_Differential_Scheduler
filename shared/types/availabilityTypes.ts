/**
 * Shared Availability Types
 * 
 * LEARNING: Types shared between client and server for availability calculations
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
 * LEARNING: Branded string type for RFC3339 datetime strings (ISO 8601 with timezone)
 * WHY: Type safety for datetime strings, prevents mixing with other string types
 * PATTERN: Branded string type
 */
export type RFC3339DateTime = string & { readonly __brand: 'RFC3339DateTime' }

/**
 * Constraint enforcement level
 * LEARNING: Controls how strictly constraints are enforced
 * WHY: Provides flexibility in how constraints are applied (off = not applied, flexible = warn/soft block, hard = hard block)
 * PATTERN: Enum-like string literal union type
 */
export type ConstraintEnforcement = 'off' | 'flexible' | 'hard'

/**
 * Rolling week calculation direction
 * LEARNING: Determines how rolling 7-day window is calculated relative to appointment date
 * WHY: Different businesses may prefer different rolling week calculations
 * PATTERN: Enum-like string literal union type
 */
export type RollingWeekDirection = 'past' | 'centered' | 'future'

/**
 * Constraint category type
 * LEARNING: Declarative category field for type-safe constraint discrimination
 * WHY: Enables type-safe narrowing without property checking, cleaner than 'config' in constraint
 * PATTERN: String literal union type for discriminated union
 */
export type ConstraintCategory = 'range' | 'overlap' | 'capacity'

/**
 * Range constraint type
 * LEARNING: Identifies the type of time-based restriction
 * WHY: Allows different range constraint types (businessHours, leadTime, dateRange) to coexist
 * PATTERN: Enum-like string literal union type
 */
export type RangeConstraintType = 'businessHours' | 'leadTime' | 'dateRange'

/**
 * Drive time application rules
 * LEARNING: Controls when drive time buffers are applied based on slot position
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
 * Business hours for a single day
 * LEARNING: Stored as RFC3339 internally, converted to/from HH:mm for UI
 * WHY: Consistent format throughout codebase, matches Google Calendar API
 * PATTERN: Use fixed reference date (2000-01-01) to store time-of-day as RFC3339
 */
export interface DayHours {
  start: RFC3339DateTime // RFC3339 format with reference date (e.g., "2000-01-01T09:00:00Z" for "09:00")
  end: RFC3339DateTime   // RFC3339 format with reference date (e.g., "2000-01-01T19:00:00Z" for "19:00")
}

/**
 * Range constraint configuration for business hours
 * LEARNING: Configuration for business hours constraint
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
 * LEARNING: Configuration for lead time constraint
 * WHY: Encapsulates minimum lead time in minutes
 * PATTERN: Interface with minutes field
 */
export interface LeadTimeConfig {
  minutes: number
}

/**
 * Range constraint configuration for date range
 * LEARNING: Configuration for date range constraint
 * WHY: Encapsulates absolute start and end boundaries
 * PATTERN: Interface with start and end RFC3339 datetime strings
 */
export interface DateRangeConfig {
  start: string  // RFC3339 datetime
  end: string    // RFC3339 datetime
}

/**
 * Range constraint
 * LEARNING: Time-based restrictions that filter slots by when they can occur
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
 * LEARNING: Identifies the purpose of a buffer configuration
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
 * LEARNING: Configuration for a single buffer type (appointment, driveTime, or lunch)
 * PATTERN: Interface with required fields
 */
export interface BufferConfig {
  type: BufferType
  minutes: number
  placement: BufferPlacement
  enforcement: ConstraintEnforcement
}

/**
 * Drive time buffer configuration (storage/API shape)
 * LEARNING: Semantic buffer for travel time with application rules
 * PATTERN: Interface with minutes, enforcement, and applyTo
 */
export interface DriveTimeConfig {
  minutes: number
  enforcement: ConstraintEnforcement
  applyTo: DriveTimeApplyTo
}

/**
 * Overlap constraint (buffer) interface
 * LEARNING: Unified structure for all buffer types (appointment, driveToCandidate, driveFromCandidate, lunch)
 * WHY: Consolidates buffer checking into single pathway
 * PATTERN: Interface with type, placement, enforcement, minutes, and optional applyTo
 * 
 * Note: driveToCandidate always has placement='before', driveFromCandidate always has placement='after'
 * The applyTo field controls WHEN the constraint is applied (first/last/all appointments)
 */
export interface OverlapConstraint {
  category: 'overlap'
  type: 'appointment' | 'driveToCandidate' | 'driveFromCandidate' | 'lunch'
  placement: 'off' | 'before' | 'after' | 'both'
  enforcement: ConstraintEnforcement
  minutes: number
  applyTo?: DriveTimeApplyTo  // Only for drive time constraints (driveToCandidate, driveFromCandidate)
}

/**
 * Capacity constraint interface
 * LEARNING: Unified structure for all capacity filters (daily, calendar week, rolling week)
 * WHY: Consolidates capacity checking into single pathway
 * PATTERN: Interface with type, enforcement, maxHours, and optional direction
 */
export interface CapacityConstraint {
  category: 'capacity'
  type: 'daily' | 'calendarWeek' | 'rollingWeek'
  enforcement: ConstraintEnforcement
  maxHours: number
  direction?: RollingWeekDirection  // Only for rollingWeek
  scheduledHours?: Record<string, number>  // enriched by server: hours already scheduled, keyed by capacity key
}

/**
 * Unified constraint type
 * LEARNING: Discriminated union of all constraint types
 * WHY: Enables type-safe constraint handling with single array
 * PATTERN: Discriminated union with category field
 */
export type Constraint = RangeConstraint | OverlapConstraint | CapacityConstraint

/**
 * Standardized constraint check result
 * LEARNING: Unifies "passes" and "available" into one concept
 * WHY: Eliminates naming inconsistency between constraint checkers
 * PATTERN: All constraint checkers return this shape
 */
export interface ConstraintCheckResult {
  passes: boolean
  violations: string[]
}

/**
 * Busy period source type
 * LEARNING: Identifies the data origin of a busy period, NOT the constraint type
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
 * LEARNING: Configuration for a single capacity filter (daily, calendar week, or rolling week)
 * WHY: Encapsulates max hours and filter mode together
 * PATTERN: Interface with required fields
 */
export interface WorkCapacityFilter {
  maxHours: number
  enforcement: ConstraintEnforcement
}

/**
 * Rolling week capacity filter configuration
 * LEARNING: Extends WorkCapacityFilter with direction setting
 * WHY: Rolling week needs direction to determine date range calculation
 * PATTERN: Extends base interface with additional field
 */
export interface RollingWeekCapacityFilter extends WorkCapacityFilter {
  direction: RollingWeekDirection
}

/**
 * Coordinates: from mapsTypes (canonical for geo types; Phase 1.1/3 type-similarity)
 */
import type { Coordinates } from './mapsTypes'
export type { Coordinates }

/**
 * Default location for drive time calculations
 * LEARNING: Starting/ending point for first/last appointment drive times
 * WHY: Needed to calculate travel time from home/office to first appointment
 * PATTERN: Uses placeId as primary location identifier (address only at UI boundary)
 * 
 * This is used as:
 * - Starting point for travel to first appointment of the day
 * - Ending point for travel from last appointment of the day
 */
export interface DefaultLocation {
  placeId: string           // Google Place ID (primary location identifier)
  address?: string          // Address string for UI display only (optional, from autocomplete)
  label?: string            // Optional label like "Home Office", "Shop", etc.
  coordinates?: Coordinates // Optional - populated by Google Places API
}

/**
 * Duration rounding configuration
 * LEARNING: Controls how appointment durations are rounded
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
 * LEARNING: Represents a time period when the calendar is busy
 * WHY: Used to exclude time slots that conflict with existing appointments
 * PATTERN: Interface with start/end times and optional placeId for drive time calculations
 */
export interface BusyTimeRange {
  start: RFC3339DateTime  // RFC3339 datetime string (ISO 8601 with timezone)
  end: RFC3339DateTime    // RFC3339 datetime string (ISO 8601 with timezone)
  placeId?: string        // Optional Google Place ID for drive time calculations (primary location identifier)
  source?: BusyPeriodSource  // Optional data-origin tag (e.g., 'event' from Events API, 'outOfOffice' from Events API)
  driveToCandidate?: number    // Drive time in minutes FROM this event's location TO the candidate location
  driveFromCandidate?: number  // Drive time in minutes FROM the candidate location TO this event's location
}

/**
 * Calendar event with location
 * LEARNING: Represents a calendar event with optional location for drive time calculations
 * WHY: Used to calculate drive times between appointments
 * PATTERN: Interface with event details and optional placeId
 */
export interface CalendarEvent {
  id: string
  start: string
  end: string
  placeId?: string        // Google Place ID for drive time calculation (primary location identifier)
  summary: string | null   // Event title for context/debugging
  eventType?: string       // 'default' | 'outOfOffice' - distinguishes regular events from out-of-office events
  transparency?: string    // Google: 'opaque' = blocks time (busy), 'transparent' = free (does not block)
}

/**
 * Computed Availability Request
 * LEARNING: Request payload for the computed availability endpoint
 * WHY: Single request contains all parameters needed to compute availability
 * PATTERN: Interface with date range, optional candidatePlaceId, duration, and data source toggle
 */
export interface ComputedAvailabilityRequest {
  dateRange: {
    start: string    // RFC3339
    end: string      // RFC3339
  }
  candidatePlaceId?: string           // Candidate property placeId for drive time (from wizard, not yet saved)
  duration: number           // appointment duration in minutes (for capacity keys)
  dataSource?: 'real' | 'mock' | 'none'  // dev toggle (default: 'real')
}

/**
 * Computed Availability Data
 * LEARNING: Single response object containing all pre-computed availability data
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
 * A single time slot with pre-computed availability from the server
 * LEARNING: Server computes slot boundaries and constraint violations; client applies shape for display
 * WHY: Eliminates client-side constraint logic; drive-time anchoring uses event-level context on server
 */
export interface ComputedSlot {
  startTime: RFC3339DateTime
  endTime: RFC3339DateTime
  duration: number
  isAvailable: boolean
  violations: string[]  // e.g. ['overlap.event.direct', 'overlap.driveFromCandidate.buffer:20']
}

/**
 * Server response: slots grouped by day (server-side slot computation)
 * LEARNING: Replaces ComputedAvailabilityData when using server-computed slots
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
  }
}
