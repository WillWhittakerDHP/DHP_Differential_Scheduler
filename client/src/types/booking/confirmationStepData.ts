import type { Ref, ComputedRef } from 'vue'
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
  propertyDetailsStepData?: Ref<PropertyDetailsStepData> | null
  availabilityStepData?: Ref<AvailabilityStepData> | null
}

export interface UseConfirmationStepDataReturn {
  summaryData: ComputedRef<SummaryData>
  priceData: ComputedRef<PriceData>
}
