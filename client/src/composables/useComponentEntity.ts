/**
 * Component Entity Composable (facade).
 *
 * PATTERN: query/state/actions separation
 * - query: `useComponentEntityQuery` (read from globalData cache)
 * - domain: `useComponentEntityDomain` (pure-ish computations)
 * - actions: `useComponentEntityActions` (mutations that refetch ['globalData'])
 */

import type { GlobalEntityKey } from '@/constants/entities'
import { useComponentEntityQuery } from '@/composables/componentEntity/useComponentEntityQuery'
import { useComponentEntityDomain } from '@/composables/componentEntity/useComponentEntityDomain'
import { useComponentEntityActions } from '@/composables/componentEntity/useComponentEntityActions'

/**
 * useComponentEntity Composable
 * 
 * LEARNING: Provides component management operations for entities
 * WHY: Centralizes component CRUD and component logic
 * PATTERN: Composable with Vue Query integration
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
    // Queries
    instanceComponents,

    // Methods
    canBeComposed: domain.canBeComposed,
    getAvailableComponents: domain.getAvailableComponents,
    getComponents: domain.getComponents,
    isComponent: domain.isComponent,
    getComposerId: domain.getComposerId,
    getComposedEntity: domain.getComposedEntity,
    calculateDistributionPreview: domain.calculateDistributionPreview,

    // Mutations
    createComponent: actions.createComponent,
    addToComponent: actions.addToComponent,
    removeFromComponent: actions.removeFromComponent,
    updateComponentWithDistribution: actions.updateComponentWithDistribution,

    // Mutation states
    isCreatingComponent: actions.isCreatingComponent,
    isAddingToComponent: actions.isAddingToComponent,
    isRemovingFromComponent: actions.isRemovingFromComponent,
    isUpdatingComponent: actions.isUpdatingComponent,
  }
}

