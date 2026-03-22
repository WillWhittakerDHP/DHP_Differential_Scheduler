import { useMutation, useQueryClient } from '@tanstack/vue-query'
import apiClient, { getBulkPatchEndpoint } from '@/utils/api'
import type { GlobalEntity } from '@/types/entities'
import { globalTransformer, type GlobalData } from '@/utils/transformers/fetchToGlobalTransformer'
import type { GlobalEntityKey } from '@/constants/entities'
import type { Logger } from '@/utils/logger'
import type { BulkUpdate, EntityCrudMutationContext, OrderIndexUpdate, UseEntityCrudMutationsReturnBase } from '@/types/entityCrud/entityCrudTypes'
import type { GlobalEntityId } from '@shared/types/primitiveBrands'
import { createEntityCreateMutationOptions } from '@/utils/entityCrud/createEntityCreateMutationOptions'
import { createEntityUpdateMutationOptions } from '@/utils/entityCrud/createEntityUpdateMutationOptions'
import { createEntityRemoveMutationOptions } from '@/utils/entityCrud/createEntityRemoveMutationOptions'
import { createEntityOrderMutationOptions } from '@/utils/entityCrud/createEntityOrderMutationOptions'

type UseEntityCrudMutationsReturn<GlobalEntityTypeKey extends GlobalEntityKey> =
  UseEntityCrudMutationsReturnBase<GlobalEntityTypeKey>

/**
 * Mutations module for `useEntityCrud`.
 * WHY: Isolates mutation orchestration to keep the main composable thin.
 */
export function useEntityCrudMutations<GlobalEntityTypeKey extends GlobalEntityKey>(params: {
  entityKey: GlobalEntityTypeKey
  logger: Logger
}): UseEntityCrudMutationsReturn<GlobalEntityTypeKey> {
  const { entityKey, logger } = params
  const queryClient = useQueryClient()

  function getEntitiesForKey(data: GlobalData | undefined): GlobalEntity<GlobalEntityTypeKey>[] {
    const entities = data?.entities?.[entityKey]
    if (entities === undefined || entities === null) {
      logger.debug('Entity crud: entities key missing in cache', { entityKey })
      return []
    }
    return entities as GlobalEntity<GlobalEntityTypeKey>[]
  }

  const mutationContext: EntityCrudMutationContext<GlobalEntityTypeKey> = {
    queryClient,
    entityKey,
    logger,
    getEntitiesForKey,
  }

  const createMutation = useMutation<
    GlobalEntity<GlobalEntityTypeKey>,
    unknown,
    Partial<GlobalEntity<GlobalEntityTypeKey>>,
    { previousData?: GlobalData }
  >(createEntityCreateMutationOptions(mutationContext))
  const updateMutation = useMutation<
    GlobalEntity<GlobalEntityTypeKey>,
    unknown,
    { entity: Partial<GlobalEntity<GlobalEntityTypeKey>>; id: GlobalEntityId },
    { previousData?: GlobalData }
  >(createEntityUpdateMutationOptions(mutationContext))
  const removeMutation = useMutation<
    { deletedId: string },
    unknown,
    GlobalEntityId,
    { previousData?: GlobalData }
  >(createEntityRemoveMutationOptions(mutationContext))
  const patchOrderIndexMutation = useMutation<void, unknown, OrderIndexUpdate, { previousData?: GlobalData }>(
    createEntityOrderMutationOptions(mutationContext)
  )

  const patchBulkMutation = useMutation<void, unknown, BulkUpdate<GlobalEntityTypeKey>, { previousData?: GlobalData }>({
    mutationFn: async (updates: BulkUpdate<GlobalEntityTypeKey>) => {
      const dehydratedUpdates = updates.map((update) => {
        const updateWithEntityKey = { ...update, entityKey }
        return globalTransformer.dehydrateEntity(updateWithEntityKey)
      })
      const response = await apiClient.patch(getBulkPatchEndpoint(entityKey), dehydratedUpdates)
      if (!response?.data) {
        throw new Error('Failed to update entities')
      }
    },
    onMutate: async (updates) => {
      await queryClient.cancelQueries({ queryKey: ['globalData'] })
      const previousData = queryClient.getQueryData<GlobalData>(['globalData'])
      queryClient.setQueryData<GlobalData>(['globalData'], (old) => {
        if (!old) return old
        const updateMap = new Map(updates.map((update) => [update.id, update]))
        const currentEntities = getEntitiesForKey(old)
        const updatedEntities = currentEntities.map((entity) => {
          const update = updateMap.get(entity.id)
          if (!update) return entity
          return { ...entity, ...update } as GlobalEntity<GlobalEntityTypeKey>
        })
        return {
          ...old,
          entities: { ...old.entities, [entityKey]: updatedEntities },
        }
      })
      return { previousData }
    },
    onError: (error: unknown, _variables: BulkUpdate<GlobalEntityTypeKey>, context: { previousData?: GlobalData } | undefined) => {
      logger.error(`Failed to bulk update ${entityKey}:`, {
        error: error instanceof Error ? error.message : String(error),
        updatesCount: _variables.length,
      })
      if (context?.previousData) {
        queryClient.setQueryData(['globalData'], context.previousData)
      }
    },
  })

  return {
    create: async (entity) => createMutation.mutateAsync(entity),
    update: async (entity, id) => updateMutation.mutateAsync({ entity, id }),
    remove: async (id) => removeMutation.mutateAsync(id),
    patchOrderIndex: async (updates) => patchOrderIndexMutation.mutateAsync(updates),
    patchBulk: async (updates) => patchBulkMutation.mutateAsync(updates),
    updateMutation: {
      mutateAsync: updateMutation.mutateAsync,
    },
  }
}
