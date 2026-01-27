/**
 * Composable for annotation type filtering
 * WHY: Extracts filtering logic from ShapesTab
 * PATTERN: Computed property for filtered annotation types
 */

import { computed, type ComputedRef } from 'vue'
import { useAnnotationTypes } from '@/composables/useAnnotationTypes'

export interface UseAnnotationTypeFilteringReturn {
  annotationTypes: ComputedRef<import('@/types/annotations').AnnotationType[]>
  isLoadingAnnotationTypes: ComputedRef<boolean>
}

/**
 * Composable for filtering annotation types
 * WHY: Centralizes annotation type filtering logic
 * PATTERN: Returns computed properties for annotation types
 */
export function useAnnotationTypeFiltering(): UseAnnotationTypeFilteringReturn {
  /**
   * LEARNING: Fetch annotation types
   * WHY: Get all annotation types for display
   * PATTERN: useQuery hook from Vue Query
   */
  // LEARNING: Avoid destructuring `data = []` from vue-query (creates a union that breaks `.value` access).
  const annotationTypesQuery = useAnnotationTypes()
  const annotationTypes = computed(() => annotationTypesQuery.data.value ?? [])
  const isLoadingAnnotationTypes = computed(() => annotationTypesQuery.isLoading.value)

  return {
    annotationTypes,
    isLoadingAnnotationTypes
  }
}
