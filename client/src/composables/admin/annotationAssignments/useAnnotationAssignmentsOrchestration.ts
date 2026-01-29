/**
 * Annotation Assignments Orchestration Module
 * 
 * LEARNING: Isolates higher-level orchestration handlers for annotation assignments
 * WHY: Separates orchestration logic from core mutations for better maintainability
 * PATTERN: Module containing handlers that coordinate multiple mutations and UI state
 */

import type { ComputedRef } from 'vue'
import type { UseAnnotationAssignmentsOptions, AnnotationAssignmentHandlers } from './types'
import type { AnnotationWithMetadata } from '@/types/annotations'
import type { Logger } from '@/utils/logger'
import type { UseAnnotationAssignmentsMutationsReturn } from './useAnnotationAssignmentsMutations'

/**
 * Orchestration module options
 */
export interface UseAnnotationAssignmentsOrchestrationOptions {
  blockInstanceId: ComputedRef<string | undefined>
  refetchRelationships: () => void
  getMaxOrderIndex: () => number
  mutations: UseAnnotationAssignmentsMutationsReturn
  options?: UseAnnotationAssignmentsOptions
  logger: Logger
}

/**
 * Orchestration module return type
 * LEARNING: Uses shared AnnotationAssignmentHandlers type to eliminate duplication
 * WHY: Handler types are defined once in types.ts and reused here
 * PATTERN: Intersection type to combine orchestration-specific handlers with shared handlers
 */
export type UseAnnotationAssignmentsOrchestrationReturn = {
  createMultiple: (annotationIds: string[], userTypeBlockBlockInstanceId?: string | null) => Promise<void>
  updateDefault: (
    annotationId: string,
    isDefault: boolean,
    allAnnotations: Array<{ id: string; isDefault: boolean }>
  ) => Promise<void>
} & AnnotationAssignmentHandlers

/**
 * Orchestration module for annotation assignments
 * 
 * LEARNING: Isolates higher-level orchestration handlers
 * WHY: Separates orchestration logic from core mutations for better maintainability
 */
