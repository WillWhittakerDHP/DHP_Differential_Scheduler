/**
 * Business Data Collection Types
 * 
 * 
 * Session 1.4.7: Created as part of data flow consolidation
 */

import type { UseMutationReturnType } from '@tanstack/vue-query'
import type { BusinessData } from '@/utils/transformers/fetchToBusinessTransformer'
import type {
  CollectionQueryResult,
  CollectionByIdQueryResult,
  CollectionEndpoints,
  UpdateByIdPayload,
  WithId
} from '@/composables/useCollectionTypes'
export type BusinessDataCollectionQueryResult<CollectionItem> = CollectionQueryResult<CollectionItem>
export type BusinessDataCollectionByIdQueryResult<CollectionItem> = CollectionByIdQueryResult<CollectionItem>

export type BusinessDataCollectionSelector<CollectionItem> = (
  businessData: BusinessData
) => readonly CollectionItem[] | undefined

export type BusinessDataCollectionUpdater<CollectionItem> = (
  businessData: BusinessData,
  updatedCollection: readonly CollectionItem[]
) => BusinessData

export type BusinessDataCollectionEndpoints = CollectionEndpoints

export type BusinessDataCollectionCrudConfig<CollectionItem extends WithId> = {
  collectionName: keyof BusinessData
  selectCollection: BusinessDataCollectionSelector<CollectionItem>
  updateCollection: BusinessDataCollectionUpdater<CollectionItem>
  endpoints: BusinessDataCollectionEndpoints
  patchOptimistically?: (current: CollectionItem, patch: Partial<unknown>) => CollectionItem
} & { readonly __brand?: 'BusinessDataCollectionCrudConfig' }

export type { UpdateByIdPayload }

export type BusinessDataCollectionCrudComposableReturn<
  CollectionItem extends WithId,
  CreatePayload = unknown,
  UpdatePayload = unknown
> = {
  create: UseMutationReturnType<CollectionItem, unknown, CreatePayload, unknown>
  update: UseMutationReturnType<CollectionItem, unknown, UpdateByIdPayload<UpdatePayload>, unknown>
  patch: UseMutationReturnType<CollectionItem, unknown, UpdateByIdPayload<UpdatePayload>, unknown>
  remove: UseMutationReturnType<void, unknown, string, unknown>
  fetchAll: BusinessDataCollectionQueryResult<CollectionItem>
  fetchById: (id: string) => BusinessDataCollectionByIdQueryResult<CollectionItem>
  /**
Optional domain helper hook point
   */
  extras?: Record<string, unknown>
} & { readonly __brand?: 'BusinessDataCollectionCrudComposableReturn' }

