import type { ComputedRef } from 'vue'
import type { BookingBlockInstance } from '@/types/transformers/bookingData'

export interface UseInstanceDisplayOptions {
  instances: ComputedRef<BookingBlockInstance[]>
  selectedUserTypeBlock?: ComputedRef<BookingBlockInstance | null>
}

export interface UseInstanceDisplayReturn {
  instancesWithDisplay: ComputedRef<BookingBlockInstance[]>
}
