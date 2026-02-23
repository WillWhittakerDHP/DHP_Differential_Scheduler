/**
 * PATTERN: Component Entity Composable (facade)
 */
import type { GlobalEntityKey } from '@/constants/entities'
import { useComponentEntityQuery } from '@/composables/componentEntity/useComponentEntityQuery'
import { useComponentEntityDomain } from '@/composables/componentEntity/useComponentEntityDomain'
import { useComponentEntityActions } from '@/composables/componentEntity/useComponentEntityActions'

/**
 * PATTERN: useComponentEntity Composable

PATTERN: Composable with Vue Query integr...
 */
export function useComponentEntity<GE extends GlobalEntityKey>(entityKey: GE) {
  const { instanceComponents, getGlobalData } = useComponentEntityQuery()
  const domain = useComponentEntityDomain({
    entityKey,
    getGlobalData,
    instanceComponents,
  })

  const actions = useComponentEntityActions({
    entityKey,
    getGlobalData,
    calculateDistributionPreview: domain.calculateDistributionPreview,
  })

  return {
    instanceComponents,

    canBeComposed: domain.canBeComposed,
    getAvailableComponents: domain.getAvailableComponents,
    getComponents: domain.getComponents,
    isComponent: domain.isComponent,
    getComposerId: domain.getComposerId,
    getComposedEntity: domain.getComposedEntity,
    calculateDistributionPreview: domain.calculateDistributionPreview,

    createComponent: actions.createComponent,
    addToComponent: actions.addToComponent,
    removeFromComponent: actions.removeFromComponent,
    updateComponentWithDistribution: actions.updateComponentWithDistribution,

    isCreatingComponent: actions.isCreatingComponent,
    isAddingToComponent: actions.isAddingToComponent,
    isRemovingFromComponent: actions.isRemovingFromComponent,
    isUpdatingComponent: actions.isUpdatingComponent,
  }
}

