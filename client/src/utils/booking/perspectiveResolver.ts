
import type { SlotTimeBounds } from '@shared/types/availabilityTypes'
import type { AppointmentSlot } from '@/types/appointment'
import type { SlotShape } from '@/types/appointment'
import type { EventShapeEntity } from '@/types/entities'
import { getEventShapeByRoleWithOverrides } from '@/utils/eventAttendeeUtils'
import type { DifferentialRole } from '@shared/types/differentialRole'
import { createTimeRange, addMinutes } from './slotTimeUtils'
import { createLogger } from '@/utils/logger'
import { EVENT_PERSPECTIVE_KEYS } from '@/configs/eventPerspectiveLabels'
import type { ResolvedEventShapes } from '@/types/booking/perspectiveResolver'

export type { ResolvedEventShapes } from '@/types/booking/perspectiveResolver'

const logger = createLogger('perspectiveResolver')

export function resolveEventShapes(
  eventFinals: SlotShape['eventFinals'],
  overrides?: Record<string, DifferentialRole> | null
): ResolvedEventShapes {
  const eventShapeEntities = eventFinals.map(ef => ef.eventShape) as EventShapeEntity[]

  const majorEventShape = getEventShapeByRoleWithOverrides(eventShapeEntities, 'major', overrides)
  if (!majorEventShape) {
    logger.error('resolveEventShapes: no event shape with effective differentialRole=major', {
      availableRoles: eventShapeEntities.map((es) => ({
        name: es.name,
        differentialRole: es.differentialRole,
      })),
    })
  }

  const minorEventShape = getEventShapeByRoleWithOverrides(eventShapeEntities, 'minor', overrides)
  if (!minorEventShape) {
    logger.error('resolveEventShapes: no event shape with effective differentialRole=minor', {
      availableRoles: eventShapeEntities.map((es) => ({
        name: es.name,
        differentialRole: es.differentialRole,
      })),
    })
  }

  return {
    majorEventShape,
    minorEventShape,
    majorEventName: majorEventShape?.name ?? null,
    minorEventName: minorEventShape?.name ?? null
  }
}

export function adjustMinorTimeRange(
  startTime: string,
  eventTimeRanges: Record<string, SlotTimeBounds | null>,
  majorEventName: string | null,
  minorEventName: string | null,
  majorTimeRange: SlotTimeBounds | null,
  minorTimeRange: SlotTimeBounds | null,
  roundedDifferentialOffset: number
): { adjustedEventTimeRanges: Record<string, SlotTimeBounds | null>; adjustedMinorTimeRange: SlotTimeBounds | null } {
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

function majorOrTotalRange(slot: AppointmentSlot, majorEventName: string | null): SlotTimeBounds | null {
  return majorEventName != null ? (slot.eventTimeRanges?.[majorEventName] ?? slot.totalTimeRange) : slot.totalTimeRange
}

function derivePerspectiveNoEventFinals(
  slot: AppointmentSlot,
  perspective: 'major' | 'minor' | 'nonDifferential'
): SlotTimeBounds | null {
  const useTotal =
    perspective === EVENT_PERSPECTIVE_KEYS.NON_DIFFERENTIAL || perspective === EVENT_PERSPECTIVE_KEYS.MAJOR
  return useTotal ? slot.totalTimeRange : null
}

function derivePerspectiveWithResolved(
  slot: AppointmentSlot,
  perspective: 'major' | 'minor' | 'nonDifferential',
  resolved: ResolvedEventShapes
): SlotTimeBounds | null {
  const { majorEventShape, minorEventShape, majorEventName, minorEventName } = resolved
  if (!majorEventShape) {
    return derivePerspectiveNoEventFinals(slot, perspective)
  }
  if (perspective === EVENT_PERSPECTIVE_KEYS.MAJOR) {
    return majorOrTotalRange(slot, majorEventName)
  }
  if (perspective === EVENT_PERSPECTIVE_KEYS.MINOR) {
    if (!minorEventShape || !minorEventName) {
      return slot.totalTimeRange
    }
    return slot.eventTimeRanges?.[minorEventName] ?? slot.totalTimeRange
  }
  if (perspective === EVENT_PERSPECTIVE_KEYS.NON_DIFFERENTIAL) {
    return majorOrTotalRange(slot, majorEventName)
  }
  return null
}

export function derivePerspective(
  slot: AppointmentSlot,
  perspective: 'major' | 'minor' | 'nonDifferential'
): SlotTimeBounds | null {
  const eventFinals = slot.shape.slotShape.eventFinals
  if (!eventFinals?.length) {
    return derivePerspectiveNoEventFinals(slot, perspective)
  }
  const resolved = resolveEventShapes(eventFinals, slot.shape.differentialEventRoleOverrides ?? null)
  return derivePerspectiveWithResolved(slot, perspective, resolved)
}
