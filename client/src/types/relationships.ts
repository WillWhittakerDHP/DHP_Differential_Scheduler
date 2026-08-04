
import type { GlobalEntityId } from '@shared/types/primitiveBrands'
import type { GlobalEntity } from './entities'
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
  /** Annotation assignment ordering from API (when present). */
  orderIndex?: number
  /**
   * For `annotationAssignments` only: optional user-type block instance on the assignment row
   * (`null` = all user types). Omitted for other relationship kinds.
   */
  userTypeBlockInstanceId?: GlobalEntityId | null
  partShapeId?: string | null
  blockShapeId?: string | null
  /**
   * For `accumulationLinks` only: which property fact gates this edge
   * (empty → never include). Omitted for other relationship kinds.
   */
  propertyFactKey?: string
}

/**
 * PATTERN: Global relationship structure (frontend format)
PATTERN: Transformed fro...
 */
export type GlobalRelationship<
  P extends GlobalEntityKey = GlobalEntityKey,
  C extends GlobalEntityKey = GlobalEntityKey
> = {
  relationshipKind: GlobalRelationshipKey
  parent: GlobalEntity<P>
  children: GlobalEntity<C>[]
  /** Per-edge fact key when relationshipKind is accumulationLinks (one child per row). */
  propertyFactKey?: string
}

export interface CreateRelationshipPayloadBase {
  parentId: GlobalEntityId
  childId: GlobalEntityId
  propertyFactKey?: string
}

export type CreateRelationshipPayload = CreateRelationshipPayloadBase