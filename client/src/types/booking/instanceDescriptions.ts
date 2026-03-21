import type { ComputedRef } from 'vue'
import type { BookingBlockInstance } from '@/utils/transformers/globalToBookingTransformer'
import type { UseInstanceDisplayOptions } from '@/types/booking/instanceDisplay'

export type UseInstanceDescriptionsOptions = UseInstanceDisplayOptions

export interface UseInstanceDescriptionsReturn {
  getFilteredDescription: (instance: BookingBlockInstance, userTypeBlockName: string | null) => string
  instancesWithDescriptions: ComputedRef<BookingBlockInstance[]>
}
