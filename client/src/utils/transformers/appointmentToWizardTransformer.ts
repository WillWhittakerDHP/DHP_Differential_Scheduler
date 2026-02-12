/**
 * Appointment to Wizard Transformer
 * 
 * LEARNING: Transforms appointment API response to wizard state format
 * WHY: Enables loading existing appointments into wizard for testing/editing
 * PATTERN: Transformer function that maps appointment data to wizard state
 * 
 * Phase 1.2.3: Created for mock data loading functionality
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
  type AppointmentVersionsResponse,
} from './appointmentToWizardHelpers'

const logger = createLogger('appointmentToWizardTransformer')

/**
 * Wizard state data structure
 * LEARNING: Represents all wizard state that can be populated from appointment
 * WHY: Type-safe structure for loading appointment data into wizard
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

/**
 * Extract property details from appointment property version
 * LEARNING: Helper to extract property address and details
 * WHY: Separates property extraction logic from main transformer
 * PATTERN: Extract from propertyVersion object, handle nulls with ?? defaults
 */
function extractPropertyDetails(propertyVersion: AppointmentResponse['propertyVersion']) {
  const address = propertyVersion?.address
  const propertyDetailsArray = propertyVersion?.propertyDetails
  const propertyDetailsRecord = Array.isArray(propertyDetailsArray)
    ? propertyDetailsArray[0]
    : propertyDetailsArray ?? null

  function extractFoundationAccess(value: unknown): 'basement' | 'crawlspace' | 'slab' | null {
    if (typeof value === 'string' && (value === 'basement' || value === 'crawlspace' || value === 'slab')) {
      return value
    }
    return null
  }

  interface AddressWithGeo {
    placeId?: string
    latitude?: number
    longitude?: number
  }
  function isAddressWithGeo(v: unknown): v is AddressWithGeo {
    return v != null && typeof v === 'object'
  }
  const addressWithGeo = address != null && isAddressWithGeo(address) ? address : undefined
  const extractedPlaceId =
    typeof addressWithGeo?.placeId === 'string' ? addressWithGeo.placeId : undefined
  const extractedCoordinates =
    addressWithGeo?.latitude != null && addressWithGeo?.longitude != null
      ? { lat: Number(addressWithGeo.latitude), lng: Number(addressWithGeo.longitude) }
      : undefined

  return {
    address: extractOptionalString(address?.address, 'propertyDetails.address'),
    unit: extractOptionalString(address?.unit, 'propertyDetails.unit'),
    city: extractOptionalString(address?.city, 'propertyDetails.city'),
    state: extractOptionalString(address?.state, 'propertyDetails.state'),
    zipCode: extractOptionalString(address?.zipCode, 'propertyDetails.zipCode'),
    candidatePlaceId: extractedPlaceId,
    candidateCoordinates: extractedCoordinates,
    propertySize: propertyDetailsRecord?.squareFootage ?? null,
    numberOfUnits: propertyDetailsRecord?.additionalUnits ?? null,
    mlsNumber: extractOptionalString(propertyDetailsRecord?.mlsNumber, 'propertyDetails.mlsNumber'),
    squareFootage: propertyDetailsRecord?.squareFootage ?? null,
    bedrooms: propertyDetailsRecord?.bedrooms ?? null,
    bathrooms: propertyDetailsRecord?.bathrooms ?? null,
    foundationAccess: extractFoundationAccess(propertyDetailsRecord?.foundationAccess),
    additionalUnits: propertyDetailsRecord?.additionalUnits ?? null,
  }
}

/**
 * Extract contacts from appointment attendees
 * LEARNING: Helper to extract client, agent, and additional contacts
 * WHY: Separates contact extraction logic from main transformer
 * PATTERN: Find client/agent by role, filter others, map to contact format
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
 * Extract availability from appointment
 * LEARNING: Helper to extract selected date and time slots
 * WHY: Separates availability extraction logic from main transformer
 * PATTERN: Map time slots to wizard format { time, duration }
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
 * Transform appointment response to wizard state data
 * LEARNING: Main transformer function that maps appointment to wizard state
 * WHY: Enables loading appointment data into wizard for testing
 * PATTERN: Orchestrator that calls helper functions to extract and transform data
 *
 * @param appointment - Appointment response from API (includes relationships)
 * @param bookingData - Scheduler data containing block instances
 * @returns Wizard state data ready to populate wizard
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
