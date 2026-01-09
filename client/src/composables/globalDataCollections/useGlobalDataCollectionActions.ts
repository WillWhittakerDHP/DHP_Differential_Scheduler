import { useMutation, useQueryClient } from '@tanstack/vue-query'
import type { UseMutationReturnType } from '@tanstack/vue-query'
import apiClient from '@/utils/api'
import type { GlobalData } from '@/utils/transformers/fetchToGlobalTransformer'
import { appendIfMissingById } from '@/utils/collections/appendIfMissingById'
import type { GlobalDataCollectionCrudConfig, UpdateByIdPayload } from './types'

/**
 * Mutation factory for GlobalData-backed collections.
 *
 * LEARNING: These mutations refresh `['globalData']` because all consumers read from that cache.
 * WHY: Keeps cache invalidation consistent and centralizes optimistic "append-on-create" behavior.
 */
export function useGlobalDataCollectionActions<
  CollectionItem extends { id: string },
  CreatePayload,
  UpdatePayload
>(
  config: GlobalDataCollectionCrudConfig<CollectionItem>
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
      // Optimistically append so the created item is available immediately (matches existing per-collection behavior)
      if (createdItem?.id) {
        const currentGlobalData = queryClient.getQueryData<GlobalData>(['globalData'])
        if (currentGlobalData) {
          const currentCollection = config.selectCollection(currentGlobalData) ?? []
          const updatedCollection = appendIfMissingById(currentCollection, createdItem)
          const updatedGlobalData = config.updateCollection(currentGlobalData, updatedCollection)
          queryClient.setQueryData<GlobalData>(['globalData'], updatedGlobalData)
        }
      }

      await queryClient.refetchQueries({ queryKey: ['globalData'] })
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
    onSuccess: async () => {
      await queryClient.refetchQueries({ queryKey: ['globalData'] })
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
    onSuccess: async () => {
      await queryClient.refetchQueries({ queryKey: ['globalData'] })
    },
  })

  const remove = useMutation<void, unknown, string, unknown>({
    mutationFn: async (id: string): Promise<void> => {
      await apiClient.delete(config.endpoints.byIdEndpoint(id))
    },
    onSuccess: async () => {
      await queryClient.refetchQueries({ queryKey: ['globalData'] })
    },
  })

  return {
    create,
    update,
    patch,
    remove,
  }
}


