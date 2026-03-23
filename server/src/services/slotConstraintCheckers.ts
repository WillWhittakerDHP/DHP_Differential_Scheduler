/**
 * Slot constraint checkers: range, overlap, and capacity.
 */

import type {
  RangeConstraint,
  OverlapConstraint,
  CapacityConstraint,
} from '../../../shared/types/availabilityTypes.js'
import { RANGE_CONSTRAINT_TYPES } from '../../../shared/constants/constraintConstants.js'
import {
  buildCapacityKey,
  capacityKeyToString,
  extractDateFromRFC3339,
} from '../../../shared/utils/capacityKeyUtils.js'

/** Opaque calendar event with parsed Date and optional drive minutes (for overlap check). */
export interface EventWithDrive {
  start: Date
  end: Date
  source: 'event' | 'outOfOffice'
  enforcement?: 'flexible' | 'hard'
  placeId?: string
  driveToMinutes?: number
  driveFromMinutes?: number
}

function timeRangesOverlap(
  a: { start: Date; end: Date },
  b: { start: Date; end: Date }
): boolean {
  return a.start < b.end && a.end > b.start
}

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

export function checkRangeConstraints(
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

export function checkOverlapConstraints(
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

export function checkCapacityConstraints(
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

/** Collect all range violation keys for a slot without short-circuiting (for force-create report). */
export function collectRangeViolationKeys(
  slotStart: Date,
  slotEnd: Date,
  rangeConstraints: RangeConstraint[],
  now: Date
): string[] {
  const keys: string[] = []
  for (const constraint of rangeConstraints) {
    const result = checkOneRangeConstraint(slotStart, slotEnd, constraint, now)
    if (result.violation) {
      keys.push(result.violation)
    } else if (!result.passes) {
      keys.push(`range.${constraint.type}`)
    }
  }
  return keys
}

/** Collect all overlap violation keys for a slot (for force-create report). */
export function collectOverlapViolationKeys(
  slotStart: Date,
  slotEnd: Date,
  eventsWithDrive: EventWithDrive[]
): string[] {
  const slotRange = { start: slotStart, end: slotEnd }
  return eventsWithDrive.flatMap((event) =>
    getOverlapViolationsForEvent(slotRange, event).map((item) => item.violation)
  )
}

/** Collect all capacity violation keys for a slot without short-circuiting (for force-create report). */
export function collectCapacityViolationKeys(
  slotStart: Date,
  durationMinutes: number,
  capacityConstraints: CapacityConstraint[]
): string[] {
  if (capacityConstraints.length === 0) return []
  const slotDate = extractDateFromRFC3339(slotStart.toISOString())
  const durationHours = durationMinutes / 60
  const keys: string[] = []
  for (const constraint of capacityConstraints) {
    const result = checkOneCapacityConstraint(
      slotDate,
      durationHours,
      constraint
    )
    if (result.violation) {
      keys.push(result.violation)
    } else if (!result.passes) {
      keys.push(`capacity.${constraint.type}`)
    }
  }
  return keys
}
