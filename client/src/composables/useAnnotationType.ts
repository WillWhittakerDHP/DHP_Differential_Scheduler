/**
 * AnnotationType CRUD Composable
 * 
 * LEARNING: Composable for AnnotationType CRUD operations
 * WHY: AnnotationTypes are NOT in ENTITY_KEYS, so they need their own composable
 * PATTERN: Similar to useEntityCrud but specific to annotation types
 * 
 * Session 1.4.7: Refactored to read from globalData cache
 * WHY: AnnotationTypes are configuration data, should be in globalData with other config
 * PATTERN: Read from globalData, invalidate ['globalData'] on mutations using refetchQueries
 */

import { computed, type ComputedRef, type Ref } from 'vue'
import { useMutation, useQueryClient } from '@tanstack/vue-query'
import apiClient, { getAnnotationTypeEndpoint, getAnnotationTypeByIdEndpoint } from '@/utils/api'
import type { AnnotationType } from '@/types/annotations'
import { useGlobal } from './useGlobal'

/**
 * Return type for useAnnotationTypes (matches vue-query pattern for backward compatibility)
 */
export type UseAnnotationTypesReturn = {
  data: ComputedRef<AnnotationType[]>
  isLoading: Ref<boolean>
  error: Ref<Error | null>
}

/**
 * Fetch all annotation types from globalData cache
 * 
 * LEARNING: Reads from globalData instead of separate cache key
 * WHY: Unified cache management for all configuration data
 * PATTERN: Returns query-like object for backward compatibility with consumers
 * 
 * Session 1.4.7: Refactored to read from globalData.annotationTypes
 */
export function useAnnotationTypes(): UseAnnotationTypesReturn {
  const { globalData, isLoading, error } = useGlobal()
  
  const data = computed(() => globalData.value?.annotationTypes ?? [])
  
  return {
    data,
    isLoading,
    error,
  }
}

/**
 * Create annotation type mutation
 * 
 * LEARNING: Creates annotation type and refetches globalData
 * WHY: Ensures cache consistency after mutation
 * PATTERN: refetchQueries(['globalData']) on success
 */
export function useCreateAnnotationType() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: { name: string }): Promise<AnnotationType> => {
      const response = await apiClient.post<AnnotationType>(getAnnotationTypeEndpoint(), data)
      return response.data
    },
    onSuccess: async () => {
      await queryClient.refetchQueries({ queryKey: ['globalData'] })
    },
  })
}

/**
 * Update annotation type mutation
 * 
 * LEARNING: Updates annotation type and refetches globalData
 * WHY: Ensures cache consistency after mutation
 * PATTERN: refetchQueries(['globalData']) on success
 */
export function useUpdateAnnotationType() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: { name: string } }): Promise<AnnotationType> => {
      const response = await apiClient.put<AnnotationType>(getAnnotationTypeByIdEndpoint(id), data)
      return response.data
    },
    onSuccess: async () => {
      await queryClient.refetchQueries({ queryKey: ['globalData'] })
    },
  })
}

/**
 * Delete annotation type mutation
 * 
 * LEARNING: Deletes annotation type and refetches globalData
 * WHY: Ensures cache consistency after mutation
 * PATTERN: refetchQueries(['globalData']) on success
 */
export function useDeleteAnnotationType() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      await apiClient.delete(getAnnotationTypeByIdEndpoint(id))
    },
    onSuccess: async () => {
      await queryClient.refetchQueries({ queryKey: ['globalData'] })
    },
  })
}

