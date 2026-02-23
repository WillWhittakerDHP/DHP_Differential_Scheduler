/**
 * Slot Computation Service
 *
 */

import type {
  ComputedSlot,
  CalendarEvent,
  Constraint,
  RangeConstraint,
  OverlapConstraint,
  CapacityConstraint,
  RFC3339DateTime,
} from '../../../shared/types/availabilityTypes.js'
import type { BusinessHoursConfig } from '../../../shared/types/availabilityTypes.js'
import { RANGE_CONSTRAINT_TYPES } from '../../../shared/constants/constraintConstants.js'
import { filterActiveConstraints, groupConstraintsByCategory } from '../../../shared/utils/constraintUtils.js'
import {
  extractDateFromRFC3339,
  buildCapacityKey,
  capacityKeyToString,
} from '../../../shared/utils/capacityKeyUtils.js'
import { buildDayBoundariesUTC } from '../../../shared/utils/businessHoursUtils.js'
import {
  generateSlotTimes,
  getUniqueDatesInRange,
} from '../utils/availabilities/availabilityPrimitives.js'
import { createLogger } from '../utils/logger.js'

const logger = createLogger('SlotComputationService')

/** Opaque calendar event with parsed Date and optional drive minutes (for overlap check) */
interface EventWithDrive {
  start: Date
  end: Date
  source: 'event' | 'outOfOffice'
  /** Per-event enforcement level (defaults to 'hard' if omitted) */
  enforcement?: 'flexible' | 'hard'
  placeId?: string
  driveToMinutes?: number
  driveFromMinutes?: number
}

/**
 * Check if two time ranges overlap
 */
function timeRangesOverlap(
  a: { start: Date; end: Date },
  b: { start: Date; end: Date }
): boolean {
  return a.start < b.end && a.end > b.start
}

/**
 * Generate raw slot time pairs for one day using shared primitive (pure, no mutation).
 */
function generateSlotsForDay(
  dayStartUtc: Date,
  dayEndUtc: Date,
  durationMinutes: number,
  minuteIncrement: number,
  requestEndBoundary: Date
): Array<{ startTime: Date; endTime: Date }> {
  return generateSlotTimes(
    dayStartUtc,
    dayEndUtc,
    durationMinutes,
    minuteIncrement,
    requestEndBoundary
  )
}

/**
 * Check one range constraint for a slot; returns violation key if it fails, null otherwise.
 */
function checkOneRangeConstraint(
  slotStart: Date,
  slotEnd: Date,
  constraint: RangeConstraint,
  now: Date
): { passes: boolean; violation: string | null } {
  if (constraint.enforcement === 'off') {
    return { passes: true, violation: null }
  }
  let passes = true
  switch (constraint.type) {
    case RANGE_CONSTRAINT_TYPES.LEAD_TIME: {
      const config = constraint.config as { minutes: number }
      const minStart = new Date(now.getTime() + config.minutes * 60 * 1000)
      if (slotStart < minStart) passes = false
      break
    }
    case RANGE_CONSTRAINT_TYPES.DATE_RANGE: {
      const config = constraint.config as { start: string; end: string }
      const rangeStart = new Date(config.start)
      const rangeEnd = new Date(config.end)
      if (slotStart < rangeStart || slotEnd > rangeEnd) passes = false
      break
    }
    case RANGE_CONSTRAINT_TYPES.BUSINESS_HOURS:
      break
  }
  if (!passes && constraint.enforcement === 'hard') {
    return { passes: false, violation: null }
  }
  if (!passes && constraint.enforcement === 'flexible') {
    return { passes: true, violation: `range.${constraint.type}` }
  }
  return { passes: true, violation: null }
}

/**
 * Check range constraints for one slot (business hours already satisfied by generation)
 */
function checkRangeConstraints(
  slotStart: Date,
  slotEnd: Date,
  rangeConstraints: RangeConstraint[],
  now: Date
): { passes: boolean; violations: string[] } {
  for (const constraint of rangeConstraints) {
    const result = checkOneRangeConstraint(slotStart, slotEnd, constraint, now)
    if (!result.passes) {
      return { passes: false, violations: [] }
    }
  }
  const violations = rangeConstraints.flatMap((constraint) => {
    const result = checkOneRangeConstraint(slotStart, slotEnd, constraint, now)
    return result.violation ? [result.violation] : []
  })
  return { passes: true, violations }
}

/**
 * Collect overlap violation strings and whether any is hard for one event.
 */
