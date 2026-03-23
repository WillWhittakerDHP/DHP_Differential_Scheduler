import type { GlobalEntityKey } from '@/constants/entities'
import type { GlobalEntity } from '@/types/entities'
import type { EventShape } from '@/types/events'
import type { GlobalRelationship } from '@/types/relationships'
import type { GlobalEntityId } from '@shared/types/primitiveBrands'
import { createLogger } from '@/utils/logger'

const logger = createLogger('appointmentShapeEventAttendees')

export function mergeAttendeesIntoEventShapes(
  eventShapes: EventShape[],
  attendeeAssignmentsRelationships: GlobalRelationship[]
): Array<EventShape & { attendees: GlobalEntityId[] }> {
  if (attendeeAssignmentsRelationships.length > 0) {
    return eventShapes.map((eventShape) => {
      const matchingRel = attendeeAssignmentsRelationships.find((rel) => rel.parent?.id === eventShape.id)
      const rawChildren = matchingRel?.children
      let attendees: GlobalEntityId[]
      if (rawChildren !== undefined && rawChildren !== null) {
        attendees = rawChildren.map((child: GlobalEntity<GlobalEntityKey>) => child.id)
      } else {
        logger.debug('useAppointmentShape: matching rel children missing', { eventShapeId: eventShape.id })
        attendees = []
      }
      return { ...eventShape, attendees }
    }) as Array<EventShape & { attendees: GlobalEntityId[] }>
  }
  return eventShapes.map((eventShape) => ({
    ...eventShape,
    attendees: [] as GlobalEntityId[],
  })) as Array<EventShape & { attendees: GlobalEntityId[] }>
}
