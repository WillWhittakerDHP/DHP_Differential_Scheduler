import type { ComputedRef } from 'vue'
import type { GlobalEntityId } from '@shared/types/primitiveBrands'
import type { GlobalEntity } from '@/types/entities'
import type { InstanceComponent, DistributionStrategy, DistributionPreview } from '@/types/component'
import type { GlobalEntityKey } from '@/constants/entities'
import type { GlobalData } from '@/utils/transformers/fetchToGlobalTransformer'

export interface UseComponentEntityDomainParams<GE extends GlobalEntityKey> {
  entityKey: GE
  getGlobalData: () => GlobalData | null
  instanceComponents: ComputedRef<InstanceComponent[]>
}

export interface UseComponentEntityDomainReturn<GE extends GlobalEntityKey> {
  canBeComposed: (blockInstanceId: GlobalEntityId) => boolean
  getAvailableComponents: (composerId: GlobalEntityId) => GlobalEntity<'blockInstance'>[]
  getComponents: (composerId: GlobalEntityId) => InstanceComponent[]
  isComponent: (entityId: GlobalEntityId) => boolean
  getComposerId: (entityId: GlobalEntityId) => GlobalEntityId | null
  getComposedEntity: (composerId: GlobalEntityId) => GlobalEntity<GE> | null
  calculateDistributionPreview: (
    composerId: GlobalEntityId,
    propertyKey: string,
    newValue: number,
    strategy: DistributionStrategy
  ) => DistributionPreview[]
}
