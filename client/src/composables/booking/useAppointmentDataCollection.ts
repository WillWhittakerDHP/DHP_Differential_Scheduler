/**
 * useAppointmentDataCollection Composable
 * 
 * LEARNING: Extracts appointment data collection logic from BookingWizard component
 * WHY: Moves massive data collection and transformation logic to composable
 * PATTERN: Composable that provides data collection function
 */

import type { Ref } from 'vue'
import type { AppointmentRequest, AppointmentStatus } from '@/types/appointment'
import type { PropertyRequest } from '@/types/property'
import type { UserRequest } from '@/types/user'
import type { BookingBlockInstance } from '@/utils/transformers/globalToBookingTransformer'

import type { PropertyDetailsData } from '@/types/propertyForm'

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

export interface AvailabilityStepData {
  selectedDate: { start: string | null; end: string | null }
  selectedTimeSlots: Array<{ time: string; duration: number }> | null
}

export interface UseAppointmentDataCollectionParams {
  wizard: {
    selectedServices: Ref<BookingBlockInstance[]> // Note: This param name kept for backward compatibility, but receives selectedServiceTypeBlocks
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
    if (wizard.selectedServices.value.length === 0) {
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
        mlsNumber: propertyDetailsStepData.value.mlsNumber || null,
        squareFootage: propertyDetailsStepData.value.squareFootage || null,
        bedrooms: propertyDetailsStepData.value.bedrooms || null,
        bathrooms: propertyDetailsStepData.value.bathrooms || null,
        foundationAccess: propertyDetailsStepData.value.foundationAccess || null,
        additionalUnits: propertyDetailsStepData.value.additionalUnits || null
      }

      const createdProperty = await createProperty.mutateAsync(propertyData)
      const propertyVersionId = createdProperty.propertyVersionId || createdProperty.id // Use propertyVersionId, fallback to id for compatibility

      const contacts = contactsStepData.value
      
      const clientUserData: UserRequest = {
        firstName: contacts.clientInfo.firstName,
        lastName: contacts.clientInfo.lastName,
        email: contacts.clientInfo.email,
        phone: null,
        userRole: 'client'
      }
      const createdClient = await createUser.mutateAsync(clientUserData)
      const clientId = createdClient.id

      const agentUserData: UserRequest = {
        firstName: contacts.agentInfo.firstName,
        lastName: contacts.agentInfo.lastName,
        email: contacts.agentInfo.email,
        phone: null,
        userRole: 'agent'
      }
      const createdAgent = await createUser.mutateAsync(agentUserData)
      const agentId = createdAgent.id

      const additionalContactIds: Array<{ id: string; role: string }> = []

      if (contacts.showAnotherClient && contacts.anotherClientInfo.firstName) {
        const anotherClientData: UserRequest = {
          firstName: contacts.anotherClientInfo.firstName,
          lastName: contacts.anotherClientInfo.lastName,
          email: contacts.anotherClientInfo.email,
          phone: null,
          userRole: 'client'
        }
        const createdAnotherClient = await createUser.mutateAsync(anotherClientData)
        additionalContactIds.push({ id: createdAnotherClient.id, role: 'anotherClient' })
      }

      if (contacts.showTransactionManager && contacts.transactionManagerInfo.firstName) {
        const transactionManagerData: UserRequest = {
          firstName: contacts.transactionManagerInfo.firstName,
          lastName: contacts.transactionManagerInfo.lastName,
          email: contacts.transactionManagerInfo.email,
          phone: null,
          userRole: 'transaction_manager'
        }
        const createdTransactionManager = await createUser.mutateAsync(transactionManagerData)
        additionalContactIds.push({ id: createdTransactionManager.id, role: 'transactionManager' })
      }

      if (contacts.showSeller && contacts.sellerInfo.firstName) {
        const sellerData: UserRequest = {
          firstName: contacts.sellerInfo.firstName,
          lastName: contacts.sellerInfo.lastName,
          email: contacts.sellerInfo.email,
          phone: null,
          userRole: 'seller'
        }
        const createdSeller = await createUser.mutateAsync(sellerData)
        additionalContactIds.push({ id: createdSeller.id, role: 'seller' })
      }

      const availability = availabilityStepData.value
      const selectedDate = availability.selectedDate.start
      const selectedDateRangeEnd = availability.selectedDate.end
      const selectedTimeSlots = availability.selectedTimeSlots

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

      const additionalContacts = additionalContactIds.length > 0
        ? additionalContactIds.map(({ id, role }) => ({
            userId: id,
            role
          }))
        : null

      const isQuoteMode = wizard.isQuoteMode.value

      // PATTERN: Map array to object { id -> number } for items with number property
      const serviceQuantities = wizard.selectedServices.value.reduce((acc, service) => {
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
        selectedServiceIds: wizard.selectedServices.value.map(s => s.id),
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
        status: isQuoteMode ? 'quoted' : 'started' as AppointmentStatus,
        clientId,
        agentId,
        additionalContacts,
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




