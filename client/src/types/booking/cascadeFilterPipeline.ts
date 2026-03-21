import type { BookingData, BookingBlockInstance } from '@/utils/transformers/globalToBookingTransformer'

export interface CascadeFilterParamsBase {
  bookingData: BookingData | null
  parentInstances: BookingBlockInstance | BookingBlockInstance[] | null
  currentSelection: BookingBlockInstance[]
  relationshipName: string
}
