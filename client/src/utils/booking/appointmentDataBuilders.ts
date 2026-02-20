/**
 * Builders for appointment request payload from wizard step data.
 * WHY: Reduces complexity in useAppointmentDataCollection and centralizes field mapping.
 */

import { USER_ROLE_CLIENT, USER_ROLE_AGENT } from '@/constants/attendeeRoles'
import type { AppointmentRequest, AppointmentStatus } from '@/types/appointment'
import type { AttendeeRequest } from '@shared/types/appointmentTypes'
import type { PropertyRequest } from '@/types/property'
import type { UserRequest } from '@/types/user'
import type { BookingBlockInstance } from '@/utils/transformers/globalToBookingTransformer'
import { buildAppointmentFeeBreakdown } from '@/utils/booking/confirmationStepData'
import { toISO8601Date } from '@/types/datetime'
import type { ISO8601Date } from '@shared/types/primitiveBrands'
import type { PropertyDetailsStepData } from '@/types/wizard'
import type { ContactsStepData } from '@/types/wizard'
import type { AvailabilityStepData } from '@/utils/booking/availabilityStepData'

/** Attendee roles used in specs; centralize to satisfy hardcoding audit. */
export const APPOINTMENT_ATTENDEE_ROLES = {
  transactionManager: 'transaction_manager' as const,
  seller: 'seller' as const,
}

export interface AttendeeSpecInput {
  info: { firstName: string; lastName: string; email: string }
  role: typeof USER_ROLE_CLIENT | typeof USER_ROLE_AGENT | typeof APPOINTMENT_ATTENDEE_ROLES.transactionManager | typeof APPOINTMENT_ATTENDEE_ROLES.seller
  shouldCreate: boolean
}

export interface CreateUserMutate {
  mutateAsync: (data: UserRequest) => Promise<{ id: string }>
}

export interface WizardBlocksForBuilders {
  selectedServiceTypeBlocks: BookingBlockInstance[]
  selectedPropertyTypeBlocks: BookingBlockInstance[]
  selectedOptionTypeBlocks: BookingBlockInstance[]
  selectedLineItemBlocks: BookingBlockInstance[]
  selectedUserTypeBlock: { id: string } | null
  isQuoteMode: boolean
}

export function buildPropertyRequest(step: PropertyDetailsStepData): PropertyRequest {
  return {
    address: step.address,
    unit: step.unit ?? null,
    city: step.city,
    state: step.state,
    zipCode: step.zipCode,
    placeId: step.candidatePlaceId ?? null,
    latitude: step.candidateCoordinates?.lat ?? null,
    longitude: step.candidateCoordinates?.lng ?? null,
    mlsNumber: step.mlsNumber ?? null,
    squareFootage: step.squareFootage ?? null,
    bedrooms: step.bedrooms ?? null,
    bathrooms: step.bathrooms ?? null,
    foundationAccess: step.foundationAccess ?? null,
    additionalUnits: step.additionalUnits ?? null,
    source: step.source ?? undefined,
  }
}

export function buildPropertyDetailsForRequest(step: PropertyDetailsStepData): AppointmentRequest['propertyDetails'] {
  return {
    address: step.address,
    unit: step.unit ?? null,
    city: step.city,
    state: step.state,
    zipCode: step.zipCode,
    propertySize: step.propertySize,
    numberOfUnits: step.numberOfUnits,
    mlsNumber: step.mlsNumber ?? null,
    squareFootage: step.squareFootage,
    bedrooms: step.bedrooms,
    bathrooms: step.bathrooms,
    foundationAccess: step.foundationAccess,
    additionalUnits: step.additionalUnits,
  }
}

async function createAttendeeFromSpec(
  spec: AttendeeSpecInput,
  createUser: CreateUserMutate
): Promise<AttendeeRequest | null> {
  if (!spec.shouldCreate || !spec.info.firstName) return null
  const created = await createUser.mutateAsync({
    firstName: spec.info.firstName,
    lastName: spec.info.lastName,
    email: spec.info.email,
    phone: null,
    userRole: spec.role,
  })
  return {
    userId: created.id,
    role: spec.role,
    shouldReceiveInvitation: true,
  }
}

export function buildAttendeeSpecs(contacts: ContactsStepData): AttendeeSpecInput[] {
  return [
    { info: contacts.clientInfo, role: USER_ROLE_CLIENT, shouldCreate: true },
    { info: contacts.agentInfo, role: USER_ROLE_AGENT, shouldCreate: true },
    { info: contacts.anotherClientInfo, role: USER_ROLE_CLIENT, shouldCreate: contacts.showAnotherClient },
    { info: contacts.transactionManagerInfo, role: APPOINTMENT_ATTENDEE_ROLES.transactionManager, shouldCreate: contacts.showTransactionManager },
    { info: contacts.sellerInfo, role: APPOINTMENT_ATTENDEE_ROLES.seller, shouldCreate: contacts.showSeller },
  ]
}

