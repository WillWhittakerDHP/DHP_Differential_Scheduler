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
import { BLOCK_SHAPE_TYPES } from '@/constants/blockShapeTypes'
import { getStateControlBlockInstances } from '@/utils/blockInstanceUtils'
import { ATTENDEE_ROLE_CLIENT, ATTENDEE_ROLE_AGENT, USER_ROLE_CLIENT, USER_ROLE_AGENT } from '@/constants/attendeeRoles'

/** Block shape type keys for resolveBlockCategory (avoids magic strings). */
const BlockShapeTypeKey = {
  SERVICE: 'SERVICE',
  PROPERTY: 'PROPERTY',
  OPTION: 'OPTION',
} as const satisfies Record<string, keyof typeof BLOCK_SHAPE_TYPES>
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
    ? propertyDetailsArray[0] // Use first/latest property details
    : propertyDetailsArray ?? null
  
  // PATTERN: Check if value is a string, otherwise return empty string (don't try to extract from objects)
  const extractString = (value: unknown): string => {
    if (typeof value === 'string') return value
    return ''
  }
  
  // PATTERN: Check if value is a number, otherwise return null (don't try to extract from objects)
  const extractFoundationAccess = (value: unknown): 'basement' | 'crawlspace' | 'slab' | null => {
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
  const extractedPlaceId = typeof addressWithGeo?.placeId === 'string' ? addressWithGeo.placeId : undefined
  const extractedCoordinates =
    addressWithGeo?.latitude != null && addressWithGeo?.longitude != null
      ? { lat: Number(addressWithGeo.latitude), lng: Number(addressWithGeo.longitude) }
      : undefined
  
  return {
    address: address?.address ?? '',
    unit: address?.unit ?? '',
    city: address?.city ?? '',
    state: address?.state ?? '',
    zipCode: address?.zipCode ?? '',
    // LEARNING: Extract candidatePlaceId and candidateCoordinates from address object
    // WHY: These are needed for drive time calculations and API orchestrator
    // PATTERN: Extract from address object if available, otherwise undefined
    // NOTE: These become "candidate" when loaded into wizard (for editing)
    candidatePlaceId: extractedPlaceId,
    candidateCoordinates: extractedCoordinates,
    
    propertySize: propertyDetailsRecord?.squareFootage ?? null,
    numberOfUnits: propertyDetailsRecord?.additionalUnits ?? null,
    mlsNumber: extractString(propertyDetailsRecord?.mlsNumber),
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
  const clientAttendee = attendees?.find(a => 
    a.userTypeBlockInstance?.name === ATTENDEE_ROLE_CLIENT || a.user?.userRole === USER_ROLE_CLIENT
  )
  const agentAttendee = attendees?.find(a => 
    a.userTypeBlockInstance?.name === ATTENDEE_ROLE_AGENT || a.user?.userRole === USER_ROLE_AGENT
  )
  
  const otherAttendees = attendees?.filter(a => 
    a.userTypeBlockInstance?.name !== ATTENDEE_ROLE_CLIENT && 
    a.userTypeBlockInstance?.name !== ATTENDEE_ROLE_AGENT &&
    a.user?.userRole !== USER_ROLE_CLIENT &&
    a.user?.userRole !== USER_ROLE_AGENT
  ) ?? []
  
  const mappedAdditionalContacts = otherAttendees.map((attendee) => {
    const user = attendee.user
    const role = attendee.userTypeBlockInstance?.name?.toLowerCase() ?? 'anotherClient'
    return {
      firstName: user?.firstName ?? '',
      lastName: user?.lastName ?? '',
      email: user?.email ?? '',
      role: role as 'anotherClient' | 'transactionManager' | 'seller'
    }
  })
  
  return {
    client: {
      firstName: clientAttendee?.user?.firstName ?? '',
      lastName: clientAttendee?.user?.lastName ?? '',
      email: clientAttendee?.user?.email ?? '',
    },
    agent: {
      firstName: agentAttendee?.user?.firstName ?? '',
      lastName: agentAttendee?.user?.lastName ?? '',
      email: agentAttendee?.user?.email ?? '',
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
        time: typeof slot.startTime === 'string' ? slot.startTime : '',
        duration: typeof slot.duration === 'number' ? slot.duration : 0,
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
  const serviceIds = appointment.selectedServiceIds ?? []
  const services = resolveBlockCategory({
    ids: serviceIds,
    bookingData,
    blockShapeType: BlockShapeTypeKey.SERVICE,
    versionsData,
    categoryKey: 'services',
    logger,
  })

  const propertyTypeBlockIds = appointment.selectedPropertyIds ?? []
  const propertyTypeBlocks = resolveBlockCategory({
    ids: propertyTypeBlockIds,
    bookingData,
    blockShapeType: BlockShapeTypeKey.PROPERTY,
    versionsData,
    categoryKey: 'properties',
    logger,
  })

  const optionTypeBlockIds = appointment.selectedOptionIds ?? []
  const optionTypeBlocks = resolveBlockCategory({
    ids: optionTypeBlockIds,
    bookingData,
    blockShapeType: BlockShapeTypeKey.OPTION,
    versionsData,
    categoryKey: 'options',
    logger,
  })

  const lineItemBlockIds =
    (appointment as { selectedLineItemIds?: string[] }).selectedLineItemIds ?? []
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
  const userTypeBlock = userTypeId
    ? stateControlBlocks.find((block) => block.id === userTypeId)
    : null

  if (userTypeId && !userTypeBlock) {
    const fallback = findBlockInstanceById(bookingData, userTypeId)
    if (fallback) {
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
    isQuoteMode: appointment.isQuoteMode ?? false,
  }
}
