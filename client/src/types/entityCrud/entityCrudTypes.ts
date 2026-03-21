import type { QueryClient } from '@tanstack/vue-query'
import type { GlobalEntityId } from '@shared/types/primitiveBrands'
import type { GlobalEntity } from '@/types/entities'
import type { GlobalEntityKey } from '@/constants/entities'
import type { Logger } from '@/utils/logger'
import type { GlobalData } from '@/utils/transformers/fetchToGlobalTransformer'
import type { UseEntityCrudStateReturnBase } from '@/types/entityCrud/entityCrudState'

export type { UseEntityCrudStateReturnBase } from '@/types/entityCrud/entityCrudState'

/** Context passed to entity CRUD mutation factories (create/update/remove/order). */
export interface EntityCrudMutationContext<GlobalEntityTypeKey extends GlobalEntityKey> {
  queryClient: QueryClient
  entityKey: GlobalEntityTypeKey
  logger: Logger
  getEntitiesForKey: (data: GlobalData | undefined) => GlobalEntity<GlobalEntityTypeKey>[]
}

export type OrderIndexUpdate = Array<{ id: GlobalEntityId; orderIndex: number }>

export type BulkUpdate<GlobalEntityTypeKey extends GlobalEntityKey> = Array<{
  id: GlobalEntityId
} & Partial<GlobalEntity<GlobalEntityTypeKey>>>

/** Mutations subset shared by entity CRUD composables (P2 type-similarity). */
export interface UseEntityCrudMutationsReturnBase<GlobalEntityTypeKey extends GlobalEntityKey> {
  create: (entity: Partial<GlobalEntity<GlobalEntityTypeKey>>) => Promise<GlobalEntity<GlobalEntityTypeKey>>
  update: (entity: Partial<GlobalEntity<GlobalEntityTypeKey>>, id: GlobalEntityId) => Promise<unknown>
  remove: (id: GlobalEntityId) => Promise<{ deletedId: string }>
  patchOrderIndex: (updates: OrderIndexUpdate) => Promise<void>
  patchBulk: (updates: BulkUpdate<GlobalEntityTypeKey>) => Promise<void>
  updateMutation: {
    mutateAsync: (args: { entity: Partial<GlobalEntity<GlobalEntityTypeKey>>; id: GlobalEntityId }) => Promise<unknown>
  }
}

export type UseEntityCrudActionsReturn<GlobalEntityTypeKey extends GlobalEntityKey> =
  UseEntityCrudStateReturnBase & UseEntityCrudMutationsReturnBase<GlobalEntityTypeKey>