function getOverlapViolationsForEvent(
  slotRange: { start: Date; end: Date },
  event: EventWithDrive
): Array<{ violation: string; hard: boolean }> {
  const out: Array<{ violation: string; hard: boolean }> = []
  if (timeRangesOverlap(slotRange, { start: event.start, end: event.end })) {
    const source = event.source === 'outOfOffice' ? 'outOfOffice' : 'event'
    const eventEnforcement = event.enforcement ?? 'hard'
    out.push({
      violation: `overlap.${source}.direct`,
      hard: eventEnforcement === 'hard',
    })
  }
  if (event.source !== 'event') {
    return out
  }
  if (event.driveToMinutes != null && event.driveToMinutes > 0) {
    const bufferStart = new Date(
      event.start.getTime() - event.driveToMinutes * 60 * 1000
    )
    const bufferEnd = event.start
    if (timeRangesOverlap(slotRange, { start: bufferStart, end: bufferEnd })) {
      out.push({
        violation: `overlap.driveToCandidate.buffer:${event.driveToMinutes}`,
        hard: true,
      })
    }
  }
  if (event.driveFromMinutes != null && event.driveFromMinutes > 0) {
    const bufferStart = event.end
    const bufferEnd = new Date(
      event.end.getTime() + event.driveFromMinutes * 60 * 1000
    )
    if (timeRangesOverlap(slotRange, { start: bufferStart, end: bufferEnd })) {
      out.push({
        violation: `overlap.driveFromCandidate.buffer:${event.driveFromMinutes}`,
        hard: true,
      })
    }
  }
  return out
}

/**
 * Check overlap constraints using event-level context (no flattening)
 * Drive-from buffer is anchored at event.end; drive-to at event.start
 */
function checkOverlapConstraints(
  slotStart: Date,
  slotEnd: Date,
  eventsWithDrive: EventWithDrive[],
  overlapConstraints: OverlapConstraint[]
): { passes: boolean; violations: string[] } {
  const slotRange = { start: slotStart, end: slotEnd }
  const items = eventsWithDrive.flatMap((event) =>
    getOverlapViolationsForEvent(slotRange, event)
  )
  const violations = items.map((item) => item.violation)
  const hasHardOverlap = items.some((item) => item.hard)
  const hardOverlapConstraint = overlapConstraints.find(
    (c) => c.enforcement === 'hard'
  )
  if (hasHardOverlap && hardOverlapConstraint) {
    return { passes: false, violations }
  }
  return { passes: !hasHardOverlap, violations }
}

/**
 * Check one capacity constraint; returns pass/fail and optional violation.
 */
function checkOneCapacityConstraint(
  slotDate: string,
  durationHours: number,
  constraint: CapacityConstraint
): { passes: boolean; violation: string | null } {
  if (constraint.enforcement === 'off') {
    return { passes: true, violation: null }
  }
  const keyParts = buildCapacityKey(constraint, slotDate)
  const keyString = capacityKeyToString(keyParts)
  const currentHours = constraint.scheduledHours?.[keyString] ?? 0
  if (
    constraint.enforcement === 'hard' &&
    currentHours + durationHours > constraint.maxHours
  ) {
    return { passes: false, violation: null }
  }
  if (constraint.enforcement === 'flexible') {
    if (currentHours >= constraint.maxHours) {
      return { passes: false, violation: null }
    }
    if (currentHours + durationHours > constraint.maxHours) {
      return { passes: true, violation: `capacity.${constraint.type}` }
    }
  }
  if (constraint.maxIncome != null) {
    const currentIncome = constraint.scheduledIncome?.[keyString] ?? 0
    if (currentIncome >= constraint.maxIncome) {
      if (constraint.enforcement === 'hard') {
        return { passes: false, violation: null }
      }
      return { passes: true, violation: `capacity.income.${constraint.type}` }
    }
  }
  return { passes: true, violation: null }
}

/**
 * Check capacity constraints using pre-computed scheduledHours
 */
function checkCapacityConstraints(
  slotStart: Date,
  durationMinutes: number,
  capacityConstraints: CapacityConstraint[]
): { passes: boolean; violations: string[] } {
  if (capacityConstraints.length === 0) {
    return { passes: true, violations: [] }
  }
  const slotDate = extractDateFromRFC3339(slotStart.toISOString())
  const durationHours = durationMinutes / 60
  for (const constraint of capacityConstraints) {
    const result = checkOneCapacityConstraint(
      slotDate,
      durationHours,
      constraint
    )
    if (!result.passes) {
      return { passes: false, violations: [] }
    }
  }
  const violations = capacityConstraints.flatMap((constraint) => {
    const result = checkOneCapacityConstraint(
      slotDate,
      durationHours,
      constraint
    )
    return result.violation ? [result.violation] : []
  })
  return { passes: true, violations }
}

