import type { GlobalEntityId } from '@shared/types/primitiveBrands'
import type { GlobalEntityKey } from '@/constants/entities'
import type { GlobalRelationshipKey } from '@/constants/relationships'
import type { GlobalEntity } from '@/types/entities'
import type { GlobalRelationship } from '@/types/relationships'

/** Flat edges for annotation_assignments (preserves per-assignment user type + order; see transformApiRelationships collapse). */
export type AnnotationAssignmentEdge = {
  blockInstanceId: GlobalEntityId
  annotationInstanceId: GlobalEntityId
  userTypeBlockInstanceId: GlobalEntityId | null
  orderIndex: number
}

/** Per-key entity arrays (avoids `Record<K, GlobalEntity<K>[]>` widening every bucket to a union). */
export type GlobalEntitiesByKey = { [GE in GlobalEntityKey]: GlobalEntity<GE>[] }

export type GlobalData = {
  entities: GlobalEntitiesByKey
  relationships: Record<GlobalRelationshipKey, GlobalRelationship[]>
  /** Populated by fetch hydrate; optional for legacy/partial fixtures. */
  annotationAssignmentEdges?: AnnotationAssignmentEdge[]
}
