import type { Ref } from 'vue'
import type { GlobalEntityId } from '@shared/types/primitiveBrands'
import type { DistributionStrategy } from '@/types/component'

export interface UseComponentEntityActionsReturn {
  createComponent: (args: { composerId: GlobalEntityId; componentIds: GlobalEntityId[] }) => Promise<void>
  addToComponent: (args: { composerId: GlobalEntityId; componentId: GlobalEntityId; orderIndex?: number }) => Promise<void>
  removeFromComponent: (args: { composerId: GlobalEntityId; componentId: GlobalEntityId }) => Promise<void>
  updateComponentWithDistribution: (args: {
    composerId: GlobalEntityId
    changes: Record<string, unknown>
    distributionStrategy: DistributionStrategy
    distributionValues?: Record<GlobalEntityId, Record<string, unknown>>
  }) => Promise<void>

  isCreatingComponent: Ref<boolean>
  isAddingToComponent: Ref<boolean>
  isRemovingFromComponent: Ref<boolean>
  isUpdatingComponent: Ref<boolean>
}