export function useAnnotationAssignmentsOrchestration(
  options: UseAnnotationAssignmentsOrchestrationOptions
): UseAnnotationAssignmentsOrchestrationReturn {
  const { blockInstanceId, refetchRelationships, getMaxOrderIndex, mutations, options: orchestrationOptions, logger } = options

  const createMultiple = async (
    annotationIds: string[],
    userTypeBlockBlockInstanceId: string | null = null
  ): Promise<void> => {
    if (!blockInstanceId.value) return

    const maxOrderIndex = getMaxOrderIndex()

    for (let i = 0; i < annotationIds.length; i++) {
      await mutations.create({
        annotationId: annotationIds[i],
        orderIndex: maxOrderIndex + 1 + i,
        isDefault: false,
        userTypeBlockBlockInstanceId,
      })
    }
  }

  const updateDefault = async (
    annotationId: string,
    isDefault: boolean,
    allAnnotations: Array<{ id: string; isDefault: boolean }>
  ): Promise<void> => {
    if (!blockInstanceId.value) return

    if (isDefault) {
      const otherDefaults = allAnnotations.filter((a) => a.id !== annotationId && a.isDefault)
      for (const other of otherDefaults) {
        await mutations.update({
          annotationId: other.id,
          isDefault: false,
        })
      }
    }

    await mutations.update({
      annotationId,
      isDefault,
    })
  }

  const handleAddAnnotations = async (
    annotationIds: string[],
    annotationsWithMetadata: Array<{ id: string }> = []
  ): Promise<void> => {
    if (!blockInstanceId.value) return

    const newIds = annotationIds.filter((id) => !annotationsWithMetadata.some((a) => a.id === id))
    if (newIds.length > 0) {
      await createMultiple(newIds, null)
    }

    if (orchestrationOptions?.dialogState) {
      orchestrationOptions.dialogState.resetQuickAdd()
    }
  }

  const handleAddSelectedAnnotations = async (
    annotationsWithMetadata: Array<{ id: string; userTypeBlock: string | null }> = []
  ): Promise<void> => {
    if (!blockInstanceId.value || !orchestrationOptions?.dialogState) return

    const selectedIds = orchestrationOptions.dialogState.selectedAnnotationIds.value
    const selectedUserTypeBlock = orchestrationOptions.dialogState.selectedUserTypeBlock.value

    if (!selectedIds || selectedIds.length === 0) return

    if (selectedUserTypeBlock !== null && orchestrationOptions.metadata) {
      const existingUserTypeBlock = annotationsWithMetadata.find((a) => a.userTypeBlock === selectedUserTypeBlock)
      if (existingUserTypeBlock) {
        throw new Error(
          `Cannot add: Another annotation already uses the "${selectedUserTypeBlock}" user type. Please select a different user type or remove the existing one first.`
        )
      }
    }

    try {
      await createMultiple(selectedIds, selectedUserTypeBlock)
      if (orchestrationOptions.dialogState) {
        orchestrationOptions.dialogState.closeDialog()
      }
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'response' in error) {
        const apiError = error as { response?: { status?: number; data?: { error?: string } } }
        if (apiError.response?.status === 400) {
          throw new Error(apiError.response.data?.error || 'Cannot add annotation with this user type')
        }
      }
      throw error
    }
  }

  const handleCreateAnnotation = async (
    annotationsWithMetadata: Array<{ id: string; userTypeBlock: string | null }> = []
  ): Promise<void> => {
    if (!orchestrationOptions?.dialogState || !orchestrationOptions?.annotationsComposable) return

    const newText = orchestrationOptions.dialogState.newAnnotationText.value.trim()
    const newType = orchestrationOptions.dialogState.newAnnotationType.value
    const newUserTypeBlock = orchestrationOptions.dialogState.newAnnotationUserTypeBlock.value

    if (!newText) return

    if (newUserTypeBlock !== null && orchestrationOptions.metadata && blockInstanceId.value) {
      const existingUserTypeBlock = annotationsWithMetadata.find((a) => a.userTypeBlock === newUserTypeBlock)
      if (existingUserTypeBlock) {
        throw new Error(
          `Cannot create: Another annotation already uses the "${newUserTypeBlock}" user type. Please select a different user type or remove the existing one first.`
        )
      }
    }

    if (!newType) {
      throw new Error('Please select an annotation type')
    }

    try {
      const newAnnotation = await orchestrationOptions.annotationsComposable.create.mutateAsync({
        text: newText,
        type: newType,
        userTypeBlock: newUserTypeBlock,
      })

      if (blockInstanceId.value) {
        try {
          await mutations.create({
            annotationId: newAnnotation.id,
            orderIndex: getMaxOrderIndex() + 1,
            isDefault: false,
            userTypeBlockBlockInstanceId: newUserTypeBlock,
          })
        } catch (error: unknown) {
          if (error && typeof error === 'object' && 'response' in error) {
            const apiError = error as { response?: { status?: number; data?: { error?: string } } }
            if (apiError.response?.status === 400) {
              throw new Error(apiError.response.data?.error || 'Cannot add annotation with this user type')
            }
          }
          throw error
        }
      }

      if (orchestrationOptions.dialogState) {
        orchestrationOptions.dialogState.closeDialog()
      }
    } catch (error) {
      logger.error('Error creating annotation:', error)
      throw error
    }
  }

  const handleUpdateAnnotationType = async (annotationId: string, type: string): Promise<void> => {
    if (!blockInstanceId.value || !type || !orchestrationOptions?.annotationsComposable) return

    try {
      await orchestrationOptions.annotationsComposable.patch.mutateAsync({
        id: annotationId,
        data: { type },
      })
      refetchRelationships()
    } catch (error) {
      logger.error('Failed to update annotation type:', error)
      throw error
    }
  }

  const handleUpdateMetadata = async (
    annotationId: string,
    orderIndex: number,
    userTypeBlock: string | null,
    annotationsWithMetadata: Array<{ id: string; userTypeBlock: string | null }> = []
  ): Promise<void> => {
    if (!blockInstanceId.value) return

    if (orchestrationOptions?.metadata && userTypeBlock !== null) {
      const annotation = annotationsWithMetadata.find((a) => a.id === annotationId)
      if (annotation) {
        const annotationWithUserTypeBlock = { ...annotation, userTypeBlock } as AnnotationWithMetadata & { blockInstanceNames?: string[] }
        const allAnnotationsTyped = annotationsWithMetadata as Array<AnnotationWithMetadata & { blockInstanceNames?: string[] }>
        if (orchestrationOptions.metadata.checkDuplicateUserTypeBlock(annotationWithUserTypeBlock, allAnnotationsTyped)) {
          logger.warn('Cannot update: Another annotation already uses this user type')
          return
        }
      }
    }

    await mutations.update({
      annotationId,
      orderIndex,
      userTypeBlockBlockInstanceId: userTypeBlock,
    })
  }

  const handleRemoveAnnotation = async (
    annotationId: string,
    annotationText: string,
    confirmRemove: () => boolean = () => confirm(`Remove annotation "${annotationText}"?`)
  ): Promise<void> => {
    if (!blockInstanceId.value) return
    if (!confirmRemove()) return

    await mutations.remove(annotationId)
  }

  return {
    createMultiple,
    updateDefault,
    handleAddAnnotations: orchestrationOptions ? handleAddAnnotations : undefined,
    handleAddSelectedAnnotations: orchestrationOptions ? handleAddSelectedAnnotations : undefined,
    handleCreateAnnotation: orchestrationOptions ? handleCreateAnnotation : undefined,
    handleUpdateAnnotationType: orchestrationOptions ? handleUpdateAnnotationType : undefined,
    handleUpdateMetadata: orchestrationOptions ? handleUpdateMetadata : undefined,
    handleRemoveAnnotation: orchestrationOptions ? handleRemoveAnnotation : undefined,
  }
}
