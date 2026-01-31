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

/**
 * Fetched relationship structure from API
 * LEARNING: Matches backend API response format
 * WHY: Type-safe API response handling
 * PATTERN: Type matches API response structure exactly
 * 
 * ARCHITECTURAL CHANGE: Metadata removed from relationships - now stored in shape tables
 * WHY: Shape columns are always metadata - relationships just indicate which shapes are active
 * PATTERN: Relationships only contain foreign keys and relationship-specific fields
 * NOTE: Metadata (ternaryValue, orderIndex, isDefault) is stored in event_shapes/annotation_shapes tables
 *      - partShapeId/blockShapeId: Used by eventAssignments to indicate which shape uses the event (relationship-specific)
 *      - userTypeBlockBlockInstanceId: Used by annotationAssignments for user type override (relationship-specific)
 */
export interface FetchedRelationship<
  P extends GlobalEntityKey = GlobalEntityKey,
  C extends GlobalEntityKey = GlobalEntityKey
> {
  id: GlobalEntityId
  kind: GlobalRelationshipKey
  parent_kind: P
  child_kind: C
  parent_id: GlobalEntityId
  child_id: GlobalEntityId
  disabled: boolean
  // Relationship-specific fields (not metadata - metadata is in shape tables)
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
  parent_id: GlobalEntityId
  child_id: GlobalEntityId
}

