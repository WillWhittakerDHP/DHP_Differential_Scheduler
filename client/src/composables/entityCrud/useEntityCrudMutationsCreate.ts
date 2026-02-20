/**
 * Create mutation factory for useEntityCrudMutations.
 * WHY: Isolates create mutation logic to reduce main file size and function complexity.
 */

import type { UseMutationOptions } from '@tanstack/vue-query'
import apiClient, { getEntityEndpoint } from '@/utils/api'
import type { GlobalEntity } from '@/types/entities'
import type { GlobalEntityKey } from '@/constants/entities'
import { globalTransformer, type GlobalData } from '@/utils/transformers/fetchToGlobalTransformer'
import { transformApiEntity } from '@/utils/transformers/entityTransformers'
import { getDefaultEntityValues } from '@/utils/entityDefaults'
import { isDevModeEnabled } from '@/utils/env/devMode'
import { extractAxiosErrorMessage } from '@/utils/errors/axiosErrorUtils'
import type { EntityCrudMutationContext } from './useEntityCrudTypes'

export function createCreateMutationOptions<GlobalEntityTypeKey extends GlobalEntityKey>(
  context: EntityCrudMutationContext<GlobalEntityTypeKey>
): UseMutationOptions<
  GlobalEntity<GlobalEntityTypeKey>,
  unknown,
  Partial<GlobalEntity<GlobalEntityTypeKey>>,
  { previousData?: GlobalData }
> {
  const { queryClient, entityKey, logger, getEntitiesForKey } = context
  const endpoint = getEntityEndpoint(entityKey)

  return {
    mutationFn: async (entity: Partial<GlobalEntity<GlobalEntityTypeKey>>) => {
      const currentGlobalData = queryClient.getQueryData<GlobalData>(['globalData'])
      const currentEntities = getEntitiesForKey(currentGlobalData)
      const orderIndices = currentEntities.map((e) => {
        const o = e.orderIndex
        if (o === undefined || o === null) {
          logger.debug('Entity crud: orderIndex missing on entity', { entityKey, entityId: e.id })
          return 0
        }
        return o
      })
      const maxOrderIndex = orderIndices.length > 0 ? Math.max(...orderIndices) : -1
      const newOrderIndex = maxOrderIndex + 1

      const defaults = getDefaultEntityValues(entityKey)
      const rawEntity: Partial<GlobalEntity<GlobalEntityTypeKey>> & { entityKey: GlobalEntityTypeKey } = {
        ...defaults,
        ...entity,
        orderIndex: newOrderIndex,
        entityKey,
      }

      const backendPayload = globalTransformer.dehydrateEntity(rawEntity)
      delete backendPayload.id

      if (isDevModeEnabled()) {
        logger.debug(`Creating ${entityKey}:`, {
          payload: backendPayload,
          hasId: 'id' in backendPayload,
        })
      }

      const response = await apiClient.post<GlobalEntity<GlobalEntityTypeKey>>(endpoint, backendPayload)
      if (!response.data) {
        const errorMessage = `API response missing data for ${entityKey} creation`
        logger.error(errorMessage, { endpoint, payload: backendPayload })
        throw new Error(errorMessage)
      }

      return transformApiEntity(response.data as Record<string, unknown>, entityKey)
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['globalData'] })
      const previousData = queryClient.getQueryData<GlobalData>(['globalData'])
      return { previousData }
    },
    onSuccess: (data) => {
      if (!data?.id) {
        logger.error('No data or ID in onSuccess callback:', {
          entityKey,
          hasData: !!data,
          dataId: (data as { id?: unknown } | null | undefined)?.id,
        })
        return
      }
      queryClient.setQueryData<GlobalData>(['globalData'], (old) => {
        if (!old) return old
        const currentEntities = getEntitiesForKey(old) as GlobalEntity<GlobalEntityTypeKey>[]
        if (currentEntities.some((e) => e.id === data.id)) return old
        const updatedEntities = [...currentEntities, data as GlobalEntity<GlobalEntityTypeKey>]
        return {
          ...old,
          entities: { ...old.entities, [entityKey]: updatedEntities },
        }
      })
      queryClient.invalidateQueries({ queryKey: ['globalData'] })
    },
    onError: (error: unknown, _variables: Partial<GlobalEntity<GlobalEntityTypeKey>>, context: { previousData?: GlobalData } | undefined) => {
      const { message: errorMessage, details: errorDetails } = extractAxiosErrorMessage(error)
      logger.error(`Failed to create ${entityKey}:`, {
        error: errorMessage,
        details: errorDetails,
        entity: _variables,
        fullError: error,
      })
      if (context?.previousData) {
        queryClient.setQueryData(['globalData'], context.previousData)
      }
    },
  }
}
