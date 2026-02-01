/**
 * Business Data Collection Types
 * 
 * LEARNING: Type definitions for business data collection CRUD operations
 * WHY: Type safety for business entity (appointment, property, user) operations
 * PATTERN: Mirrors globalDataCollections/types.ts structure
 * 
 * Session 1.4.7: Created as part of data flow consolidation
 */

import type { ComputedRef } from 'vue'
import type { UseMutationReturnType } from '@tanstack/vue-query'
import type { BusinessData } from '@/utils/transformers/fetchToBusinessTransformer'

export type BusinessDataCollectionQueryResult<CollectionItem> = {
  data: ComputedRef<CollectionItem[]>
  isLoading: ComputedRef<boolean>
  error: ComputedRef<unknown | undefined>
}

export type BusinessDataCollectionByIdQueryResult<CollectionItem> = {
  data: ComputedRef<CollectionItem | undefined>
  isLoading: ComputedRef<boolean>
  error: ComputedRef<unknown | undefined>
}

export type BusinessDataCollectionSelector<CollectionItem> = (
  businessData: BusinessData
) => readonly CollectionItem[] | undefined

export type BusinessDataCollectionUpdater<CollectionItem> = (
  businessData: BusinessData,
  updatedCollection: readonly CollectionItem[]
) => BusinessData

export type BusinessDataCollectionEndpoints = {
  listEndpoint: () => string
  byIdEndpoint: (id: string) => string
}

export type BusinessDataCollectionCrudConfig<CollectionItem extends { id: string }> = {
  collectionName: keyof BusinessData
  selectCollection: BusinessDataCollectionSelector<CollectionItem>
  updateCollection: BusinessDataCollectionUpdater<CollectionItem>
  endpoints: BusinessDataCollectionEndpoints
  patchOptimistically?: (current: CollectionItem, patch: Partial<unknown>) => CollectionItem
}

export type UpdateByIdPayload<UpdatePayload> = {
  id: string
  data: UpdatePayload
}

export type BusinessDataCollectionCrudComposableReturn<
  CollectionItem extends { id: string },
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
   * Optional domain helper hook point.
   * LEARNING: Some domain composables add extra helpers (e.g. `fetchRandom`).
   */
  extras?: Record<string, unknown>
}

