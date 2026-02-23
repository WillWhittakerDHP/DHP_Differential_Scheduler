/**
 * Perspective Resolver
 *
 */

import type { TimeRange, AppointmentSlot } from '@/types/appointment'
import type { SlotShape } from '@/types/appointment'
import type { EventShapeEntity } from '@/types/entities'
import { getEventShapeByRole } from '@/utils/eventAttendeeUtils'
import { createTimeRange, addMinutes } from './slotTimeUtils'
import { createLogger } from '@/utils/logger'
import { EVENT_PERSPECTIVE_KEYS } from '@/configs/eventPerspectiveLabels'

const logger = createLogger('perspectiveResolver')

export interface ResolvedEventShapes {
  majorEventShape: EventShapeEntity | null
  minorEventShape: EventShapeEntity | null
  majorEventName: string | null
  minorEventName: string | null
}

/**
 * Resolve major and minor event shapes using differentialRole.
 * Logs an error if no event shape has the expected role.
 */
export function resolveEventShapes(
  eventFinals: SlotShape['eventFinals']
): ResolvedEventShapes {
  const eventShapeEntities = eventFinals.map(ef => ef.eventShape) as EventShapeEntity[]

  const majorEventShape = getEventShapeByRole(eventShapeEntities, 'major')
  if (!majorEventShape) {
    logger.error('resolveEventShapes: no event shape with differentialRole=major', {
      availableRoles: eventShapeEntities.map(es => ({ name: es.name, differentialRole: es.differentialRole }))
    })
  }

  const minorEventShape = getEventShapeByRole(eventShapeEntities, 'minor')
  if (!minorEventShape) {
    logger.error('resolveEventShapes: no event shape with differentialRole=minor', {
      availableRoles: eventShapeEntities.map(es => ({ name: es.name, differentialRole: es.differentialRole }))
    })
  }

  return {
    majorEventShape,
    minorEventShape,
    majorEventName: majorEventShape?.name ?? null,
    minorEventName: minorEventShape?.name ?? null
  }
}

/**
 * Adjust minor time range to end at major end time using roundedDifferentialOffset.
 */
export function adjustMinorTimeRange(
  startTime: string,
  eventTimeRanges: Record<string, TimeRange | null>,
  majorEventName: string | null,
  minorEventName: string | null,
  majorTimeRange: TimeRange | null,
  minorTimeRange: TimeRange | null,
  roundedDifferentialOffset: number
): { adjustedEventTimeRanges: Record<string, TimeRange | null>; adjustedMinorTimeRange: TimeRange | null } {
  if (
    !majorTimeRange ||
    !minorTimeRange ||
    !majorEventName ||
    !minorEventName ||
    roundedDifferentialOffset < 0
  ) {
    return { adjustedEventTimeRanges: { ...eventTimeRanges }, adjustedMinorTimeRange: minorTimeRange }
  }

  const minorDuration = majorTimeRange.duration - roundedDifferentialOffset
  if (minorDuration <= 0) {
    return {
      adjustedEventTimeRanges: { ...eventTimeRanges, [minorEventName]: null },
      adjustedMinorTimeRange: null
    }
  }

  const adjustedMinorTimeRange = createTimeRange(
    addMinutes(startTime, roundedDifferentialOffset),
    minorDuration
  )
  return {
    adjustedEventTimeRanges: { ...eventTimeRanges, [minorEventName]: adjustedMinorTimeRange },
    adjustedMinorTimeRange
  }
}

/**
 * Derive the display TimeRange for a slot given a perspective (major / minor / nonDifferential).
 */
export function derivePerspective(
  slot: AppointmentSlot,
  perspective: 'major' | 'minor' | 'nonDifferential',
): TimeRange | null {
  const eventFinals = slot.shape.slotShape.eventFinals

  if (!eventFinals?.length) {
    if (perspective === EVENT_PERSPECTIVE_KEYS.NON_DIFFERENTIAL || perspective === EVENT_PERSPECTIVE_KEYS.MAJOR) {
      return slot.totalTimeRange
    }
    return null
  }

  const { majorEventShape, minorEventShape, majorEventName, minorEventName } = resolveEventShapes(
    eventFinals
  )

  if (!majorEventShape) {
    if (perspective === EVENT_PERSPECTIVE_KEYS.NON_DIFFERENTIAL || perspective === EVENT_PERSPECTIVE_KEYS.MAJOR) {
      return slot.totalTimeRange
    }
    return null
  }

  if (perspective === EVENT_PERSPECTIVE_KEYS.MAJOR) {
    return majorEventName != null ? (slot.eventTimeRanges?.[majorEventName] ?? slot.totalTimeRange) : slot.totalTimeRange
  }
  if (perspective === EVENT_PERSPECTIVE_KEYS.MINOR) {
    if (!minorEventShape || !minorEventName) {
      return slot.totalTimeRange
    }
    return slot.eventTimeRanges?.[minorEventName] ?? slot.totalTimeRange
  }
  if (perspective === EVENT_PERSPECTIVE_KEYS.NON_DIFFERENTIAL) {
    return majorEventName != null ? (slot.eventTimeRanges?.[majorEventName] ?? slot.totalTimeRange) : slot.totalTimeRange
  }

  return null
}
