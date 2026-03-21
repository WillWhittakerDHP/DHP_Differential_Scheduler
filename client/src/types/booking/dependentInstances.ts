import type { ComputedRef, Ref } from 'vue'
import type { BookingBlockInstance } from '@/utils/transformers/globalToBookingTransformer'
import type { GlobalRelationship } from '@/types/relationships'

export interface UseDependentInstancesOptions {
  parentInstance: ComputedRef<BookingBlockInstance | null> | Ref<BookingBlockInstance | null>
  relationships?: ComputedRef<GlobalRelationship[]> | Ref<GlobalRelationship[]>
}

export interface UseDependentInstancesReturn {
  dependentInstanceIds: ComputedRef<string[]>
  dependentInstances: ComputedRef<BookingBlockInstance[]>
  hasDependentInstances: ComputedRef<boolean>
}
