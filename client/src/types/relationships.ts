
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
  userTypeBlockBlockInstanceId?: GlobalEntityId | null  // For annotationAssignments user type override
  partShapeId?: string | null  // For eventAssignments - which partShape uses this event
  blockShapeId?: string | null  // For eventAssignments - which blockShape uses this event
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
}

export interface CreateRelationshipPayloadBase {
  parentId: GlobalEntityId
  childId: GlobalEntityId
}

export type CreateRelationshipPayload = CreateRelationshipPayloadBase

