/**
 * useAppointmentDataCollection Composable
 * 
 * LEARNING: Extracts appointment data collection logic from BookingWizard component
 * WHY: Moves massive data collection and transformation logic to composable
 * PATTERN: Composable that provides data collection function
 */

import type { Ref } from 'vue'
import type { AppointmentRequest, AppointmentStatus, BlockInstanceSnapshot } from '@/types/appointment'
import type { PropertyRequest } from '@/types/property'
import type { UserRequest } from '@/types/user'
import type { BookingBlockInstance } from '@/utils/transformers/globalToBookingTransformer'
import { blockInstanceToSnapshot } from '@/utils/transformers/blockInstanceToSnapshot'

/**
 * Property details step data structure
 */
export interface PropertyDetailsStepData {
  address: string
  unit: string
  city: string
  state: string
  zipCode: string
  propertySize: number | null
  numberOfUnits: number | null
  mlsNumber: string
  squareFootage: number | null
  bedrooms: number | null
  bathrooms: number | null
  foundationAccess: 'basement' | 'crawlspace' | 'slab' | null
  additionalUnits: number | null
}

/**
 * Contacts step data structure
 */
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

/**
 * Availability step data structure
 */
export interface AvailabilityStepData {
  selectedDate: { start: string | null; end: string | null }
  selectedTimeSlots: Array<{ time: string; duration: number }> | null
}

/**
 * useAppointmentDataCollection composable parameters
 */
export interface UseAppointmentDataCollectionParams {
  wizard: {
    selectedServices: Ref<BookingBlockInstance[]>
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

/**
 * useAppointmentDataCollection composable return type
 */
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
      // Step 1: Create property
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

      // Step 2: Create users
      const contacts = contactsStepData.value
      
      // Create client user
      const clientUserData: UserRequest = {
        firstName: contacts.clientInfo.firstName,
        lastName: contacts.clientInfo.lastName,
        email: contacts.clientInfo.email,
        phone: null,
        userRole: 'client'
      }
      const createdClient = await createUser.mutateAsync(clientUserData)
      const clientId = createdClient.id

      // Create agent user
      const agentUserData: UserRequest = {
        firstName: contacts.agentInfo.firstName,
        lastName: contacts.agentInfo.lastName,
        email: contacts.agentInfo.email,
        phone: null,
        userRole: 'agent'
      }
      const createdAgent = await createUser.mutateAsync(agentUserData)
      const agentId = createdAgent.id

      // Create additional contacts if sections are visible
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

      // Step 3: Collect availability data
      const availability = availabilityStepData.value
      const selectedDate = availability.selectedDate.start
      const selectedDateRangeEnd = availability.selectedDate.end
      const selectedTimeSlots = availability.selectedTimeSlots

      // Step 4: Collect property details object
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

      // Step 5: Collect additional contacts array
      const additionalContacts = additionalContactIds.length > 0
        ? additionalContactIds.map(({ id, role }) => ({
            userId: id,
            role
          }))
        : null

      // Step 6: Get quote mode from wizard state
      const isQuoteMode = wizard.isQuoteMode.value

      // Step 7: Extract quantity multipliers from selected items
      // LEARNING: Build quantity objects from items with number values
      // WHY: Store per-item quantities for calculation on appointment load
      // PATTERN: Map array to object { id -> number } for items with number property
      // NOTE: number property is added at runtime, not part of BookingBlockInstance type
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

      // Step 8: Capture snapshots of selected items
      // LEARNING: Store snapshots of block instances at booking time for historical accuracy
      // WHY: Preserves pricing/names even if admin updates services later
      // PATTERN: Transform each selected item to snapshot format
      const serviceSnapshots = wizard.selectedServices.value.reduce((acc, service) => {
        acc[service.id] = blockInstanceToSnapshot(service)
        return acc
      }, {} as Record<string, BlockInstanceSnapshot>)
      
      const propertySnapshots = wizard.selectedPropertyTypeBlocks.value.reduce((acc, property) => {
        acc[property.id] = blockInstanceToSnapshot(property)
        return acc
      }, {} as Record<string, BlockInstanceSnapshot>)
      
      const optionTypeBlockSnapshots = wizard.selectedOptionTypeBlocks.value.reduce((acc, option) => {
        acc[option.id] = blockInstanceToSnapshot(option)
        return acc
      }, {} as Record<string, BlockInstanceSnapshot>)

      // Build complete appointment request
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
        serviceSnapshots: Object.keys(serviceSnapshots).length > 0 ? serviceSnapshots : null,
        propertySnapshots: Object.keys(propertySnapshots).length > 0 ? propertySnapshots : null,
        optionSnapshots: Object.keys(optionTypeBlockSnapshots).length > 0 ? optionTypeBlockSnapshots : null,
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




