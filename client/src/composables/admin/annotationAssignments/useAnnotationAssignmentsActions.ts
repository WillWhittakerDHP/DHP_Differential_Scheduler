import type { ComputedRef } from 'vue'
import { createLogger } from '@/utils/logger'
import type { CreateAssignmentData, UpdateAssignmentData, UseAnnotationAssignmentsOptions, AnnotationAssignmentHandlers } from './types'
import { useAnnotationAssignmentsMutations } from './useAnnotationAssignmentsMutations'
import { useAnnotationAssignmentsOrchestration } from './useAnnotationAssignmentsOrchestration'

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
} & AnnotationAssignmentHandlers

type UseAnnotationAssignmentsActionsOptions = {
  blockInstanceId: ComputedRef<string | undefined>
  refetchRelationships: () => void
  getMaxOrderIndex: () => number
  options?: UseAnnotationAssignmentsOptions
}

/**
 * Actions module: thin wrapper that composes mutations + orchestration handlers.
 *
 * LEARNING: Composes mutations and orchestration modules
 * WHY: Maintains stable public API while reducing complexity through module separation
 * PATTERN: Thin wrapper that delegates to specialized modules
 */
export function useAnnotationAssignmentsActions(
  actionOptions: UseAnnotationAssignmentsActionsOptions
): UseAnnotationAssignmentsActionsReturn {
  const logger = createLogger('useAnnotationAssignmentsActions')

  // LEARNING: Create mutations module for core CRUD operations
  // WHY: Isolates mutation logic with optimistic updates
  // PATTERN: Delegate to mutations module
  const mutations = useAnnotationAssignmentsMutations({
    blockInstanceId: actionOptions.blockInstanceId,
    logger,
  })

  // LEARNING: Create orchestration module for higher-level handlers
  // WHY: Isolates orchestration logic that coordinates multiple operations
  // PATTERN: Delegate to orchestration module, passing mutations as dependency
  const orchestration = useAnnotationAssignmentsOrchestration({
    blockInstanceId: actionOptions.blockInstanceId,
    refetchRelationships: actionOptions.refetchRelationships,
    getMaxOrderIndex: actionOptions.getMaxOrderIndex,
    mutations,
    options: actionOptions.options,
    logger,
  })

  // LEARNING: Compose return value from both modules
  // WHY: Maintains stable public API while reducing complexity
  // PATTERN: Spread mutations and orchestration return values
  return {
    ...mutations,
    ...orchestration,
  }
}


