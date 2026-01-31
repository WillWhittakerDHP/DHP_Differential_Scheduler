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
import type { AnnotationInstance } from '@/types/annotations'
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
  type: string // AnnotationShape ID
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
  GlobalDataCollectionCrudComposableReturn<AnnotationInstance, AnnotationRequest, Partial<AnnotationRequest>>,
  'extras'
>

export function useAnnotations(): UseAnnotationsReturn {
  return useGlobalDataCollectionCrud<AnnotationInstance, AnnotationRequest, Partial<AnnotationRequest>>({
    collectionName: 'annotations',
    selectCollection: (globalData: GlobalData) => (globalData.annotations?.annotationInstance || []) as AnnotationInstance[],
    updateCollection: (globalData: GlobalData, updatedCollection: readonly AnnotationInstance[]): GlobalData => ({
      ...globalData,
      annotations: {
        ...globalData.annotations,
        annotationInstance: [...updatedCollection],
      },
    }),
    endpoints: {
      listEndpoint: () => getAnnotationEndpoint('annotationInstance'),
      byIdEndpoint: getAnnotationByIdEndpoint,
    },
  })
}

