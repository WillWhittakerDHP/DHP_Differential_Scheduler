import type { GlobalData } from '@/utils/transformers/fetchToGlobalTransformer'
import type { UseMutationReturnType } from '@tanstack/vue-query'
import type {
  CollectionQueryResult,
  CollectionByIdQueryResult,
  CollectionEndpoints,
  UpdateByIdPayload,
  WithId
} from '@/composables/useCollectionTypes'
export type GlobalDataCollectionQueryResult<CollectionItem> = CollectionQueryResult<CollectionItem>
export type GlobalDataCollectionByIdQueryResult<CollectionItem> = CollectionByIdQueryResult<CollectionItem>

export type GlobalDataCollectionSelector<CollectionItem> = (
  globalData: GlobalData
) => readonly CollectionItem[] | undefined

export type GlobalDataCollectionUpdater<CollectionItem> = (
  globalData: GlobalData,
  updatedCollection: readonly CollectionItem[]
) => GlobalData

export type GlobalDataCollectionEndpoints = CollectionEndpoints

export type GlobalDataCollectionCrudConfig<CollectionItem extends WithId> = {
  collectionName: string
  selectCollection: GlobalDataCollectionSelector<CollectionItem>
  updateCollection: GlobalDataCollectionUpdater<CollectionItem>
  endpoints: GlobalDataCollectionEndpoints
} & { readonly __brand?: 'GlobalDataCollectionCrudConfig' }

export type { UpdateByIdPayload }

export type GlobalDataCollectionCrudComposableReturn<
  CollectionItem extends WithId,
  CreatePayload = unknown,
  UpdatePayload = unknown
> = {
  create: UseMutationReturnType<CollectionItem, unknown, CreatePayload, unknown>
  update: UseMutationReturnType<CollectionItem, unknown, UpdateByIdPayload<UpdatePayload>, unknown>
  patch: UseMutationReturnType<CollectionItem, unknown, UpdateByIdPayload<UpdatePayload>, unknown>
  remove: UseMutationReturnType<void, unknown, string, unknown>
  fetchAll: GlobalDataCollectionQueryResult<CollectionItem>
  fetchById: (id: string) => GlobalDataCollectionByIdQueryResult<CollectionItem>
  /**
Optional domain helper hook point
   */
  extras?: Record<string, unknown>
} & { readonly __brand?: 'GlobalDataCollectionCrudComposableReturn' }


