import { computed, type ComputedRef } from 'vue'
import type { FieldContextType } from '@/composables/useFieldContext'
import type { GlobalEntityKey } from '@/constants/entities'
import type { GlobalFieldKey } from '@/constants/primitives'
import type { AnnotationWithMetadata } from '@/types/annotations'
import { useNotification } from '@/composables/useNotification'
import { useAnnotations } from '@/composables/useAnnotations'
import { useAnnotationTypes } from '@/composables/useAnnotationTypes'
import { useAnnotationAssignments } from '@/composables/admin/useAnnotationAssignments'
import { useAnnotationMetadata } from '@/composables/admin/useAnnotationMetadata'
import { useAnnotationDialogState } from '@/composables/admin/useAnnotationDialogState'

export interface AnnotationsFieldViewModel {
  blockInstanceId: ComputedRef<string | undefined>

  // Data sources for template
  metadata: ReturnType<typeof useAnnotationMetadata>
  dialogState: ReturnType<typeof useAnnotationDialogState>
  annotationsWithMetadata: ComputedRef<Array<AnnotationWithMetadata & { blockInstanceNames?: string[] }>>
  sortedAnnotations: ComputedRef<Array<AnnotationWithMetadata & { blockInstanceNames?: string[] }>>
  availableAnnotations: ComputedRef<Array<{ id: string; text: string }>>
  allAnnotationsWithBlockInstances: ComputedRef<Array<{ id: string; displayText: string }>>

  // Template helpers
  hasDuplicateUserTypeBlock: (ann: AnnotationWithMetadata & { blockInstanceNames?: string[] }) => boolean
  getAvailableUserTypeBlocksForAnnotation: (ann: AnnotationWithMetadata & { blockInstanceNames?: string[] }) => Array<{ title: string; value: string | null }>

  // Handlers
  handleCloseDialog: () => void
  handleAddAnnotations: (annotationIds: string[]) => Promise<void>
  handleAddSelectedAnnotations: () => Promise<void>
  handleCreateAnnotation: () => Promise<void>
  handleUpdateAnnotationType: (ann: AnnotationWithMetadata & { blockInstanceNames?: string[]; type?: string }) => Promise<void>
  handleUpdateMetadata: (ann: AnnotationWithMetadata & { blockInstanceNames?: string[] }) => Promise<void>
  handleUpdateDefault: (ann: AnnotationWithMetadata) => Promise<void>
  handleRemoveAnnotation: (ann: AnnotationWithMetadata) => Promise<void>
}

/**
 * useAnnotationsFieldViewModel
 *
 * LEARNING: A “field view-model” composable: it owns all non-UI state/logic and handlers.
 * WHY: Keeps `AnnotationsField.vue` as a thin UI wrapper.
 * PATTERN: Compute view-ready arrays + provide safe handlers with explicit logging + notifications.
 */