/**
 * Map one calendar event to EventWithDrive or null if filtered (opaque-only).
 */
function mapToEventWithDrive(
  event: CalendarEvent,
  source: 'event' | 'outOfOffice',
  driveTimesByPlaceId: Record<string, { driveToCandidate?: number; driveFromCandidate?: number }>,
  onlyOpaque: boolean,
  enforcement?: 'flexible' | 'hard'
): EventWithDrive | null {
  if (onlyOpaque && event.transparency === 'transparent') {
    return null
  }
  const driveTo = event.placeId
    ? driveTimesByPlaceId[event.placeId]?.driveToCandidate
    : undefined
  const driveFrom = event.placeId
    ? driveTimesByPlaceId[event.placeId]?.driveFromCandidate
    : undefined
  return {
    start: new Date(event.start),
    end: new Date(event.end),
    source,
    enforcement,
    placeId: event.placeId,
    driveToMinutes: source === 'event' ? driveTo : undefined,
    driveFromMinutes: source === 'event' ? driveFrom : undefined,
  }
}

/**
 * Build event list with drive minutes attached (event-level context)
 */
function attachDriveTimesToEvents(
  regularEvents: CalendarEvent[],
  outOfOfficeEvents: CalendarEvent[],
  driveTimesByPlaceId: Record<string, { driveToCandidate?: number; driveFromCandidate?: number }>,
  onlyOpaque: boolean,
  /** Enforcement level for out-of-office events (defaults to 'hard') */
  oooEnforcement: 'flexible' | 'hard' = 'hard'
): EventWithDrive[] {
  const regular = regularEvents
    .map((e) =>
      mapToEventWithDrive(e, 'event', driveTimesByPlaceId, onlyOpaque)
    )
    .filter((e): e is EventWithDrive => e != null)
  const ooo = outOfOfficeEvents
    .map((e) =>
      mapToEventWithDrive(
        e,
        'outOfOffice',
        driveTimesByPlaceId,
        onlyOpaque,
        oooEnforcement
      )
    )
    .filter((e): e is EventWithDrive => e != null)
  return [...regular, ...ooo]
}

/** Day config for slot computation: day key and UTC boundaries */
interface DayConfig {
  dayKey: string
  boundaries: { dayStartUtc: Date; dayEndUtc: Date }
}

/**
 * Build list of day configs (dayKey + boundaries) for the request range using business hours.
 */
function getDayConfigsInRange(
  requestStart: Date,
  requestEnd: Date,
  hoursMap: NonNullable<BusinessHoursConfig['hours']>
): DayConfig[] {
  const dateStrings = getUniqueDatesInRange(requestStart, requestEnd)
  return dateStrings
    .map((dateStr) => {
      const [y, m, d] = dateStr.split('-').map(Number)
      const year = y!
      const month = (m ?? 1) - 1
      const day = d ?? 1
      const dayOfWeek = new Date(
        Date.UTC(year, month, day, 12, 0, 0)
      ).getUTCDay() as 0 | 1 | 2 | 3 | 4 | 5 | 6
      const dayHours = hoursMap[dayOfWeek]
      if (!dayHours?.start || !dayHours?.end) return null
      const boundaries = buildDayBoundariesUTC(
        year,
        month,
        day,
        dayHours.start,
        dayHours.end
      )
      if (!boundaries) return null
      return {
        dayKey: dateStr,
        boundaries,
      }
    })
    .filter((c): c is DayConfig => c != null)
}

/**
 * Compute computed slots for one day (raw slots filtered by min start, then constraint-checked).
 */
