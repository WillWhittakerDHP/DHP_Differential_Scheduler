/**
 * PATTERN: Component Entity Composable (facade)
 * Wave 4: useComponentEntityQuery inlined here to reduce composable chain depth.
 * Remaining chain repairs: useComponentEntityActions inlined here to reduce depth for all callers.
 */
import { computed, type ComputedRef } from 'vue'
import { useMutation, useQueryClient } from '@tanstack/vue-query'
import apiClient, {
  getRelationshipEndpoint,
  getRelationshipByParentChildEndpoint,
  createMultipleRelationships,
  createRelationshipWithConflictHandling,
} from '@/utils/api'
import type { GlobalEntityKey } from '@/constants/entities'
import type { InstanceComponent } from '@/types/component'
import type { GlobalEntityId } from '@shared/types/primitiveBrands'
import type { DistributionStrategy } from '@/types/component'
import type { GlobalRelationship } from '@/types/relationships'
import { toGlobalEntityId } from '@/utils/globalEntity'
import { useGlobal } from '@/composables/useGlobal'
import { useComponentEntityDomain } from '@/composables/componentEntity/useComponentEntityDomain'
import { createRefetchGlobalDataHandler } from '@/composables/entityCrud/useSharedMutationHandlers'
import type { UseComponentEntityActionsReturn } from '@/types/componentEntity/componentEntityActions'
import type { UseComponentEntityDomainReturn } from '@/types/componentEntity/componentEntityDomain'

function transformGlobalRelationshipsToInstanceComponents(relationships: GlobalRelationship[]): InstanceComponent[] {
  const instanceComponents: InstanceComponent[] = []
  relationships.forEach((rel) => {
    if (rel.relationshipKind !== 'instanceComponents') return
    rel.children.forEach((child, index) => {
      instanceComponents.push({
        id: toGlobalEntityId(`${rel.parent.id}-${child.id}`),
        parentId: rel.parent.id,
        childId: child.id,
        orderIndex: index,
        disabled: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
    })
  })
  return instanceComponents
}

/** Grouped return for composable-health (oversized-return repair). Domain shape from componentEntityDomain. */
export interface UseComponentEntityReturn<GE extends GlobalEntityKey> {
  data: {
    instanceComponents: ComputedRef<InstanceComponent[]>
  } & UseComponentEntityDomainReturn<GE>
  actions: {
    createComponent: UseComponentEntityActionsReturn['createComponent']
    addToComponent: UseComponentEntityActionsReturn['addToComponent']
    removeFromComponent: UseComponentEntityActionsReturn['removeFromComponent']
    updateComponentWithDistribution: UseComponentEntityActionsReturn['updateComponentWithDistribution']
    isCreatingComponent: UseComponentEntityActionsReturn['isCreatingComponent']
    isAddingToComponent: UseComponentEntityActionsReturn['isAddingToComponent']
    isRemovingFromComponent: UseComponentEntityActionsReturn['isRemovingFromComponent']
    isUpdatingComponent: UseComponentEntityActionsReturn['isUpdatingComponent']
  }
}

/**
 * PATTERN: useComponentEntity Composable

PATTERN: Composable with Vue Query integr...
 */
export function useComponentEntity<GE extends GlobalEntityKey>(entityKey: GE): UseComponentEntityReturn<GE> {
  const { globalData, getGlobalData } = useGlobal()
  const instanceComponents = computed((): InstanceComponent[] => {
    const data = globalData?.value
    if (!data?.relationships?.instanceComponents) {
      return []
    }
    return transformGlobalRelationshipsToInstanceComponents(data.relationships.instanceComponents)
  })
  const domain = useComponentEntityDomain({
    entityKey,
    getGlobalData,
    instanceComponents,
  })

  const queryClient = useQueryClient()
  const refetchGlobalData = createRefetchGlobalDataHandler(queryClient)

  const createComponentMutation = useMutation<void, Error, { composerId: GlobalEntityId; componentIds: GlobalEntityId[] }>({
    mutationFn: async ({ composerId, componentIds }: { composerId: GlobalEntityId; componentIds: GlobalEntityId[] }) => {
      const endpoint = getRelationshipEndpoint('instanceComponents')
      await createMultipleRelationships(endpoint, composerId, componentIds)
    },
    onSuccess: refetchGlobalData,
  })

  const addToComponentMutation = useMutation<void, Error, {
    composerId: GlobalEntityId
    componentId: GlobalEntityId
    orderIndex?: number
  }>({
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
      await createRelationshipWithConflictHandling(endpoint, composerId, componentId, orderIndex ?? 0)
    },
    onSuccess: refetchGlobalData,
  })

  const removeFromComponentMutation = useMutation<void, Error, { composerId: GlobalEntityId; componentId: GlobalEntityId }>({
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

  const updateComponentWithDistributionMutation = useMutation<void, Error, {
    composerId: GlobalEntityId
    changes: Record<string, unknown>
    distributionStrategy: DistributionStrategy
    distributionValues?: Record<GlobalEntityId, Record<string, unknown>>
  }>({
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

      const componentUpdates = Object.entries(changes).reduce((acc, [propertyKey, newValue]) => {
        if (typeof newValue !== 'number') return acc
        const preview = domain.calculateDistributionPreview(composerId, propertyKey, newValue, distributionStrategy)
        return preview.reduce((componentAcc, { componentId, newValue: componentNewValue }) => {
          const rawExisting = componentAcc[componentId]
          const existing = rawExisting !== undefined && rawExisting !== null ? rawExisting : {}
          return {
            ...componentAcc,
            [componentId]: {
              ...existing,
              [propertyKey]: componentNewValue
            }
          }
        }, acc)
      }, {} as Record<string, Record<string, unknown>>)

      const promises = Object.entries(componentUpdates).map(([componentId, componentChanges]) =>
        apiClient.patch(`/api/internal/entities/${entityKey}/${componentId}`, componentChanges)
      )
      await Promise.all(promises)
    },
    onSuccess: refetchGlobalData,
  })

  return {
    data: {
      instanceComponents,
      canBeComposed: domain.canBeComposed,
      getAvailableComponents: domain.getAvailableComponents,
      getComponents: domain.getComponents,
      isComponent: domain.isComponent,
      getComposerId: domain.getComposerId,
      getComposedEntity: domain.getComposedEntity,
      calculateDistributionPreview: domain.calculateDistributionPreview,
    },
    actions: {
      createComponent: createComponentMutation.mutateAsync,
      addToComponent: (args: { composerId: GlobalEntityId; componentId: GlobalEntityId; orderIndex?: number }) =>
        addToComponentMutation.mutateAsync(args).then(() => undefined),
      removeFromComponent: removeFromComponentMutation.mutateAsync,
      updateComponentWithDistribution: updateComponentWithDistributionMutation.mutateAsync,
      isCreatingComponent: createComponentMutation.isPending,
      isAddingToComponent: addToComponentMutation.isPending,
      isRemovingFromComponent: removeFromComponentMutation.isPending,
      isUpdatingComponent: updateComponentWithDistributionMutation.isPending,
    },
  }
}

