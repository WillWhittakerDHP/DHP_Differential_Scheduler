/**
 * useAnnotations Composable
 * 
 * LEARNING: Vue composable for annotation CRUD operations
 * WHY: Provides reactive annotation mutations with error handling
 * PATTERN: Vue Query useMutation for data mutations
 * 
 * Session 1.4.6: Created following useAppointment pattern
 * WHY: Unified cache ensures all CRUD operations go through same cache layer
 * PATTERN: Read from globalData cache, invalidate ['globalData'] on mutations
 */

import { getAnnotationByIdEndpoint, getAnnotationEndpoint } from '@/utils/api'
import type { Annotation } from '@/types/annotations'
import type { GlobalData } from '@/utils/transformers/fetchToGlobalTransformer'
import type { GlobalDataCollectionCrudComposableReturn } from '@/composables/globalDataCollections/types'
import { useGlobalDataCollectionCrud } from '@/composables/globalDataCollections/useGlobalDataCollectionCrud'

/**
 * Annotation request type for create/update operations
 * LEARNING: Partial annotation data for mutations
 * WHY: Allows partial updates without requiring all fields
 * PATTERN: Partial type for flexibility
 */
export type AnnotationRequest = {
  text: string
  type: string // AnnotationType ID
  userTypeBlock?: string | null // BlockInstance ID or null
}

/**
 * useAnnotations composable
 * LEARNING: Provides annotation CRUD operations
 * WHY: Centralizes annotation API logic with reactive state management
 * PATTERN: Vue Query useMutation for create/update operations
 * Session 1.4.6: Follows useAppointment pattern for consistency
 */
type UseAnnotationsReturn = Omit<
  GlobalDataCollectionCrudComposableReturn<Annotation, AnnotationRequest, Partial<AnnotationRequest>>,
  'extras'
>

export function useAnnotations(): UseAnnotationsReturn {
  return useGlobalDataCollectionCrud<Annotation, AnnotationRequest, Partial<AnnotationRequest>>({
    collectionName: 'annotations',
    selectCollection: (globalData: GlobalData) => globalData.annotations,
    updateCollection: (globalData: GlobalData, updatedCollection: readonly Annotation[]): GlobalData => ({
      ...globalData,
      annotations: [...updatedCollection],
    }),
    endpoints: {
      listEndpoint: getAnnotationEndpoint,
      byIdEndpoint: getAnnotationByIdEndpoint,
    },
  })
}

