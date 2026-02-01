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

import type { EventShapeEntity } from '@/types/entities'
import type { GlobalEntityId } from '@/types/entities'
import type { BlockInstanceEntity, BlockShapeEntity } from '@/types/entities'
import type { GlobalData } from '@/utils/transformers/fetchToGlobalTransformer'

/**
 * Find UserTypeBlock BlockInstance IDs by name
 * LEARNING: Searches for BlockInstances that are state control blocks with matching name
 * WHY: Provides lookup by name (e.g., "Major", "Minor", "Agent") to get BlockInstance ID
 * PATTERN: Filter BlockInstances by blockShape.isStateControl and name match
 * 
 * @param globalData - GlobalData containing all entities
 * @param name - Name to search for (case-insensitive)
 * @returns Array of BlockInstance IDs matching the name, or empty array if not found
 */
export function findUserTypeBlockIdsByName(
  globalData: GlobalData,
  name: string
): GlobalEntityId[] {
  const blockShapes = (globalData.entities.blockShape || []) as BlockShapeEntity[]
  const stateControlBlockShapes = blockShapes.filter(bs => bs.isStateControl === true)
  const stateControlBlockShapeIds = new Set(stateControlBlockShapes.map(bs => bs.id))
  
  const blockInstances = (globalData.entities.blockInstance || []) as BlockInstanceEntity[]
  const stateControlBlockInstances = blockInstances.filter(
    instance => 
      stateControlBlockShapeIds.has(instance.blockShapeRef) && 
      instance.active &&
      instance.name.toLowerCase() === name.toLowerCase()
  )
  
  return stateControlBlockInstances.map(instance => instance.id)
}

/**
 * Check if an event shape has a specific attendee (UserTypeBlock)
 * LEARNING: Checks if the event shape's attendees array includes the given UserTypeBlock ID
 * WHY: Provides type-safe way to check attendee presence
 * PATTERN: Array includes check with null/undefined safety
 * 
 * @param eventShape - EventShapeEntity to check
 * @param userTypeBlockId - UserTypeBlock BlockInstance ID to check for
 * @returns True if event shape has this attendee, false otherwise
 */
export function hasAttendee(
  eventShape: EventShapeEntity,
  userTypeBlockId: GlobalEntityId
): boolean {
  if (!eventShape.attendees || !Array.isArray(eventShape.attendees)) {
    return false
  }
  return eventShape.attendees.includes(userTypeBlockId)
}

/**
 * Find event shape with agent attendee
 * LEARNING: Finds the first event shape that has an agent UserTypeBlock in its attendees
 * WHY: Used to identify which event represents agent time (for future use)
 * PATTERN: Filter event shapes by attendee presence
 * 
 * @param eventShapes - Array of EventShapeEntity to search
 * @param agentUserTypeBlockIds - Array of agent UserTypeBlock BlockInstance IDs
 * @returns EventShapeEntity with agent attendee, or null if not found
 */
export function getAgentEventShape(
  eventShapes: EventShapeEntity[],
  agentUserTypeBlockIds: GlobalEntityId[]
): EventShapeEntity | null {
  if (agentUserTypeBlockIds.length === 0) {
    return null
  }
  
  return eventShapes.find(eventShape => 
    agentUserTypeBlockIds.some(id => hasAttendee(eventShape, id))
  ) || null
}

export function getAllUserTypeBlockIds(globalData: GlobalData): GlobalEntityId[] {
  const blockShapes = (globalData.entities.blockShape || []) as BlockShapeEntity[]
  const stateControlBlockShapes = blockShapes.filter(bs => bs.isStateControl === true)
  const stateControlBlockShapeIds = new Set(stateControlBlockShapes.map(bs => bs.id))
  
  const blockInstances = (globalData.entities.blockInstance || []) as BlockInstanceEntity[]
  const stateControlBlockInstances = blockInstances.filter(
    instance => 
      stateControlBlockShapeIds.has(instance.blockShapeRef)
  )
  
  return stateControlBlockInstances.map(instance => instance.id)
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
 * WHY: Used to identify which event represents minor perspective (replaces hardcoded "ClientPresent"/"client" check)
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
