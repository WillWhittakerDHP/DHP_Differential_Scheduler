/**
 * EventInstance CRUD Composable
 * 
 * LEARNING: Composable for EventInstance CRUD operations
 * WHY: EventInstances are NOT in ENTITY_KEYS, so they need their own composable
 * PATTERN: Similar to useAnnotationTypes but specific to event instances
 * 
 * NOTE: EventInstances are configuration data, should be in globalData with other config
 */

import { computed, type ComputedRef, type Ref } from 'vue'
import { useMutation, useQueryClient } from '@tanstack/vue-query'
import apiClient, { getEventEndpoint, getEventByIdEndpoint } from '@/utils/api'
import type { EventInstance } from '@/types/events'
import { useGlobal } from './useGlobal'
import { createRefetchGlobalDataHandler } from './entityCrud/useSharedMutationHandlers'

/**
 * Return type for useEventInstances (matches vue-query pattern for backward compatibility)
 */
export type UseEventInstancesReturn = {
  data: ComputedRef<EventInstance[]>
  isLoading: Ref<boolean>
  error: Ref<Error | null>
}

/**
 * Load all event instances from globalData cache
 * 
 * LEARNING: Reads from globalData instead of separate cache key
 * WHY: Unified cache management for all configuration data
 * PATTERN: Returns query-like object for backward compatibility with consumers
 */
export function useEventInstances(): UseEventInstancesReturn {
  const { globalData, isLoading, error } = useGlobal()
  
  const data = computed(() => globalData.value?.eventInstances ?? [])
  
  return {
    data,
    isLoading,
    error,
  }
}

/**
 * Create event instance mutation
 * 
 * LEARNING: Creates event instance and refetches globalData
 * WHY: Ensures cache consistency after mutation
 * PATTERN: refetchQueries(['globalData']) on success
 */
export function useCreateEventInstance() {
  const queryClient = useQueryClient()
  const refetchGlobalData = createRefetchGlobalDataHandler(queryClient)

  return useMutation({
    mutationFn: async (data: {
      eventShapeRef: string
      name: string
      titleTemplate?: string | null
      descriptionTemplate?: string | null
      locationTemplate?: string | null
    }): Promise<EventInstance> => {
      const response = await apiClient.post<EventInstance>(getEventEndpoint('eventInstance'), data)
      return response.data
    },
    onSuccess: refetchGlobalData,
  })
}

/**
 * Update event instance mutation
 * 
 * LEARNING: Updates event instance and refetches globalData
 * WHY: Ensures cache consistency after mutation
 * PATTERN: refetchQueries(['globalData']) on success
 */
export function useUpdateEventInstance() {
  const queryClient = useQueryClient()
  const refetchGlobalData = createRefetchGlobalDataHandler(queryClient)

  return useMutation({
    mutationFn: async ({ id, data }: {
      id: string
      data: {
        name?: string
        titleTemplate?: string | null
        descriptionTemplate?: string | null
        locationTemplate?: string | null
      }
    }): Promise<EventInstance> => {
      const response = await apiClient.put<EventInstance>(getEventByIdEndpoint(id), data)
      return response.data
    },
    onSuccess: refetchGlobalData,
  })
}

/**
 * Delete event instance mutation
 * 
 * LEARNING: Deletes event instance and refetches globalData
 * WHY: Ensures cache consistency after mutation
 * PATTERN: refetchQueries(['globalData']) on success
 */
export function useDeleteEventInstance() {
  const queryClient = useQueryClient()
  const refetchGlobalData = createRefetchGlobalDataHandler(queryClient)

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      await apiClient.delete(getEventByIdEndpoint(id))
    },
    onSuccess: refetchGlobalData,
  })
}
