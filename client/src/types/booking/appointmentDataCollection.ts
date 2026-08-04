import type { Ref } from 'vue'
import type { AppointmentRequest } from '@/types/appointment'
import type { AppointmentStatus } from '@/types/appointmentStatus'
import type { PropertyRequest } from '@/types/property'
import type { UserRequest } from '@/types/user'
import type { BookingBlockInstance } from '@/utils/transformers/globalToBookingTransformer'
import type { PropertyDetailsStepData, WizardMode } from '@/types/wizard'
import type { ContactsStepData } from '@/types/wizard'
import type { AvailabilityStepData } from '@/types/booking/availabilityStepData'

export interface UseAppointmentDataCollectionParams {
  wizard: {
    selectedServiceTypeBlocks: Ref<BookingBlockInstance[]>
    selectedPropertyTypeBlocks: Ref<BookingBlockInstance[]>
    selectedOptionTypeBlocks: Ref<BookingBlockInstance[]>
    selectedPriceBlocks: Ref<BookingBlockInstance[]>
    selectedLineItemBlocks: Ref<BookingBlockInstance[]>
    selectedUserTypeBlock: Ref<{ id: string } | null>
    isQuoteMode: Ref<boolean>
    wizardMode: Ref<WizardMode>
  }
  propertyDetailsStepData: Ref<PropertyDetailsStepData | null> | null
  contactsStepData: Ref<ContactsStepData | null> | null
  availabilityStepData: Ref<AvailabilityStepData | null> | null
  createProperty: {
    mutateAsync: (data: PropertyRequest) => Promise<{ propertyVersionId?: string; id: string }>
  }
  createUser: {
    mutateAsync: (data: UserRequest) => Promise<{ id: string }>
  }
  showError: (message: string) => void
  /** Set when an appointment was loaded; used to avoid illegal status transitions on PUT. */
  loadedAppointmentStatus: Ref<AppointmentStatus | null>
}

export interface UseAppointmentDataCollectionReturn {
  collectAppointmentData: () => Promise<AppointmentRequest | null>
}
