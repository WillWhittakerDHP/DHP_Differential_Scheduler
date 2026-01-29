import type { Ref } from 'vue'
import { useMutation, useQueryClient } from '@tanstack/vue-query'
import apiClient, { getRelationshipEndpoint, getRelationshipByParentChildEndpoint } from '@/utils/api'
import type { GlobalEntityId } from '@/types/entities'
import type { DistributionStrategy } from '@/types/component'
import type { GlobalData } from '@/utils/transformers/fetchToGlobalTransformer'
import { createRefetchGlobalDataHandler } from '../entityCrud/useSharedMutationHandlers'
import { createMultipleRelationships, createRelationshipWithConflictHandling } from '@/utils/api/relationshipApiHelpers'

export type UseComponentEntityActionsReturn = {
  createComponent: (args: { composerId: GlobalEntityId; componentIds: GlobalEntityId[] }) => Promise<void>
  addToComponent: (args: { composerId: GlobalEntityId; componentId: GlobalEntityId; orderIndex?: number }) => Promise<void>
  removeFromComponent: (args: { composerId: GlobalEntityId; componentId: GlobalEntityId }) => Promise<void>
  updateComponentWithDistribution: (args: {
    composerId: GlobalEntityId
    changes: Record<string, unknown>
    distributionStrategy: DistributionStrategy
    distributionValues?: Record<GlobalEntityId, Record<string, unknown>>
  }) => Promise<void>

  // Mutation states
  isCreatingComponent: Ref<boolean>
  isAddingToComponent: Ref<boolean>
  isRemovingFromComponent: Ref<boolean>
  isUpdatingComponent: Ref<boolean>
}

export function useComponentEntityActions(params: {
  entityKey: string
  getGlobalData: () => GlobalData | null
  calculateDistributionPreview: (composerId: GlobalEntityId, propertyKey: string, newValue: number, strategy: DistributionStrategy) => Array<{ componentId: string; newValue: number }>
}): UseComponentEntityActionsReturn {
  const { entityKey, getGlobalData, calculateDistributionPreview } = params
  const queryClient = useQueryClient()

  // LEARNING: Use shared mutation handler for refetching globalData
  // WHY: Eliminates duplication of common refetch pattern
  // PATTERN: Extract shared handler to utility function
  const refetchGlobalData = createRefetchGlobalDataHandler(queryClient)

  const createComponentMutation = useMutation({
    mutationFn: async ({ composerId, componentIds }: { composerId: GlobalEntityId; componentIds: GlobalEntityId[] }) => {
      const endpoint = getRelationshipEndpoint('instanceComponents')
      // LEARNING: Use shared utility for creating multiple relationships
      // WHY: Eliminates duplication of conflict handling logic
      // PATTERN: Extract shared API call logic to utility function
      await createMultipleRelationships(endpoint, composerId, componentIds)
    },
    onSuccess: refetchGlobalData,
  })

  const addToComponentMutation = useMutation({
    mutationFn: async ({
      composerId,
      componentId,
      orderIndex,
    }: {
      composerId: GlobalEntityId
      componentId: GlobalEntityId
      orderIndex?: number
    }) => {
      const endpoint = getRelationshipEndpoint('instanceComponents')
      // LEARNING: Use shared utility for creating relationship with conflict handling
      // WHY: Eliminates duplication of conflict handling logic
      // PATTERN: Extract shared API call logic to utility function
      await createRelationshipWithConflictHandling(endpoint, composerId, componentId, orderIndex ?? 0)
    },
    onSuccess: refetchGlobalData,
  })

  const removeFromComponentMutation = useMutation({
    mutationFn: async ({ composerId, componentId }: { composerId: GlobalEntityId; componentId: GlobalEntityId }) => {
      const deleteEndpoint = getRelationshipByParentChildEndpoint(
        'instanceComponents',
        String(composerId),
        String(componentId)
      )
      await apiClient.delete(deleteEndpoint)
    },
    onSuccess: refetchGlobalData,
  })

  const updateComponentWithDistributionMutation = useMutation({
    mutationFn: async ({
      composerId,
      changes,
      distributionStrategy,
      distributionValues,
    }: {
      composerId: GlobalEntityId
      changes: Record<string, unknown>
      distributionStrategy: DistributionStrategy
      distributionValues?: Record<GlobalEntityId, Record<string, unknown>>
    }) => {
      const globalData = getGlobalData()
      if (!globalData) throw new Error('Global data not available')

      if (distributionStrategy === 'manual' && distributionValues) {
        const promises = Object.entries(distributionValues).map(([componentId, componentChanges]) =>
          apiClient.patch(`/api/internal/entities/${entityKey}/${componentId}`, componentChanges)
        )
        await Promise.all(promises)
        return
      }

      // LEARNING: Use reduce to build componentUpdates object instead of forEach with mutations
      // WHY: Functional approach avoids forEach with object mutations
      // PATTERN: Reduce changes entries into componentUpdates object, then reduce preview items
      const componentUpdates = Object.entries(changes).reduce((acc, [propertyKey, newValue]) => {
        if (typeof newValue !== 'number') return acc

        const preview = calculateDistributionPreview(composerId, propertyKey, newValue, distributionStrategy)
        // LEARNING: Use reduce to build componentUpdates immutably instead of forEach with mutations
        // WHY: Functional approach avoids mutations, aligns with workspace rules
        // PATTERN: Reduce preview items into componentUpdates object
        return preview.reduce((componentAcc, { componentId, newValue: componentNewValue }) => {
          const existing = componentAcc[componentId] || {}
          return {
            ...componentAcc,
            [componentId]: {
              ...existing,
              [propertyKey]: componentNewValue
            }
          }
        }, acc)
      }, {} as Record<string, Record<string, unknown>>)

      // LEARNING: Use map to create promises immutably
      // WHY: Functional approach avoids mutations, aligns with workspace rules
      // PATTERN: Map entries to promises, then await all
      const promises = Object.entries(componentUpdates).map(([componentId, componentChanges]) =>
        apiClient.patch(`/api/internal/entities/${entityKey}/${componentId}`, componentChanges)
      )
      await Promise.all(promises)
    },
    onSuccess: refetchGlobalData,
  })

  return {
    createComponent: createComponentMutation.mutateAsync,
    addToComponent: (args) => addToComponentMutation.mutateAsync(args).then(() => undefined),
    removeFromComponent: removeFromComponentMutation.mutateAsync,
    updateComponentWithDistribution: updateComponentWithDistributionMutation.mutateAsync,

    isCreatingComponent: createComponentMutation.isPending,
    isAddingToComponent: addToComponentMutation.isPending,
    isRemovingFromComponent: removeFromComponentMutation.isPending,
    isUpdatingComponent: updateComponentWithDistributionMutation.isPending,
  }
}


