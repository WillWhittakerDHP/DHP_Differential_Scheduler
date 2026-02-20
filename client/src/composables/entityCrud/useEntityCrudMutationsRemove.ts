/**
 * Remove mutation factory for useEntityCrudMutations.
 * WHY: Isolates remove mutation logic to reduce main file size and function complexity.
 */

import type { UseMutationOptions } from '@tanstack/vue-query'
import apiClient, { getEntityByIdEndpoint } from '@/utils/api'
import type { GlobalEntityId } from '@shared/types/primitiveBrands'
import type { GlobalEntityKey } from '@/constants/entities'
import type { GlobalData } from '@/utils/transformers/fetchToGlobalTransformer'
import type { EntityCrudMutationContext } from './useEntityCrudTypes'

export function createRemoveMutationOptions<GlobalEntityTypeKey extends GlobalEntityKey>(
  context: EntityCrudMutationContext<GlobalEntityTypeKey>
): UseMutationOptions<
  { deletedId: string },
  unknown,
  GlobalEntityId,
  { previousData?: GlobalData }
> {
  const { queryClient, entityKey, logger, getEntitiesForKey } = context

  return {
    mutationFn: async (id: GlobalEntityId) => {
      const deleteEndpoint = getEntityByIdEndpoint(entityKey, id)
      const response = await apiClient.delete(deleteEndpoint)
      if (response.status < 200 || response.status >= 300) {
        const errorMessage = `Delete operation failed for ${entityKey}`
        logger.error(errorMessage, { endpoint: deleteEndpoint, entityId: id, status: response.status })
        throw new Error(errorMessage)
      }
      return { deletedId: id }
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['globalData'] })
      const previousData = queryClient.getQueryData<GlobalData>(['globalData'])
      queryClient.setQueryData<GlobalData>(['globalData'], (old) => {
        if (!old) return old
        const currentEntities = getEntitiesForKey(old)
        const updatedEntities = currentEntities.filter((entity) => entity.id !== id)
        return {
          ...old,
          entities: {
            ...old.entities,
            [entityKey]: updatedEntities,
          },
        }
      })
      return { previousData }
    },
    onError: (error: unknown, _variables: GlobalEntityId, context: { previousData?: GlobalData } | undefined) => {
      logger.error(`Failed to remove ${entityKey}:`, {
        error: error instanceof Error ? error.message : String(error),
        entityId: _variables,
      })
      if (context?.previousData) {
        queryClient.setQueryData(['globalData'], context.previousData)
      }
    },
  }
}
