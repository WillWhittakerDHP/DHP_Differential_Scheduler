/**
 * WHY: Vue Query mutations for component entity (thin useComponentEntity / complexity audit).
 */

import { useMutation } from '@tanstack/vue-query'
import apiClient, {
  getRelationshipEndpoint,
  getRelationshipByParentChildEndpoint,
  createMultipleRelationships,
  createRelationshipWithConflictHandling,
} from '@/utils/api'
import type { GlobalEntityKey } from '@/constants/entities'
import type { GlobalEntityId } from '@shared/types/primitiveBrands'
import type { DistributionStrategy } from '@/types/component'
import type { GlobalData } from '@/utils/transformers/fetchToGlobalTransformer'
import {
  buildNumericChangeDistributionMap,
  patchComponentUpdatesById,
  runManualDistributionPatches,
} from '@/utils/componentEntity/buildComponentDistributionUpdates'
import type { UseComponentEntityDomainReturn } from '@/types/componentEntity/componentEntityDomain'

export function useComponentEntityMutations<GE extends GlobalEntityKey>(input: {
  entityKey: GE
  getGlobalData: () => GlobalData | null
  refetchGlobalData: () => void
  calculateDistributionPreview: UseComponentEntityDomainReturn<GE>['calculateDistributionPreview']
}): {
  createComponent: ReturnType<typeof useMutation<void, Error, { composerId: GlobalEntityId; componentIds: GlobalEntityId[] }>>
  addToComponent: ReturnType<
    typeof useMutation<
      void,
      Error,
      { composerId: GlobalEntityId; componentId: GlobalEntityId; orderIndex?: number }
    >
  >
  removeFromComponent: ReturnType<
    typeof useMutation<void, Error, { composerId: GlobalEntityId; componentId: GlobalEntityId }>
  >
  updateComponentWithDistribution: ReturnType<
    typeof useMutation<
      void,
      Error,
      {
        composerId: GlobalEntityId
        changes: Record<string, unknown>
        distributionStrategy: DistributionStrategy
        distributionValues?: Record<GlobalEntityId, Record<string, unknown>>
      }
    >
  >
} {
  const { entityKey, getGlobalData, refetchGlobalData, calculateDistributionPreview } = input

  const createComponent = useMutation<void, Error, { composerId: GlobalEntityId; componentIds: GlobalEntityId[] }>({
    mutationFn: async ({ composerId, componentIds }) => {
      const endpoint = getRelationshipEndpoint('instanceComponents')
      await createMultipleRelationships(endpoint, composerId, componentIds)
    },
    onSuccess: refetchGlobalData,
  })

  const addToComponent = useMutation<
    void,
    Error,
    { composerId: GlobalEntityId; componentId: GlobalEntityId; orderIndex?: number }
  >({
    mutationFn: async ({ composerId, componentId, orderIndex }) => {
      const endpoint = getRelationshipEndpoint('instanceComponents')
      await createRelationshipWithConflictHandling(endpoint, composerId, componentId, orderIndex ?? 0)
    },
    onSuccess: refetchGlobalData,
  })

  const removeFromComponent = useMutation<void, Error, { composerId: GlobalEntityId; componentId: GlobalEntityId }>({
    mutationFn: async ({ composerId, componentId }) => {
      const deleteEndpoint = getRelationshipByParentChildEndpoint(
        'instanceComponents',
        String(composerId),
        String(componentId)
      )
      await apiClient.delete(deleteEndpoint)
    },
    onSuccess: refetchGlobalData,
  })

  const updateComponentWithDistribution = useMutation<
    void,
    Error,
    {
      composerId: GlobalEntityId
      changes: Record<string, unknown>
      distributionStrategy: DistributionStrategy
      distributionValues?: Record<GlobalEntityId, Record<string, unknown>>
    }
  >({
    mutationFn: async ({ composerId, changes, distributionStrategy, distributionValues }) => {
      const globalData = getGlobalData()
      if (!globalData) throw new Error('Global data not available')

      if (distributionStrategy === 'manual' && distributionValues) {
        await runManualDistributionPatches({
          entityKey,
          distributionValues: distributionValues as Record<string, Record<string, unknown>>,
        })
        return
      }

      const componentUpdates = buildNumericChangeDistributionMap({
        changes,
        composerId,
        distributionStrategy,
        calculateDistributionPreview,
      })

      await patchComponentUpdatesById({ entityKey, componentUpdates })
    },
    onSuccess: refetchGlobalData,
  })

  return {
    createComponent,
    addToComponent,
    removeFromComponent,
    updateComponentWithDistribution,
  }
}
