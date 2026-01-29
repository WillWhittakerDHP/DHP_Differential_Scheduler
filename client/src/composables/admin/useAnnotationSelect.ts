/**
 * Annotation Select Composable
 * 
 * LEARNING: Extracts annotation-specific select logic from SelectInputs component
 * WHY: Components should be thin UI wrappers - annotation handling belongs in composables
 * PATTERN: Composable that provides annotation fetching and relationship management
 * 
 * This composable handles:
 * - Annotation fetching from globalData cache
 * - AnnotationAssignment relationship queries
 * - Creating/deleting annotation relationships
 * - Block instance ID determination for annotations
 */

import { computed, type ComputedRef } from 'vue'
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import type { UseMutationReturnType } from '@tanstack/vue-query'
import apiClient from '@/utils/api'
import { getBlockInstanceAnnotationsEndpoint, getBlockInstanceAnnotationEndpoint } from '@/utils/api'
import { useAnnotations } from '../useAnnotations'
import { isDevModeEnabled } from '@/utils/env/devMode'
import type { GlobalEntityKey } from '@/constants/entities'
import type { GlobalFieldKey } from '@/constants/primitives'
import type { FieldContextType } from '../useFieldContext'
import type { GlobalData } from '@/utils/transformers/fetchToGlobalTransformer'
import {
  applyOptimisticAssignmentCreateToGlobalData,
  applyOptimisticAssignmentDeleteToGlobalData,
  optimisticRemoveAssignmentFromList,
  optimisticUpsertAssignmentInList,
  type AnnotationAssignmentLike,
} from '@/utils/optimistic/annotationAssignmentsOptimistic'
import { cancelQueriesBeforeMutate } from '../entityCrud/useSharedMutationHandlers'

type AnnotationAssignmentRelationship = {
  id: string
  blockInstanceId: string
  annotationId: string
  orderIndex: number
  isDefault: boolean
  userTypeBlockBlockInstanceId: string | null
}

type CreateAnnotationRelationshipPayload = {
  annotationId: string
  orderIndex?: number
  isDefault?: boolean
  userTypeBlockBlockInstanceId?: string | null
}

/**
 * Annotation Select Composable Options
 */
export interface UseAnnotationSelectOptions {
  /**
   * Whether this is a DescriptionSelect field
   */
  isDescriptionSelect: ComputedRef<boolean>
  
  /**
   * Field context containing entityKey and entityId
   */
  fieldContext: FieldContextType<GlobalEntityKey, GlobalFieldKey<GlobalEntityKey>>
}

/**
 * Annotation Select Composable Return Type
 */
export interface UseAnnotationSelectReturn {
  /**
   * Annotations from globalData cache
   */
  annotations: ComputedRef<Array<{ id: string; text: string; userTypeBlock: string | null }>>
  
  /**
   * Block instance ID for annotation queries (null if not applicable)
   */
  blockInstanceId: ComputedRef<string | null>
  
  /**
   * AnnotationAssignment relationships for current block instance
   */
  blockInstanceAnnotations: ComputedRef<AnnotationAssignmentRelationship[]>
  
  /**
   * Mutation for creating AnnotationAssignment relationships
   */
  createAnnotationRelationship: UseMutationReturnType<
    AnnotationAssignmentRelationship,
    Error,
    CreateAnnotationRelationshipPayload,
    unknown
  >
  
  /**
   * Mutation for deleting AnnotationAssignment relationships
   */
  deleteAnnotationRelationship: UseMutationReturnType<void, Error, string, unknown>
}

/**
 * Annotation Select Composable
 * 
 * LEARNING: Provides annotation-specific logic extracted from SelectInputs component
 * WHY: Moves business logic out of components into reusable composable
 * PATTERN: Composable with queries and mutations for annotation management
 */
