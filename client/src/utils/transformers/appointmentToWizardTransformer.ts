/**
 * WHY: Appointment to Wizard Transformer

LEARNING: Transforms appointment API ...
 */
import type { AppointmentResponse } from '@/types/appointment'
import type { BookingBlockInstance } from './globalToBookingTransformer'
import type { BookingData } from './globalToBookingTransformer'
import { getStateControlBlockInstances } from '@/utils/blockInstanceUtils'
import { ATTENDEE_ROLE_CLIENT, ATTENDEE_ROLE_AGENT, USER_ROLE_CLIENT, USER_ROLE_AGENT } from '@/constants/attendeeRoles'
import { safeArray, extractOptionalString, extractOptionalNumber, extractOptionalBoolean } from './transformerPrimitives'
import { findById } from './transformerCollections'
import apiClient from '@/utils/api'
import { getAppointmentVersionsEndpoint } from '@/utils/api'
import { createLogger } from '@/utils/logger'
import {
  findBlockInstanceById,
  resolveBlockCategory,
  extractAddressFields,
  extractLocationData,
  extractPropertyDetailsFields,
  type AppointmentVersionsResponse,
} from './appointmentToWizardHelpers'

const logger = createLogger('appointmentToWizardTransformer')

/**
 * WHY: Wizard state data structure
LEARNING: Represents all wizard state that c...
 */
export interface WizardStateData {
  userTypeBlock: BookingBlockInstance | null
  services: BookingBlockInstance[] // Multi-select array - replaces baseService
  propertyTypeBlocks: BookingBlockInstance[] // Multi-select array - replaces propertyTypeBlock
  optionTypeBlocks: BookingBlockInstance[]
  lineItemBlocks: BookingBlockInstance[] // Line item blocks (bookingMode: "addOn")
  
  propertyDetails: {
    address: string
    unit: string
    city: string
    state: string
    zipCode: string
    candidatePlaceId?: string  // Candidate placeId (from confirmed appointment, loaded into wizard for editing)
    candidateCoordinates?: { lat: number; lng: number }  // Candidate coordinates (from confirmed appointment, loaded into wizard)
    propertySize: number | null
    numberOfUnits: number | null
    mlsNumber: string
    squareFootage: number | null
    bedrooms: number | null
    bathrooms: number | null
    foundationAccess: 'basement' | 'crawlspace' | 'slab' | null
    additionalUnits: number | null
  }
  
  contacts: {
    client: {
      firstName: string
      lastName: string
      email: string
    }
    agent: {
      firstName: string
      lastName: string
      email: string
    }
    additionalContacts: Array<{
      firstName: string
      lastName: string
      email: string
      role: 'anotherClient' | 'transactionManager' | 'seller'
    }>
  }
  
  availability: {
    candidateDate: { start: string | null; end: string | null }  // Candidate date (from confirmed appointment, loaded into wizard)
    candidateTimeSlots: Array<{ time: string; duration: number }> | null  // Candidate time slots (from confirmed appointment, loaded into wizard)
  }
  
  isQuoteMode: boolean
}

function normalizePropertyDetails(propertyDetails: unknown): unknown {
  if (Array.isArray(propertyDetails) && propertyDetails.length > 0) {
    return propertyDetails[0]
  }
  return propertyDetails ?? null
}

/**
 * Extract property details from appointment property version
 */
function extractPropertyDetails(propertyVersion: AppointmentResponse['propertyVersion']) {
  const address = propertyVersion?.address
  const details = normalizePropertyDetails(propertyVersion?.propertyDetails)
  return {
    ...extractAddressFields(address),
    ...extractLocationData(address),
    ...extractPropertyDetailsFields(details),
  }
}

/**
 * WHY: Extract contacts from appointment attendees
WHY: Separates contact extra...
 */
function extractContacts(attendees: AppointmentResponse['attendees']) {
  const attendeesList = safeArray(attendees)
  const clientAttendee = attendeesList.find(
    (a) =>
      a.userTypeBlockInstance?.name === ATTENDEE_ROLE_CLIENT ||
      a.user?.userRole === USER_ROLE_CLIENT
  )
  const agentAttendee = attendeesList.find(
    (a) =>
      a.userTypeBlockInstance?.name === ATTENDEE_ROLE_AGENT ||
      a.user?.userRole === USER_ROLE_AGENT
  )
  const otherAttendees = attendeesList.filter(
    (a) =>
      a.userTypeBlockInstance?.name !== ATTENDEE_ROLE_CLIENT &&
      a.userTypeBlockInstance?.name !== ATTENDEE_ROLE_AGENT &&
      a.user?.userRole !== USER_ROLE_CLIENT &&
      a.user?.userRole !== USER_ROLE_AGENT
  )
  const mappedAdditionalContacts = otherAttendees.map((attendee) => {
    const user = attendee.user
    const role =
      typeof attendee.userTypeBlockInstance?.name === 'string'
        ? attendee.userTypeBlockInstance.name.toLowerCase()
        : 'anotherClient'
    return {
      firstName: extractOptionalString(user?.firstName, 'additionalContact.firstName'),
      lastName: extractOptionalString(user?.lastName, 'additionalContact.lastName'),
      email: extractOptionalString(user?.email, 'additionalContact.email'),
      role: role as 'anotherClient' | 'transactionManager' | 'seller',
    }
  })
  return {
    client: {
      firstName: extractOptionalString(clientAttendee?.user?.firstName, 'client.firstName'),
      lastName: extractOptionalString(clientAttendee?.user?.lastName, 'client.lastName'),
      email: extractOptionalString(clientAttendee?.user?.email, 'client.email'),
    },
    agent: {
      firstName: extractOptionalString(agentAttendee?.user?.firstName, 'agent.firstName'),
      lastName: extractOptionalString(agentAttendee?.user?.lastName, 'agent.lastName'),
      email: extractOptionalString(agentAttendee?.user?.email, 'agent.email'),
    },
    additionalContacts: mappedAdditionalContacts,
  }
}

