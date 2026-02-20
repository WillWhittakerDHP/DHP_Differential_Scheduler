/**
 * Event Attendee Utilities
 * 
 * LEARNING: Helper functions for working with event attendees (UserTypeBlock instances)
 * WHY: Encapsulates logic for finding event shapes by attendee type and checking attendee presence
 * PATTERN: Pure utility functions that work with EventShapeEntity and GlobalEntity types
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
 * LEARNING: Checks if the event shape's attendees array includes the given UserTypeBlock ID
 * WHY: Used by getMajorEventShape and getMinorEventShape
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
 * Find event shape with major attendee
 * LEARNING: Finds the first event shape that has a major attendee UserTypeBlock in its attendees
 * WHY: Used to identify which event represents major perspective (replaces hardcoded "OnSite"/"inspector" check)
 * PATTERN: Filter event shapes by attendee presence using configured major attendee IDs
 * 
 * @param eventShapes - Array of EventShapeEntity to search
 * @param majorAttendeeIds - Array of major attendee UserTypeBlock BlockInstance IDs (from configuration)
 * @returns EventShapeEntity with major attendee, or null if not found
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
 * LEARNING: Finds the first event shape that has a minor attendee UserTypeBlock in its attendees
 * WHY: Used to identify which event represents minor perspective (replaces hardcoded ClientPresent/USER_ROLE_CLIENT check)
 * PATTERN: Filter event shapes by attendee presence using configured minor attendee IDs
 * 
 * @param eventShapes - Array of EventShapeEntity to search
 * @param minorAttendeeIds - Array of minor attendee UserTypeBlock BlockInstance IDs (from configuration)
 * @returns EventShapeEntity with minor attendee, or null if not found
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
