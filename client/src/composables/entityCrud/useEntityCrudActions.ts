import { computed, type ComputedRef } from 'vue'
import { useMutation, useQueryClient } from '@tanstack/vue-query'
import apiClient, { getEntityByIdEndpoint, getEntityEndpoint, getOrderIndexEndpoint, getBulkPatchEndpoint } from '@/utils/api'
import type { GlobalEntityId, GlobalEntity } from '@/types/entities'
import { globalTransformer, type GlobalData } from '@/utils/transformers/fetchToGlobalTransformer'
import { transformApiEntity } from '@/utils/transformers/entityTransformers'
import type { GlobalEntityKey } from '@/constants/entities'
import { getDefaultEntityValues } from '@/utils/entityDefaults'
import type { ValidAdminValue } from '@/constants/primitives'
import { sanitizeEntityAdminValues } from '@/utils/entities/sanitizeEntityAdminValues'
import type { Logger } from '@/utils/logger'
import { isDevModeEnabled } from '@/utils/env/devMode'

export type OrderIndexUpdate = Array<{ id: GlobalEntityId; orderIndex: number }>

export type BulkUpdate<GlobalEntityTypeKey extends GlobalEntityKey> = Array<{ 
  id: GlobalEntityId 
} & Partial<GlobalEntity<GlobalEntityTypeKey>>>

export type UseEntityCrudActionsReturn<GlobalEntityTypeKey extends GlobalEntityKey> = {
  isLoading: ComputedRef<boolean>
  error: ComputedRef<unknown | undefined>
  refetch: () => Promise<void>

  create: (entity: Partial<GlobalEntity<GlobalEntityTypeKey>>) => Promise<GlobalEntity<GlobalEntityTypeKey>>
  update: (entity: Partial<GlobalEntity<GlobalEntityTypeKey>>, id: GlobalEntityId) => Promise<unknown>
  remove: (id: GlobalEntityId) => Promise<{ deletedId: string }>
  patchOrderIndex: (updates: OrderIndexUpdate) => Promise<void>
  patchBulk: (updates: BulkUpdate<GlobalEntityTypeKey>) => Promise<void>

  // Expose the raw update mutation for advanced orchestration (e.g. component-computed checks).
  updateMutation: {
    mutateAsync: (args: { entity: Partial<GlobalEntity<GlobalEntityTypeKey>>; id: GlobalEntityId }) => Promise<unknown>
  }
}

/**
 * Actions/mutations module for `useEntityCrud`.
 *
 * PATTERN: query/state/actions separation
 * - state reads from globalData cache (see `useEntityCrudQuery`)
 * - actions are Vue Query mutations that refetch `['globalData']`
 */
