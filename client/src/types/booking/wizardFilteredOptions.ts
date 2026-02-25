import type { Ref } from 'vue'
import type { BookingData, BookingBlockInstance } from '@/utils/transformers/globalToBookingTransformer'
import type { WizardComputedProperties } from '@/types/wizard'

export type UseWizardFilteredOptionsParams = {
  bookingData: Ref<BookingData | null>
  selectedUserType: Ref<BookingBlockInstance | null>
  selectedServiceTypeBlocks: Ref<BookingBlockInstance[]>
  selectedAvailabilityOptions: Ref<BookingBlockInstance[]>
  selectedPropertyTypeBlocks: Ref<BookingBlockInstance[]>
}

export type UseWizardFilteredOptionsReturn = WizardComputedProperties
