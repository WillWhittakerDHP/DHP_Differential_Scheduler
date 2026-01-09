import type { ComputedRef } from 'vue'
import type { GlobalData } from '@/utils/transformers/fetchToGlobalTransformer'
import type { UseMutationReturnType } from '@tanstack/vue-query'

export type GlobalDataCollectionQueryResult<CollectionItem> = {
  data: ComputedRef<CollectionItem[]>
  isLoading: ComputedRef<boolean>
  error: ComputedRef<unknown | undefined>
}

export type GlobalDataCollectionByIdQueryResult<CollectionItem> = {
  data: ComputedRef<CollectionItem | undefined>
  isLoading: ComputedRef<boolean>
  error: ComputedRef<unknown | undefined>
}

export type GlobalDataCollectionSelector<CollectionItem> = (
  globalData: GlobalData
) => readonly CollectionItem[] | undefined

export type GlobalDataCollectionUpdater<CollectionItem> = (
  globalData: GlobalData,
  updatedCollection: readonly CollectionItem[]
) => GlobalData

export type GlobalDataCollectionEndpoints = {
  listEndpoint: () => string
  byIdEndpoint: (id: string) => string
}

export type GlobalDataCollectionCrudConfig<CollectionItem extends { id: string }> = {
  collectionName: string
  selectCollection: GlobalDataCollectionSelector<CollectionItem>
  updateCollection: GlobalDataCollectionUpdater<CollectionItem>
  endpoints: GlobalDataCollectionEndpoints
}

export type UpdateByIdPayload<UpdatePayload> = {
  id: string
  data: UpdatePayload
}

export type GlobalDataCollectionCrudComposableReturn<
  CollectionItem extends { id: string },
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
   * Optional domain helper hook point.
   * LEARNING: Some domain composables add extra helpers (e.g. `fetchRandom`).
   */
  extras?: Record<string, unknown>
}


