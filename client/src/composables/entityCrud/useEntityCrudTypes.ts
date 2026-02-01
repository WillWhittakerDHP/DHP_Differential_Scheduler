import type { ComputedRef } from 'vue'
import type { GlobalEntityId, GlobalEntity } from '@/types/entities'
import type { GlobalEntityKey } from '@/constants/entities'

export type OrderIndexUpdate = Array<{ id: GlobalEntityId; orderIndex: number }>

export type BulkUpdate<GlobalEntityTypeKey extends GlobalEntityKey> = Array<{ 
  id: GlobalEntityId 
} & Partial<GlobalEntity<GlobalEntityTypeKey>>>

export type UseEntityCrudActionsReturn<GlobalEntityTypeKey extends GlobalEntityKey> = {
  isLoading: ComputedRef<boolean>
  error: ComputedRef<unknown | undefined>
  refetch: () => Promise<void>

  create: (entity: Partial<GlobalEntity<GlobalEntityTypeKey>>) => Promise<GlobalEntity<GlobalEntityTypeKey>>
  update: (entity: Partial<GlobalEntity<GlobalEntityTypeKey>>, id: GlobalEntityId) => Promise<unknown>
  remove: (id: GlobalEntityId) => Promise<{ deletedId: string }>
  patchOrderIndex: (updates: OrderIndexUpdate) => Promise<void>
  patchBulk: (updates: BulkUpdate<GlobalEntityTypeKey>) => Promise<void>

  updateMutation: {
    mutateAsync: (args: { entity: Partial<GlobalEntity<GlobalEntityTypeKey>>; id: GlobalEntityId }) => Promise<unknown>
  }
}
