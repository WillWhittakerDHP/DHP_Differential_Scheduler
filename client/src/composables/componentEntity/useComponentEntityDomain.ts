import type { GlobalEntityId } from '@/types/entities'
import type { GlobalEntityKey } from '@/constants/entities'
import type { DistributionStrategy, DistributionPreview } from '@/types/component'
import type {
  UseComponentEntityDomainParams,
  UseComponentEntityDomainReturn,
} from '@/types/componentEntity/componentEntityDomain'
import {
  componentEntityCalculateDistributionPreview,
  componentEntityCanBeComposed,
  componentEntityGetAvailableComponents,
  componentEntityGetComposerId,
  componentEntityGetComponents,
  componentEntityGetComposedEntity,
  componentEntityIsComponent,
} from '@/utils/componentEntity/componentEntityDomainQueries'

export function useComponentEntityDomain<GE extends GlobalEntityKey>(
  params: UseComponentEntityDomainParams<GE>
): UseComponentEntityDomainReturn<GE> {
  const { entityKey, getGlobalData, instanceComponents } = params

  return {
    getComponents: (composerId: GlobalEntityId) =>
      componentEntityGetComponents(instanceComponents.value, composerId),

    canBeComposed: (blockInstanceId: GlobalEntityId) =>
      componentEntityCanBeComposed(entityKey, getGlobalData, blockInstanceId),

    getAvailableComponents: (composerId: GlobalEntityId) =>
      componentEntityGetAvailableComponents(
        entityKey,
        getGlobalData,
        instanceComponents.value,
        composerId
      ),

    isComponent: (entityId: GlobalEntityId) =>
      componentEntityIsComponent(entityKey, instanceComponents.value, entityId),

    getComposerId: (entityId: GlobalEntityId) =>
      componentEntityGetComposerId(entityKey, instanceComponents.value, entityId),

    getComposedEntity: (composerId: GlobalEntityId) =>
      componentEntityGetComposedEntity(entityKey, getGlobalData, composerId),

    calculateDistributionPreview: (
      composerId: GlobalEntityId,
      propertyKey: string,
      newValue: number,
      strategy: DistributionStrategy
    ): DistributionPreview[] =>
      componentEntityCalculateDistributionPreview(
        entityKey,
        getGlobalData,
        composerId,
        propertyKey,
        newValue,
        strategy
      ),
  }
}
