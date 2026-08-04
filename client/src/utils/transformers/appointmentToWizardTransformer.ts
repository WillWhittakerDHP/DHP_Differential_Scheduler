/**
 * WHY: Appointment to Wizard Transformer

 */
import type { AppointmentResponse } from '@/types/appointment'
import type { BookingBlockInstance, BookingData } from '@/types/transformers/bookingData'
import type { WizardStateData } from '@/types/booking/wizardStateData'
import { getStateControlBlockInstances } from '@/utils/blockInstanceUtils'
import {
  ATTENDEE_ROLE_BUYER,
  ATTENDEE_ROLE_AGENT,
  USER_ROLE_BUYER,
  USER_ROLE_AGENT,
} from '@/constants/attendeeRoles'
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

export type { WizardStateData } from '@/types/booking/wizardStateData'

function normalizePropertyDetails(propertyDetails: unknown): unknown {
  if (Array.isArray(propertyDetails) && propertyDetails.length > 0) {
    return propertyDetails[0]
  }
  return propertyDetails ?? null
}

function extractPropertyDetails(propertyVersion: AppointmentResponse['propertyVersion']) {
  const address = propertyVersion?.address
  const details = normalizePropertyDetails(propertyVersion?.propertyDetails)
  return {
    ...extractAddressFields(address),
    ...extractLocationData(address),
    ...extractPropertyDetailsFields(details),
  }
}

function blockLabelIsBuyer(name: string | null | undefined): boolean {
  if (typeof name !== 'string' || !name.trim()) return false
  const n = name.trim().toLowerCase()
  return n === ATTENDEE_ROLE_BUYER.toLowerCase()
}

function extractContacts(attendees: AppointmentResponse['attendees']) {
  const attendeesList = safeArray(attendees)
  const clientAttendee = attendeesList.find((a) => {
    const ur = a.user?.userRole as string | undefined
    return blockLabelIsBuyer(a.userTypeBlockInstance?.name) || ur === USER_ROLE_BUYER
  })
  const agentAttendee = attendeesList.find(
    (a) =>
      a.userTypeBlockInstance?.name === ATTENDEE_ROLE_AGENT ||
      a.user?.userRole === USER_ROLE_AGENT
  )
  const otherAttendees = attendeesList.filter((a) => {
    const ur = a.user?.userRole as string | undefined
    return (
      !blockLabelIsBuyer(a.userTypeBlockInstance?.name) &&
      a.userTypeBlockInstance?.name !== ATTENDEE_ROLE_AGENT &&
      ur !== USER_ROLE_BUYER &&
      ur !== USER_ROLE_AGENT
    )
  })
  const mappedAdditionalContacts = otherAttendees.map((attendee) => {
    const user = attendee.user
    const rawName =
      typeof attendee.userTypeBlockInstance?.name === 'string'
        ? attendee.userTypeBlockInstance.name.toLowerCase().replace(/\s+/g, '')
        : ''
    let role: 'anotherBuyer' | 'owner' = 'anotherBuyer'
    if (rawName === 'owner' || rawName === 'seller') {
      // Block instance display name may be "Owner" or "Seller" in admin data; wizard stores `owner` only.
      role = 'owner'
    }
    return {
      firstName: extractOptionalString(user?.firstName, 'additionalContact.firstName'),
      lastName: extractOptionalString(user?.lastName, 'additionalContact.lastName'),
      email: extractOptionalString(user?.email, 'additionalContact.email'),
      role,
    }
  })
  return {
    buyer: {
      firstName: extractOptionalString(clientAttendee?.user?.firstName, 'buyer.firstName'),
      lastName: extractOptionalString(clientAttendee?.user?.lastName, 'buyer.lastName'),
      email: extractOptionalString(clientAttendee?.user?.email, 'buyer.email'),
    },
    agent: {
      firstName: extractOptionalString(agentAttendee?.user?.firstName, 'agent.firstName'),
      lastName: extractOptionalString(agentAttendee?.user?.lastName, 'agent.lastName'),
      email: extractOptionalString(agentAttendee?.user?.email, 'agent.email'),
    },
    additionalContacts: mappedAdditionalContacts,
  }
}

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
    minimizerScheduling: null,
    totalDriveMinutes: null,
  }
}

async function fetchVersionSnapshots(
  appointment: AppointmentResponse
): Promise<AppointmentVersionsResponse | null> {
  if (
    !appointment.serviceSnapshotIds &&
    !appointment.timeSnapshotIds &&
    !appointment.eventSnapshotIds
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

  const propertyTypeBlockIds = safeArray(appointment.selectedTimeIds)
  const propertyTypeBlocks = resolveBlockCategory({
    ids: propertyTypeBlockIds,
    bookingData,
    blockShapeType: 'TIME',
    versionsData,
    categoryKey: 'properties',
    logger,
  })

  const optionTypeBlockIds = safeArray(appointment.selectedEventIds)
  const optionTypeBlocks = resolveBlockCategory({
    ids: optionTypeBlockIds,
    bookingData,
    blockShapeType: 'EVENT',
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
