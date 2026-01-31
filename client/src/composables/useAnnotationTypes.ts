/**
 * AnnotationShape CRUD Composable
 * 
 * LEARNING: Composable for AnnotationShape CRUD operations
 * WHY: AnnotationShapes are NOT in ENTITY_KEYS, so they need their own composable
 * PATTERN: Similar to useEntityCrud but specific to annotation shapes
 * 
 * Session 1.4.7: Refactored to read from globalData cache
 * WHY: AnnotationShapes are configuration data, should be in globalData with other config
 * PATTERN: Read from globalData, invalidate ['globalData'] on mutations using refetchQueries
 * 
 * NOTE: Renamed from useAnnotationTypes to useAnnotationShapes (2026-01-30)
 */

import { computed, type ComputedRef, type Ref } from 'vue'
import { useMutation, useQueryClient } from '@tanstack/vue-query'
import apiClient, { getAnnotationShapeEndpoint, getAnnotationShapeByIdEndpoint } from '@/utils/api'
import type { AnnotationShape } from '@/types/annotations'
import { useGlobal } from './useGlobal'
import { createRefetchGlobalDataHandler } from './entityCrud/useSharedMutationHandlers'

/**
 * Return type for useAnnotationShapes
 */
export type UseAnnotationShapesReturn = {
  data: ComputedRef<AnnotationShape[]>
  isLoading: Ref<boolean>
  error: Ref<Error | null>
}

/**
 * Load all annotation shapes from globalData cache
 * 
 * LEARNING: Reads from globalData instead of separate cache key
 * WHY: Unified cache management for all configuration data
 * PATTERN: Returns query-like object
 * 
 * Session 1.4.7: Refactored to read from globalData.annotationShapes
 * NOTE: Renamed from useAnnotationTypes to useAnnotationShapes (2026-01-30)
 */
export function useAnnotationShapes(): UseAnnotationShapesReturn {
  const { globalData, isLoading, error } = useGlobal()
  
  const data = computed(() => (globalData.value?.annotations?.annotationShape || []) as AnnotationShape[])
  
  return {
    data,
    isLoading,
    error,
  }
}

/**
 * Create annotation shape mutation
 * 
 * LEARNING: Creates annotation shape and refetches globalData
 * WHY: Ensures cache consistency after mutation
 * PATTERN: refetchQueries(['globalData']) on success
 * 
 * NOTE: Renamed from useCreateAnnotationType (2026-01-30)
 */
export function useCreateAnnotationShape() {
  const queryClient = useQueryClient()
  // LEARNING: Use shared mutation handler for refetching globalData
  // WHY: Eliminates duplication of common refetch pattern
  // PATTERN: Extract shared handler to utility function
  const refetchGlobalData = createRefetchGlobalDataHandler(queryClient)

  return useMutation({
    mutationFn: async (data: { name: string }): Promise<AnnotationShape> => {
      const response = await apiClient.post<AnnotationShape>(getAnnotationShapeEndpoint(), data)
      return response.data
    },
    onSuccess: refetchGlobalData,
  })
}

/**
 * Update annotation shape mutation
 * 
 * LEARNING: Updates annotation shape and refetches globalData
 * WHY: Ensures cache consistency after mutation
 * PATTERN: refetchQueries(['globalData']) on success
 * 
 * NOTE: Renamed from useUpdateAnnotationType (2026-01-30)
 */
export function useUpdateAnnotationShape() {
  const queryClient = useQueryClient()
  // LEARNING: Use shared mutation handler for refetching globalData
  // WHY: Eliminates duplication of common refetch pattern
  // PATTERN: Extract shared handler to utility function
  const refetchGlobalData = createRefetchGlobalDataHandler(queryClient)

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: { name: string } }): Promise<AnnotationShape> => {
      const response = await apiClient.put<AnnotationShape>(getAnnotationShapeByIdEndpoint(id), data)
      return response.data
    },
    onSuccess: refetchGlobalData,
  })
}

/**
 * Delete annotation shape mutation
 * 
 * LEARNING: Deletes annotation shape and refetches globalData
 * WHY: Ensures cache consistency after mutation
 * PATTERN: refetchQueries(['globalData']) on success
 * 
 * NOTE: Renamed from useDeleteAnnotationType (2026-01-30)
 */
export function useDeleteAnnotationShape() {
  const queryClient = useQueryClient()
  // LEARNING: Use shared mutation handler for refetching globalData
  // WHY: Eliminates duplication of common refetch pattern
  // PATTERN: Extract shared handler to utility function
  const refetchGlobalData = createRefetchGlobalDataHandler(queryClient)

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      await apiClient.delete(getAnnotationShapeByIdEndpoint(id))
    },
    onSuccess: refetchGlobalData,
  })
}
