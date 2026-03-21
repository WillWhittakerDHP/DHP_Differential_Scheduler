import type { ComputedRef } from 'vue'
import type { BookingBlockInstance } from '@/utils/transformers/globalToBookingTransformer'
import type { ComponentItem } from '@/components/booking/types/selectionCardTypes'

export interface UseInstanceComponentsOptions {
  service: ComputedRef<BookingBlockInstance | null>
  selectedUserTypeBlock: ComputedRef<BookingBlockInstance | null>
}

export interface UseInstanceComponentsReturn {
  isComposable: ComputedRef<boolean>
  instanceComponents: ComputedRef<ComponentItem[]>
  componentCount: ComputedRef<number>
}
