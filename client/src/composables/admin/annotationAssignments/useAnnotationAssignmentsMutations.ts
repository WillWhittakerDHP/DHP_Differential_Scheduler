/**
 * Annotation Assignments Mutations Module
 * 
 * LEARNING: Isolates core CRUD mutations for annotation assignments
 * WHY: Separates mutation logic from orchestration handlers for better maintainability
 * PATTERN: Module containing Vue Query mutations with optimistic updates
 */

import type { ComputedRef } from 'vue'
import { useMutation, useQueryClient } from '@tanstack/vue-query'
import apiClient from '@/utils/api'
import { getBlockInstanceAnnotationEndpoint, getBlockInstanceAnnotationsEndpoint } from '@/utils/api'
import type { CreateAssignmentData, UpdateAssignmentData } from './types'
import type { AnnotationAssignmentResponse, BlockInstanceAnnotationResponse } from '@/types/annotations'
import type { GlobalData } from '@/utils/transformers/fetchToGlobalTransformer'
import type { Logger } from '@/utils/logger'
import {
  applyOptimisticAssignmentCreateToGlobalData,
  applyOptimisticAssignmentDeleteToGlobalData,
  applyOptimisticAssignmentPatchToGlobalData,
  optimisticPatchAssignmentInList,
  optimisticRemoveAssignmentFromList,
  optimisticUpsertAssignmentInList,
  type AnnotationAssignmentLike,
} from '@/utils/optimistic/annotationAssignmentsOptimistic'

/**
 * Mutations module options
 */
export interface UseAnnotationAssignmentsMutationsOptions {
  blockInstanceId: ComputedRef<string | undefined>
  logger: Logger
}

/**
 * Mutations module return type
 */
export interface UseAnnotationAssignmentsMutationsReturn {
  create: (data: CreateAssignmentData) => Promise<unknown>
  update: (data: UpdateAssignmentData) => Promise<unknown>
  remove: (annotationId: string) => Promise<void>
}

/**
 * Helper to get block instance name from global data
 */
function getBlockInstanceNameFromGlobalData(
  globalData: GlobalData | undefined,
  blockInstanceId: string | undefined
): string | null {
  if (!blockInstanceId || !globalData) return null
  const blockInstances = globalData.entities.blockInstance || []
  const found = blockInstances.find((bi) => String(bi.id) === String(blockInstanceId))
  return found?.name ?? null
}

/**
 * Mutations module for annotation assignments
 * 
 * LEARNING: Isolates core CRUD mutations
 * WHY: Separates mutation logic from orchestration for better maintainability
 */
export function useAnnotationAssignmentsMutations(
  options: UseAnnotationAssignmentsMutationsOptions
): UseAnnotationAssignmentsMutationsReturn {
  const { blockInstanceId, logger } = options
  const queryClient = useQueryClient()

  const globalDataKey = ['globalData'] as const
  const blockInstanceAnnotationsKey = ['blockInstanceAnnotations', blockInstanceId] as const
  const allBlockInstanceAnnotationsKey = ['allBlockInstanceAnnotations'] as const

  const createMutation = useMutation({
    mutationFn: async (data: CreateAssignmentData) => {
      if (!blockInstanceId.value) throw new Error('Block instance ID required')
      const response = await apiClient.post(
        getBlockInstanceAnnotationsEndpoint(blockInstanceId.value),
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
      const currentBlockInstanceId = blockInstanceId.value
      if (!currentBlockInstanceId) throw new Error('Block instance ID required')

      await queryClient.cancelQueries({ queryKey: globalDataKey })
      await queryClient.cancelQueries({ queryKey: blockInstanceAnnotationsKey })
      await queryClient.cancelQueries({ queryKey: allBlockInstanceAnnotationsKey })

      const previousGlobalData = queryClient.getQueryData<GlobalData>(globalDataKey)
      const previousBlockInstanceAnnotations =
        queryClient.getQueryData<AnnotationAssignmentResponse[]>(blockInstanceAnnotationsKey)
      const previousAllBlockInstanceAnnotations =
        queryClient.getQueryData<BlockInstanceAnnotationResponse[]>(allBlockInstanceAnnotationsKey)

      const optimisticId = `optimistic-${currentBlockInstanceId}-${variables.annotationId}-${Date.now()}`
      const optimisticAssignment: AnnotationAssignmentResponse & AnnotationAssignmentLike = {
        id: optimisticId,
        blockInstanceId: currentBlockInstanceId,
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
          blockInstanceId: currentBlockInstanceId,
          assignment: {
            annotationId: variables.annotationId,
            orderIndex: variables.orderIndex,
            isDefault: variables.isDefault,
            userTypeBlockBlockInstanceId: variables.userTypeBlockBlockInstanceId,
          },
          devWarningPrefix: '[useAnnotationAssignmentsMutations.create]',
        })
      })

      // 3) Update the "all instances" flattened cache (used by admin views)
      const blockInstanceName = getBlockInstanceNameFromGlobalData(previousGlobalData, currentBlockInstanceId)
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
      if (!blockInstanceId.value) throw new Error('Block instance ID required')
      const response = await apiClient.patch(
        getBlockInstanceAnnotationEndpoint(blockInstanceId.value, data.annotationId),
        {
          orderIndex: data.orderIndex,
          isDefault: data.isDefault,
          userTypeBlockBlockInstanceId: data.userTypeBlockBlockInstanceId,
        }
      )
      return response.data
    },
    onMutate: async (variables) => {
      const currentBlockInstanceId = blockInstanceId.value
      if (!currentBlockInstanceId) throw new Error('Block instance ID required')

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
          blockInstanceId: currentBlockInstanceId,
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
      const currentBlockInstanceId = blockInstanceId.value
      if (!relationship?.annotationId || !currentBlockInstanceId) return

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
          blockInstanceId: currentBlockInstanceId,
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
      if (!blockInstanceId.value) throw new Error('Block instance ID required')
      await apiClient.delete(
        getBlockInstanceAnnotationEndpoint(blockInstanceId.value, annotationId)
      )
    },
    onMutate: async (annotationId) => {
      const currentBlockInstanceId = blockInstanceId.value
      if (!currentBlockInstanceId) throw new Error('Block instance ID required')

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
          blockInstanceId: currentBlockInstanceId,
          annotationId,
        })
      })

      queryClient.setQueryData<BlockInstanceAnnotationResponse[]>(allBlockInstanceAnnotationsKey, (old) => {
        const current = old ?? []
        return current.filter(
          (rel) =>
            !(
              String(rel.blockInstanceId) === String(currentBlockInstanceId) &&
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

  return {
    create: (data: CreateAssignmentData): Promise<unknown> => createMutation.mutateAsync(data),
    update: (data: UpdateAssignmentData): Promise<unknown> => updateMutation.mutateAsync(data),
    remove: (annotationId: string): Promise<void> => deleteMutation.mutateAsync(annotationId),
  }
}
