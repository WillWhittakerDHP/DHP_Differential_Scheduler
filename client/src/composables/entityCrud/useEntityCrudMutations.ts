import { useMutation, useQueryClient } from '@tanstack/vue-query'
import apiClient, { getEntityByIdEndpoint, getEntityEndpoint, getOrderIndexEndpoint, getBulkPatchEndpoint } from '@/utils/api'
import type { AxiosError } from 'axios'
import type { GlobalEntityId, GlobalEntity } from '@/types/entities'
import { globalTransformer, type GlobalData } from '@/utils/transformers/fetchToGlobalTransformer'
import { transformApiEntity } from '@/utils/transformers/entityTransformers'
import type { GlobalEntityKey } from '@/constants/entities'
import { getDefaultEntityValues } from '@/utils/entityDefaults'
import type { Logger } from '@/utils/logger'
import { isDevModeEnabled } from '@/utils/env/devMode'
import type { BulkUpdate, OrderIndexUpdate } from './useEntityCrudTypes'

type UseEntityCrudMutationsReturn<GlobalEntityTypeKey extends GlobalEntityKey> = {
  create: (entity: Partial<GlobalEntity<GlobalEntityTypeKey>>) => Promise<GlobalEntity<GlobalEntityTypeKey>>
  update: (entity: Partial<GlobalEntity<GlobalEntityTypeKey>>, id: GlobalEntityId) => Promise<unknown>
  remove: (id: GlobalEntityId) => Promise<{ deletedId: string }>
  patchOrderIndex: (updates: OrderIndexUpdate) => Promise<void>
  patchBulk: (updates: BulkUpdate<GlobalEntityTypeKey>) => Promise<void>
  updateMutation: {
    mutateAsync: (args: { entity: Partial<GlobalEntity<GlobalEntityTypeKey>>; id: GlobalEntityId }) => Promise<unknown>
  }
}

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
  const endpoint = getEntityEndpoint(entityKey)

  function getEntitiesForKey(data: GlobalData | undefined): GlobalEntity<GlobalEntityTypeKey>[] {
    const entities = data?.entities?.[entityKey]
    if (entities === undefined || entities === null) {
      logger.debug('Entity crud: entities key missing in cache', { entityKey })
      return []
    }
    return entities as GlobalEntity<GlobalEntityTypeKey>[]
  }

  const createMutation = useMutation<GlobalEntity<GlobalEntityTypeKey>, unknown, Partial<GlobalEntity<GlobalEntityTypeKey>>, { previousData?: GlobalData }>({
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
      
      // PATTERN: Check response data, log error if missing, throw explicit error
      if (!response.data) {
        const errorMessage = `API response missing data for ${entityKey} creation`
        logger.error(errorMessage, { endpoint, payload: backendPayload })
        throw new Error(errorMessage)
      }

      const transformedResponse = transformApiEntity(response.data as unknown as Record<string, unknown>, entityKey)
      return transformedResponse
    },
    onMutate: async () => {
      // LEARNING: Optimistic update pattern for create
      // PATTERN: Cancel → Snapshot → Return context for rollback
      await queryClient.cancelQueries({ queryKey: ['globalData'] })
      const previousData = queryClient.getQueryData<GlobalData>(['globalData'])
      return { previousData }
    },
    onSuccess: (data) => {
      // PATTERN: Update cache with response data, no refetch needed
      if (data && data.id) {
        queryClient.setQueryData<GlobalData>(['globalData'], (old) => {
          if (!old) return old

          const currentEntities = getEntitiesForKey(old) as GlobalEntity<GlobalEntityTypeKey>[]
          const entityExists = currentEntities.some((e) => e.id === data.id)
          
          if (!entityExists) {
            const updatedEntities = [...currentEntities, data as GlobalEntity<GlobalEntityTypeKey>]
            return {
              ...old,
              entities: {
                ...old.entities,
                [entityKey]: updatedEntities,
              },
            }
          }
          
          return old
        })
        // PATTERN: Invalidate after cache update to trigger refetch in dependent components
        queryClient.invalidateQueries({ queryKey: ['globalData'] })
      } else {
        logger.error('No data or ID in onSuccess callback:', {
          entityKey,
          hasData: !!data,
          dataId: (data as { id?: unknown } | null | undefined)?.id,
        })
      }
    },
    onError: (error: unknown, _variables: Partial<GlobalEntity<GlobalEntityTypeKey>>, context: { previousData?: GlobalData } | undefined) => {
      // WHY: Log errors explicitly instead of silent failures, then restore previous cache state
      // PATTERN: Log error, then use context from onMutate to restore previous data
      // PATTERN: Check for AxiosError and extract response.data.details or response.data.error
      let errorMessage = error instanceof Error ? error.message : String(error)
      let errorDetails: string | undefined
      
      // PATTERN: Use type guard to check for AxiosError, then extract response.data
      if (error && typeof error === 'object') {
        const possibleAxiosError = error as AxiosError<{ error?: string; details?: string; message?: string }>
        if (possibleAxiosError.response?.data) {
          const d = possibleAxiosError.response.data
          if (d.details !== undefined && d.details !== null) {
            errorDetails = String(d.details)
          } else if (d.error !== undefined && d.error !== null) {
            errorDetails = String(d.error)
          } else if (d.message !== undefined && d.message !== null) {
            errorDetails = String(d.message)
          }
          if (errorDetails !== undefined) {
            errorMessage = errorDetails
          }
        }
      }
      
      logger.error(`Failed to create ${entityKey}:`, {
        error: errorMessage,
        details: errorDetails,
        entity: _variables,
        fullError: error // Include full error object for debugging
      })
      if (context?.previousData) {
        queryClient.setQueryData(['globalData'], context.previousData)
      }
    },
  })

  const updateMutation = useMutation<GlobalEntity<GlobalEntityTypeKey>, unknown, { entity: Partial<GlobalEntity<GlobalEntityTypeKey>>; id: GlobalEntityId }, { previousData?: GlobalData }>({
    mutationFn: async ({
      entity,
      id,
    }: {
      entity: Partial<GlobalEntity<GlobalEntityTypeKey>>
      id: GlobalEntityId
    }) => {
      const updateEndpoint = getEntityByIdEndpoint(entityKey, String(id))

      const rawEntity: Partial<GlobalEntity<GlobalEntityTypeKey>> & { entityKey: GlobalEntityTypeKey } = {
        ...entity,
        entityKey,
      }

      const backendPayload = globalTransformer.dehydrateEntity(rawEntity)
      const response = await apiClient.put<GlobalEntity<GlobalEntityTypeKey>>(updateEndpoint, backendPayload)
      
      // PATTERN: Check response data, log error if missing, throw explicit error
      if (!response.data) {
        const errorMessage = `API response missing data for ${entityKey} update`
        logger.error(errorMessage, { endpoint: updateEndpoint, payload: backendPayload, entityId: id })
        throw new Error(errorMessage)
      }
      
      return { ...response.data, id: String(id) }
    },
    onMutate: async (variables) => {
      // LEARNING: Optimistic update pattern for update
      // PATTERN: Cancel → Snapshot → Update → Return context
      await queryClient.cancelQueries({ queryKey: ['globalData'] })
      const previousData = queryClient.getQueryData<GlobalData>(['globalData'])

      queryClient.setQueryData<GlobalData>(['globalData'], (old) => {
        if (!old) return old

        const currentEntities = getEntitiesForKey(old)
        const entityIndex = currentEntities.findIndex((e) => String(e.id) === String(variables.id))

        if (entityIndex === -1) {
          if (isDevModeEnabled()) {
            logger.warn(`[useEntityCrudActions] Entity ${variables.id} not found in ${entityKey} cache for update`)
          }
          return old
        }

        // PATTERN: Spread existing entity, then override with update fields
        const updatedEntities = [...currentEntities]
        updatedEntities[entityIndex] = {
          ...currentEntities[entityIndex],
          ...variables.entity,
          id: variables.id, // Ensure ID is preserved
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
      // PATTERN: Update cache with response data to ensure consistency
      // PATTERN: Spread existing entity first, then override with server response
      if (data && data.id) {
        queryClient.setQueryData<GlobalData>(['globalData'], (old) => {
          if (!old) return old

          const currentEntities = getEntitiesForKey(old)
          const entityIndex = currentEntities.findIndex((e) => String(e.id) === String(data.id))

          if (entityIndex === -1) return old

          const updatedEntities = [...currentEntities]
          updatedEntities[entityIndex] = {
            ...currentEntities[entityIndex],
            ...variables.entity,
            ...data,
            id: data.id, // Ensure ID is preserved
          } as GlobalEntity<GlobalEntityTypeKey>

          return {
            ...old,
            entities: {
              ...old.entities,
              [entityKey]: updatedEntities,
            },
          }
        })
        // PATTERN: Invalidate after cache update to trigger refetch in dependent components
        queryClient.invalidateQueries({ queryKey: ['globalData'] })
      }
    },
    onError: (error: unknown, _variables: { entity: Partial<GlobalEntity<GlobalEntityTypeKey>>; id: GlobalEntityId }, context: { previousData?: GlobalData } | undefined) => {
      // WHY: Log errors explicitly instead of silent failures, then restore previous cache state
      // PATTERN: Log error, then use context from onMutate to restore previous data
      logger.error(`Failed to update ${entityKey}:`, {
        error: error instanceof Error ? error.message : String(error),
        entityId: _variables.id,
        entity: _variables.entity
      })
      if (context?.previousData) {
        queryClient.setQueryData(['globalData'], context.previousData)
      }
    },
  })

  const removeMutation = useMutation<{ deletedId: string }, unknown, GlobalEntityId, { previousData?: GlobalData }>({
    mutationFn: async (id: GlobalEntityId) => {
      const deleteEndpoint = getEntityByIdEndpoint(entityKey, String(id))
      const response = await apiClient.delete(deleteEndpoint)
      
      // PATTERN: Check response status, log error if failed, throw explicit error
      if (response.status < 200 || response.status >= 300) {
        const errorMessage = `Delete operation failed for ${entityKey}`
        logger.error(errorMessage, { endpoint: deleteEndpoint, entityId: id, status: response.status })
        throw new Error(errorMessage)
      }
      
      return { deletedId: String(id) }
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['globalData'] })
      const previousData = queryClient.getQueryData<GlobalData>(['globalData'])

      queryClient.setQueryData<GlobalData>(['globalData'], (old) => {
        if (!old) return old
        const currentEntities = getEntitiesForKey(old)
        const updatedEntities = currentEntities.filter((entity) => String(entity.id) !== String(id))
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
      // WHY: Log errors explicitly instead of silent failures, then restore previous cache state
      // PATTERN: Log error, then use context from onMutate to restore previous data
      logger.error(`Failed to remove ${entityKey}:`, {
        error: error instanceof Error ? error.message : String(error),
        entityId: _variables
      })
      if (context?.previousData) {
        queryClient.setQueryData(['globalData'], context.previousData)
      }
    },
  })

  const patchOrderIndexMutation = useMutation<void, unknown, OrderIndexUpdate, { previousData?: GlobalData }>({
    mutationFn: async (updates: OrderIndexUpdate) => {
      // PATTERN: Client sends camelCase; Sequelize model uses underscored: true
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
        const updateMap = new Map(updates.map((update) => [String(update.id), update.orderIndex]))
        const updatedEntities = currentEntities.map((entity) => {
          const newOrder = updateMap.get(String(entity.id))
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
      // WHY: Log errors explicitly instead of silent failures, then restore previous cache state
      // PATTERN: Log error, then use context from onMutate to restore previous data
      logger.error(`Failed to update orderIndex for ${entityKey}:`, {
        error: error instanceof Error ? error.message : String(error),
        updates: _variables
      })
      if (context?.previousData) {
        queryClient.setQueryData(['globalData'], context.previousData)
      }
    },
  })

  const patchBulkMutation = useMutation<void, unknown, BulkUpdate<GlobalEntityTypeKey>, { previousData?: GlobalData }>({
    mutationFn: async (updates: BulkUpdate<GlobalEntityTypeKey>) => {
      // LEARNING: Dehydrate each update to ensure proper field formatting
      // WHY: Ensures fields are in correct format for backend (handles boolean conversions, etc.)
      // PATTERN: Map updates to dehydrated format, similar to create/update mutations
      const dehydratedUpdates = updates.map((update) => {
        const updateWithEntityKey = {
          ...update,
          entityKey,
        }
        return globalTransformer.dehydrateEntity(updateWithEntityKey)
      })
      
      // PATTERN: Send array directly to match server expectation: [{ id: string, ...fields }]
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
        const updateMap = new Map(updates.map((update) => [String(update.id), update]))
        const currentEntities = getEntitiesForKey(old)
        const updatedEntities = currentEntities.map((entity) => {
          const update = updateMap.get(String(entity.id))
          if (!update) return entity
          return {
            ...entity,
            ...update,
          } as GlobalEntity<GlobalEntityTypeKey>
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
    onError: (error: unknown, _variables: BulkUpdate<GlobalEntityTypeKey>, context: { previousData?: GlobalData } | undefined) => {
      // WHY: Log errors explicitly instead of silent failures, then restore previous cache state
      // PATTERN: Log error, then use context from onMutate to restore previous data
      logger.error(`Failed to bulk update ${entityKey}:`, {
        error: error instanceof Error ? error.message : String(error),
        updatesCount: _variables.length
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