export function useAnnotationSelect(
  options: UseAnnotationSelectOptions
): UseAnnotationSelectReturn {
  const { isDescriptionSelect, fieldContext } = options

  // Session 1.4.6: Read annotations from globalData cache instead of separate query
  // LEARNING: Use useAnnotations composable's fetchAll which reads from globalData.annotations
  // WHY: Unified cache ensures all data comes from globalData
  // PATTERN: Read from globalData cache instead of direct API call
  const annotationsComposable = useAnnotations()
  const annotations = computed(() => {
    // Only return annotations if this is a DescriptionSelect field
    if (!isDescriptionSelect.value) return []
    return annotationsComposable.fetchAll.data.value || []
  })

  /**
   * LEARNING: Fetch AnnotationAssignment relationships for current block instance
   * WHY: Need to know which annotations are currently linked to this block instance
   * PATTERN: Use useQuery to fetch relationships, only when entity exists and is blockInstance
   */
  const blockInstanceId = computed(() => {
    if (!isDescriptionSelect.value || fieldContext.entityKey !== 'blockInstance') return null
    const entityIdString = String(fieldContext.entityId)
    // Skip temp entities (they don't have relationships yet)
    if (entityIdString.startsWith('new-')) return null
    return entityIdString
  })

  /**
   * LEARNING: Avoid destructuring `data = []` from vue-query.
   * WHY: `data = []` creates a union like `never[] | Ref<T[] | undefined>`, which breaks `.value` access.
   * PATTERN: Keep the query object, then derive a normalized computed list.
   */
  const blockInstanceAnnotationsQuery = useQuery({
    queryKey: ['blockInstanceAnnotations', blockInstanceId],
    queryFn: async () => {
      if (!blockInstanceId.value) return []
      const response = await apiClient.get(getBlockInstanceAnnotationsEndpoint(blockInstanceId.value))
      return response.data as AnnotationAssignmentRelationship[]
    },
    enabled: () => isDescriptionSelect.value && !!blockInstanceId.value
  })

  /**
   * LEARNING: Query client for mutations
   */
  const queryClient = useQueryClient()
  const globalDataKey = ['globalData'] as const
  const blockInstanceAnnotationsKey = ['blockInstanceAnnotations', blockInstanceId] as const

  /**
   * LEARNING: Mutation for creating AnnotationAssignment relationships
   */
  const createAnnotationRelationship = useMutation<
    AnnotationAssignmentRelationship,
    Error,
    CreateAnnotationRelationshipPayload,
    { previousGlobalData?: GlobalData; previousRelationships?: AnnotationAssignmentRelationship[] }
  >({
    mutationFn: async ({
      annotationId,
      orderIndex = 0,
      isDefault = false,
      userTypeBlockBlockInstanceId = null,
    }: CreateAnnotationRelationshipPayload) => {
      if (!blockInstanceId.value) throw new Error('Block instance ID is required')
      const response = await apiClient.post(getBlockInstanceAnnotationsEndpoint(blockInstanceId.value), {
        annotationId,
        orderIndex,
        isDefault,
        userTypeBlockBlockInstanceId
      })
      return response.data as AnnotationAssignmentRelationship
    },
    onMutate: async (variables) => {
      const currentBlockInstanceId = blockInstanceId.value
      if (!currentBlockInstanceId) throw new Error('Block instance ID is required')

      // LEARNING: Use shared utility to cancel queries in parallel
      // WHY: Eliminates duplication and combines multiple await calls
      // PATTERN: Extract shared query cancellation logic
      await cancelQueriesBeforeMutate(queryClient, [
        globalDataKey,
        blockInstanceAnnotationsKey,
      ])

      const previousGlobalData = queryClient.getQueryData<GlobalData>(globalDataKey)
      const previousRelationships =
        queryClient.getQueryData<AnnotationAssignmentRelationship[]>(blockInstanceAnnotationsKey)

      const optimisticId = `optimistic-${currentBlockInstanceId}-${variables.annotationId}-${Date.now()}`
      const optimisticRelationship: AnnotationAssignmentRelationship & AnnotationAssignmentLike = {
        id: optimisticId,
        blockInstanceId: currentBlockInstanceId,
        annotationId: variables.annotationId,
        orderIndex: variables.orderIndex ?? 0,
        isDefault: variables.isDefault ?? false,
        userTypeBlockBlockInstanceId: variables.userTypeBlockBlockInstanceId ?? null,
      }

      queryClient.setQueryData<AnnotationAssignmentRelationship[]>(blockInstanceAnnotationsKey, (old) =>
        optimisticUpsertAssignmentInList({
          old: old as Array<AnnotationAssignmentRelationship & AnnotationAssignmentLike> | undefined,
          next: optimisticRelationship,
        }) as AnnotationAssignmentRelationship[]
      )

      queryClient.setQueryData<GlobalData>(globalDataKey, (old) => {
        if (!old) return old
        return applyOptimisticAssignmentCreateToGlobalData({
          old,
          blockInstanceId: currentBlockInstanceId,
          assignment: {
            annotationId: variables.annotationId,
            orderIndex: variables.orderIndex ?? 0,
            isDefault: variables.isDefault ?? false,
            userTypeBlockBlockInstanceId: variables.userTypeBlockBlockInstanceId ?? null,
          },
          devWarningPrefix: '[useAnnotationSelect.createAnnotationRelationship]',
        })
      })

      return { previousGlobalData, previousRelationships }
    },
    onError: (error, _variables, context) => {
      if (context?.previousGlobalData) queryClient.setQueryData(globalDataKey, context.previousGlobalData)
      if (context?.previousRelationships) queryClient.setQueryData(blockInstanceAnnotationsKey, context.previousRelationships)
      if (isDevModeEnabled()) {
         
        console.error('[useAnnotationSelect] Failed to create annotation relationship:', error)
      }
    },
    onSuccess: (data) => {
      // Reconcile optimistic entry with the server response (real ID).
      queryClient.setQueryData<AnnotationAssignmentRelationship[]>(blockInstanceAnnotationsKey, (old) =>
        optimisticUpsertAssignmentInList({
          old: old as Array<AnnotationAssignmentRelationship & AnnotationAssignmentLike> | undefined,
          next: data as AnnotationAssignmentRelationship & AnnotationAssignmentLike,
        }) as AnnotationAssignmentRelationship[]
      )
    },
  })

  /**
   * LEARNING: Mutation for deleting AnnotationAssignment relationships
   */
  const deleteAnnotationRelationship = useMutation<
    void,
    Error,
    string,
    { previousGlobalData?: GlobalData; previousRelationships?: AnnotationAssignmentRelationship[] }
  >({
    mutationFn: async (annotationId: string) => {
      if (!blockInstanceId.value) throw new Error('Block instance ID is required')
      await apiClient.delete(getBlockInstanceAnnotationEndpoint(blockInstanceId.value, annotationId))
    },
    onMutate: async (annotationId) => {
      const currentBlockInstanceId = blockInstanceId.value
      if (!currentBlockInstanceId) throw new Error('Block instance ID is required')

      // LEARNING: Use shared utility to cancel queries in parallel
      // WHY: Eliminates duplication and combines multiple await calls
      // PATTERN: Extract shared query cancellation logic
      await cancelQueriesBeforeMutate(queryClient, [
        globalDataKey,
        blockInstanceAnnotationsKey,
      ])

      const previousGlobalData = queryClient.getQueryData<GlobalData>(globalDataKey)
      const previousRelationships =
        queryClient.getQueryData<AnnotationAssignmentRelationship[]>(blockInstanceAnnotationsKey)

      queryClient.setQueryData<AnnotationAssignmentRelationship[]>(blockInstanceAnnotationsKey, (old) =>
        optimisticRemoveAssignmentFromList({
          old: old as Array<AnnotationAssignmentRelationship & AnnotationAssignmentLike> | undefined,
          annotationId,
        }) as AnnotationAssignmentRelationship[]
      )

      queryClient.setQueryData<GlobalData>(globalDataKey, (old) => {
        if (!old) return old
        return applyOptimisticAssignmentDeleteToGlobalData({
          old,
          blockInstanceId: currentBlockInstanceId,
          annotationId,
        })
      })

      return { previousGlobalData, previousRelationships }
    },
    onError: (error, _annotationId, context) => {
      if (context?.previousGlobalData) queryClient.setQueryData(globalDataKey, context.previousGlobalData)
      if (context?.previousRelationships) queryClient.setQueryData(blockInstanceAnnotationsKey, context.previousRelationships)
      if (isDevModeEnabled()) {
         
        console.error('[useAnnotationSelect] Failed to delete annotation relationship:', error)
      }
    },
  })

  return {
    annotations,
    blockInstanceId,
    blockInstanceAnnotations: computed(() => blockInstanceAnnotationsQuery.data.value ?? []),
    createAnnotationRelationship,
    deleteAnnotationRelationship
  }
}



