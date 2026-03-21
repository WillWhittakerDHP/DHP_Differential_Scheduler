import type { UseMutationOptions } from '@tanstack/vue-query'
import apiClient, { getEntityByIdEndpoint } from '@/utils/api'
import type { GlobalEntityId } from '@shared/types/primitiveBrands'
import type { GlobalEntity } from '@/types/entities'
import type { GlobalEntityKey } from '@/constants/entities'
import { globalTransformer, type GlobalData } from '@/utils/transformers/fetchToGlobalTransformer'
import { transformApiEntity } from '@/utils/transformers/entityTransformers'
import { isDevModeEnabled } from '@/utils/env/devMode'
import type { EntityCrudMutationContext } from '@/types/entityCrud/entityCrudTypes'

export function createEntityUpdateMutationOptions<GlobalEntityTypeKey extends GlobalEntityKey>(
  context: EntityCrudMutationContext<GlobalEntityTypeKey>
): UseMutationOptions<
  GlobalEntity<GlobalEntityTypeKey>,
  unknown,
  { entity: Partial<GlobalEntity<GlobalEntityTypeKey>>; id: GlobalEntityId },
  { previousData?: GlobalData }
> {
  const { queryClient, entityKey, logger, getEntitiesForKey } = context

  return {
    mutationFn: async ({
      entity,
      id,
    }: {
      entity: Partial<GlobalEntity<GlobalEntityTypeKey>>
      id: GlobalEntityId
    }) => {
      const updateEndpoint = getEntityByIdEndpoint(entityKey, id)
      const rawEntity: Partial<GlobalEntity<GlobalEntityTypeKey>> & { entityKey: GlobalEntityTypeKey } = {
        ...entity,
        entityKey,
      }
      const backendPayload = globalTransformer.dehydrateEntity(rawEntity)
      const response = await apiClient.put<Record<string, unknown>>(updateEndpoint, backendPayload)
      if (!response.data) {
        const errorMessage = `API response missing data for ${entityKey} update`
        logger.error(errorMessage, { endpoint: updateEndpoint, payload: backendPayload, entityId: id })
        throw new Error(errorMessage)
      }
      const hydrated = transformApiEntity(response.data, entityKey)
      return { ...hydrated, id }
    },
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: ['globalData'] })
      const previousData = queryClient.getQueryData<GlobalData>(['globalData'])
      queryClient.setQueryData<GlobalData>(['globalData'], (old) => {
        if (!old) return old
        const currentEntities = getEntitiesForKey(old)
        const entityIndex = currentEntities.findIndex((e) => e.id === variables.id)
        if (entityIndex === -1) {
          if (isDevModeEnabled()) {
            logger.warn(`[useEntityCrudActions] Entity ${variables.id} not found in ${entityKey} cache for update`)
          }
          return old
        }
        const updatedEntities = [...currentEntities]
        updatedEntities[entityIndex] = {
          ...currentEntities[entityIndex],
          ...variables.entity,
          id: variables.id,
        } as GlobalEntity<GlobalEntityTypeKey>
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
    onSuccess: (data, variables) => {
      if (!data?.id) return
      queryClient.setQueryData<GlobalData>(['globalData'], (old) => {
        if (!old) return old
        const currentEntities = getEntitiesForKey(old)
        const entityIndex = currentEntities.findIndex((e) => e.id === data.id)
        if (entityIndex === -1) return old
        const updatedEntities = [...currentEntities]
        updatedEntities[entityIndex] = {
          ...currentEntities[entityIndex],
          ...variables.entity,
          ...data,
          id: data.id,
        } as GlobalEntity<GlobalEntityTypeKey>
        return {
          ...old,
          entities: {
            ...old.entities,
            [entityKey]: updatedEntities,
          },
        }
      })
      queryClient.invalidateQueries({ queryKey: ['globalData'] })
    },
    onError: (error: unknown, _variables: { entity: Partial<GlobalEntity<GlobalEntityTypeKey>>; id: GlobalEntityId }, context: { previousData?: GlobalData } | undefined) => {
      logger.error(`Failed to update ${entityKey}:`, {
        error: error instanceof Error ? error.message : String(error),
        entityId: _variables.id,
        entity: _variables.entity,
      })
      if (context?.previousData) {
        queryClient.setQueryData(['globalData'], context.previousData)
      }
    },
  }
}
