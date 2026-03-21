import type { Ref, ComputedRef } from 'vue'
import type { BookingData } from '@/types/transformers/bookingData'
import type { BookingBlockInstance } from '@/utils/transformers/globalToBookingTransformer'
import type { AvailabilityStepData, PriceData, SummaryData } from '@/types/wizardStepData'
import type { PropertyDetailsStepData } from '@/types/wizard'

export interface UseConfirmationStepDataParams {
  wizard: {
    selectedServiceTypeBlocks: Ref<BookingBlockInstance[]>
    selectedPropertyTypeBlocks: Ref<BookingBlockInstance[]>
    selectedOptionTypeBlocks: Ref<BookingBlockInstance[]>
    selectedLineItemBlocks: Ref<BookingBlockInstance[]>
    selectedUserTypeBlock: Ref<BookingBlockInstance | null>
  }
  propertyDetailsStepData?: Ref<PropertyDetailsStepData | null> | null
  availabilityStepData?: Ref<AvailabilityStepData | null> | null
  /** When set, Drive time fee row uses live block id from global/booking data (Phase 6.11.5). */
  bookingData?: Ref<BookingData | null> | null
}

export interface UseConfirmationStepDataReturn {
  summaryData: ComputedRef<SummaryData>
  priceData: ComputedRef<PriceData>
}