export function useEntityCrudActions<GlobalEntityTypeKey extends GlobalEntityKey>(params: {
  entityKey: GlobalEntityTypeKey
  logger: Logger
}): UseEntityCrudActionsReturn<GlobalEntityTypeKey> {
  const { entityKey, logger } = params
  const queryClient = useQueryClient()
  const endpoint = getEntityEndpoint(entityKey)

  // Keep these stable for now (legacy callers expect these to exist, but they don't drive UI yet).
  const isLoading = computed((): boolean => false)
  const error = computed((): unknown | undefined => undefined)

  const refetch = async (): Promise<void> => {
    await queryClient.refetchQueries({ queryKey: ['globalData'] })
  }

  const createMutation = useMutation<GlobalEntity<GlobalEntityTypeKey>, unknown, Partial<GlobalEntity<GlobalEntityTypeKey>>, { previousData?: GlobalData }>({
    mutationFn: async (entity: Partial<GlobalEntity<GlobalEntityTypeKey>>) => {
      const currentGlobalData = queryClient.getQueryData<GlobalData>(['globalData'])
      const currentEntities = (currentGlobalData?.entities?.[entityKey] || []) as GlobalEntity<GlobalEntityTypeKey>[]
      const maxOrderIndex =
        currentEntities.length > 0 ? Math.max(...currentEntities.map((e) => e.orderIndex ?? 0)) : -1
      const newOrderIndex = maxOrderIndex + 1

      const defaults = getDefaultEntityValues(entityKey)
      const rawEntity: Record<string, ValidAdminValue> = {
        ...defaults,
        ...entity,
        orderIndex: newOrderIndex,
        entityKey,
      }

      const sanitizedEntity = sanitizeEntityAdminValues(entityKey, rawEntity)

      const { id: _id, ...entityWithoutId } = sanitizedEntity
      const backendPayload = globalTransformer.dehydrateEntity(entityWithoutId as Partial<GlobalEntity<GlobalEntityTypeKey>>)
      delete backendPayload.id

      if (isDevModeEnabled()) {
        logger.debug(`Creating ${entityKey}:`, {
          payload: backendPayload,
          hasId: 'id' in backendPayload,
        })
      }

      const response = await apiClient.post<GlobalEntity<GlobalEntityTypeKey>>(endpoint, backendPayload)

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
      } else {
        logger.error('No data or ID in onSuccess callback:', {
          entityKey,
          hasData: !!data,
          dataId: (data as { id?: unknown } | null | undefined)?.id,
        })
      }
    },
    onError: (_error: unknown, _variables: Partial<GlobalEntity<GlobalEntityTypeKey>>, context: { previousData?: GlobalData } | undefined) => {
      // LEARNING: Rollback on error
      // WHY: If creation fails, restore previous cache state
      // PATTERN: Use context from onMutate to restore previous data
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

      const rawEntity: Record<string, ValidAdminValue> = {
        ...entity,
        entityKey,
      }

      const sanitizedEntity = sanitizeEntityAdminValues(entityKey, rawEntity)
      const backendPayload = globalTransformer.dehydrateEntity(sanitizedEntity as Partial<GlobalEntity<GlobalEntityTypeKey>>)
      const response = await apiClient.put<GlobalEntity<GlobalEntityTypeKey>>(updateEndpoint, backendPayload)
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

          // LEARNING: Merge existing entity with server response
          // WHY: Preserves properties from optimistic update that might not be in server response
          // PATTERN: Spread existing entity, then override with transformed server response
          const existingEntity = currentEntities[entityIndex]
          const transformedResponse = transformApiEntity(data as unknown as Record<string, unknown>, entityKey)
          const updatedEntities = [...currentEntities]
          const mergedEntity = {
            ...existingEntity,
            ...transformedResponse,
          } as GlobalEntity<GlobalEntityTypeKey>
          updatedEntities[entityIndex] = mergedEntity

          return {
            ...old,
            entities: {
              ...old.entities,
              [entityKey]: updatedEntities,
            },
          }
        })

        // LEARNING: Refetch globalData when fieldMetadata is updated
        // WHY: fieldMetadata changes affect field visibility in BlockInstance/PartInstance cards
        //      Vue's reactivity system needs fresh data references to detect nested property changes
        // PATTERN: Check if update includes fieldMetadata, then refetch to ensure reactivity
        const hasFieldMetadata = 'fieldMetadata' in variables.entity ||
          (data && 'fieldMetadata' in (data as unknown as Record<string, unknown>))
        
        if (hasFieldMetadata && (entityKey === 'blockShape' || entityKey === 'partShape')) {
          // LEARNING: Refetch globalData to get fresh entity references with updated fieldMetadata
          // WHY: Ensures Vue's reactivity system detects changes to nested fieldMetadata property
          //      This triggers recomputation of computed properties that depend on blockShape.fieldMetadata
          // PATTERN: Invalidate and refetch to force fresh data flow through cache
          queryClient.invalidateQueries({ queryKey: ['globalData'] })
          queryClient.refetchQueries({ queryKey: ['globalData'] })
        }
      }
    },
    onError: (_error: unknown, _variables: { entity: Partial<GlobalEntity<GlobalEntityTypeKey>>; id: GlobalEntityId }, context: { previousData?: GlobalData } | undefined) => {
      // LEARNING: Rollback optimistic update on error
      // WHY: If update fails, restore previous cache state
      // PATTERN: Use context from onMutate to restore previous data
      if (context?.previousData) {
        queryClient.setQueryData(['globalData'], context.previousData)
      }
    },
  })

  const deleteMutation = useMutation<{ deletedId: string }, unknown, GlobalEntityId, { previousData?: GlobalData }>({
    mutationFn: async (id: GlobalEntityId) => {
      const deleteEndpoint = getEntityByIdEndpoint(entityKey, String(id))
      await apiClient.delete(deleteEndpoint)
      return { deletedId: String(id) }
    },
    onMutate: async (id) => {
      // LEARNING: Optimistic update pattern for delete
      // WHY: Remove entity immediately for instant UI feedback
      // PATTERN: Cancel → Snapshot → Remove → Return context
      await queryClient.cancelQueries({ queryKey: ['globalData'] })
      const previousData = queryClient.getQueryData<GlobalData>(['globalData'])

      // Optimistically remove entity from cache
      queryClient.setQueryData<GlobalData>(['globalData'], (old) => {
        if (!old) return old

        const currentEntities = old.entities[entityKey] || []
        const filteredEntities = currentEntities.filter((e) => String(e.id) !== String(id))

        // LEARNING: Optimistically normalize order indices after removal
        // WHY: Maintains consistent orderIndex sequence (0, 1, 2, ...)
        // PATTERN: Recalculate orderIndex for remaining entities
        const normalizedEntities = filteredEntities.map((entity, index) => ({
          ...entity,
          orderIndex: index,
        })) as GlobalEntity<GlobalEntityTypeKey>[]

        return {
          ...old,
          entities: {
            ...old.entities,
            [entityKey]: normalizedEntities,
          },
        }
      })

      return { previousData }
    },
    onSuccess: async () => {
      // LEARNING: Order normalization happens optimistically in onMutate
      // WHY: No need to refetch - cache already updated
      // NOTE: If server-side order normalization is required, we could trigger it here
      //       but optimistic normalization is usually sufficient
      
      // Optional: Trigger server-side order normalization if needed
      // This ensures server and client stay in sync, but doesn't block UI update
      const currentGlobalData = queryClient.getQueryData<GlobalData>(['globalData'])
      const remainingEntities = currentGlobalData?.entities?.[entityKey] || []
      
      // Check if order normalization is needed (gaps in sequence)
      const hasGaps = remainingEntities.some((entity, index) => entity.orderIndex !== index)
      
      if (hasGaps && remainingEntities.length > 0) {
        // Trigger normalization in background (non-blocking)
        const normalizedUpdates = remainingEntities.map((entity, index) => ({
          id: entity.id,
          orderIndex: index,
        }))
        
        const orderIndexEndpoint = getOrderIndexEndpoint(entityKey)
        const backendPayload = normalizedUpdates.map(({ id, orderIndex }) => ({
          id: String(id),
          order_index: orderIndex,
        }))
        
        // Fire and forget - don't await, don't refetch
        apiClient.patch(orderIndexEndpoint, backendPayload).catch((error) => {
          if (isDevModeEnabled()) {
            logger.warn(`[useEntityCrudActions] Order normalization failed for ${entityKey}:`, error)
          }
        })
      }
    },
    onError: (_error: unknown, _id: GlobalEntityId, context: { previousData?: GlobalData } | undefined) => {
      // LEARNING: Rollback optimistic delete on error
      // WHY: If delete fails, restore previous cache state
      // PATTERN: Use context from onMutate to restore previous data
      if (context?.previousData) {
        queryClient.setQueryData(['globalData'], context.previousData)
      }
    },
  })

  const patchOrderIndexMutation = useMutation<void, unknown, OrderIndexUpdate, { previousData?: GlobalData }>({
    mutationFn: async (updates: OrderIndexUpdate): Promise<void> => {
      const orderIndexEndpoint = getOrderIndexEndpoint(entityKey)
      const backendPayload = updates.map(({ id, orderIndex }) => ({
        id: String(id),
        order_index: orderIndex,
      }))
      await apiClient.patch(orderIndexEndpoint, backendPayload)
    },
    onMutate: async (updates) => {
      // LEARNING: Optimistic update pattern for order changes
      // WHY: Update order indices immediately for instant UI feedback
      // PATTERN: Cancel → Snapshot → Update order → Return context
      await queryClient.cancelQueries({ queryKey: ['globalData'] })
      const previousData = queryClient.getQueryData<GlobalData>(['globalData'])

      // Optimistically update order indices using mutation variables
      queryClient.setQueryData<GlobalData>(['globalData'], (old) => {
        if (!old) return old

        const currentEntities = old.entities[entityKey] || []
        
        // LEARNING: Create a map of ID -> new orderIndex for quick lookup
        // WHY: Updates may not include all entities, need to preserve existing orderIndex for others
        // PATTERN: Map updates, then apply to entities
        const orderMap = new Map<string, number>()
        updates.forEach(({ id, orderIndex }) => {
          orderMap.set(String(id), orderIndex)
        })

        // LEARNING: Update orderIndex for entities in updates, preserve others
        // WHY: Only update entities that are being reordered
        // PATTERN: Map over entities, update orderIndex if in updates map
        const updatedEntities = currentEntities.map((entity) => {
          const entityId = String(entity.id)
          if (orderMap.has(entityId)) {
            return {
              ...entity,
              orderIndex: orderMap.get(entityId)!,
            } as GlobalEntity<GlobalEntityTypeKey>
          }
          return entity
        })

        // LEARNING: Sort by orderIndex to maintain correct order
        // WHY: Ensures entities are in the correct sequence after order update
        // PATTERN: Sort after applying updates
        const sortedEntities = [...updatedEntities].sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0))

        return {
          ...old,
          entities: {
            ...old.entities,
            [entityKey]: sortedEntities,
          },
        }
      })

      return { previousData }
    },
    onError: (_error: unknown, _updates: OrderIndexUpdate, context: { previousData?: GlobalData } | undefined) => {
      // LEARNING: Rollback optimistic order update on error
      // WHY: If order update fails, restore previous cache state
      // PATTERN: Use context from onMutate to restore previous data
      if (context?.previousData) {
        queryClient.setQueryData(['globalData'], context.previousData)
      }
    },
    onSuccess: () => {
      // LEARNING: Side effects after successful order update
      // WHY: Invalidate related caches (scheduler) without refetching globalData
      // PATTERN: Only invalidate, don't refetch
      if (['blockInstance', 'blockShape'].includes(entityKey)) {
        queryClient.invalidateQueries({ queryKey: ['schedulerAdmin'] })
      }
    },
  })

  const patchBulkMutation = useMutation<void, unknown, BulkUpdate<GlobalEntityTypeKey>, { previousData?: GlobalData }>({
    mutationFn: async (updates: BulkUpdate<GlobalEntityTypeKey>): Promise<void> => {
      const bulkPatchEndpoint = getBulkPatchEndpoint(entityKey)
      // LEARNING: Transform updates to backend format (camelCase to snake_case for specific fields)
      // WHY: Backend expects snake_case for some fields, but we use camelCase in frontend
      // PATTERN: Use globalTransformer to dehydrate entity fields
      // FIX: Remove sanitizeEntityAdminValues - if form only has fields we want, no sanitization needed
      //      Sanitization was a workaround for forms including unwanted fields - fix the form instead
      const backendPayload = updates.map(({ id, ...fields }) => {
        // LEARNING: Only dehydrate fields - no sanitization needed if form only has correct fields
        // WHY: Sanitization was a workaround for forms including unwanted fields - fix the form instead
        const dehydratedFields = globalTransformer.dehydrateEntity(fields as Partial<GlobalEntity<GlobalEntityTypeKey>>)
        return {
          id: String(id),
          ...dehydratedFields,
        }
      })
      await apiClient.patch(bulkPatchEndpoint, backendPayload)
    },
    onMutate: async (updates) => {
      // LEARNING: Optimistic update pattern for bulk field updates
      // WHY: Update entities immediately for instant UI feedback
      // PATTERN: Cancel → Snapshot → Update fields → Return context
      await queryClient.cancelQueries({ queryKey: ['globalData'] })
      const previousData = queryClient.getQueryData<GlobalData>(['globalData'])

      // Optimistically update entities using mutation variables
      queryClient.setQueryData<GlobalData>(['globalData'], (old) => {
        if (!old) return old

        const currentEntities = old.entities[entityKey] || []
        
        // LEARNING: Create a map of ID -> update fields for quick lookup
        // WHY: Updates may not include all entities, need to preserve existing fields for others
        // PATTERN: Map updates, then apply to entities
        const updateMap = new Map<string, Partial<GlobalEntity<GlobalEntityTypeKey>>>()
        updates.forEach(({ id, ...fields }) => {
          // FIX: Omit<..., "id"> needs to be cast to Partial<GlobalEntity<...>> for type compatibility
          updateMap.set(String(id), fields as Partial<GlobalEntity<GlobalEntityTypeKey>>)
        })

        // LEARNING: Merge update fields into existing entities
        // WHY: Only update fields that are being changed, preserve other properties
        // PATTERN: Map over entities, merge update fields if in updates map
        const updatedEntities = currentEntities.map((entity) => {
          const entityId = String(entity.id)
          if (updateMap.has(entityId)) {
            return {
              ...entity,
              ...updateMap.get(entityId)!,
              id: entity.id, // Ensure ID is preserved
            } as GlobalEntity<GlobalEntityTypeKey>
          }
          return entity
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
    onError: (_error: unknown, _updates: BulkUpdate<GlobalEntityTypeKey>, context: { previousData?: GlobalData } | undefined) => {
      // LEARNING: Rollback optimistic bulk update on error
      // WHY: If bulk update fails, restore previous cache state
      // PATTERN: Use context from onMutate to restore previous data
      if (context?.previousData) {
        queryClient.setQueryData(['globalData'], context.previousData)
      }
    },
    onSuccess: () => {
      // LEARNING: Invalidate globalData to ensure components react to changes
      // WHY: Optimistic updates may not trigger reactivity properly - invalidate to force fresh data
      // PATTERN: Invalidate globalData so components using admin.getEntity() get updated entities
      queryClient.invalidateQueries({ queryKey: ['globalData'] })
      
      // LEARNING: Side effects after successful bulk update
      // WHY: Invalidate related caches (scheduler) without refetching globalData
      // PATTERN: Only invalidate, don't refetch
      if (['blockInstance', 'blockShape'].includes(entityKey)) {
        queryClient.invalidateQueries({ queryKey: ['schedulerAdmin'] })
      }
    },
  })

  return {
    isLoading,
    error,
    refetch,
    create: async (entity) => createMutation.mutateAsync(entity),
    update: async (entity, id) => updateMutation.mutateAsync({ entity, id }),
    remove: async (id) => deleteMutation.mutateAsync(id),
    patchOrderIndex: async (updates) => patchOrderIndexMutation.mutateAsync(updates),
    patchBulk: async (updates) => patchBulkMutation.mutateAsync(updates),
    updateMutation,
  }
}


