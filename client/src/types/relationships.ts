/**
 * Relationship Types
 * 
 * LEARNING: Type definitions for entity relationships
 * WHY: Type-safe relationship structures
 * PATTERN: Types derived from relationship constants
 */

import type { GlobalEntity, GlobalEntityId } from './entities'
import { GlobalEntityKey } from '@/constants/entities'
import type { GlobalRelationshipKey } from '../constants/relationships'

export interface FetchedRelationship<
  P extends GlobalEntityKey = GlobalEntityKey,
  C extends GlobalEntityKey = GlobalEntityKey
> {
  id: GlobalEntityId
  kind: GlobalRelationshipKey
  parentKind: P
  childKind: C
  parentId: GlobalEntityId
  childId: GlobalEntityId
  disabled: boolean
  userTypeBlockBlockInstanceId?: GlobalEntityId | null  // For annotationAssignments user type override
  partShapeId?: string | null  // For eventAssignments - which partShape uses this event
  blockShapeId?: string | null  // For eventAssignments - which blockShape uses this event
}

/**
 * Global relationship structure (frontend format)
 * LEARNING: Groups relationships by parent with children array
 * WHY: Easier to work with in UI (parent -> children[])
 * PATTERN: Transformed from flat API format to grouped format
 */
export type GlobalRelationship<
  P extends GlobalEntityKey = GlobalEntityKey,
  C extends GlobalEntityKey = GlobalEntityKey
> = {
  relationshipKind: GlobalRelationshipKey
  parent: GlobalEntity<P>
  children: GlobalEntity<C>[]
}

/**
 * Relationship creation payload
 * LEARNING: Payload for creating new relationships
 * WHY: Type-safe relationship creation
 * PATTERN: Simple object with parent and child IDs
 */
export interface CreateRelationshipPayload {
  parentId: GlobalEntityId
  childId: GlobalEntityId
}

