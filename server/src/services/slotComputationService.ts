/**
 * Slot Computation Service
 *
 * LEARNING: Generates time slots and checks all constraints server-side using event-level context
 * WHY: Eliminates client-side flattening and drive-time anchoring bugs; single source of truth
 * PATTERN: Pure slot generation + constraint checking over CalendarEvent[] (not flattened BusyTimeRange[])
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
 * Generate raw slot start times for one day at minuteIncrement, then create slots with duration
 */
function generateSlotsForDay(
  dayStartUtc: Date,
  dayEndUtc: Date,
  durationMinutes: number,
  minuteIncrement: number,
  requestEndBoundary: Date
): Array<{ startTime: Date; endTime: Date }> {
  const slots: Array<{ startTime: Date; endTime: Date }> = []
  let slotStart = new Date(dayStartUtc)

  while (slotStart < dayEndUtc) {
    const slotEnd = new Date(slotStart.getTime() + durationMinutes * 60 * 1000)
    if (slotEnd > requestEndBoundary) break
    if (slotEnd <= dayEndUtc) {
      slots.push({ startTime: new Date(slotStart), endTime: slotEnd })
    }
    slotStart = new Date(slotStart.getTime() + minuteIncrement * 60 * 1000)
  }

  return slots
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
  const violations: string[] = []

  for (const constraint of rangeConstraints) {
    if (constraint.enforcement === 'off') continue

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
        // Already satisfied by slot generation boundaries
        break
    }

    if (!passes && constraint.enforcement === 'hard') {
      return { passes: false, violations: [] }
    }
    if (!passes && constraint.enforcement === 'flexible') {
      violations.push(`range.${constraint.type}`)
    }
  }

  return { passes: true, violations }
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
  const violations: string[] = []
  let hasHardOverlap = false

  for (const event of eventsWithDrive) {
    if (timeRangesOverlap(slotRange, { start: event.start, end: event.end })) {
      const source = event.source === 'outOfOffice' ? 'outOfOffice' : 'event'
      violations.push(`overlap.${source}.direct`)
      // LEARNING: Flexible-enforcement events produce violations but don't hard-block the slot
      // WHY: Allows admin to see OOO conflicts as warnings without preventing booking
      const eventEnforcement = event.enforcement ?? 'hard'
      if (eventEnforcement === 'hard') {
        hasHardOverlap = true
      }
    }

    if (event.source !== 'event') continue

    if (event.driveToMinutes != null && event.driveToMinutes > 0) {
      const bufferStart = new Date(event.start.getTime() - event.driveToMinutes * 60 * 1000)
      const bufferEnd = event.start
      if (timeRangesOverlap(slotRange, { start: bufferStart, end: bufferEnd })) {
        violations.push(`overlap.driveToCandidate.buffer:${event.driveToMinutes}`)
        hasHardOverlap = true
      }
    }

    if (event.driveFromMinutes != null && event.driveFromMinutes > 0) {
      const bufferStart = event.end
      const bufferEnd = new Date(event.end.getTime() + event.driveFromMinutes * 60 * 1000)
      if (timeRangesOverlap(slotRange, { start: bufferStart, end: bufferEnd })) {
        violations.push(`overlap.driveFromCandidate.buffer:${event.driveFromMinutes}`)
        hasHardOverlap = true
      }
    }
  }

  const hardOverlapConstraint = overlapConstraints.find(c => c.enforcement === 'hard')
  if (hasHardOverlap && hardOverlapConstraint) {
    return { passes: false, violations }
  }

  return { passes: !hasHardOverlap, violations }
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
  const violations: string[] = []

  for (const constraint of capacityConstraints) {
    if (constraint.enforcement === 'off') continue

    const keyParts = buildCapacityKey(constraint, slotDate)
    const keyString = capacityKeyToString(keyParts)
    const currentHours = constraint.scheduledHours?.[keyString] ?? 0

    if (constraint.enforcement === 'hard' && currentHours + durationHours > constraint.maxHours) {
      return { passes: false, violations: [] }
    }
    if (constraint.enforcement === 'flexible') {
      if (currentHours >= constraint.maxHours) {
        return { passes: false, violations: [] }
      }
      if (currentHours + durationHours > constraint.maxHours) {
        violations.push(`capacity.${constraint.type}`)
      }
    }
  }

  return { passes: true, violations }
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
  const result: EventWithDrive[] = []

  const process = (event: CalendarEvent, source: 'event' | 'outOfOffice', enforcement?: 'flexible' | 'hard') => {
    if (onlyOpaque && event.transparency === 'transparent') return

    const driveTo = event.placeId ? driveTimesByPlaceId[event.placeId]?.driveToCandidate : undefined
    const driveFrom = event.placeId ? driveTimesByPlaceId[event.placeId]?.driveFromCandidate : undefined

    result.push({
      start: new Date(event.start),
      end: new Date(event.end),
      source,
      enforcement,
      placeId: event.placeId,
      driveToMinutes: source === 'event' ? driveTo : undefined,
      driveFromMinutes: source === 'event' ? driveFrom : undefined,
    })
  }

  for (const e of regularEvents) process(e, 'event')
  for (const e of outOfOfficeEvents) process(e, 'outOfOffice', oooEnforcement)
  return result
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

  // Minimum slot start: now + lead time (or now if no lead time). Slots before this are not generated.
  const leadTimeConstraint = rangeConstraints.find(c => c.type === RANGE_CONSTRAINT_TYPES.LEAD_TIME)
  const leadMinutes = leadTimeConstraint?.config && typeof (leadTimeConstraint.config as { minutes?: number }).minutes === 'number'
    ? (leadTimeConstraint.config as { minutes: number }).minutes
    : 0
  const minSlotStart = new Date(now.getTime() + leadMinutes * 60 * 1000)

  const slotsByDay: Record<string, ComputedSlot[]> = {}
  const current = new Date(requestStart)
  current.setUTCHours(0, 0, 0, 0)

  while (current < requestEnd) {
    const year = current.getUTCFullYear()
    const month = current.getUTCMonth()
    const day = current.getUTCDate()

    const dayOfWeek = new Date(Date.UTC(year, month, day, 12, 0, 0)).getUTCDay() as 0 | 1 | 2 | 3 | 4 | 5 | 6
    const dayHours = hoursMap[dayOfWeek]
    if (!dayHours?.start || !dayHours?.end) {
      current.setUTCDate(current.getUTCDate() + 1)
      continue
    }
    const boundaries = buildDayBoundariesUTC(year, month, day, dayHours.start, dayHours.end)
    if (!boundaries) {
      current.setUTCDate(current.getUTCDate() + 1)
      continue
    }

    const rawSlots = generateSlotsForDay(
      boundaries.dayStartUtc,
      boundaries.dayEndUtc,
      durationMinutes,
      minuteIncrement,
      requestEnd
    )

    // Don't generate slots that start before now+leadTime (or before now); exclude them entirely.
    const slotsFromMinStart = rawSlots.filter(({ startTime }) => startTime >= minSlotStart)

    const dayKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    const computedSlots: ComputedSlot[] = slotsFromMinStart.map(({ startTime, endTime }) => {
      const rangeResult = checkRangeConstraints(startTime, endTime, rangeConstraints, now)
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

    slotsByDay[dayKey] = computedSlots
    current.setUTCDate(current.getUTCDate() + 1)
  }

  return slotsByDay
}
