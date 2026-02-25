import type { UseMutationReturnType } from '@tanstack/vue-query'
import type { UpdateByIdPayload } from '@/composables/businessDataCollections/types'

export interface DataCollectionCrudConfig<
  CollectionItem extends { id: string },
  DataType
> {
  endpoints: {
    listEndpoint: () => string
    byIdEndpoint: (id: string) => string
  }
  selectCollection: (data: DataType) => CollectionItem[] | readonly CollectionItem[] | undefined
  updateCollection: (data: DataType, collection: CollectionItem[] | readonly CollectionItem[]) => DataType
  [key: string]: unknown
}

export interface UseDataCollectionActionsReturn<
  CollectionItem extends { id: string },
  CreatePayload,
  UpdatePayload
> {
  create: UseMutationReturnType<CollectionItem, unknown, CreatePayload, unknown>
  update: UseMutationReturnType<CollectionItem, unknown, UpdateByIdPayload<UpdatePayload>, unknown>
  patch: UseMutationReturnType<CollectionItem, unknown, UpdateByIdPayload<UpdatePayload>, unknown>
  remove: UseMutationReturnType<void, unknown, string, unknown>
}
