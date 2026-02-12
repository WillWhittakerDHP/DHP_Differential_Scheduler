/**
 * useAppointmentDataCollection Composable
 * 
 * LEARNING: Extracts appointment data collection logic from BookingWizard component
 * WHY: Moves massive data collection and transformation logic to composable
 * PATTERN: Composable that provides data collection function
 */

import type { Ref } from 'vue'
import { USER_ROLE_CLIENT, USER_ROLE_AGENT } from '@/constants/attendeeRoles'
import type { AppointmentRequest, AppointmentStatus, AttendeeRequest } from '@/types/appointment'
import type { PropertyRequest } from '@/types/property'
import type { UserRequest } from '@/types/user'
import type { BookingBlockInstance } from '@/utils/transformers/globalToBookingTransformer'

import type { PropertyDetailsData } from '@/types/propertyForm'

/**
 * Helper type for building attendees
 * LEARNING: Internal type for collecting attendee data before API submission
 */
interface AttendeeCollectionItem {
  userId: string;
  role: typeof USER_ROLE_CLIENT | typeof USER_ROLE_AGENT | 'transaction_manager' | 'seller';
  shouldReceiveInvitation: boolean;
}

/**
 * Property details step data structure
 * FIX: Use shared PropertyDetailsData type from propertyForm.ts
 */
export type PropertyDetailsStepData = PropertyDetailsData

export interface ContactsStepData {
  clientInfo: { firstName: string; lastName: string; email: string }
  agentInfo: { firstName: string; lastName: string; email: string }
  anotherClientInfo: { firstName: string; lastName: string; email: string }
  transactionManagerInfo: { firstName: string; lastName: string; email: string }
  sellerInfo: { firstName: string; lastName: string; email: string }
  showAnotherClient: boolean
  showTransactionManager: boolean
  showSeller: boolean
}

// LEARNING: Import AvailabilityStepData from canonical source
// WHY: Single source of truth prevents format mismatches
// SESSION: 2.1.3b - Fixed timezone issue caused by duplicate interface
import type { AvailabilityStepData } from '@/utils/booking/availabilityStepData'
export type { AvailabilityStepData }