/**
 * WHY: Extract availability from appointment
WHY: Separates availability extrac...
 */
function extractAvailability(appointment: AppointmentResponse) {
  const candidateDate = {
    start: appointment.selectedDate ?? null,
    end: appointment.selectedDateRangeEnd ?? null,
  }
  
  interface TimeSlotLike {
    startTime?: string | null
    duration?: number | null
  }
  const candidateTimeSlots = appointment.selectedTimeSlots
    ? (appointment.selectedTimeSlots as TimeSlotLike[]).map((slot) => ({
        time: extractOptionalString(slot.startTime, 'timeSlot.time'),
        duration: extractOptionalNumber(slot.duration, 'timeSlot.duration'),
      }))
    : null
  
  return {
    candidateDate,
    candidateTimeSlots,
  }
}

async function fetchVersionSnapshots(
  appointment: AppointmentResponse
): Promise<AppointmentVersionsResponse | null> {
  if (
    !appointment.serviceSnapshotIds &&
    !appointment.propertySnapshotIds &&
    !appointment.optionSnapshotIds
  ) {
    return null
  }
  const versionsResponse = await apiClient.get<AppointmentVersionsResponse>(
    getAppointmentVersionsEndpoint(appointment.id)
  )
  return versionsResponse.data
}

function resolveBlockCategories(
  appointment: AppointmentResponse,
  bookingData: BookingData,
  versionsData: AppointmentVersionsResponse | null
): {
  services: BookingBlockInstance[]
  propertyTypeBlocks: BookingBlockInstance[]
  optionTypeBlocks: BookingBlockInstance[]
  lineItemBlocks: BookingBlockInstance[]
} {
  const serviceIds = safeArray(appointment.selectedServiceIds)
  const services = resolveBlockCategory({
    ids: serviceIds,
    bookingData,
    blockShapeType: 'SERVICE',
    versionsData,
    categoryKey: 'services',
    logger,
  })

  const propertyTypeBlockIds = safeArray(appointment.selectedPropertyIds)
  const propertyTypeBlocks = resolveBlockCategory({
    ids: propertyTypeBlockIds,
    bookingData,
    blockShapeType: 'PROPERTY',
    versionsData,
    categoryKey: 'properties',
    logger,
  })

  const optionTypeBlockIds = safeArray(appointment.selectedOptionIds)
  const optionTypeBlocks = resolveBlockCategory({
    ids: optionTypeBlockIds,
    bookingData,
    blockShapeType: 'OPTION',
    versionsData,
    categoryKey: 'options',
    logger,
  })

  const lineItemBlockIds = safeArray(
    (appointment as { selectedLineItemIds?: string[] }).selectedLineItemIds
  )
  const lineItemBlocks = resolveBlockCategory({
    ids: lineItemBlockIds,
    bookingData,
    versionsData,
    categoryKey: 'lineItems',
    logger,
    lineItemBlocks: bookingData.lineItemBlocks,
  })

  return { services, propertyTypeBlocks, optionTypeBlocks, lineItemBlocks }
}

/**
 * WHY: Transform appointment response to wizard state data
LEARNING: Main trans...
 */
export async function transformAppointmentToWizard(
  appointment: AppointmentResponse,
  bookingData: BookingData
): Promise<WizardStateData> {
  const stateControlBlocks = getStateControlBlockInstances(bookingData)
  const userTypeId = appointment.userTypeId
  const userTypeBlock = findById(stateControlBlocks, userTypeId)

  if (userTypeId && !userTypeBlock) {
    const resolvedBlockInstance = findBlockInstanceById(bookingData, userTypeId)
    if (resolvedBlockInstance) {
      logger.warn(
        `userTypeId ${userTypeId} resolved to block instance but is not a state control block`
      )
    } else {
      logger.warn(`userTypeId ${userTypeId} not found in booking data`)
    }
  }

  let versionsData: AppointmentVersionsResponse | null = null
  try {
    versionsData = await fetchVersionSnapshots(appointment)
  } catch (error) {
    logger.error('Failed to fetch versions:', error)
    throw error
  }

  const { services, propertyTypeBlocks, optionTypeBlocks, lineItemBlocks } =
    resolveBlockCategories(appointment, bookingData, versionsData)

  const propertyDetails = extractPropertyDetails(appointment.propertyVersion)
  const contacts = extractContacts(appointment.attendees)
  const availability = extractAvailability(appointment)

  return {
    userTypeBlock: userTypeBlock ?? null,
    services,
    propertyTypeBlocks,
    optionTypeBlocks,
    lineItemBlocks,
    propertyDetails,
    contacts,
    availability,
    isQuoteMode: extractOptionalBoolean(appointment.isQuoteMode, 'isQuoteMode'),
  }
}