function computeSlotsForOneDay(
  dayConfig: DayConfig,
  durationMinutes: number,
  minuteIncrement: number,
  requestEnd: Date,
  minSlotStart: Date,
  rangeConstraints: RangeConstraint[],
  overlapConstraints: OverlapConstraint[],
  capacityConstraints: CapacityConstraint[],
  eventsWithDrive: EventWithDrive[],
  now: Date
): ComputedSlot[] {
  const rawSlots = generateSlotsForDay(
    dayConfig.boundaries.dayStartUtc,
    dayConfig.boundaries.dayEndUtc,
    durationMinutes,
    minuteIncrement,
    requestEnd
  )
  const slotsFromMinStart = rawSlots.filter(
    ({ startTime }) => startTime >= minSlotStart
  )
  return slotsFromMinStart.map(({ startTime, endTime }) => {
    const rangeResult = checkRangeConstraints(
      startTime,
      endTime,
      rangeConstraints,
      now
    )
    if (!rangeResult.passes) {
      return {
        startTime: startTime.toISOString() as RFC3339DateTime,
        endTime: endTime.toISOString() as RFC3339DateTime,
        duration: durationMinutes,
        isAvailable: false,
        violations: [],
      }
    }
    const overlapResult = checkOverlapConstraints(
      startTime,
      endTime,
      eventsWithDrive,
      overlapConstraints
    )
    if (!overlapResult.passes) {
      return {
        startTime: startTime.toISOString() as RFC3339DateTime,
        endTime: endTime.toISOString() as RFC3339DateTime,
        duration: durationMinutes,
        isAvailable: false,
        violations: overlapResult.violations,
      }
    }
    const capacityResult = checkCapacityConstraints(
      startTime,
      durationMinutes,
      capacityConstraints
    )
    if (!capacityResult.passes) {
      return {
        startTime: startTime.toISOString() as RFC3339DateTime,
        endTime: endTime.toISOString() as RFC3339DateTime,
        duration: durationMinutes,
        isAvailable: false,
        violations: capacityResult.violations,
      }
    }
    const allViolations = [
      ...rangeResult.violations,
      ...overlapResult.violations,
      ...capacityResult.violations,
    ]
    return {
      startTime: startTime.toISOString() as RFC3339DateTime,
      endTime: endTime.toISOString() as RFC3339DateTime,
      duration: durationMinutes,
      isAvailable: allViolations.length === 0,
      violations: allViolations,
    }
  })
}

/**
 * Compute slots for a date range with all constraints applied
 */
export function computeSlotsForDateRange(
  dateRange: { start: string; end: string },
  durationMinutes: number,
  minuteIncrement: number,
  constraints: Constraint[],
  regularEvents: CalendarEvent[],
  outOfOfficeEvents: CalendarEvent[],
  driveTimesByPlaceId: Record<string, { driveToCandidate?: number; driveFromCandidate?: number }>,
  businessHoursConfig: BusinessHoursConfig,
  _timezone: string, // Pass-through for client/UI; server uses UTC/RFC3339 only
  now: Date = new Date(),
  /** Enforcement level for out-of-office events (defaults to 'hard') */
  oooEnforcement: 'flexible' | 'hard' = 'hard'
): Record<string, ComputedSlot[]> {
  const active = filterActiveConstraints(constraints)
  const { range: rangeConstraints, overlap: overlapConstraints, capacity: capacityConstraints } =
    groupConstraintsByCategory(active)

  const hoursMap = businessHoursConfig?.hours
  if (!hoursMap) {
    logger.warn('No business hours config; returning empty slots per day')
    return {}
  }

  const requestStart = new Date(dateRange.start)
  const requestEnd = new Date(dateRange.end)
  const eventsWithDrive = attachDriveTimesToEvents(
    regularEvents,
    outOfOfficeEvents,
    driveTimesByPlaceId,
    true,
    oooEnforcement
  )

  const leadTimeConstraint = rangeConstraints.find(
    (c) => c.type === RANGE_CONSTRAINT_TYPES.LEAD_TIME
  )
  const leadMinutes =
    leadTimeConstraint?.config &&
    typeof (leadTimeConstraint.config as { minutes?: number }).minutes === 'number'
      ? (leadTimeConstraint.config as { minutes: number }).minutes
      : 0
  const minSlotStart = new Date(now.getTime() + leadMinutes * 60 * 1000)

  const dayConfigs = getDayConfigsInRange(requestStart, requestEnd, hoursMap)
  const slotsByDay = Object.fromEntries(
    dayConfigs.map((dayConfig) => [
      dayConfig.dayKey,
      computeSlotsForOneDay(
        dayConfig,
        durationMinutes,
        minuteIncrement,
        requestEnd,
        minSlotStart,
        rangeConstraints,
        overlapConstraints,
        capacityConstraints,
        eventsWithDrive,
        now
      ),
    ])
  )
  return slotsByDay
}
