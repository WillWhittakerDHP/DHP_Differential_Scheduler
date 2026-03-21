import type { ComputedRef } from 'vue'
import type { BookingBlockInstance } from '@/utils/transformers/globalToBookingTransformer'
import type { ComponentItem, SelectionCardItem } from '@/components/booking/types/selectionCardTypes'

export interface UseInstanceComponentsListOptions {
  services: ComputedRef<BookingBlockInstance[]>
  selectedUserTypeBlock?: ComputedRef<BookingBlockInstance | null>
}

export interface UseInstanceComponentsListReturn {
  servicesWithComponents: ComputedRef<SelectionCardItem[]>
  getInstanceComponents: (service: BookingBlockInstance) => ComponentItem[]
}
