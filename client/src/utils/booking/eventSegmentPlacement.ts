import type { SlotTimeBounds } from '@shared/types/availabilityTypes'
import {
  sanitizeEventAnchorEdgeInput,
  sanitizeEventPlacementKindInput,
  type EventAnchorEdge,
  type EventPlacementKind,
} from '@shared/utils/eventPlacementUtils'
import type { EventFinal, SlotShape } from '@/types/appointment'
import { addMinutes, createTimeRange } from '@/utils/booking/slotTimeUtils'

interface PlacedSegment {
  name: string
  range: SlotTimeBounds | null
  expandsMainWindow: boolean
}

interface EventPlacementFields {
  placementKind: EventPlacementKind
  anchorEdge: EventAnchorEdge | null
}

function placementFieldsFor(eventFinal: EventFinal): EventPlacementFields {
  const placementKind = sanitizeEventPlacementKindInput(eventFinal.eventShape.placementKind) ?? 'primary'
  const anchorEdge =
    placementKind === 'primary' || placementKind === 'none'
      ? null
      : sanitizeEventAnchorEdgeInput(eventFinal.eventShape.anchorEdge) ?? 'end'
  return { placementKind, anchorEdge }
}

function primaryRange(startTime: string, duration: number): SlotTimeBounds {
  return createTimeRange(startTime, duration)
}

function secondaryRange(primary: SlotTimeBounds, duration: number, edge: EventAnchorEdge): SlotTimeBounds {
  if (edge === 'start') {
    return createTimeRange(primary.startTime, duration)
  }
  return createTimeRange(addMinutes(primary.endTime, -duration), duration)
}

function adjacentRange(primary: SlotTimeBounds, duration: number, edge: EventAnchorEdge): SlotTimeBounds {
  if (edge === 'start') {
    return createTimeRange(addMinutes(primary.startTime, -duration), duration)
  }
  return createTimeRange(primary.endTime, duration)
}

function rangeForEventFinal(eventFinal: EventFinal, primary: SlotTimeBounds): PlacedSegment {
  const duration = eventFinal.roundedDuration
  const name = eventFinal.eventShape.name
  const { placementKind, anchorEdge } = placementFieldsFor(eventFinal)

  // WHY: `none` = intentionally unscheduled (e.g. no presentation) — no calendar range.
  if (placementKind === 'none') {
    return { name, range: null, expandsMainWindow: false }
  }

  if (duration <= 0) {
    return { name, range: null, expandsMainWindow: false }
  }

  if (placementKind === 'primary') {
    return { name, range: primaryRange(primary.startTime, duration), expandsMainWindow: true }
  }
  if (placementKind === 'secondary') {
    return { name, range: secondaryRange(primary, duration, anchorEdge ?? 'end'), expandsMainWindow: false }
  }
  if (placementKind === 'marginal') {
    return { name, range: adjacentRange(primary, duration, anchorEdge ?? 'end'), expandsMainWindow: true }
  }
  return { name, range: adjacentRange(primary, duration, anchorEdge ?? 'end'), expandsMainWindow: false }
}

function spanRanges(ranges: SlotTimeBounds[]): SlotTimeBounds | null {
  if (ranges.length === 0) {
    return null
  }
  const starts = ranges.map((r) => new Date(r.startTime).getTime())
  const ends = ranges.map((r) => new Date(r.endTime).getTime())
  const start = new Date(Math.min(...starts)).toISOString()
  const end = new Date(Math.max(...ends)).toISOString()
  return {
    startTime: start as SlotTimeBounds['startTime'],
    endTime: end as SlotTimeBounds['endTime'],
    duration: Math.max(0, Math.round((new Date(end).getTime() - new Date(start).getTime()) / 60000)),
  }
}

function resolvePrimaryEventFinal(slotShape: SlotShape): EventFinal | null {
  return slotShape.eventFinals.find((eventFinal) => {
    const kind = sanitizeEventPlacementKindInput(eventFinal.eventShape.placementKind) ?? 'primary'
    return kind === 'primary'
  }) ?? null
}

export function createPlacedEventTimeRanges(
  slotShape: SlotShape,
  startTime: string
): {
  totalTimeRange: SlotTimeBounds | null
  eventTimeRanges: Record<string, SlotTimeBounds | null>
} {
  const eventFinals = Array.isArray(slotShape.eventFinals) ? slotShape.eventFinals : []
  const primaryEventFinal = resolvePrimaryEventFinal(slotShape)
  const primaryDuration = primaryEventFinal?.roundedDuration ?? slotShape.roundedDuration
  if (primaryDuration <= 0) {
    return { totalTimeRange: null, eventTimeRanges: {} }
  }

  const primary = createTimeRange(startTime, primaryDuration)
  const placedSegments = eventFinals.map((eventFinal) => rangeForEventFinal(eventFinal, primary))
  const eventTimeRanges = Object.fromEntries(
    placedSegments.map((segment) => [segment.name, segment.range])
  )
  const expandingRanges = placedSegments
    .filter((segment) => segment.expandsMainWindow && segment.range !== null)
    .map((segment) => segment.range as SlotTimeBounds)

  return {
    totalTimeRange: spanRanges(expandingRanges),
    eventTimeRanges,
  }
}
