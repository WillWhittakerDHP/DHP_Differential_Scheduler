/**
 * PATTERN: Component Entity Composable (facade)
 * Wave 4: useComponentEntityQuery inlined here to reduce composable chain depth.
 * Remaining chain repairs: useComponentEntityActions inlined here to reduce depth for all callers.
 */
import { computed, type ComputedRef } from 'vue'
import { useQueryClient } from '@tanstack/vue-query'
import type { GlobalEntityKey } from '@/constants/entities'
import type { InstanceComponent } from '@/types/component'
import { useGlobal } from '@/composables/useGlobal'
import { useComponentEntityDomain } from '@/composables/componentEntity/useComponentEntityDomain'
import { createRefetchGlobalDataHandler } from '@/composables/entityCrud/useSharedMutationHandlers'
import { useComponentEntityMutations } from '@/composables/componentEntity/useComponentEntityMutations'
import { transformGlobalRelationshipsToInstanceComponents } from '@/utils/componentEntity/transformGlobalRelationshipsToInstanceComponents'
import type { UseComponentEntityActionsReturn } from '@/types/componentEntity/componentEntityActions'
import type { UseComponentEntityDomainReturn } from '@/types/componentEntity/componentEntityDomain'

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

  const mutations = useComponentEntityMutations({
    entityKey,
    getGlobalData,
    refetchGlobalData,
    calculateDistributionPreview: domain.calculateDistributionPreview,
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
      createComponent: mutations.createComponent.mutateAsync,
      addToComponent: mutations.addToComponent.mutateAsync,
      removeFromComponent: mutations.removeFromComponent.mutateAsync,
      updateComponentWithDistribution: mutations.updateComponentWithDistribution.mutateAsync,
      isCreatingComponent: mutations.createComponent.isPending,
      isAddingToComponent: mutations.addToComponent.isPending,
      isRemovingFromComponent: mutations.removeFromComponent.isPending,
      isUpdatingComponent: mutations.updateComponentWithDistribution.isPending,
    },
  }
}
