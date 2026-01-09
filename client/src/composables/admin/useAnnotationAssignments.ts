/**
 * useAnnotationAssignments Composable (facade)
 *
 * WHY: Keep the public API stable while splitting a high-complexity composable into query/state/actions modules.
 */

import { computed, type ComputedRef } from 'vue'
import {
  useAnnotationAssignmentsActions,
  useAnnotationAssignmentsQuery,
  useAnnotationAssignmentsState,
} from '@/composables/admin/annotationAssignments'

export type {
  CreateAssignmentData,
  UpdateAssignmentData,
  UseAnnotationAssignmentsOptions,
} from '@/composables/admin/annotationAssignments/types'

import type { UseAnnotationAssignmentsOptions } from '@/composables/admin/annotationAssignments/types'

export function useAnnotationAssignments(
  blockInstanceId: ComputedRef<string | undefined>,
  options?: UseAnnotationAssignmentsOptions
) {
  const { blockInstanceAnnotations, allBlockInstanceAnnotations, refetchRelationships } =
    useAnnotationAssignmentsQuery(blockInstanceId)

  const { getMaxOrderIndex } = useAnnotationAssignmentsState(blockInstanceAnnotations)

  const actions = useAnnotationAssignmentsActions({
    blockInstanceId,
    refetchRelationships: () => {
      // Vue Query's refetch has a richer signature; the facade uses it as a simple trigger.
      void refetchRelationships()
    },
    getMaxOrderIndex,
    options,
  })

  return {
    // State
    blockInstanceAnnotations: computed(() => blockInstanceAnnotations.value),
    allBlockInstanceAnnotations: computed(() => allBlockInstanceAnnotations.value),

    // Actions
    create: actions.create,
    createMultiple: actions.createMultiple,
    update: actions.update,
    updateDefault: actions.updateDefault,
    remove: actions.remove,
    refetch: refetchRelationships,

    // Handlers (when options provided)
    handleAddAnnotations: actions.handleAddAnnotations,
    handleAddSelectedAnnotations: actions.handleAddSelectedAnnotations,
    handleCreateAnnotation: actions.handleCreateAnnotation,
    handleUpdateAnnotationType: actions.handleUpdateAnnotationType,
    handleUpdateMetadata: actions.handleUpdateMetadata,
    handleRemoveAnnotation: actions.handleRemoveAnnotation,

    // Helpers
    getMaxOrderIndex,
  }
}

