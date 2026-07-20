import {
  sanitizeEventAnchorEdgeInput,
  sanitizeEventPlacementKindInput,
  type EventAnchorEdge,
  type EventPlacementKind,
} from '@shared/utils/eventPlacementUtils'

export type EventTimingBehaviorValue =
  | 'primary'
  | 'secondary:start'
  | 'secondary:end'
  | 'marginal:start'
  | 'marginal:end'
  | 'floating:start'
  | 'floating:end'
  | 'none'

export interface EventTimingBehaviorDescriptor {
  value: EventTimingBehaviorValue
  placementKind: EventPlacementKind
  anchorEdge: EventAnchorEdge | null
  title: string
  shortTitle: string
  description: string
}

export const EVENT_TIMING_BEHAVIOR_OPTIONS: EventTimingBehaviorDescriptor[] = [
  {
    value: 'primary',
    placementKind: 'primary',
    anchorEdge: null,
    title: 'Main appointment window',
    shortTitle: 'Main window',
    description: 'The main time window. Other segment timing is positioned relative to this.',
  },
  {
    value: 'secondary:start',
    placementKind: 'secondary',
    anchorEdge: 'start',
    title: 'Inside start of main window',
    shortTitle: 'Inside start',
    description: 'A segment inside the main window that starts when the main window starts.',
  },
  {
    value: 'secondary:end',
    placementKind: 'secondary',
    anchorEdge: 'end',
    title: 'Inside end of main window',
    shortTitle: 'Inside end',
    description: 'A segment inside the main window that ends when the main window ends. Useful for a client presentation.',
  },
  {
    value: 'marginal:start',
    placementKind: 'marginal',
    anchorEdge: 'start',
    title: 'Work before main window',
    shortTitle: 'Before main',
    description: 'Adjacent work before the main window. It expands the main busy window.',
  },
  {
    value: 'marginal:end',
    placementKind: 'marginal',
    anchorEdge: 'end',
    title: 'Work after main window',
    shortTitle: 'After main',
    description: 'Adjacent work after the main window. It expands the main busy window.',
  },
  {
    value: 'floating:start',
    placementKind: 'floating',
    anchorEdge: 'start',
    title: 'Flexible/off-site before main window',
    shortTitle: 'Flexible before',
    description: 'Separate work near the front of the appointment. It does not expand the main availability hold.',
  },
  {
    value: 'floating:end',
    placementKind: 'floating',
    anchorEdge: 'end',
    title: 'Flexible/off-site after main window',
    shortTitle: 'Flexible after',
    description: 'Separate work near the back of the appointment. It does not expand the main availability hold.',
  },
  {
    value: 'none',
    placementKind: 'none',
    anchorEdge: null,
    title: 'None (no timed segment)',
    shortTitle: 'None',
    description:
      'No calendar placement among the other timing options — for example a “no presentation” profile where that segment is intentionally not scheduled.',
  },
]

function eventTimingValue(
  placementKind: EventPlacementKind,
  anchorEdge: EventAnchorEdge | null
): EventTimingBehaviorValue {
  if (placementKind === 'primary' || placementKind === 'none') {
    return placementKind
  }
  return `${placementKind}:${anchorEdge ?? 'start'}` as EventTimingBehaviorValue
}

export function eventTimingBehaviorFromPlacement(
  placementKindInput: unknown,
  anchorEdgeInput: unknown
): EventTimingBehaviorDescriptor {
  const placementKind = sanitizeEventPlacementKindInput(placementKindInput) ?? 'primary'
  const anchorEdge =
    placementKind === 'primary' || placementKind === 'none'
      ? null
      : sanitizeEventAnchorEdgeInput(anchorEdgeInput) ?? 'start'
  const value = eventTimingValue(placementKind, anchorEdge)
  return (
    EVENT_TIMING_BEHAVIOR_OPTIONS.find((option) => option.value === value) ??
    EVENT_TIMING_BEHAVIOR_OPTIONS[0]
  )
}

export function eventTimingBehaviorFromValue(value: unknown): EventTimingBehaviorDescriptor {
  if (typeof value === 'string') {
    const option = EVENT_TIMING_BEHAVIOR_OPTIONS.find((item) => item.value === value)
    if (option) {
      return option
    }
  }
  return EVENT_TIMING_BEHAVIOR_OPTIONS[0]
}
