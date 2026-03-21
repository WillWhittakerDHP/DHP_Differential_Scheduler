/**
 * Order-index patch mutation factory for entity CRUD.
 * WHY: Isolates patch order mutation logic to reduce main file size and function complexity.
 */

import type { UseMutationOptions } from '@tanstack/vue-query'
import apiClient, { getOrderIndexEndpoint } from '@/utils/api'
import type { GlobalEntityKey } from '@/constants/entities'
import type { GlobalData } from '@/utils/transformers/fetchToGlobalTransformer'
import type { EntityCrudMutationContext, OrderIndexUpdate } from '@/types/entityCrud/entityCrudTypes'

export function createEntityOrderMutationOptions<GlobalEntityTypeKey extends GlobalEntityKey>(
  context: EntityCrudMutationContext<GlobalEntityTypeKey>
): UseMutationOptions<void, unknown, OrderIndexUpdate, { previousData?: GlobalData }> {
  const { queryClient, entityKey, logger, getEntitiesForKey } = context

  return {
    mutationFn: async (updates: OrderIndexUpdate) => {
      const response = await apiClient.patch(getOrderIndexEndpoint(entityKey), updates)
      if (!response?.data) {
        throw new Error('Failed to update orderIndex')
      }
    },
    onMutate: async (updates) => {
      await queryClient.cancelQueries({ queryKey: ['globalData'] })
      const previousData = queryClient.getQueryData<GlobalData>(['globalData'])
      queryClient.setQueryData<GlobalData>(['globalData'], (old) => {
        if (!old) return old
        const currentEntities = getEntitiesForKey(old)
        const updateMap = new Map(updates.map((update) => [update.id, update.orderIndex]))
        const updatedEntities = currentEntities.map((entity) => {
          const newOrder = updateMap.get(entity.id)
          let orderIndex: number
          if (newOrder !== undefined) {
            orderIndex = newOrder
          } else if (entity.orderIndex !== undefined && entity.orderIndex !== null) {
            orderIndex = entity.orderIndex
          } else {
            logger.debug('Entity crud: orderIndex missing when patching order', { entityKey, entityId: entity.id })
            orderIndex = 0
          }
          return {
            ...entity,
            orderIndex,
          }
        })
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
    onError: (error: unknown, _variables: OrderIndexUpdate, context: { previousData?: GlobalData } | undefined) => {
      logger.error(`Failed to update orderIndex for ${entityKey}:`, {
        error: error instanceof Error ? error.message : String(error),
        updates: _variables,
      })
      if (context?.previousData) {
        queryClient.setQueryData(['globalData'], context.previousData)
      }
    },
  }
}
