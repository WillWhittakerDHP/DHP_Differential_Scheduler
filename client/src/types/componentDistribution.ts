import type { Ref } from 'vue'
import type { GlobalEntityKey } from '@/constants/entities'
import type { GlobalEntityId } from '@shared/types/primitiveBrands'
import type { DistributionPreview } from '@/types/component'

export interface UseComponentDistributionOptions {
  entityKey: GlobalEntityKey
  composerId: Ref<GlobalEntityId> | GlobalEntityId
  propertyKey: Ref<string> | string
  newValue: Ref<number> | number
  distributionStrategy: Ref<string> | string
  manualValues?: Ref<Record<GlobalEntityId, number>> | Record<GlobalEntityId, number>
  modalOpen?: Ref<boolean>
}

export interface UseComponentDistributionReturn {
  /** P2 type-similarity: uses shared DistributionPreview shape. */
  preview: Ref<DistributionPreview[]>
  getCurrentValue: (componentId: GlobalEntityId) => number
  getComponentName: (componentId: GlobalEntityId) => string
  formatValue: (value: number) => string
  updateManualPreview: () => void
}
