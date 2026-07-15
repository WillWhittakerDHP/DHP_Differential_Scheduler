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
  resolveAppointmentRequestStatus,
  type WizardBlocksForBuilders,
} from '@/utils/booking/appointmentDataBuilders'
import { createLogger } from '@/utils/logger'
import type { AppointmentRequest } from '@/types/appointment'
import type { UseAppointmentDataCollectionParams, UseAppointmentDataCollectionReturn } from '@/types/booking/appointmentDataCollection'
import type { AvailabilityStepData } from '@/types/booking/availabilityStepData'
import { useBooking } from '@/composables/useBooking'
import { useAvailabilitySettings } from '@/composables/booking/useAvailabilitySettings'
import type { ConfirmationDriveContext } from '@/utils/booking/confirmationStepData'
import { resolveSystemDriveTimeBlockForFees } from '@/utils/booking/systemDriveTimeBlock'
import { resolveAccumulatedBlockInstances } from '@/utils/booking/resolveAccumulatedBlockInstances'
import type { BookingData } from '@/types/transformers/bookingData'
import type { ContactsStepData, PropertyDetailsStepData } from '@/types/wizard'

const logger = createLogger('useAppointmentDataCollection')

interface ReadyAppointmentInputs {
  propertyStep: PropertyDetailsStepData
  contacts: ContactsStepData
  availability: AvailabilityStepData
  selectedServices: UseAppointmentDataCollectionParams['wizard']['selectedServiceTypeBlocks']['value']
}

function resolveReadyAppointmentInputs(
  params: UseAppointmentDataCollectionParams
): { data: ReadyAppointmentInputs | null; error: string | null } {
  const selectedServices = params.wizard.selectedServiceTypeBlocks.value
  const propertyStep = params.propertyDetailsStepData?.value
  const contacts = params.contactsStepData?.value
  const availability = params.availabilityStepData?.value

  if (selectedServices.length === 0) {
    return { data: null, error: 'Please select at least one service type' }
  }
  if (!propertyStep) {
    return { data: null, error: 'Property details are required' }
  }
  if (!contacts) {
    return { data: null, error: 'Contact information is required' }
  }
  if (!availability) {
    return { data: null, error: 'Availability selection is required' }
  }
  return { data: { propertyStep, contacts, availability, selectedServices }, error: null }
}

function propertyVersionIdFromCreatedProperty(createdProperty: { propertyVersionId?: string; id: string }): string {
  return createdProperty.propertyVersionId ?? createdProperty.id
}

function selectedLineItemBlocksFromWizard(
  wizard: UseAppointmentDataCollectionParams['wizard']
): UseAppointmentDataCollectionParams['wizard']['selectedLineItemBlocks']['value'] {
  return wizard.selectedLineItemBlocks?.value ?? []
}

function selectedTimeBlocksWithAccumulations(params: {
  bookingData: BookingData | null
  selectedServices: ReadyAppointmentInputs['selectedServices']
  userSelectedTimes: UseAppointmentDataCollectionParams['wizard']['selectedPropertyTypeBlocks']['value']
  propertyStep: PropertyDetailsStepData
}): UseAppointmentDataCollectionParams['wizard']['selectedPropertyTypeBlocks']['value'] {
  const { bookingData, selectedServices, userSelectedTimes, propertyStep } = params
  if (bookingData === null) {
    return userSelectedTimes
  }
  const accumulatedTimes = resolveAccumulatedBlockInstances({
    selectedServiceBlocks: selectedServices,
    allBlockInstances: bookingData.blockInstanceCatalog,
    accumulationRelationships: bookingData.accumulationLinks,
    propertyDetails: propertyStep as unknown as Record<string, unknown>,
  })
  const seenTimeIds = new Set(userSelectedTimes.map((b) => b.id))
  return [
    ...userSelectedTimes,
    ...accumulatedTimes.filter((b) => !seenTimeIds.has(b.id)),
  ]
}

