/**
 * WHY: useAppointmentDataCollection Composable
WHY: Moves massive data collecti...
 */
import type { Ref } from 'vue'
import type { AppointmentRequest } from '@/types/appointment'
import type { PropertyRequest } from '@/types/property'
import type { UserRequest } from '@/types/user'
import type { BookingBlockInstance } from '@/utils/transformers/globalToBookingTransformer'
import {
  buildPropertyRequest,
  buildPropertyDetailsForRequest,
  buildAttendeesFromContacts,
  buildAvailabilityPayload,
  buildBlockQuantities,
  buildAppointmentRequest,
  type WizardBlocksForBuilders,
} from '@/utils/booking/appointmentDataBuilders'
import type { PropertyDetailsStepData } from '@/types/wizard'
import type { ContactsStepData } from '@/types/wizard'
import { createLogger } from '@/utils/logger'
import type { AvailabilityStepData } from '@/utils/booking/availabilityStepData'

const logger = createLogger('useAppointmentDataCollection')

export type { ContactsStepData, PropertyDetailsStepData }
export type { AvailabilityStepData }

export interface UseAppointmentDataCollectionParams {
  wizard: {
    selectedServiceTypeBlocks: Ref<BookingBlockInstance[]>
    selectedPropertyTypeBlocks: Ref<BookingBlockInstance[]>
    selectedOptionTypeBlocks: Ref<BookingBlockInstance[]>
    selectedLineItemBlocks: Ref<BookingBlockInstance[]>
    selectedUserTypeBlock: Ref<{ id: string } | null>
    isQuoteMode: Ref<boolean>
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
}

export interface UseAppointmentDataCollectionReturn {
  collectAppointmentData: () => Promise<AppointmentRequest | null>
}

/**
 * WHY: useAppointmentDataCollection composable
WHY: Extracts massive data colle...
 */
export function useAppointmentDataCollection(params: UseAppointmentDataCollectionParams): UseAppointmentDataCollectionReturn {
  const {
    wizard,
    propertyDetailsStepData,
    contactsStepData,
    availabilityStepData,
    createProperty,
    createUser,
    showError,
  } = params

  const collectAppointmentData = async (): Promise<AppointmentRequest | null> => {
    if (wizard.selectedServiceTypeBlocks.value.length === 0) {
      showError('Please select at least one service type')
      return null
    }
    const propertyStep = propertyDetailsStepData?.value
    if (!propertyStep) {
      showError('Property details are required')
      return null
    }
    const contacts = contactsStepData?.value
    if (!contacts) {
      showError('Contact information is required')
      return null
    }
    const availability = availabilityStepData?.value
    if (!availability) {
      showError('Availability selection is required')
      return null
    }

    try {
      const propertyData = buildPropertyRequest(propertyStep)
      const createdProperty = await createProperty.mutateAsync(propertyData)
      const propertyVersionId =
        createdProperty.propertyVersionId !== undefined && createdProperty.propertyVersionId !== null
          ? createdProperty.propertyVersionId
          : createdProperty.id

      const attendees = await buildAttendeesFromContacts(contacts, createUser)
      const availabilityPayload = buildAvailabilityPayload(availability)

      const lineItemBlocksRef = wizard.selectedLineItemBlocks?.value
      const selectedLineItemBlocks =
        lineItemBlocksRef !== undefined && lineItemBlocksRef !== null ? lineItemBlocksRef : []
      const wizardBlocks: WizardBlocksForBuilders = {
        selectedServiceTypeBlocks: wizard.selectedServiceTypeBlocks.value,
        selectedPropertyTypeBlocks: wizard.selectedPropertyTypeBlocks.value,
        selectedOptionTypeBlocks: wizard.selectedOptionTypeBlocks.value,
        selectedLineItemBlocks,
        selectedUserTypeBlock: wizard.selectedUserTypeBlock.value,
        isQuoteMode: wizard.isQuoteMode.value,
      }
      const quantities = buildBlockQuantities(wizardBlocks)
      const propertyDetails = buildPropertyDetailsForRequest(propertyStep)
      const squareFootage = propertyStep.squareFootage ?? propertyStep.propertySize ?? null
      const aduCount = propertyStep.additionalUnits ?? null

      return buildAppointmentRequest({
        propertyVersionId,
        wizard: wizardBlocks,
        propertyDetails,
        attendees,
        availability: availabilityPayload,
        quantities,
        squareFootage,
        aduCount,
      })
    } catch (error) {
      logger.error('Failed to collect appointment data', { error })
      const errorMessage = error instanceof Error ? error.message : 'Failed to collect appointment data'
      showError(errorMessage)
      return null
    }
  }

  return {
    collectAppointmentData,
  }
}
