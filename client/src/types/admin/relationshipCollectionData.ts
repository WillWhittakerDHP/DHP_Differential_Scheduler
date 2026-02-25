import type { ComputedRef, Ref } from 'vue'
import type { GlobalEntity } from '@/types/entities'
import type { GlobalEntityKey } from '@/constants/entities'

export interface UseRelationshipCollectionDataOptions {
  parentEntityId: ComputedRef<string> | Ref<string> | string
  parentEntityKey: ComputedRef<GlobalEntityKey> | GlobalEntityKey
  childEntityKey: ComputedRef<GlobalEntityKey> | GlobalEntityKey
  shapeEntityKey: ComputedRef<GlobalEntityKey> | GlobalEntityKey
  relationshipKey: ComputedRef<string> | string
  optionsFieldKey: ComputedRef<string> | string
  parentTypeEntityKey: ComputedRef<GlobalEntityKey> | GlobalEntityKey
  parentTypeRef: ComputedRef<string | null> | Ref<string | null> | string | null
  shapeRefProperty: string
}

export interface UseRelationshipCollectionDataReturnBase {
  validShapes: Ref<GlobalEntity<GlobalEntityKey>[]>
  existingChildren: Ref<GlobalEntity<GlobalEntityKey>[]>
  getChildForShape: (shapeId: string) => GlobalEntity<GlobalEntityKey> | undefined
  getShapeName: (shapeId: string) => string
}

export type UseRelationshipCollectionDataReturn = UseRelationshipCollectionDataReturnBase
