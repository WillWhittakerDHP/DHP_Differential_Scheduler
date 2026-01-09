import { useMutation, useQueryClient } from '@tanstack/vue-query'
import type { AxiosError } from 'axios'
import apiClient, { getEntityByIdEndpoint } from '@/utils/api'
import type { GlobalEntityKey } from '@/constants/entities'
import type { ValidAdminValue } from '@/constants/primitives'
import type { GlobalData } from '@/utils/transformers/fetchToGlobalTransformer'
import type { GlobalEntity } from '@/types/entities'
import { isDevModeEnabled } from '@/utils/env/devMode'

/**
 * Primitive mutation for updating a single field on an entity.
 *
 * LEARNING: Optimistic update pattern using mutation variables
 * WHY: PATCH response only contains {updated: 1}, not the updated entity
 *      We update cache using what we sent (variables), not what server returns
 * PATTERN: onMutate for optimistic update, onError for rollback, onSuccess for side effects
 * 
 * PERFORMANCE: Eliminates 26+ GET requests per field update
 * UX: Instant UI feedback, automatic rollback on error
 */
export function usePrimitiveMutation<GlobalEntityTypeKey extends GlobalEntityKey>(
  entityKey: GlobalEntityTypeKey
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      admin,
      dynamicId,
    }: {
      admin: { key: string; value: ValidAdminValue }
      dynamicId: string
    }) => {
      if (!dynamicId) throw new Error('Missing dynamicId for primitive mutation')

      const endpoint = getEntityByIdEndpoint(entityKey, dynamicId)

      try {
        // LEARNING: PATCH response only contains {updated: 1}, not the updated entity
        // WHY: Server doesn't return full entity, so we don't transform response
        // PATTERN: Just make API call, cache update happens in onMutate using variables
        await apiClient.patch(endpoint, admin)
        return { success: true }
      } catch (error: unknown) {
        const axiosError = error as AxiosError<{ error?: string; id?: string }>
        if (axiosError.response?.status === 404) {
          const errorMessage = axiosError.response?.data?.error || 'Entity not found'
          const errorId = axiosError.response?.data?.id || dynamicId

          queryClient.invalidateQueries({ queryKey: [entityKey] })
          queryClient.invalidateQueries({ queryKey: ['globalData'] })

          throw new Error(`${errorMessage} (ID: ${errorId})`)
        }
        throw axiosError
      }
    },
    onMutate: async (variables) => {
      // LEARNING: Optimistic update pattern
      // WHY: Update cache immediately using mutation variables for instant UI feedback
      // PATTERN: Cancel queries → Snapshot → Update → Return context for rollback
      
      // 1. Cancel any outgoing refetches to prevent race conditions
      await queryClient.cancelQueries({ queryKey: ['globalData'] })

      // 2. Snapshot the previous value for rollback
      const previousData = queryClient.getQueryData<GlobalData>(['globalData'])

      // 3. Optimistically update cache using variables (not response)
      queryClient.setQueryData<GlobalData>(['globalData'], (old) => {
        if (!old) {
          // Cache not initialized, return as-is (will be populated on next access)
          return old
        }

        const currentEntities = old.entities[entityKey] || []
        const entityIndex = currentEntities.findIndex((entity) => 
          String(entity.id) === String(variables.dynamicId)
        )

        if (entityIndex === -1) {
          // Entity not found in cache - log warning but don't fail
          // This can happen if cache is stale or entity was deleted
          if (isDevModeEnabled()) {
            console.warn(
              `[usePrimitiveMutation] Entity ${variables.dynamicId} not found in ${entityKey} cache. Cache may be stale.`
            )
          }
          return old
        }

        // LEARNING: Update using mutation variables, not response
        // WHY: PATCH response doesn't contain updated entity, only {updated: 1}
        // PATTERN: Update specific field using variables.admin.key and variables.admin.value
        const updatedEntities = [...currentEntities]
        updatedEntities[entityIndex] = {
          ...currentEntities[entityIndex],
          [variables.admin.key]: variables.admin.value, // Key change: use variables, not response
        } as GlobalEntity<GlobalEntityTypeKey>

        return {
          ...old,
          entities: {
            ...old.entities,
            [entityKey]: updatedEntities,
          },
        }
      })

      // 4. Return context object for rollback
      return { previousData }
    },
    onError: (error, _variables, context) => {
      // LEARNING: Rollback optimistic update on error
      // WHY: If mutation fails, restore previous cache state
      // PATTERN: Use context from onMutate to restore previous data
      if (context?.previousData) {
        queryClient.setQueryData(['globalData'], context.previousData)
      }

      // Log error for debugging
      if (isDevModeEnabled()) {
        console.error(`[usePrimitiveMutation] Failed to update ${entityKey}:`, error)
      }
    },
    onSuccess: () => {
      // LEARNING: Side effects after successful mutation
      // WHY: Invalidate related caches (scheduler) without refetching globalData
      // PATTERN: Only invalidate, don't refetch - let related queries refetch when needed
      if (['blockInstance', 'blockShape'].includes(entityKey)) {
        queryClient.invalidateQueries({ queryKey: ['schedulerAdmin'] })
      }
    },
  })
}


