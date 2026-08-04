/**
 * Pure helper for resolving minimizer part shape display name. Extracted to reduce composable complexity.
 */
import type { AppointmentShape } from '@/types/appointment'
import type { MinimizerSegmentDescriptor } from '@/utils/booking/minimizerEventShapes'

function isGenericMinimizerLabel(value: string | null | undefined): boolean {
  if (!value) return true
  const normalized = value.trim().toLowerCase().replace(/\s+/g, ' ')
  return (
    normalized === 'minimizer part' ||
    normalized === 'movable part' ||
    normalized === 'minimizer work' ||
    normalized === 'movable work'
  )
}

/**
 * Resolve the display name for the minimizer part (part-shape name, event-instance names, or fallback).
 */
export function getMinimizerPartShapeName(
  shape: AppointmentShape | null,
  minimizerEventShapeId: string | undefined,
  fallbackLabel: string,
  eventShapeName?: string | null
): string {
  if (shape && minimizerEventShapeId) {
    const byLineage = shape.eventAssignmentsByPartInstanceId
    const matchingAssignments = Object.entries(byLineage).filter(([, eventInstances]) =>
      eventInstances.some((eventInstance) => eventInstance.eventShapeRef === minimizerEventShapeId),
    )
    const matchingPartShapes = matchingAssignments
      .map(([partInstanceId]) => {
        const pf = shape.finalizedParts.find((p) => p.sourcePartInstances[0]?.id === partInstanceId)
        return pf?.partShape ?? ''
      })
      .filter((name) => name.trim().length > 0)
      .filter((name) => !isGenericMinimizerLabel(name))

    if (matchingPartShapes.length === 1) return matchingPartShapes[0]
    if (matchingPartShapes.length > 1) return `${matchingPartShapes[0]} +${matchingPartShapes.length - 1}`

    const matchingEventInstanceNames = matchingAssignments
      .flatMap(([, eventInstances]) => eventInstances.map((eventInstance) => eventInstance.name))
      .filter((name): name is string => typeof name === 'string' && name.trim().length > 0)
      .filter((name) => !isGenericMinimizerLabel(name))

    if (matchingEventInstanceNames.length === 1) return matchingEventInstanceNames[0]
    if (matchingEventInstanceNames.length > 1) {
      return `${matchingEventInstanceNames[0]} +${matchingEventInstanceNames.length - 1}`
    }
  }

  if (eventShapeName && !isGenericMinimizerLabel(eventShapeName)) {
    return eventShapeName
  }

  return fallbackLabel
}

/**
 * Label for one or more minimizer segments (ordered). For a single segment, reuses `getMinimizerPartShapeName`;
 * for multiple, joins event-shape names (or fallback when none).
 */
export function formatMinimizerSegmentsDisplayLabel(
  segments: MinimizerSegmentDescriptor[],
  shape: AppointmentShape | null,
  fallbackLabel: string
): string {
  if (segments.length === 0) {
    return fallbackLabel
  }
  if (segments.length === 1) {
    const s = segments[0]
    return getMinimizerPartShapeName(shape, s.eventShapeId, fallbackLabel, s.eventShape.name?.trim())
  }
  const names = segments
    .map((seg) => seg.eventShape.name?.trim())
    .filter((n): n is string => Boolean(n && n.length > 0))
  if (names.length === 0) {
    return fallbackLabel
  }
  return names.join(' + ')
}
