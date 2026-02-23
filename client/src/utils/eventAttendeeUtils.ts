/**
 * Event Attendee Utilities
 * 
 * 
 * NOTE: Attendees are UserTypeBlock instances (BlockInstances where blockShape.isStateControl === true)
 * They are referenced by BlockInstance ID in the event_shape_attendees relationship table
 */

import type { GlobalEntityId } from '@shared/types/primitiveBrands'
import type { EventShapeEntity, BlockInstanceEntity, BlockShapeEntity } from '@/types/entities'
import { toGlobalEntityId } from '@/types/entities'
import type { GlobalData } from '@/utils/transformers/fetchToGlobalTransformer'
import { asEmptyArray } from '@/utils/safeDefaults'

export function getAllUserTypeBlockIds(globalData: GlobalData): GlobalEntityId[] {
  const blockShapes = asEmptyArray(globalData.entities.blockShape) as BlockShapeEntity[]
  const stateControlBlockShapes = blockShapes.filter(bs => bs.isStateControl === true)
  const stateControlBlockShapeIds = new Set(stateControlBlockShapes.map(bs => bs.id))
  
  const blockInstances = asEmptyArray(globalData.entities.blockInstance) as BlockInstanceEntity[]
  const stateControlBlockInstances = blockInstances.filter(
    instance => 
      stateControlBlockShapeIds.has(toGlobalEntityId(instance.blockShapeRef))
  )
  
  return stateControlBlockInstances.map(instance => instance.id)
}

/**
 * Check if an event shape has a specific attendee (UserTypeBlock).
 */
function hasAttendee(
  eventShape: EventShapeEntity,
  userTypeBlockId: GlobalEntityId
): boolean {
  if (!eventShape.attendees || !Array.isArray(eventShape.attendees)) {
    return false
  }
  return eventShape.attendees.includes(userTypeBlockId)
}

/**
 * Find event shape by its differentialRole field.
 * Primary resolution method — direct field lookup, no attendee matching needed.
 */
export function getEventShapeByRole(
  eventShapes: EventShapeEntity[],
  role: 'major' | 'minor' | 'moveable'
): EventShapeEntity | null {
  return eventShapes.find(es => es.differentialRole === role) ?? null
}

/**
 * Find event shape with major attendee
 * @deprecated Use getEventShapeByRole(shapes, 'major') for direct lookup; this remains as fallback.
 */
export function getMajorEventShape(
  eventShapes: EventShapeEntity[],
  majorAttendeeIds: GlobalEntityId[]
): EventShapeEntity | null {
  if (majorAttendeeIds.length === 0) {
    return null
  }
  
  return eventShapes.find(eventShape => 
    majorAttendeeIds.some(id => hasAttendee(eventShape, id))
  ) || null
}

/**
 * Find event shape with minor attendee
 * @deprecated Use getEventShapeByRole(shapes, 'minor') for direct lookup; this remains as fallback.
 */
export function getMinorEventShape(
  eventShapes: EventShapeEntity[],
  minorAttendeeIds: GlobalEntityId[]
): EventShapeEntity | null {
  if (minorAttendeeIds.length === 0) {
    return null
  }
  
  return eventShapes.find(eventShape => 
    minorAttendeeIds.some(id => hasAttendee(eventShape, id))
  ) || null
}
