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

  const createMutation = useMutation<GlobalEntity<GlobalEntityTypeKey>, unknown, Partial<GlobalEntity<GlobalEntityTypeKey>>, { previousData?: GlobalData }>({
    mutationFn: async (entity: Partial<GlobalEntity<GlobalEntityTypeKey>>) => {
      const currentGlobalData = queryClient.getQueryData<GlobalData>(['globalData'])
      const currentEntities = (currentGlobalData?.entities?.[entityKey] || []) as GlobalEntity<GlobalEntityTypeKey>[]
      const maxOrderIndex =
        currentEntities.length > 0 ? Math.max(...currentEntities.map((e) => e.orderIndex ?? 0)) : -1
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
      
      // LEARNING: Explicit error handling for API response
      // WHY: Ensure response data exists before transformation
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
      // WHY: Cancel queries to prevent race conditions
      // PATTERN: Cancel → Snapshot → Return context for rollback
      await queryClient.cancelQueries({ queryKey: ['globalData'] })
      const previousData = queryClient.getQueryData<GlobalData>(['globalData'])
      return { previousData }
    },
    onSuccess: (data) => {
      // LEARNING: Add created entity to cache using response (not refetch)
      // WHY: Server returns the created entity with ID, so we can add it directly
      // PATTERN: Update cache with response data, no refetch needed
      if (data && data.id) {
        queryClient.setQueryData<GlobalData>(['globalData'], (old) => {
          if (!old) return old

          const currentEntities = (old.entities[entityKey] || []) as GlobalEntity<GlobalEntityTypeKey>[]
          const entityExists = currentEntities.some((e) => e.id === data.id)
          
          if (!entityExists) {
            // Add new entity to cache
            const updatedEntities = [...currentEntities, data as GlobalEntity<GlobalEntityTypeKey>]
            return {
              ...old,
              entities: {
                ...old.entities,
                [entityKey]: updatedEntities,
              },
            }
          }
          
          // Entity already exists (shouldn't happen, but handle gracefully)
          return old
        })
        // LEARNING: Invalidate globalData cache to ensure all components see updated data
        // WHY: Changes may affect other components that depend on globalData
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
      // LEARNING: Explicit error logging and rollback
      // WHY: Log errors explicitly instead of silent failures, then restore previous cache state
      // PATTERN: Log error, then use context from onMutate to restore previous data
      // LEARNING: Extract detailed error message from AxiosError response
      // WHY: Server returns helpful error messages in response.data.details for validation errors
      // PATTERN: Check for AxiosError and extract response.data.details or response.data.error
      let errorMessage = error instanceof Error ? error.message : String(error)
      let errorDetails: string | undefined
      
      // LEARNING: Check if error is AxiosError to extract server response details
      // WHY: AxiosError contains response.data with server error messages
      // PATTERN: Use type guard to check for AxiosError, then extract response.data
      if (error && typeof error === 'object') {
        // Check if it's an AxiosError by checking for response property
        const possibleAxiosError = error as AxiosError<{ error?: string; details?: string; message?: string }>
        if (possibleAxiosError.response?.data) {
          errorDetails = possibleAxiosError.response.data.details || 
                        possibleAxiosError.response.data.error || 
                        possibleAxiosError.response.data.message
          if (errorDetails) {
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
      
      // LEARNING: Explicit error handling for API response
      // WHY: Ensure response data exists before returning
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
      // WHY: Update cache immediately using mutation variables for instant UI feedback
      // PATTERN: Cancel → Snapshot → Update → Return context
      await queryClient.cancelQueries({ queryKey: ['globalData'] })
      const previousData = queryClient.getQueryData<GlobalData>(['globalData'])

      // Optimistically update cache using mutation variables
      queryClient.setQueryData<GlobalData>(['globalData'], (old) => {
        if (!old) return old

        const currentEntities = old.entities[entityKey] || []
        const entityIndex = currentEntities.findIndex((e) => String(e.id) === String(variables.id))

        if (entityIndex === -1) {
          if (isDevModeEnabled()) {
            logger.warn(`[useEntityCrudActions] Entity ${variables.id} not found in ${entityKey} cache for update`)
          }
          return old
        }

        // LEARNING: Merge update variables into existing entity
        // WHY: Update may only include changed fields, preserve other properties
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
      // LEARNING: Update cache with server response (may have server-side transformations)
      // WHY: Server may apply additional transformations or validations
      // PATTERN: Update cache with response data to ensure consistency
      // LEARNING: Merge server response with existing entity to preserve properties not in response
      // WHY: Server response might not include all properties (e.g., fieldMetadata)
      //      Optimistic update may have properties that server doesn't return
      // PATTERN: Spread existing entity first, then override with server response
      if (data && data.id) {
        queryClient.setQueryData<GlobalData>(['globalData'], (old) => {
          if (!old) return old

          const currentEntities = old.entities[entityKey] || []
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
        // LEARNING: Invalidate globalData cache to ensure all components see updated data
        // WHY: Changes may affect other components that depend on globalData
        // PATTERN: Invalidate after cache update to trigger refetch in dependent components
        queryClient.invalidateQueries({ queryKey: ['globalData'] })
      }
    },
    onError: (error: unknown, _variables: { entity: Partial<GlobalEntity<GlobalEntityTypeKey>>; id: GlobalEntityId }, context: { previousData?: GlobalData } | undefined) => {
      // LEARNING: Explicit error logging and rollback
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
      
      // LEARNING: Explicit error handling for delete operation
      // WHY: Verify delete succeeded - API should return success status
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
        const currentEntities = old.entities[entityKey] || []
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
      // LEARNING: Explicit error logging and rollback
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
      // LEARNING: Send array directly with snake_case field names
      // WHY: Server expects array (not wrapped) with order_index (snake_case)
      // PATTERN: Server transforms order_index → orderIndex for Sequelize, so send snake_case directly
      const response = await apiClient.patch(getOrderIndexEndpoint(entityKey), 
        updates.map((update) => ({
          id: update.id,
          order_index: update.orderIndex, // Convert camelCase to snake_case for API
        }))
      )
      if (!response?.data) {
        throw new Error('Failed to update orderIndex')
      }
    },
    onMutate: async (updates) => {
      await queryClient.cancelQueries({ queryKey: ['globalData'] })
      const previousData = queryClient.getQueryData<GlobalData>(['globalData'])

      queryClient.setQueryData<GlobalData>(['globalData'], (old) => {
        if (!old) return old
        const currentEntities = old.entities[entityKey] || []
        const updateMap = new Map(updates.map((update) => [String(update.id), update.orderIndex]))
        const updatedEntities = currentEntities.map((entity) => ({
          ...entity,
          orderIndex: updateMap.get(String(entity.id)) ?? entity.orderIndex,
        }))
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
      // LEARNING: Explicit error logging and rollback
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
      
      // LEARNING: Send array directly, not wrapped in object
      // WHY: Server expects req.body to be an array of update objects
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
        const currentEntities = old.entities[entityKey] || []
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
      // LEARNING: Explicit error logging and rollback
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
