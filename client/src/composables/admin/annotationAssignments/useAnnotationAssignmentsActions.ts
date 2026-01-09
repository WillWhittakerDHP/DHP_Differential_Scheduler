import type { ComputedRef } from 'vue'
import { useMutation, useQueryClient } from '@tanstack/vue-query'
import apiClient from '@/utils/api'
import { getBlockInstanceAnnotationEndpoint, getBlockInstanceAnnotationsEndpoint } from '@/utils/api'
import type { CreateAssignmentData, UpdateAssignmentData, UseAnnotationAssignmentsOptions } from './types'
import type { AnnotationWithMetadata } from '@/types/annotations'
import type { AnnotationAssignmentResponse, BlockInstanceAnnotationResponse } from '@/types/annotations'
import type { GlobalData } from '@/utils/transformers/fetchToGlobalTransformer'
import { createLogger } from '@/utils/logger'
import {
  applyOptimisticAssignmentCreateToGlobalData,
  applyOptimisticAssignmentDeleteToGlobalData,
  applyOptimisticAssignmentPatchToGlobalData,
  optimisticPatchAssignmentInList,
  optimisticRemoveAssignmentFromList,
  optimisticUpsertAssignmentInList,
  type AnnotationAssignmentLike,
} from '@/utils/optimistic/annotationAssignmentsOptimistic'

type UseAnnotationAssignmentsActionsReturn = {
  create: (data: CreateAssignmentData) => Promise<unknown>
  update: (data: UpdateAssignmentData) => Promise<unknown>
  remove: (annotationId: string) => Promise<void>
  createMultiple: (annotationIds: string[], userTypeBlockBlockInstanceId?: string | null) => Promise<void>
  updateDefault: (
    annotationId: string,
    isDefault: boolean,
    allAnnotations: Array<{ id: string; isDefault: boolean }>
  ) => Promise<void>
  handleAddAnnotations?: (annotationIds: string[], annotationsWithMetadata?: Array<{ id: string }>) => Promise<void>
  handleAddSelectedAnnotations?: (
    annotationsWithMetadata?: Array<{ id: string; userTypeBlock: string | null }>
  ) => Promise<void>
  handleCreateAnnotation?: (
    annotationsWithMetadata?: Array<{ id: string; userTypeBlock: string | null }>
  ) => Promise<void>
  handleUpdateAnnotationType?: (annotationId: string, type: string) => Promise<void>
  handleUpdateMetadata?: (
    annotationId: string,
    orderIndex: number,
    userTypeBlock: string | null,
    annotationsWithMetadata?: Array<{ id: string; userTypeBlock: string | null }>
  ) => Promise<void>
  handleRemoveAnnotation?: (
    annotationId: string,
    annotationText: string,
    confirmRemove?: () => boolean
  ) => Promise<void>
}

type UseAnnotationAssignmentsActionsOptions = {
  blockInstanceId: ComputedRef<string | undefined>
  refetchRelationships: () => void
  getMaxOrderIndex: () => number
  options?: UseAnnotationAssignmentsOptions
}

/**
 * Actions module: mutations + orchestration handlers.
 *
 * NOTE: This is a mechanical extraction from `admin/useAnnotationAssignments.ts` to reduce file size.
 */
