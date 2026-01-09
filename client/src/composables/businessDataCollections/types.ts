/**
 * Business Data Collection Types
 * 
 * LEARNING: Type definitions for business data collection CRUD operations
 * WHY: Type safety for business entity (appointment, property, user) operations
 * PATTERN: Mirrors globalDataCollections/types.ts structure
 * 
 * Session 1.4.9: Created as part of data flow consolidation
 */

import type { ComputedRef } from 'vue'
import type { UseMutationReturnType } from '@tanstack/vue-query'
import type { BusinessData } from '@/utils/transformers/fetchToBusinessTransformer'

/**
 * Query result for fetching all items in a collection
 */
export type BusinessDataCollectionQueryResult<CollectionItem> = {
  data: ComputedRef<CollectionItem[]>
  isLoading: ComputedRef<boolean>
  error: ComputedRef<unknown | undefined>
}

/**
 * Query result for fetching a single item by ID
 */
export type BusinessDataCollectionByIdQueryResult<CollectionItem> = {
  data: ComputedRef<CollectionItem | undefined>
  isLoading: ComputedRef<boolean>
  error: ComputedRef<unknown | undefined>
}

/**
 * Function type for selecting a collection from BusinessData
 */
export type BusinessDataCollectionSelector<CollectionItem> = (
  businessData: BusinessData
) => readonly CollectionItem[] | undefined

/**
 * Function type for updating a collection in BusinessData
 */
export type BusinessDataCollectionUpdater<CollectionItem> = (
  businessData: BusinessData,
  updatedCollection: readonly CollectionItem[]
) => BusinessData

/**
 * Endpoint configuration for collection CRUD operations
 */
export type BusinessDataCollectionEndpoints = {
  listEndpoint: () => string
  byIdEndpoint: (id: string) => string
}

/**
 * Configuration for business data collection CRUD
 */
export type BusinessDataCollectionCrudConfig<CollectionItem extends { id: string }> = {
  collectionName: keyof BusinessData
  selectCollection: BusinessDataCollectionSelector<CollectionItem>
  updateCollection: BusinessDataCollectionUpdater<CollectionItem>
  endpoints: BusinessDataCollectionEndpoints
  /**
   * Optional function to apply patch optimistically before refetch
   * LEARNING: Some collections need custom patch logic (e.g., property with complex fields)
   * WHY: Allows immediate UI feedback for partial updates
   */
  patchOptimistically?: (current: CollectionItem, patch: Partial<unknown>) => CollectionItem
}

/**
 * Payload type for update/patch by ID operations
 */
export type UpdateByIdPayload<UpdatePayload> = {
  id: string
  data: UpdatePayload
}

/**
 * Full return type for business data collection CRUD composable
 */
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

