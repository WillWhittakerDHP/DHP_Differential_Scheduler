/**
 * LEARNING: Generic data collection actions composable
 * WHY: Collection action mutations are duplicated across businessDataCollections and globalDataCollections
 * PATTERN: Extract shared mutation logic into generic composable
 * 
 * Used by:
 * - useBusinessDataCollectionActions.ts
 * - useGlobalDataCollectionActions.ts
 */

import { useMutation, useQueryClient } from '@tanstack/vue-query'
import type { UseMutationReturnType } from '@tanstack/vue-query'
import apiClient from '@/utils/api'
import { appendIfMissingById } from '@/utils/collections/appendIfMissingById'
import type { UpdateByIdPayload } from '../businessDataCollections/types'
import { createRefetchQueriesHandler } from '../entityCrud/useSharedMutationHandlers'

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

/**
 * LEARNING: Generic mutation factory for data collection CRUD operations
 * WHY: Provides consistent mutation behavior across different data collection types
 * PATTERN: Accepts query key and data type as parameters for flexibility
 */
export function useDataCollectionActions<
  CollectionItem extends { id: string },
  CreatePayload,
  UpdatePayload,
  DataType
>(
  config: DataCollectionCrudConfig<CollectionItem, DataType>,
  queryKey: readonly unknown[],
  enableOptimisticUpdates: boolean = true
): {
  create: UseMutationReturnType<CollectionItem, unknown, CreatePayload, unknown>
  update: UseMutationReturnType<CollectionItem, unknown, UpdateByIdPayload<UpdatePayload>, unknown>
  patch: UseMutationReturnType<CollectionItem, unknown, UpdateByIdPayload<UpdatePayload>, unknown>
  remove: UseMutationReturnType<void, unknown, string, unknown>
} {
  const queryClient = useQueryClient()
  
  // WHY: Eliminates duplication of common refetch pattern
  // PATTERN: Extract shared handler to utility function
  const refetchQuery = createRefetchQueriesHandler(queryClient, [queryKey] as readonly (readonly unknown[])[])

  const create = useMutation<CollectionItem, unknown, CreatePayload, unknown>({
    mutationFn: async (payload: CreatePayload): Promise<CollectionItem> => {
      const response = await apiClient.post<CollectionItem>(config.endpoints.listEndpoint(), payload)
      return response.data
    },
    onSuccess: async (createdItem: CollectionItem) => {
      if (enableOptimisticUpdates && createdItem?.id) {
        const currentData = queryClient.getQueryData<DataType>(queryKey)
        if (currentData) {
          const currentCollection = config.selectCollection(currentData) ?? []
          const updatedCollection = appendIfMissingById(currentCollection, createdItem)
          const updatedData = config.updateCollection(currentData, updatedCollection)
          queryClient.setQueryData<DataType>(queryKey, updatedData)
        }
      }

      await refetchQuery()
    },
  })

  const update = useMutation<CollectionItem, unknown, UpdateByIdPayload<UpdatePayload>, unknown>({
    mutationFn: async (payload: UpdateByIdPayload<UpdatePayload>): Promise<CollectionItem> => {
      const response = await apiClient.put<CollectionItem>(
        config.endpoints.byIdEndpoint(payload.id),
        payload.data
      )
      return response.data
    },
    onSuccess: async (updatedItem: CollectionItem) => {
      if (enableOptimisticUpdates && updatedItem?.id) {
        const currentData = queryClient.getQueryData<DataType>(queryKey)
        if (currentData) {
          const currentCollection = config.selectCollection(currentData) ?? []
          const updatedCollection = currentCollection.map(item =>
            item.id === updatedItem.id ? updatedItem : item
          )
          const updatedData = config.updateCollection(currentData, updatedCollection)
          queryClient.setQueryData<DataType>(queryKey, updatedData)
        }
      }

      await refetchQuery()
    },
  })

  const patch = useMutation<CollectionItem, unknown, UpdateByIdPayload<UpdatePayload>, unknown>({
    mutationFn: async (payload: UpdateByIdPayload<UpdatePayload>): Promise<CollectionItem> => {
      const response = await apiClient.patch<CollectionItem>(
        config.endpoints.byIdEndpoint(payload.id),
        payload.data
      )
      return response.data
    },
    onSuccess: async (patchedItem: CollectionItem) => {
      if (enableOptimisticUpdates && patchedItem?.id) {
        const currentData = queryClient.getQueryData<DataType>(queryKey)
        if (currentData) {
          const currentCollection = config.selectCollection(currentData) ?? []
          const updatedCollection = currentCollection.map(item =>
            item.id === patchedItem.id ? patchedItem : item
          )
          const updatedData = config.updateCollection(currentData, updatedCollection)
          queryClient.setQueryData<DataType>(queryKey, updatedData)
        }
      }

      await refetchQuery()
    },
  })

  const remove = useMutation<void, unknown, string, unknown>({
    mutationFn: async (id: string): Promise<void> => {
      await apiClient.delete(config.endpoints.byIdEndpoint(id))
    },
    onSuccess: async (_result, deletedId) => {
      if (enableOptimisticUpdates) {
        const currentData = queryClient.getQueryData<DataType>(queryKey)
        if (currentData) {
          const currentCollection = config.selectCollection(currentData) ?? []
          const updatedCollection = currentCollection.filter(item => item.id !== deletedId)
          const updatedData = config.updateCollection(currentData, updatedCollection)
          queryClient.setQueryData<DataType>(queryKey, updatedData)
        }
      }

      await refetchQuery()
    },
  })

  return {
    create,
    update,
    patch,
    remove,
  }
}