export interface UseAppointmentDataCollectionParams {
  wizard: {
    selectedServiceTypeBlocks: Ref<BookingBlockInstance[]>
    selectedPropertyTypeBlocks: Ref<BookingBlockInstance[]>
    selectedOptionTypeBlocks: Ref<BookingBlockInstance[]>
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
 * useAppointmentDataCollection composable
 * 
 * LEARNING: Provides appointment data collection logic
 * WHY: Extracts massive data collection function from component to composable
 * PATTERN: Composable that returns data collection function
 */
export function useAppointmentDataCollection(params: UseAppointmentDataCollectionParams): UseAppointmentDataCollectionReturn {
  const {
    wizard,
    propertyDetailsStepData,
    contactsStepData,
    availabilityStepData,
    createProperty,
    createUser,
    showError
  } = params

  /**
   * LEARNING: Helper function to collect appointment data from wizard state
   * WHY: Transforms wizard selections into appointment API format
   * PATTERN: Collect data from wizard state and transform to AppointmentRequest
   */
  const collectAppointmentData = async (): Promise<AppointmentRequest | null> => {
    // Validate required fields
    if (wizard.selectedServiceTypeBlocks.value.length === 0) {
      showError('Please select at least one service type')
      return null
    }

    // Validate step data is available
    if (!propertyDetailsStepData?.value) {
      showError('Property details are required')
      return null
    }

    if (!contactsStepData?.value) {
      showError('Contact information is required')
      return null
    }

    if (!availabilityStepData?.value) {
      showError('Availability selection is required')
      return null
    }

    try {
      const propertyData: PropertyRequest = {
        address: propertyDetailsStepData.value.address,
        unit: propertyDetailsStepData.value.unit || null,
        city: propertyDetailsStepData.value.city,
        state: propertyDetailsStepData.value.state,
        zipCode: propertyDetailsStepData.value.zipCode,
        // LEARNING: Map candidatePlaceId to placeId at API boundary (candidate --> confirmed)
        placeId: propertyDetailsStepData.value.candidatePlaceId || null,
        latitude: propertyDetailsStepData.value.candidateCoordinates?.lat || null,
        longitude: propertyDetailsStepData.value.candidateCoordinates?.lng || null,
        mlsNumber: propertyDetailsStepData.value.mlsNumber || null,
        squareFootage: propertyDetailsStepData.value.squareFootage || null,
        bedrooms: propertyDetailsStepData.value.bedrooms || null,
        bathrooms: propertyDetailsStepData.value.bathrooms || null,
        foundationAccess: propertyDetailsStepData.value.foundationAccess || null,
        additionalUnits: propertyDetailsStepData.value.additionalUnits || null
      }

      const createdProperty = await createProperty.mutateAsync(propertyData)
      const rawVersionId = createdProperty.propertyVersionId
      const propertyVersionId = rawVersionId !== undefined && rawVersionId !== null ? rawVersionId : createdProperty.id

      const contacts = contactsStepData.value
      
      // LEARNING: Build attendees array for calendar invitations
      // WHY: New flexible attendee system replaces legacy clientId/agentId
      // SESSION: 2.1.3b - Appointment Attendees Architecture
      const attendeesCollection: AttendeeCollectionItem[] = []
      
      // Create primary client user
      const clientUserData: UserRequest = {
        firstName: contacts.clientInfo.firstName,
        lastName: contacts.clientInfo.lastName,
        email: contacts.clientInfo.email,
        phone: null,
        userRole: USER_ROLE_CLIENT
      }
      const createdClient = await createUser.mutateAsync(clientUserData)
      attendeesCollection.push({
        userId: createdClient.id,
        role: USER_ROLE_CLIENT,
        shouldReceiveInvitation: true
      })

      // Create agent user
      const agentUserData: UserRequest = {
        firstName: contacts.agentInfo.firstName,
        lastName: contacts.agentInfo.lastName,
        email: contacts.agentInfo.email,
        phone: null,
        userRole: USER_ROLE_AGENT
      }
      const createdAgent = await createUser.mutateAsync(agentUserData)
      attendeesCollection.push({
        userId: createdAgent.id,
        role: USER_ROLE_AGENT,
        shouldReceiveInvitation: true
      })

      // Create another client if provided
      if (contacts.showAnotherClient && contacts.anotherClientInfo.firstName) {
        const anotherClientData: UserRequest = {
          firstName: contacts.anotherClientInfo.firstName,
          lastName: contacts.anotherClientInfo.lastName,
          email: contacts.anotherClientInfo.email,
          phone: null,
          userRole: USER_ROLE_CLIENT
        }
        const createdAnotherClient = await createUser.mutateAsync(anotherClientData)
        attendeesCollection.push({
          userId: createdAnotherClient.id,
          role: USER_ROLE_CLIENT,
          shouldReceiveInvitation: true
        })
      }

      // Create transaction manager if provided
      if (contacts.showTransactionManager && contacts.transactionManagerInfo.firstName) {
        const transactionManagerData: UserRequest = {
          firstName: contacts.transactionManagerInfo.firstName,
          lastName: contacts.transactionManagerInfo.lastName,
          email: contacts.transactionManagerInfo.email,
          phone: null,
          userRole: 'transaction_manager'
        }
        const createdTransactionManager = await createUser.mutateAsync(transactionManagerData)
        attendeesCollection.push({
          userId: createdTransactionManager.id,
          role: 'transaction_manager',
          shouldReceiveInvitation: true
        })
      }

      // Create seller if provided
      if (contacts.showSeller && contacts.sellerInfo.firstName) {
        const sellerData: UserRequest = {
          firstName: contacts.sellerInfo.firstName,
          lastName: contacts.sellerInfo.lastName,
          email: contacts.sellerInfo.email,
          phone: null,
          userRole: 'seller'
        }
        const createdSeller = await createUser.mutateAsync(sellerData)
        attendeesCollection.push({
          userId: createdSeller.id,
          role: 'seller',
          shouldReceiveInvitation: true
        })
      }
      
      // Transform to AttendeeRequest format
      // SESSION: 2.1.3b - Appointment Attendees Architecture
      const attendees: AttendeeRequest[] = attendeesCollection.map(item => ({
        userId: item.userId,
        role: item.role,
        shouldReceiveInvitation: item.shouldReceiveInvitation
      }))

      const availability = availabilityStepData.value
      // LEARNING: Map candidateDate to selectedDate at API boundary (candidate --> confirmed)
      const selectedDate = availability.candidateDate.start
      const selectedDateRangeEnd = availability.candidateDate.end
      // LEARNING: Map candidateTimeSlots to selectedTimeSlots at API boundary (candidate --> confirmed)
      // Transform from SelectedTimeSlot format to AppointmentRequest format
      const selectedTimeSlots = availability.candidateTimeSlots 
        ? availability.candidateTimeSlots.map(slot => ({
            startTime: slot.startTime,
            endTime: slot.endTime,
            duration: slot.duration
          }))
        : null

      const propertyDetails = {
        address: propertyDetailsStepData.value.address,
        unit: propertyDetailsStepData.value.unit || null,
        city: propertyDetailsStepData.value.city,
        state: propertyDetailsStepData.value.state,
        zipCode: propertyDetailsStepData.value.zipCode,
        propertySize: propertyDetailsStepData.value.propertySize,
        numberOfUnits: propertyDetailsStepData.value.numberOfUnits,
        mlsNumber: propertyDetailsStepData.value.mlsNumber || null,
        squareFootage: propertyDetailsStepData.value.squareFootage,
        bedrooms: propertyDetailsStepData.value.bedrooms,
        bathrooms: propertyDetailsStepData.value.bathrooms,
        foundationAccess: propertyDetailsStepData.value.foundationAccess,
        additionalUnits: propertyDetailsStepData.value.additionalUnits
      }

      const isQuoteMode = wizard.isQuoteMode.value

      // PATTERN: Map array to object { id -> number } for items with number property
      const serviceQuantities = wizard.selectedServiceTypeBlocks.value.reduce((acc, service) => {
        const number = (service as BookingBlockInstance & { number?: number | null }).number
        if (number != null) {
          acc[service.id] = number
        }
        return acc
      }, {} as Record<string, number>)
      
      const propertyQuantities = wizard.selectedPropertyTypeBlocks.value.reduce((acc, property) => {
        const number = (property as BookingBlockInstance & { number?: number | null }).number
        if (number != null) {
          acc[property.id] = number
        }
        return acc
      }, {} as Record<string, number>)
      
      const optionTypeBlockQuantities = wizard.selectedOptionTypeBlocks.value.reduce((acc, option) => {
        const number = (option as BookingBlockInstance & { number?: number | null }).number
        if (number != null) {
          acc[option.id] = number
        }
        return acc
      }, {} as Record<string, number>)

      const appointmentData: AppointmentRequest = {
        propertyVersionId, // Use propertyVersionId (new field)
        userTypeBlockId: wizard.selectedUserTypeBlock.value?.id || null,
        selectedServiceIds: wizard.selectedServiceTypeBlocks.value.map(s => s.id),
        serviceQuantities: Object.keys(serviceQuantities).length > 0 ? serviceQuantities : null,
        selectedPropertyIds: wizard.selectedPropertyTypeBlocks.value.length > 0
          ? wizard.selectedPropertyTypeBlocks.value.map(d => d.id)
          : null,
        propertyQuantities: Object.keys(propertyQuantities).length > 0 ? propertyQuantities : null,
        selectedOptionIds: wizard.selectedOptionTypeBlocks.value.length > 0
          ? wizard.selectedOptionTypeBlocks.value.map(opt => opt.id)
          : null,
        optionQuantities: Object.keys(optionTypeBlockQuantities).length > 0 ? optionTypeBlockQuantities : null,
        selectedDate,
        selectedDateRangeEnd,
        selectedTimeSlots,
        isQuoteMode,
        // LEARNING: 'submitted' triggers calendar invitation, 'quoted' is for quote-only mode
        // WHY: Calendar events should only be created when user commits to booking
        // SESSION: 2.1.3b - Appointment Attendees Architecture
        status: isQuoteMode ? 'quoted' : 'submitted' as AppointmentStatus,
        // Attendees for calendar invitations
        // SESSION: 2.1.3b - Appointment Attendees Architecture
        attendees: attendees.length > 0 ? attendees : null,
        propertyDetails
      }

      return appointmentData
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to collect appointment data'
      showError(errorMessage)
      return null
    }
  }

  return {
    collectAppointmentData
  }
}




