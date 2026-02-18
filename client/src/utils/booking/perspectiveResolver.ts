/**
 * Perspective Resolver
 *
 * LEARNING: Shared logic for resolving major/minor event shapes and deriving display time ranges.
 * WHY: applyShapeToTime and derivePerspective duplicated this logic; single place reduces complexity.
 * PATTERN: Pure functions; no slot shape building, only perspective/time derivation.
 */

import type { TimeRange, AppointmentSlot } from '@/types/appointment'
import type { SlotShape } from '@/types/appointment'
import type { AvailabilitySettings } from '@/configs/availabilitySettings'
import type { GlobalData } from '@/utils/transformers/fetchToGlobalTransformer'
import type { EventShapeEntity, GlobalEntityId } from '@/types/entities'
import { getMajorEventShape, getMinorEventShape } from '@/utils/eventAttendeeUtils'
import { createTimeRange, addMinutes } from './slotTimeUtils'
import { EVENT_PERSPECTIVE_KEYS } from '@/configs/eventPerspectiveLabels'

export interface ResolvedEventShapes {
  majorEventShape: EventShapeEntity | null
  minorEventShape: EventShapeEntity | null
  majorEventName: string | null
  minorEventName: string | null
}

/**
 * Resolve major and minor event shapes from slot shape and availability settings.
 * LEARNING: Single place for the duplicated logic previously in applyShapeToTime and derivePerspective.
 * WHY: Eliminates duplication and reduces nesting in callers.
 */
export function resolveEventShapes(
  majorAttendeeIds: GlobalEntityId[],
  minorAttendeeIds: GlobalEntityId[],
  eventFinals: SlotShape['eventFinals']
): ResolvedEventShapes {
  const eventShapeEntities = eventFinals.map(ef => ef.eventShape) as EventShapeEntity[]

  const majorEventShape =
    majorAttendeeIds.length > 0 ? getMajorEventShape(eventShapeEntities, majorAttendeeIds) : null
  const eventShapesExcludingMajor = majorEventShape
    ? eventShapeEntities.filter(es => es.id !== majorEventShape.id)
    : eventShapeEntities
  const minorEventShape =
    minorAttendeeIds.length > 0
      ? getMinorEventShape(eventShapesExcludingMajor, minorAttendeeIds)
      : null

  return {
    majorEventShape,
    minorEventShape,
    majorEventName: majorEventShape?.name ?? null,
    minorEventName: minorEventShape?.name ?? null
  }
}

/**
 * Adjust minor time range to end at major end time using roundedDifferentialOffset.
 * LEARNING: Differential display: minor starts after offset, ends with major.
 * WHY: Extracted from applyShapeToTime to share and reduce complexity.
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
 * LEARNING: Single place for perspective-to-time mapping; uses resolveEventShapes.
 * WHY: Used by useAppointmentSlots and AppointmentSlotGrid for display.
 */
export function derivePerspective(
  slot: AppointmentSlot,
  perspective: 'major' | 'minor' | 'nonDifferential',
  globalData?: GlobalData,
  availabilitySettings?: AvailabilitySettings | null
): TimeRange | null {
  const differentialPerspectives = availabilitySettings?.differentialPerspectives
  const eventFinals = slot.shape.slotShape.eventFinals

  if (!globalData || !eventFinals?.length || !differentialPerspectives) {
    if (perspective === EVENT_PERSPECTIVE_KEYS.NON_DIFFERENTIAL || perspective === EVENT_PERSPECTIVE_KEYS.MAJOR) {
      return slot.totalTimeRange
    }
    return null
  }

  const majorAttendeeIds = differentialPerspectives.majorAttendees ?? []
  const minorAttendeeIds = differentialPerspectives.minorAttendees ?? []
  const { majorEventShape, minorEventShape, majorEventName, minorEventName } = resolveEventShapes(
    majorAttendeeIds,
    minorAttendeeIds,
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