function buildWizardBlocksForRequest(params: {
  wizard: UseAppointmentDataCollectionParams['wizard']
  selectedServices: ReadyAppointmentInputs['selectedServices']
  selectedPropertyTypeBlocks: UseAppointmentDataCollectionParams['wizard']['selectedPropertyTypeBlocks']['value']
}): WizardBlocksForBuilders {
  const { wizard, selectedServices, selectedPropertyTypeBlocks } = params
  return {
    selectedServiceTypeBlocks: selectedServices,
    selectedPropertyTypeBlocks,
    selectedOptionTypeBlocks: wizard.selectedOptionTypeBlocks.value,
    selectedPriceBlocks: wizard.selectedPriceBlocks.value,
    selectedLineItemBlocks: selectedLineItemBlocksFromWizard(wizard),
    selectedUserTypeBlock: wizard.selectedUserTypeBlock.value,
    isQuoteMode: wizard.isQuoteMode.value,
    wizardMode: wizard.wizardMode.value,
  }
}

function driveFeeOptionsFromAvailability(params: {
  availability: AvailabilityStepData
  availabilitySettings: ReturnType<typeof useAvailabilitySettings>['settings']['value']
  bookingData: BookingData | null
}) {
  const rawDrive = params.availability.totalDriveMinutes
  const clampedDrive = rawDrive != null && Number.isFinite(rawDrive) ? Math.max(0, rawDrive) : null
  const driveContext: ConfirmationDriveContext | null =
    clampedDrive != null ? { totalDriveMinutes: clampedDrive } : null

  if (driveContext === null) {
    return null
  }

  return {
    driveContext,
    driveTimeFeeSettings: params.availabilitySettings?.driveTimeFee ?? null,
    driveTimeSystemBlock: resolveSystemDriveTimeBlockForFees(params.bookingData),
  }
}

async function collectAppointmentDataCore(params: {
  inputs: ReadyAppointmentInputs
  collectionParams: UseAppointmentDataCollectionParams
  bookingData: BookingData | null
  availabilitySettings: ReturnType<typeof useAvailabilitySettings>['settings']['value']
}): Promise<AppointmentRequest> {
  const { inputs, collectionParams, bookingData, availabilitySettings } = params
  const { wizard, createProperty, createUser, loadedAppointmentStatus } = collectionParams
  const propertyData = buildPropertyRequest(inputs.propertyStep)
  const createdProperty = await createProperty.mutateAsync(propertyData)
  const attendees = await buildAttendeesFromContacts(inputs.contacts, createUser)
  const selectedPropertyTypeBlocks = selectedTimeBlocksWithAccumulations({
    bookingData,
    selectedServices: inputs.selectedServices,
    userSelectedTimes: wizard.selectedPropertyTypeBlocks.value,
    propertyStep: inputs.propertyStep,
  })
  const wizardBlocks = buildWizardBlocksForRequest({
    wizard,
    selectedServices: inputs.selectedServices,
    selectedPropertyTypeBlocks,
  })
  const propertyDetails = buildPropertyDetailsForRequest(inputs.propertyStep)
  const status = resolveAppointmentRequestStatus({
    existingStatus: loadedAppointmentStatus.value,
    isQuoteMode: wizard.isQuoteMode.value,
  })

  return buildAppointmentRequest({
    propertyVersionId: propertyVersionIdFromCreatedProperty(createdProperty),
    wizard: wizardBlocks,
    propertyDetails,
    attendees,
    availability: buildAvailabilityPayload(inputs.availability),
    quantities: buildBlockQuantities(wizardBlocks),
    squareFootage: inputs.propertyStep.squareFootage ?? inputs.propertyStep.propertySize ?? null,
    aduCount: inputs.propertyStep.additionalUnits ?? null,
    feeDriveOptions: driveFeeOptionsFromAvailability({
      availability: inputs.availability,
      availabilitySettings,
      bookingData,
    }),
    status,
  })
}

export function useAppointmentDataCollection(params: UseAppointmentDataCollectionParams): UseAppointmentDataCollectionReturn {
  const { showError } = params

  const { bookingData } = useBooking()
  const { settings: availabilitySettings } = useAvailabilitySettings()

  const collectAppointmentData = async (): Promise<AppointmentRequest | null> => {
    const ready = resolveReadyAppointmentInputs(params)
    if (ready.error || !ready.data) {
      showError(ready.error ?? 'Appointment data is incomplete')
      return null
    }

    try {
      return await collectAppointmentDataCore({
        inputs: ready.data,
        collectionParams: params,
        bookingData: bookingData.value,
        availabilitySettings: availabilitySettings.value,
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
