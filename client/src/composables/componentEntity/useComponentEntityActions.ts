import type { Ref } from 'vue'
import { useMutation, useQueryClient } from '@tanstack/vue-query'
import type { AxiosError } from 'axios'
import apiClient, { getRelationshipEndpoint, getRelationshipByParentChildEndpoint } from '@/utils/api'
import type { GlobalEntityId } from '@/types/entities'
import type { DistributionStrategy } from '@/types/component'
import type { GlobalData } from '@/utils/transformers/fetchToGlobalTransformer'

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

  const createComponentMutation = useMutation({
    mutationFn: async ({ composerId, componentIds }: { composerId: GlobalEntityId; componentIds: GlobalEntityId[] }) => {
      const endpoint = getRelationshipEndpoint('instanceComponents')
      const promises = componentIds.map(async (componentId, index) => {
        try {
          return await apiClient.post(endpoint, {
            parent_id: composerId,
            child_id: componentId,
            order_index: index,
          })
        } catch (error: unknown) {
          // LEARNING: Handle 409 Conflict as success (idempotent operation)
          // WHY: If relationship already exists, desired state is already achieved
          // PATTERN: Treat duplicate creation as success
          const axiosError = error as AxiosError<{ error?: string; parent_id?: string; child_id?: string }>
          if (axiosError?.response?.status === 409) {
            // Return successfully - relationship already exists, which is the desired state
            return { data: { parent_id: composerId, child_id: componentId } }
          }
          // Re-throw other errors
          throw error
        }
      })
      await Promise.all(promises)
    },
    onSuccess: async () => {
      await queryClient.refetchQueries({ queryKey: ['globalData'] })
    },
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
      try {
        await apiClient.post(endpoint, {
          parent_id: composerId,
          child_id: componentId,
          order_index: orderIndex ?? 0,
        })
      } catch (error: unknown) {
        // LEARNING: Handle 409 Conflict as success (idempotent operation)
        // WHY: If relationship already exists, desired state is already achieved
        // PATTERN: Treat duplicate creation as success
        const axiosError = error as AxiosError<{ error?: string; parent_id?: string; child_id?: string }>
        if (axiosError?.response?.status === 409) {
          // Return successfully - relationship already exists, which is the desired state
          return
        }
        // Re-throw other errors
        throw error
      }
    },
    onSuccess: async () => {
      await queryClient.refetchQueries({ queryKey: ['globalData'] })
    },
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
    onSuccess: async () => {
      await queryClient.refetchQueries({ queryKey: ['globalData'] })
    },
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
      // PATTERN: Reduce changes entries into componentUpdates object
      const componentUpdates = Object.entries(changes).reduce((acc, [propertyKey, newValue]) => {
        if (typeof newValue !== 'number') return acc

        const preview = calculateDistributionPreview(composerId, propertyKey, newValue, distributionStrategy)
        preview.forEach(({ componentId, newValue: componentNewValue }) => {
          if (!acc[componentId]) acc[componentId] = {}
          acc[componentId][propertyKey] = componentNewValue
        })
        return acc
      }, {} as Record<string, Record<string, unknown>>)

      const promises = Object.entries(componentUpdates).map(([componentId, componentChanges]) =>
        apiClient.patch(`/api/internal/entities/${entityKey}/${componentId}`, componentChanges)
      )
      await Promise.all(promises)
    },
    onSuccess: async () => {
      await queryClient.refetchQueries({ queryKey: ['globalData'] })
    },
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


