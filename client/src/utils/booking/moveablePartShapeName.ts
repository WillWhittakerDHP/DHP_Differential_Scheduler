/**
 * Pure helper for resolving moveable part shape display name. Extracted to reduce composable complexity.
 */
import type { AppointmentShape } from '@/types/appointment'

function isGenericMoveableLabel(value: string | null | undefined): boolean {
  if (!value) return true
  const normalized = value.trim().toLowerCase().replace(/\s+/g, ' ')
  return (
    normalized === 'moveable part' ||
    normalized === 'movable part' ||
    normalized === 'moveable work' ||
    normalized === 'movable work'
  )
}

/**
 * Resolve the display name for the moveable part (part-shape name, event-instance names, or fallback).
 */
export function getMoveablePartShapeName(
  shape: AppointmentShape | null,
  moveableEventShapeId: string | undefined,
  fallbackLabel: string,
  eventShapeName?: string | null
): string {
  if (shape && moveableEventShapeId) {
    const matchingAssignments = Object.entries(shape.eventAssignmentsByPartShape).filter(
      ([, eventInstances]) =>
        eventInstances.some((eventInstance) => eventInstance.eventShapeRef === moveableEventShapeId)
    )
    const matchingPartShapes = matchingAssignments
      .map(([partShapeName]) => partShapeName)
      .filter((name) => name.trim().length > 0)
      .filter((name) => !isGenericMoveableLabel(name))

    if (matchingPartShapes.length === 1) return matchingPartShapes[0]
    if (matchingPartShapes.length > 1) return `${matchingPartShapes[0]} +${matchingPartShapes.length - 1}`

    const matchingEventInstanceNames = matchingAssignments
      .flatMap(([, eventInstances]) => eventInstances.map((eventInstance) => eventInstance.name))
      .filter((name): name is string => typeof name === 'string' && name.trim().length > 0)
      .filter((name) => !isGenericMoveableLabel(name))

    if (matchingEventInstanceNames.length === 1) return matchingEventInstanceNames[0]
    if (matchingEventInstanceNames.length > 1) {
      return `${matchingEventInstanceNames[0]} +${matchingEventInstanceNames.length - 1}`
    }
  }

  if (eventShapeName && !isGenericMoveableLabel(eventShapeName)) {
    return eventShapeName
  }

  return fallbackLabel
}
