/**
 * EventShape CRUD Composable
 * 
 * LEARNING: Composable for EventShape CRUD operations
 * WHY: EventShapes are NOT in ENTITY_KEYS, so they need their own composable
 * PATTERN: Similar to useAnnotationTypes but specific to event shapes
 * 
 * NOTE: EventShapes are configuration data, should be in globalData with other config
 */

import { computed, type ComputedRef, type Ref } from 'vue'
import { useMutation, useQueryClient } from '@tanstack/vue-query'
import apiClient, { getEventShapeEndpoint, getEventShapeByIdEndpoint } from '@/utils/api'
import type { EventShape } from '@/types/events'
import { useGlobal } from './useGlobal'
import { createRefetchGlobalDataHandler } from './entityCrud/useSharedMutationHandlers'

/**
 * Return type for useEventShapes (matches vue-query pattern for backward compatibility)
 */
export type UseEventShapesReturn = {
  data: ComputedRef<EventShape[]>
  isLoading: Ref<boolean>
  error: Ref<Error | null>
}

/**
 * Load all event shapes from globalData cache
 * 
 * LEARNING: Reads from globalData instead of separate cache key
 * WHY: Unified cache management for all configuration data
 * PATTERN: Returns query-like object for backward compatibility with consumers
 */
export function useEventShapes(): UseEventShapesReturn {
  const { globalData, isLoading, error } = useGlobal()
  
  const data = computed(() => (globalData.value?.events?.eventShape || []) as EventShape[])
  
  return {
    data,
    isLoading,
    error,
  }
}

/**
 * Create event shape mutation
 * 
 * LEARNING: Creates event shape and refetches globalData
 * WHY: Ensures cache consistency after mutation
 * PATTERN: refetchQueries(['globalData']) on success
 */
export function useCreateEventShape() {
  const queryClient = useQueryClient()
  const refetchGlobalData = createRefetchGlobalDataHandler(queryClient)

  return useMutation({
    mutationFn: async (data: { name: string }): Promise<EventShape> => {
      const response = await apiClient.post<EventShape>(getEventEndpoint('eventShape'), data)
      return response.data
    },
    onSuccess: refetchGlobalData,
  })
}

/**
 * Update event shape mutation
 * 
 * LEARNING: Updates event shape and refetches globalData
 * WHY: Ensures cache consistency after mutation
 * PATTERN: refetchQueries(['globalData']) on success
 */
export function useUpdateEventShape() {
  const queryClient = useQueryClient()
  const refetchGlobalData = createRefetchGlobalDataHandler(queryClient)

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: { name: string } }): Promise<EventShape> => {
      const response = await apiClient.put<EventShape>(getEventShapeByIdEndpoint(id), data)
      return response.data
    },
    onSuccess: refetchGlobalData,
  })
}

/**
 * Delete event shape mutation
 * 
 * LEARNING: Deletes event shape and refetches globalData
 * WHY: Ensures cache consistency after mutation
 * PATTERN: refetchQueries(['globalData']) on success
 */
export function useDeleteEventShape() {
  const queryClient = useQueryClient()
  const refetchGlobalData = createRefetchGlobalDataHandler(queryClient)

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      await apiClient.delete(getEventShapeByIdEndpoint(id))
    },
    onSuccess: refetchGlobalData,
  })
}
