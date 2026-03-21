import type { ComputedRef, Ref } from 'vue'
import type { BookingPartInstance } from '@/utils/transformers/globalToBookingTransformer'

export interface UsePricingCascadeInstancesOptions {
  parentPartInstance: ComputedRef<BookingPartInstance | null> | Ref<BookingPartInstance | null>
  allPartInstances: ComputedRef<BookingPartInstance[]> | Ref<BookingPartInstance[]>
}

export interface UsePricingCascadeInstancesReturn {
  cascadePartInstanceIds: ComputedRef<string[]>
  cascadePartInstances: ComputedRef<BookingPartInstance[]>
  hasCascades: ComputedRef<boolean>
}