export function useAnnotationAssignmentsActions(
  actionOptions: UseAnnotationAssignmentsActionsOptions
): UseAnnotationAssignmentsActionsReturn {
  const queryClient = useQueryClient()
  const logger = createLogger('useAnnotationAssignmentsActions')

  const globalDataKey = ['globalData'] as const
  const blockInstanceAnnotationsKey = ['blockInstanceAnnotations', actionOptions.blockInstanceId] as const
  const allBlockInstanceAnnotationsKey = ['allBlockInstanceAnnotations'] as const

  const getBlockInstanceNameFromGlobalData = (globalData: GlobalData | undefined): string | null => {
    const id = actionOptions.blockInstanceId.value
    if (!id || !globalData) return null
    const blockInstances = globalData.entities.blockInstance || []
    const found = blockInstances.find((bi) => String(bi.id) === String(id))
    return found?.name ?? null
  }

  const createMutation = useMutation({
    mutationFn: async (data: CreateAssignmentData) => {
      if (!actionOptions.blockInstanceId.value) throw new Error('Block instance ID required')
      const response = await apiClient.post(
        getBlockInstanceAnnotationsEndpoint(actionOptions.blockInstanceId.value),
        {
          annotationId: data.annotationId,
          orderIndex: data.orderIndex,
          isDefault: data.isDefault,
          userTypeBlockBlockInstanceId: data.userTypeBlockBlockInstanceId,
        }
      )
      return response.data
    },
    onMutate: async (variables) => {
      const blockInstanceId = actionOptions.blockInstanceId.value
      if (!blockInstanceId) throw new Error('Block instance ID required')

      await queryClient.cancelQueries({ queryKey: globalDataKey })
      await queryClient.cancelQueries({ queryKey: blockInstanceAnnotationsKey })
      await queryClient.cancelQueries({ queryKey: allBlockInstanceAnnotationsKey })

      const previousGlobalData = queryClient.getQueryData<GlobalData>(globalDataKey)
      const previousBlockInstanceAnnotations =
        queryClient.getQueryData<AnnotationAssignmentResponse[]>(blockInstanceAnnotationsKey)
      const previousAllBlockInstanceAnnotations =
        queryClient.getQueryData<BlockInstanceAnnotationResponse[]>(allBlockInstanceAnnotationsKey)

      const optimisticId = `optimistic-${blockInstanceId}-${variables.annotationId}-${Date.now()}`
      const optimisticAssignment: AnnotationAssignmentResponse & AnnotationAssignmentLike = {
        id: optimisticId,
        blockInstanceId,
        annotationId: variables.annotationId,
        orderIndex: variables.orderIndex,
        isDefault: variables.isDefault,
        userTypeBlockBlockInstanceId: variables.userTypeBlockBlockInstanceId,
      }

      // 1) Update the per-block-instance assignments query cache
      queryClient.setQueryData<AnnotationAssignmentResponse[]>(blockInstanceAnnotationsKey, (old) =>
        optimisticUpsertAssignmentInList({
          old: old as Array<AnnotationAssignmentResponse & AnnotationAssignmentLike> | undefined,
          next: optimisticAssignment,
        }) as AnnotationAssignmentResponse[]
      )

      // 2) Update globalData (blockInstance.annotations + description)
      queryClient.setQueryData<GlobalData>(globalDataKey, (old) => {
        if (!old) return old
        return applyOptimisticAssignmentCreateToGlobalData({
          old,
          blockInstanceId,
          assignment: {
            annotationId: variables.annotationId,
            orderIndex: variables.orderIndex,
            isDefault: variables.isDefault,
            userTypeBlockBlockInstanceId: variables.userTypeBlockBlockInstanceId,
          },
          devWarningPrefix: '[useAnnotationAssignmentsActions.create]',
        })
      })

      // 3) Update the "all instances" flattened cache (used by admin views)
      const blockInstanceName = getBlockInstanceNameFromGlobalData(previousGlobalData)
      if (blockInstanceName) {
        queryClient.setQueryData<BlockInstanceAnnotationResponse[]>(allBlockInstanceAnnotationsKey, (old) => {
          const current = old ?? []
          const next: BlockInstanceAnnotationResponse = {
            ...optimisticAssignment,
            blockInstanceName,
          }
          const withoutSame = current.filter(
            (rel) =>
              !(String(rel.blockInstanceId) === String(next.blockInstanceId) && String(rel.annotationId) === String(next.annotationId))
          )
          return [...withoutSame, next].sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0))
        })
      }

      return {
        previousGlobalData,
        previousBlockInstanceAnnotations,
        previousAllBlockInstanceAnnotations,
      }
    },
    onError: (error, _variables, context) => {
      if (context?.previousGlobalData) {
        queryClient.setQueryData(globalDataKey, context.previousGlobalData)
      }
      if (context?.previousBlockInstanceAnnotations) {
        queryClient.setQueryData(blockInstanceAnnotationsKey, context.previousBlockInstanceAnnotations)
      }
      if (context?.previousAllBlockInstanceAnnotations) {
        queryClient.setQueryData(allBlockInstanceAnnotationsKey, context.previousAllBlockInstanceAnnotations)
      }
      logger.error('Failed to create annotation assignment:', error)
    },
    onSuccess: (data) => {
      // Reconcile optimistic assignment entry with server response (includes real ID).
      const relationship = data as AnnotationAssignmentResponse
      if (!relationship?.annotationId) return

      queryClient.setQueryData<AnnotationAssignmentResponse[]>(blockInstanceAnnotationsKey, (old) =>
        optimisticUpsertAssignmentInList({
          old: old as Array<AnnotationAssignmentResponse & AnnotationAssignmentLike> | undefined,
          next: relationship as AnnotationAssignmentResponse & AnnotationAssignmentLike,
        }) as AnnotationAssignmentResponse[]
      )
    },
  })

  const updateMutation = useMutation({
    mutationFn: async (data: UpdateAssignmentData) => {
      if (!actionOptions.blockInstanceId.value) throw new Error('Block instance ID required')
      const response = await apiClient.patch(
        getBlockInstanceAnnotationEndpoint(actionOptions.blockInstanceId.value, data.annotationId),
        {
          orderIndex: data.orderIndex,
          isDefault: data.isDefault,
          userTypeBlockBlockInstanceId: data.userTypeBlockBlockInstanceId,
        }
      )
      return response.data
    },
    onMutate: async (variables) => {
      const blockInstanceId = actionOptions.blockInstanceId.value
      if (!blockInstanceId) throw new Error('Block instance ID required')

      await queryClient.cancelQueries({ queryKey: globalDataKey })
      await queryClient.cancelQueries({ queryKey: blockInstanceAnnotationsKey })
      await queryClient.cancelQueries({ queryKey: allBlockInstanceAnnotationsKey })

      const previousGlobalData = queryClient.getQueryData<GlobalData>(globalDataKey)
      const previousBlockInstanceAnnotations =
        queryClient.getQueryData<AnnotationAssignmentResponse[]>(blockInstanceAnnotationsKey)
      const previousAllBlockInstanceAnnotations =
        queryClient.getQueryData<BlockInstanceAnnotationResponse[]>(allBlockInstanceAnnotationsKey)

      queryClient.setQueryData<AnnotationAssignmentResponse[]>(blockInstanceAnnotationsKey, (old) =>
        optimisticPatchAssignmentInList({
          old: old as Array<AnnotationAssignmentResponse & AnnotationAssignmentLike> | undefined,
          annotationId: variables.annotationId,
          patch: {
            orderIndex: variables.orderIndex,
            isDefault: variables.isDefault,
            userTypeBlockBlockInstanceId: variables.userTypeBlockBlockInstanceId,
          },
        }) as AnnotationAssignmentResponse[]
      )

      queryClient.setQueryData<GlobalData>(globalDataKey, (old) => {
        if (!old) return old
        return applyOptimisticAssignmentPatchToGlobalData({
          old,
          blockInstanceId,
          annotationId: variables.annotationId,
          patch: {
            orderIndex: variables.orderIndex,
            isDefault: variables.isDefault,
            userTypeBlockBlockInstanceId: variables.userTypeBlockBlockInstanceId,
          },
        })
      })

      queryClient.setQueryData<BlockInstanceAnnotationResponse[]>(allBlockInstanceAnnotationsKey, (old) => {
        const current = old ?? []
        return optimisticPatchAssignmentInList({
          old: current as Array<BlockInstanceAnnotationResponse & AnnotationAssignmentLike>,
          annotationId: variables.annotationId,
          patch: {
            orderIndex: variables.orderIndex,
            isDefault: variables.isDefault,
            userTypeBlockBlockInstanceId: variables.userTypeBlockBlockInstanceId,
          },
        }) as BlockInstanceAnnotationResponse[]
      })

      return {
        previousGlobalData,
        previousBlockInstanceAnnotations,
        previousAllBlockInstanceAnnotations,
      }
    },
    onError: (error, _variables, context) => {
      if (context?.previousGlobalData) {
        queryClient.setQueryData(globalDataKey, context.previousGlobalData)
      }
      if (context?.previousBlockInstanceAnnotations) {
        queryClient.setQueryData(blockInstanceAnnotationsKey, context.previousBlockInstanceAnnotations)
      }
      if (context?.previousAllBlockInstanceAnnotations) {
        queryClient.setQueryData(allBlockInstanceAnnotationsKey, context.previousAllBlockInstanceAnnotations)
      }
      logger.error('Failed to update annotation assignment:', error)
    },
    onSuccess: (data) => {
      const relationship = data as AnnotationAssignmentResponse
      const blockInstanceId = actionOptions.blockInstanceId.value
      if (!relationship?.annotationId || !blockInstanceId) return

      // Reconcile caches with server response.
      queryClient.setQueryData<AnnotationAssignmentResponse[]>(blockInstanceAnnotationsKey, (old) =>
        optimisticUpsertAssignmentInList({
          old: old as Array<AnnotationAssignmentResponse & AnnotationAssignmentLike> | undefined,
          next: relationship as AnnotationAssignmentResponse & AnnotationAssignmentLike,
        }) as AnnotationAssignmentResponse[]
      )

      queryClient.setQueryData<GlobalData>(globalDataKey, (old) => {
        if (!old) return old
        return applyOptimisticAssignmentPatchToGlobalData({
          old,
          blockInstanceId,
          annotationId: relationship.annotationId,
          patch: {
            orderIndex: relationship.orderIndex,
            isDefault: relationship.isDefault,
            userTypeBlockBlockInstanceId: relationship.userTypeBlockBlockInstanceId ?? null,
          },
        })
      })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (annotationId: string): Promise<void> => {
      if (!actionOptions.blockInstanceId.value) throw new Error('Block instance ID required')
      await apiClient.delete(
        getBlockInstanceAnnotationEndpoint(actionOptions.blockInstanceId.value, annotationId)
      )
    },
    onMutate: async (annotationId) => {
      const blockInstanceId = actionOptions.blockInstanceId.value
      if (!blockInstanceId) throw new Error('Block instance ID required')

      await queryClient.cancelQueries({ queryKey: globalDataKey })
      await queryClient.cancelQueries({ queryKey: blockInstanceAnnotationsKey })
      await queryClient.cancelQueries({ queryKey: allBlockInstanceAnnotationsKey })

      const previousGlobalData = queryClient.getQueryData<GlobalData>(globalDataKey)
      const previousBlockInstanceAnnotations =
        queryClient.getQueryData<AnnotationAssignmentResponse[]>(blockInstanceAnnotationsKey)
      const previousAllBlockInstanceAnnotations =
        queryClient.getQueryData<BlockInstanceAnnotationResponse[]>(allBlockInstanceAnnotationsKey)

      queryClient.setQueryData<AnnotationAssignmentResponse[]>(blockInstanceAnnotationsKey, (old) =>
        optimisticRemoveAssignmentFromList({
          old: old as Array<AnnotationAssignmentResponse & AnnotationAssignmentLike> | undefined,
          annotationId,
        }) as AnnotationAssignmentResponse[]
      )

      queryClient.setQueryData<GlobalData>(globalDataKey, (old) => {
        if (!old) return old
        return applyOptimisticAssignmentDeleteToGlobalData({
          old,
          blockInstanceId,
          annotationId,
        })
      })

      queryClient.setQueryData<BlockInstanceAnnotationResponse[]>(allBlockInstanceAnnotationsKey, (old) => {
        const current = old ?? []
        return current.filter(
          (rel) =>
            !(
              String(rel.blockInstanceId) === String(blockInstanceId) &&
              String(rel.annotationId) === String(annotationId)
            )
        )
      })

      return {
        previousGlobalData,
        previousBlockInstanceAnnotations,
        previousAllBlockInstanceAnnotations,
      }
    },
    onError: (error, _annotationId, context) => {
      if (context?.previousGlobalData) {
        queryClient.setQueryData(globalDataKey, context.previousGlobalData)
      }
      if (context?.previousBlockInstanceAnnotations) {
        queryClient.setQueryData(blockInstanceAnnotationsKey, context.previousBlockInstanceAnnotations)
      }
      if (context?.previousAllBlockInstanceAnnotations) {
        queryClient.setQueryData(allBlockInstanceAnnotationsKey, context.previousAllBlockInstanceAnnotations)
      }
      logger.error('Failed to delete annotation assignment:', error)
    },
  })

  const create = (data: CreateAssignmentData): Promise<unknown> => createMutation.mutateAsync(data)
  const update = (data: UpdateAssignmentData): Promise<unknown> => updateMutation.mutateAsync(data)
  const remove = (annotationId: string): Promise<void> => deleteMutation.mutateAsync(annotationId)

  const createMultiple = async (
    annotationIds: string[],
    userTypeBlockBlockInstanceId: string | null = null
  ): Promise<void> => {
    if (!actionOptions.blockInstanceId.value) return

    const maxOrderIndex = actionOptions.getMaxOrderIndex()

    for (let i = 0; i < annotationIds.length; i++) {
      await create({
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
    if (!actionOptions.blockInstanceId.value) return

    if (isDefault) {
      const otherDefaults = allAnnotations.filter((a) => a.id !== annotationId && a.isDefault)
      for (const other of otherDefaults) {
        await update({
          annotationId: other.id,
          isDefault: false,
        })
      }
    }

    await update({
      annotationId,
      isDefault,
    })
  }

  const handleAddAnnotations = async (
    annotationIds: string[],
    annotationsWithMetadata: Array<{ id: string }> = []
  ): Promise<void> => {
    if (!actionOptions.blockInstanceId.value) return

    const newIds = annotationIds.filter((id) => !annotationsWithMetadata.some((a) => a.id === id))
    if (newIds.length > 0) {
      await createMultiple(newIds, null)
    }

    if (actionOptions.options?.dialogState) {
      actionOptions.options.dialogState.resetQuickAdd()
    }
  }

  const handleAddSelectedAnnotations = async (
    annotationsWithMetadata: Array<{ id: string; userTypeBlock: string | null }> = []
  ): Promise<void> => {
    if (!actionOptions.blockInstanceId.value || !actionOptions.options?.dialogState) return

    const selectedIds = actionOptions.options.dialogState.selectedAnnotationIds.value
    const selectedUserTypeBlock = actionOptions.options.dialogState.selectedUserTypeBlock.value

    if (!selectedIds || selectedIds.length === 0) return

    if (selectedUserTypeBlock !== null && actionOptions.options.metadata) {
      const existingUserTypeBlock = annotationsWithMetadata.find((a) => a.userTypeBlock === selectedUserTypeBlock)
      if (existingUserTypeBlock) {
        throw new Error(
          `Cannot add: Another annotation already uses the "${selectedUserTypeBlock}" user type. Please select a different user type or remove the existing one first.`
        )
      }
    }

    try {
      await createMultiple(selectedIds, selectedUserTypeBlock)
      if (actionOptions.options.dialogState) {
        actionOptions.options.dialogState.closeDialog()
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
    if (!actionOptions.options?.dialogState || !actionOptions.options?.annotationsComposable) return

    const newText = actionOptions.options.dialogState.newAnnotationText.value.trim()
    const newType = actionOptions.options.dialogState.newAnnotationType.value
    const newUserTypeBlock = actionOptions.options.dialogState.newAnnotationUserTypeBlock.value

    if (!newText) return

    if (newUserTypeBlock !== null && actionOptions.options.metadata && actionOptions.blockInstanceId.value) {
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
      const newAnnotation = await actionOptions.options.annotationsComposable.create.mutateAsync({
        text: newText,
        type: newType,
        userTypeBlock: newUserTypeBlock,
      })

      if (actionOptions.blockInstanceId.value) {
        try {
          await create({
            annotationId: newAnnotation.id,
            orderIndex: actionOptions.getMaxOrderIndex() + 1,
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

      if (actionOptions.options.dialogState) {
        actionOptions.options.dialogState.closeDialog()
      }
    } catch (error) {
      logger.error('Error creating annotation:', error)
      throw error
    }
  }

  const handleUpdateAnnotationType = async (annotationId: string, type: string): Promise<void> => {
    if (!actionOptions.blockInstanceId.value || !type || !actionOptions.options?.annotationsComposable) return

    try {
      await actionOptions.options.annotationsComposable.patch.mutateAsync({
        id: annotationId,
        data: { type },
      })
      actionOptions.refetchRelationships()
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
    if (!actionOptions.blockInstanceId.value) return

    if (actionOptions.options?.metadata && userTypeBlock !== null) {
      const annotation = annotationsWithMetadata.find((a) => a.id === annotationId)
      if (annotation) {
        const annotationWithUserTypeBlock = { ...annotation, userTypeBlock } as AnnotationWithMetadata & { blockInstanceNames?: string[] }
        const allAnnotationsTyped = annotationsWithMetadata as Array<AnnotationWithMetadata & { blockInstanceNames?: string[] }>
        if (actionOptions.options.metadata.checkDuplicateUserTypeBlock(annotationWithUserTypeBlock, allAnnotationsTyped)) {
          logger.warn('Cannot update: Another annotation already uses this user type')
          return
        }
      }
    }

    await update({
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
    if (!actionOptions.blockInstanceId.value) return
    if (!confirmRemove()) return

    await remove(annotationId)
  }

  return {
    create,
    update,
    remove,
    createMultiple,
    updateDefault,
    handleAddAnnotations: actionOptions.options ? handleAddAnnotations : undefined,
    handleAddSelectedAnnotations: actionOptions.options ? handleAddSelectedAnnotations : undefined,
    handleCreateAnnotation: actionOptions.options ? handleCreateAnnotation : undefined,
    handleUpdateAnnotationType: actionOptions.options ? handleUpdateAnnotationType : undefined,
    handleUpdateMetadata: actionOptions.options ? handleUpdateMetadata : undefined,
    handleRemoveAnnotation: actionOptions.options ? handleRemoveAnnotation : undefined,
  }
}


