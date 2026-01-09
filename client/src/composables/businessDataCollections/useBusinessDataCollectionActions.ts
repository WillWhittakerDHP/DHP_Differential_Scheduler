/**
 * Business Data Collection Actions Composable
 * 
 * LEARNING: Mutation factory for BusinessData-backed collections
 * WHY: Uses optimistic updates + refetchQueries for cache consistency
 * PATTERN: Mirrors globalDataCollections/useGlobalDataCollectionActions.ts
 * 
 * Session 1.4.9: Created as part of data flow consolidation
 * ARCHITECTURAL DECISION: Optimistic + refetchQueries pattern
 * - Optimistic: Update cache immediately for instant UI feedback
 * - RefetchQueries: Ensure cache consistency with server
 */

import { useMutation, useQueryClient } from '@tanstack/vue-query'
import type { UseMutationReturnType } from '@tanstack/vue-query'
import apiClient from '@/utils/api'
import type { BusinessData } from '@/utils/transformers/fetchToBusinessTransformer'
import { BUSINESS_DATA_QUERY_KEY } from '@/composables/useBusiness'
import { appendIfMissingById } from '@/utils/collections/appendIfMissingById'
import type { BusinessDataCollectionCrudConfig, UpdateByIdPayload } from './types'

/**
 * Mutation factory for BusinessData-backed collections.
 *
 * LEARNING: These mutations refresh `['businessData']` because all consumers read from that cache.
 * WHY: Keeps cache invalidation consistent and centralizes optimistic "append-on-create" behavior.
 * PATTERN: Optimistic update followed by refetch for consistency
 */
export function useBusinessDataCollectionActions<
  CollectionItem extends { id: string },
  CreatePayload,
  UpdatePayload
>(
  config: BusinessDataCollectionCrudConfig<CollectionItem>
): {
  create: UseMutationReturnType<CollectionItem, unknown, CreatePayload, unknown>
  update: UseMutationReturnType<CollectionItem, unknown, UpdateByIdPayload<UpdatePayload>, unknown>
  patch: UseMutationReturnType<CollectionItem, unknown, UpdateByIdPayload<UpdatePayload>, unknown>
  remove: UseMutationReturnType<void, unknown, string, unknown>
} {
  const queryClient = useQueryClient()

  const create = useMutation<CollectionItem, unknown, CreatePayload, unknown>({
    mutationFn: async (payload: CreatePayload): Promise<CollectionItem> => {
      const response = await apiClient.post<CollectionItem>(config.endpoints.listEndpoint(), payload)
      return response.data
    },
    onSuccess: async (createdItem: CollectionItem) => {
      // Optimistically append so the created item is available immediately
      if (createdItem?.id) {
        const currentBusinessData = queryClient.getQueryData<BusinessData>(BUSINESS_DATA_QUERY_KEY)
        if (currentBusinessData) {
          const currentCollection = config.selectCollection(currentBusinessData) ?? []
          const updatedCollection = appendIfMissingById(currentCollection, createdItem)
          const updatedBusinessData = config.updateCollection(currentBusinessData, updatedCollection)
          queryClient.setQueryData<BusinessData>(BUSINESS_DATA_QUERY_KEY, updatedBusinessData)
        }
      }

      // Refetch for consistency with server
      await queryClient.refetchQueries({ queryKey: BUSINESS_DATA_QUERY_KEY })
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
      // Optimistically update the item in cache
      if (updatedItem?.id) {
        const currentBusinessData = queryClient.getQueryData<BusinessData>(BUSINESS_DATA_QUERY_KEY)
        if (currentBusinessData) {
          const currentCollection = config.selectCollection(currentBusinessData) ?? []
          const updatedCollection = currentCollection.map(item =>
            item.id === updatedItem.id ? updatedItem : item
          )
          const updatedBusinessData = config.updateCollection(currentBusinessData, updatedCollection)
          queryClient.setQueryData<BusinessData>(BUSINESS_DATA_QUERY_KEY, updatedBusinessData)
        }
      }

      await queryClient.refetchQueries({ queryKey: BUSINESS_DATA_QUERY_KEY })
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
      // Optimistically update the item in cache
      if (patchedItem?.id) {
        const currentBusinessData = queryClient.getQueryData<BusinessData>(BUSINESS_DATA_QUERY_KEY)
        if (currentBusinessData) {
          const currentCollection = config.selectCollection(currentBusinessData) ?? []
          const updatedCollection = currentCollection.map(item =>
            item.id === patchedItem.id ? patchedItem : item
          )
          const updatedBusinessData = config.updateCollection(currentBusinessData, updatedCollection)
          queryClient.setQueryData<BusinessData>(BUSINESS_DATA_QUERY_KEY, updatedBusinessData)
        }
      }

      await queryClient.refetchQueries({ queryKey: BUSINESS_DATA_QUERY_KEY })
    },
  })

  const remove = useMutation<void, unknown, string, unknown>({
    mutationFn: async (id: string): Promise<void> => {
      await apiClient.delete(config.endpoints.byIdEndpoint(id))
    },
    onSuccess: async (_result, deletedId) => {
      // Optimistically remove the item from cache
      const currentBusinessData = queryClient.getQueryData<BusinessData>(BUSINESS_DATA_QUERY_KEY)
      if (currentBusinessData) {
        const currentCollection = config.selectCollection(currentBusinessData) ?? []
        const updatedCollection = currentCollection.filter(item => item.id !== deletedId)
        const updatedBusinessData = config.updateCollection(currentBusinessData, updatedCollection)
        queryClient.setQueryData<BusinessData>(BUSINESS_DATA_QUERY_KEY, updatedBusinessData)
      }

      await queryClient.refetchQueries({ queryKey: BUSINESS_DATA_QUERY_KEY })
    },
  })

  return {
    create,
    update,
    patch,
    remove,
  }
}