export async function buildAttendeesFromContacts(
  contacts: ContactsStepData,
  createUser: CreateUserMutate
): Promise<AttendeeRequest[]> {
  const specs = buildAttendeeSpecs(contacts)
  const results = await Promise.all(specs.map((spec) => createAttendeeFromSpec(spec, createUser)))
  return results.filter((r): r is AttendeeRequest => r !== null)
}

export interface AvailabilityPayload {
  selectedDate: ISO8601Date | null
  selectedDateRangeEnd: ISO8601Date | null
  selectedTimeSlots: AppointmentRequest['selectedTimeSlots']
}

export function buildAvailabilityPayload(availability: AvailabilityStepData): AvailabilityPayload {
  const startRaw = availability.candidateDate.start
  const endRaw = availability.candidateDate.end
  const selectedDate = startRaw != null ? toISO8601Date(String(startRaw)) : null
  const selectedDateRangeEnd = endRaw != null ? toISO8601Date(String(endRaw)) : null
  const selectedTimeSlots = availability.candidateTimeSlots
    ? availability.candidateTimeSlots.map((slot) => ({
        startTime: slot.startTime,
        endTime: slot.endTime,
        duration: slot.duration,
      }))
    : null
  return { selectedDate, selectedDateRangeEnd, selectedTimeSlots }
}

export interface BlockQuantities {
  serviceQuantities: Record<string, number>
  propertyQuantities: Record<string, number>
  optionTypeBlockQuantities: Record<string, number>
}

function reduceBlockQuantities(blocks: BookingBlockInstance[]): Record<string, number> {
  return blocks.reduce((acc, block) => {
    const number = (block as BookingBlockInstance & { number?: number | null }).number
    if (number != null) acc[block.id] = number
    return acc
  }, {} as Record<string, number>)
}

export function buildBlockQuantities(wizard: WizardBlocksForBuilders): BlockQuantities {
  return {
    serviceQuantities: reduceBlockQuantities(wizard.selectedServiceTypeBlocks),
    propertyQuantities: reduceBlockQuantities(wizard.selectedPropertyTypeBlocks),
    optionTypeBlockQuantities: reduceBlockQuantities(wizard.selectedOptionTypeBlocks),
  }
}

export function buildAppointmentRequest(params: {
  propertyVersionId: string
  wizard: WizardBlocksForBuilders
  propertyDetails: AppointmentRequest['propertyDetails']
  attendees: AttendeeRequest[]
  availability: AvailabilityPayload
  quantities: BlockQuantities
  squareFootage: number | null
  aduCount: number | null
}): AppointmentRequest {
  const { propertyVersionId, wizard, propertyDetails, attendees, availability, quantities, squareFootage, aduCount } = params
  const hasServiceQty = Object.keys(quantities.serviceQuantities).length > 0
  const hasPropertyQty = Object.keys(quantities.propertyQuantities).length > 0
  const hasOptionQty = Object.keys(quantities.optionTypeBlockQuantities).length > 0
  const wizardForFee = {
    selectedServices: wizard.selectedServiceTypeBlocks,
    selectedPropertyTypeBlocks: wizard.selectedPropertyTypeBlocks,
    selectedOptionTypeBlocks: wizard.selectedOptionTypeBlocks,
    selectedLineItemBlocks: wizard.selectedLineItemBlocks,
  }
  const feeBreakdown = buildAppointmentFeeBreakdown(wizardForFee, squareFootage, aduCount)
  const status: AppointmentStatus = wizard.isQuoteMode ? 'quoted' : 'submitted'

  return {
    propertyVersionId,
    userTypeBlockId: wizard.selectedUserTypeBlock?.id ?? null,
    selectedServiceIds: wizard.selectedServiceTypeBlocks.map((s) => s.id),
    serviceQuantities: hasServiceQty ? quantities.serviceQuantities : null,
    selectedPropertyIds: wizard.selectedPropertyTypeBlocks.length > 0 ? wizard.selectedPropertyTypeBlocks.map((d) => d.id) : null,
    propertyQuantities: hasPropertyQty ? quantities.propertyQuantities : null,
    selectedOptionIds: wizard.selectedOptionTypeBlocks.length > 0 ? wizard.selectedOptionTypeBlocks.map((opt) => opt.id) : null,
    optionQuantities: hasOptionQty ? quantities.optionTypeBlockQuantities : null,
    selectedDate: availability.selectedDate,
    selectedDateRangeEnd: availability.selectedDateRangeEnd,
    selectedTimeSlots: availability.selectedTimeSlots,
    isQuoteMode: wizard.isQuoteMode,
    status,
    attendees: attendees.length > 0 ? attendees : null,
    propertyDetails,
    feeBreakdown,
  }
}
