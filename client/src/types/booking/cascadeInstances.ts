import type { ComputedRef, Ref } from 'vue'
import type { BookingData, BookingBlockInstance } from '@/utils/transformers/globalToBookingTransformer'

export interface UseCascadeInstancesOptions {
  parentInstance: ComputedRef<BookingBlockInstance | null> | Ref<BookingBlockInstance | null>
  bookingData: Ref<BookingData | null>
  targetBlockShapeName?: string
}

export interface UseCascadeInstancesReturn {
  cascadeInstanceIds: ComputedRef<string[]>
  cascadeInstances: ComputedRef<BookingBlockInstance[]>
  hasCascades: ComputedRef<boolean>
}
