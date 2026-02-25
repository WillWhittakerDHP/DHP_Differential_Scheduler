import type { Ref, ComputedRef } from 'vue'
import type { GlobalEntity } from '@/types/entities'
import type { GlobalEntityKey } from '@/constants/entities'
import type { OrderIndexUpdate } from '@/composables/entityCrud/useEntityCrudTypes'

export type PatchOrderIndex = (updates: OrderIndexUpdate) => Promise<void>

export interface UseEntityDragHandlersParams<EntityKey extends GlobalEntityKey> {
  entityIds: Ref<string[]>
  entityList: Ref<GlobalEntity<EntityKey>[]>
  filteredEntities: ComputedRef<GlobalEntity<EntityKey>[]>
  patchOrderIndex: PatchOrderIndex
}

export interface UseEntityDragHandlersReturn {
  handleDragEnd: () => Promise<void>
  syncArrays: () => void
}
