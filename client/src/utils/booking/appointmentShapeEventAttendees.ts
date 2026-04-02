import type { EventInstance, EventShape } from '@/types/events'
import type { GlobalRelationship } from '@/types/relationships'
import type { GlobalEntityId } from '@shared/types/primitiveBrands'
import { createLogger } from '@/utils/logger'

const logger = createLogger('appointmentShapeEventAttendees')

/**
 * Merge segment-level attendee assignments onto placement types for booking.
 * Relationship parents are event instances; aggregate children onto each shape by eventShapeRef.
 */
export function mergeAttendeesIntoEventShapes(
  eventShapes: EventShape[],
  eventInstances: EventInstance[],
  attendeeAssignmentsRelationships: GlobalRelationship[]
): Array<EventShape & { attendees: GlobalEntityId[] }> {
  const shapeRefToInstanceIds = new Map<string, string[]>()
  for (const ei of eventInstances) {
    const list = shapeRefToInstanceIds.get(ei.eventShapeRef) ?? []
    list.push(String(ei.id))
    shapeRefToInstanceIds.set(ei.eventShapeRef, list)
  }

  return eventShapes.map((eventShape) => {
    const instanceIds = new Set(shapeRefToInstanceIds.get(String(eventShape.id)) ?? [])
    const matchingRels = attendeeAssignmentsRelationships.filter(
      (rel) => rel.parent && instanceIds.has(String(rel.parent.id))
    )
    const attendeeIds = new Set<GlobalEntityId>()
    for (const rel of matchingRels) {
      for (const child of rel.children ?? []) {
        attendeeIds.add(child.id)
      }
    }
    if (matchingRels.length === 0 && attendeeAssignmentsRelationships.length > 0) {
      logger.debug('useAppointmentShape: no attendee rels for shape instances', {
        eventShapeId: eventShape.id,
      })
    }
    return {
      ...eventShape,
      attendees: Array.from(attendeeIds),
    } as EventShape & { attendees: GlobalEntityId[] }
  }) as Array<EventShape & { attendees: GlobalEntityId[] }>
}
