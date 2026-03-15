/**
 * Appointment data collection: gathers wizard state into an AppointmentRequest payload.
 * Accepts reactive params but uses no Vue reactivity internally.
 */
import {
  buildPropertyRequest,
  buildPropertyDetailsForRequest,
  buildAttendeesFromContacts,
  buildAvailabilityPayload,
  buildBlockQuantities,
  buildAppointmentRequest,
  type WizardBlocksForBuilders,
} from '@/utils/booking/appointmentDataBuilders'
import { createLogger } from '@/utils/logger'
import type { AppointmentRequest } from '@/types/appointment'
import type { UseAppointmentDataCollectionParams, UseAppointmentDataCollectionReturn } from '@/types/booking/appointmentDataCollection'

const logger = createLogger('useAppointmentDataCollection')


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
        selectedCouponBlocks: wizard.selectedCouponBlocks.value,
        selectedLineItemBlocks,
        selectedUserTypeBlock: wizard.selectedUserTypeBlock.value,
        isQuoteMode: wizard.isQuoteMode.value,
        wizardMode: wizard.wizardMode.value,
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
