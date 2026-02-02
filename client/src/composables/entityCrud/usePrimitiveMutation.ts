import { useMutation, useQueryClient } from '@tanstack/vue-query'
import type { AxiosError } from 'axios'
import apiClient, { getEntityByIdEndpoint } from '@/utils/api'
import type { GlobalEntityKey } from '@/constants/entities'
import type { ValidAdminValue } from '@/constants/primitives'
import type { GlobalData } from '@/utils/transformers/fetchToGlobalTransformer'
import type { GlobalEntity } from '@/types/entities'
import { isDevModeEnabled } from '@/utils/env/devMode'
import { createLogger } from '@/utils/logger'

const logger = createLogger('usePrimitiveMutation')

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
        // PATTERN: Just make API call, cache update happens in onMutate using variables
        await apiClient.patch(endpoint, admin)
        return { success: true }
      } catch (error: unknown) {
        const axiosError = error as AxiosError<{ error?: string; id?: string }>
        if (axiosError.response?.status === 404) {
          const errorMessage = axiosError.response?.data?.error || 'Entity not found'
          const errorId = axiosError.response?.data?.id || dynamicId

          // PATTERN: Update cache to remove missing entity, then invalidate to trigger refetch
          queryClient.setQueryData<GlobalData>(['globalData'], (old) => {
            if (!old) return old
            
            const currentEntities = old.entities[entityKey] || []
            const filteredEntities = currentEntities.filter(
              (entity) => String(entity.id) !== String(errorId)
            )
            
            // PATTERN: Filter out relationships with children array containing the deleted partInstance
            let updatedRelationships = old.relationships
            if (entityKey === 'partInstance' && old.relationships?.partAssignments) {
              updatedRelationships = {
                ...old.relationships,
                partAssignments: old.relationships.partAssignments.filter(
                  rel => !rel.children.some(child => String(child.id) === String(errorId))
                )
              }
            }
            
            return {
              ...old,
              entities: {
                ...old.entities,
                [entityKey]: filteredEntities,
              },
              relationships: updatedRelationships,
            }
          })

          queryClient.invalidateQueries({ queryKey: [entityKey] })
          if (entityKey === 'partInstance') {
            queryClient.invalidateQueries({ queryKey: ['partAssignments'] })
          }
          queryClient.invalidateQueries({ queryKey: ['globalData'] })

          throw new Error(`${errorMessage} (ID: ${errorId}). The entity has been removed from the cache.`)
        }
        throw axiosError
      }
    },
    onMutate: async (variables) => {
      // LEARNING: Optimistic update pattern
      // PATTERN: Cancel queries → Snapshot → Update → Return context for rollback
      
      // 1. Cancel any outgoing refetches to prevent race conditions
      await queryClient.cancelQueries({ queryKey: ['globalData'] })

      const previousData = queryClient.getQueryData<GlobalData>(['globalData'])

      queryClient.setQueryData<GlobalData>(['globalData'], (old) => {
        if (!old) {
          return old
        }

        const currentEntities = old.entities[entityKey] || []
        const entityIndex = currentEntities.findIndex((entity) => 
          String(entity.id) === String(variables.dynamicId)
        )

        if (entityIndex === -1) {
          if (isDevModeEnabled()) {
            logger.warn('Entity not found in cache. Cache may be stale', {
              entityId: variables.dynamicId,
              entityKey
            })
          }
          return old
        }

        // PATTERN: Update specific field using variables.admin.key and variables.admin.value
        const updatedEntities = [...currentEntities]
        updatedEntities[entityIndex] = {
          ...currentEntities[entityIndex], // LEARNING: Spread preserves all existing fields
          [variables.admin.key]: variables.admin.value, // Only update the single field being changed
        } as GlobalEntity<GlobalEntityTypeKey>

        // PATTERN: Compare field counts before and after update
        if (isDevModeEnabled()) {
          const beforeKeys = Object.keys(currentEntities[entityIndex])
          const afterKeys = Object.keys(updatedEntities[entityIndex])
          const missingKeys = beforeKeys.filter(key => !afterKeys.includes(key))
          if (missingKeys.length > 0) {
            console.warn(`[usePrimitiveMutation] Field count mismatch - fields lost:`, {
              entityKey,
              entityId: variables.dynamicId,
              beforeCount: beforeKeys.length,
              afterCount: afterKeys.length,
              beforeKeys,
              afterKeys,
              missingKeys,
              addedKeys: afterKeys.filter(key => !beforeKeys.includes(key))
            })
          }
        }

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
    onError: (error, _variables, context) => {
      // PATTERN: Check if error is 404 before rolling back
      const axiosError = error as AxiosError<{ error?: string; id?: string }>
      const is404 = axiosError.response?.status === 404
      const is404FromMessage = error instanceof Error && error.message.includes('not found') && error.message.includes('removed from the cache')
      const shouldSkipRollback = is404 || is404FromMessage
      
      if (context?.previousData && !shouldSkipRollback) {
        queryClient.setQueryData(['globalData'], context.previousData)
      }

      if (isDevModeEnabled()) {
        logger.error('Failed to update entity', { entityKey, error })
      }
    },
    onSuccess: () => {
      // PATTERN: Only invalidate, don't refetch - let related queries refetch when needed
      if (['blockInstance', 'blockShape'].includes(entityKey)) {
        queryClient.invalidateQueries({ queryKey: ['schedulerAdmin'] })
      }
    },
  })
}