export function useAnnotationsFieldViewModel(
  fieldContext: FieldContextType<GlobalEntityKey, GlobalFieldKey<GlobalEntityKey>>
): AnnotationsFieldViewModel {
  const { error: notifyError } = useNotification()

  const annotationsComposable = useAnnotations()
  const { data: allAnnotations } = annotationsComposable.fetchAll
  // LEARNING: Avoid destructuring `data = []` from vue-query (creates a union that breaks `.value` access).
  const annotationTypesQuery = useAnnotationTypes()
  const annotationTypes = computed(() => annotationTypesQuery.data.value ?? [])

  const metadata = useAnnotationMetadata()
  const dialogState = useAnnotationDialogState()

  const blockInstanceId = computed<string | undefined>(() => {
    const entityId = fieldContext.entityId
    if (!entityId || String(entityId).startsWith('new-')) return undefined
    return String(entityId)
  })

  const assignments = useAnnotationAssignments(blockInstanceId, {
    annotationsComposable: {
      create: annotationsComposable.create,
      patch: {
        mutateAsync: async (data: { id: string; data: { type: string } }) => {
          await annotationsComposable.patch.mutateAsync({ id: data.id, data: { type: data.data.type } })
        }
      },
    },
    dialogState,
    metadata,
  })

  const annotationsWithMetadata = computed(() => {
    if (!blockInstanceId.value) return []
    const blockInstanceAnnotations = assignments.blockInstanceAnnotations.value || []
    const allBlockInstanceAnnotations = assignments.allBlockInstanceAnnotations.value || []

    return metadata.computeAnnotationsWithMetadata(
      blockInstanceAnnotations,
      allAnnotations.value,
      annotationTypes.value,
      allBlockInstanceAnnotations,
      blockInstanceId.value
    )
  })

  const sortedAnnotations = computed(() => metadata.sortAnnotations(annotationsWithMetadata.value))

  const availableAnnotations = computed(() => {
    const assignedIds = annotationsWithMetadata.value.map(a => a.id)
    return metadata.getAvailableAnnotations(allAnnotations.value, assignedIds)
  })

  const allAnnotationsWithBlockInstances = computed(() => {
    const allBlockInstanceAnnotations = assignments.allBlockInstanceAnnotations.value || []
    return metadata.computeAnnotationsWithBlockInstances(allAnnotations.value, allBlockInstanceAnnotations)
  })

  const handleCloseDialog = (): void => {
    dialogState.closeDialog()
  }

  const handleAddAnnotations = async (annotationIds: string[]): Promise<void> => {
    if (!assignments.handleAddAnnotations) return
    try {
      await assignments.handleAddAnnotations(annotationIds, annotationsWithMetadata.value)
    } catch (error) {
      // Failed to add annotations
      notifyError('Failed to add annotations')
    }
  }

  const handleAddSelectedAnnotations = async (): Promise<void> => {
    if (!assignments.handleAddSelectedAnnotations) return
    try {
      await assignments.handleAddSelectedAnnotations(annotationsWithMetadata.value)
    } catch (error) {
      // Failed to add selected annotations
      const message = error instanceof Error ? error.message : 'Failed to add selected annotations'
      notifyError(message)
    }
  }

  const handleCreateAnnotation = async (): Promise<void> => {
    if (!assignments.handleCreateAnnotation) return
    try {
      await assignments.handleCreateAnnotation(annotationsWithMetadata.value)
    } catch (error) {
      // Failed to create annotation
      const message = error instanceof Error ? error.message : 'Failed to create annotation'
      notifyError(message)
    }
  }

  const handleUpdateAnnotationType = async (
    ann: AnnotationWithMetadata & { blockInstanceNames?: string[]; type?: string }
  ): Promise<void> => {
    if (!blockInstanceId.value || !ann.type || !assignments.handleUpdateAnnotationType) return
    try {
      await assignments.handleUpdateAnnotationType(ann.id, ann.type)
    } catch (error) {
      // Failed to update annotation type
      notifyError('Failed to update annotation type')
    }
  }

  const handleUpdateMetadata = async (
    ann: AnnotationWithMetadata & { blockInstanceNames?: string[] }
  ): Promise<void> => {
    if (!blockInstanceId.value || !assignments.handleUpdateMetadata) return
    try {
      await assignments.handleUpdateMetadata(ann.id, ann.orderIndex, ann.userTypeBlock, annotationsWithMetadata.value)
    } catch (error) {
      // Failed to update annotation metadata
      notifyError('Failed to update annotation')
    }
  }

  const handleUpdateDefault = async (ann: AnnotationWithMetadata): Promise<void> => {
    if (!blockInstanceId.value) return
    try {
      await assignments.updateDefault(ann.id, ann.isDefault, annotationsWithMetadata.value)
    } catch (error) {
      // Failed to update default annotation
      notifyError('Failed to update default')
    }
  }

  const handleRemoveAnnotation = async (ann: AnnotationWithMetadata): Promise<void> => {
    if (!blockInstanceId.value || !assignments.handleRemoveAnnotation) return
    try {
      await assignments.handleRemoveAnnotation(ann.id, ann.text)
    } catch (error) {
      // Failed to remove annotation
      notifyError('Failed to remove annotation')
    }
  }

  const hasDuplicateUserTypeBlock = (ann: AnnotationWithMetadata & { blockInstanceNames?: string[] }): boolean => {
    return metadata.checkDuplicateUserTypeBlock(ann, annotationsWithMetadata.value)
  }

  const getAvailableUserTypeBlocksForAnnotation = (ann: AnnotationWithMetadata & { blockInstanceNames?: string[] }) => {
    return metadata.getAvailableUserTypeBlocks(ann, annotationsWithMetadata.value)
  }

  return {
    blockInstanceId,
    metadata,
    dialogState,
    annotationsWithMetadata,
    sortedAnnotations,
    availableAnnotations,
    allAnnotationsWithBlockInstances,
    hasDuplicateUserTypeBlock,
    getAvailableUserTypeBlocksForAnnotation,
    handleCloseDialog,
    handleAddAnnotations,
    handleAddSelectedAnnotations,
    handleCreateAnnotation,
    handleUpdateAnnotationType,
    handleUpdateMetadata,
    handleUpdateDefault,
    handleRemoveAnnotation,
  }
}


