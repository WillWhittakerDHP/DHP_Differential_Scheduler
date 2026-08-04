
import type { SlotTimeBounds } from '@shared/types/availabilityTypes'
import type { AppointmentSlot } from '@/types/appointment'
import type { SlotShape } from '@/types/appointment'
import type { EventShapeEntity } from '@/types/entities'
import { resolveDifferentialMajorMinorFromEventShapes } from '@/utils/eventAttendeeUtils'
import { EVENT_PERSPECTIVE_KEYS } from '@/configs/eventPerspectiveLabels'
import type { ResolvedEventShapes } from '@/types/booking/perspectiveResolver'

export type { ResolvedEventShapes } from '@/types/booking/perspectiveResolver'

function resolvedShapesFromMajorMinorPair(
  pair: ReturnType<typeof resolveDifferentialMajorMinorFromEventShapes>
): ResolvedEventShapes {
  if (!pair.hasMajorMinorPair || pair.major === null || pair.minor === null) {
    return {
      majorEventShape: null,
      minorEventShape: null,
      majorEventName: null,
      minorEventName: null,
    }
  }
  return {
    majorEventShape: pair.major,
    minorEventShape: pair.minor,
    majorEventName: pair.major.name ?? null,
    minorEventName: pair.minor.name ?? null,
  }
}

function resolveEventShapesCore(eventFinals: SlotShape['eventFinals']): ResolvedEventShapes {
  const eventShapeEntities = eventFinals.map((ef) => ef.eventShape) as EventShapeEntity[]
  const pair = resolveDifferentialMajorMinorFromEventShapes(eventShapeEntities)
  return resolvedShapesFromMajorMinorPair(pair)
}

export function resolveEventShapes(eventFinals: SlotShape['eventFinals']): ResolvedEventShapes {
  return resolveEventShapesCore(eventFinals)
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
  const resolved = resolveEventShapes(eventFinals)
  // WHY: Without a major+minor pair, role-based ranges are not defined; use total for every
  // perspective (including minor). Reusing derivePerspectiveNoEventFinals would return null
  // for minor and show "Unavailable" while totalTimeRange is valid.
  if (!resolved.majorEventShape) {
    return slot.totalTimeRange ?? derivePerspectiveNoEventFinals(slot, perspective)
  }
  return derivePerspectiveWithResolved(slot, perspective, resolved)
}
