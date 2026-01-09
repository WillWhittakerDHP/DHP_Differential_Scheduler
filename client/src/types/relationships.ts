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

