/**
 * LEARNING: Wizard Appointment Management
 * WHY: Encapsulates appointment loading, updating, and wizard reset logic
 * PATTERN: Composable for managing appointment operations and wizard state
 * 
 * Used by:
 * - BookingWizard.vue
 */

import { ref, type Ref } from 'vue'
import type { WizardStateData } from '@/utils/transformers/appointmentToWizardTransformer'
import { transformAppointmentToWizard } from '@/utils/transformers/appointmentToWizardTransformer'
import type { AppointmentResponse } from '@/types/appointment'
import type { BookingData } from '@/utils/transformers/globalToBookingTransformer'
import type { UseBookingWizardReturn, WizardStepDataAndValidationRefs } from '@/types/wizard'
import type { AppointmentRequest } from '@/types/appointment'

export interface UseWizardAppointmentManagementOptions extends WizardStepDataAndValidationRefs {
  wizard: UseBookingWizardReturn
  bookingData: Ref<BookingData | null>
  loadAppointmentById: (id: string) => Promise<AppointmentResponse | null>
  fetchRandom: () => Promise<AppointmentResponse | null>
  collectAppointmentData: () => Promise<AppointmentRequest | null>
  updateAppointment: {
    mutateAsync: (params: { id: string; data: AppointmentRequest }) => Promise<unknown>
    isPending: Ref<boolean>
  }
  activeStep: Ref<number>
  completedSteps: Ref<Set<number>>
  showError: (message: string) => void
  success: (message: string) => void
}

export interface UseWizardAppointmentManagementReturn {
  loadedWizardState: Ref<WizardStateData | null>
  loadedAppointmentId: Ref<string | null>
  selectedAppointmentId: Ref<string | null>
  isLoadingAppointment: Ref<boolean>
  handleLoadAppointment: (appointmentIdOrRandom: string | null) => Promise<void>
  handleUpdateAppointment: () => Promise<void>
  handleResetWizard: () => void
}

/**
 * LEARNING: Manage appointment loading, updating, and wizard reset
 * WHY: Encapsulates all appointment-related operations and state management
 * PATTERN: Composable that provides handlers and state for appointment operations
 */
export function useWizardAppointmentManagement(
  options: UseWizardAppointmentManagementOptions
): UseWizardAppointmentManagementReturn {
  const {
    wizard,
    bookingData,
    loadAppointmentById,
    fetchRandom,
    collectAppointmentData,
    updateAppointment,
    activeStep,
    completedSteps,
    propertyDetailsStepData,
    contactsStepData,
    availabilityStepData,
    propertyDetailsStepValid,
    propertyDetailsStepValidate,
    propertyDetailsFieldErrors,
    contactsStepValid,
    contactsStepValidate,
    availabilityStepValid,
    availabilityStepValidate,
    showError,
    success,
  } = options

  // LEARNING: State for loading appointment data
  // WHY: Tracks loaded wizard state for populating form fields
  // PATTERN: Reactive refs for appointment tracking
  const loadedWizardState = ref<WizardStateData | null>(null)
  const loadedAppointmentId = ref<string | null>(null)
  const selectedAppointmentId = ref<string | null>(null)
  const isLoadingAppointment = ref(false)

  /**
   * LEARNING: Handle loading appointment into wizard
   * WHY: Enables testing time slot creation by loading existing appointments
   * PATTERN: Load appointment, transform to wizard state, populate wizard refs
   */
  const handleLoadAppointment = async (appointmentIdOrRandom: string | null): Promise<void> => {
    if (!appointmentIdOrRandom) return
    
    isLoadingAppointment.value = true
    try {
      let appointment: AppointmentResponse | null = null
      
      if (appointmentIdOrRandom === 'random') {
        appointment = await fetchRandom()
        if (!appointment) {
          showError('No appointments available to load')
          return
        }
        selectedAppointmentId.value = appointment.id
      } else {
        // LEARNING: Load appointment using composable with cache refresh
        // WHY: Ensures appointment is loaded with all relationships from API
        // PATTERN: Composable handles cache refresh and returns appointment from cache
        try {
          appointment = await loadAppointmentById(appointmentIdOrRandom)
          if (!appointment) {
            showError('Appointment not found')
            return
          }
          selectedAppointmentId.value = appointment.id
        } catch (error) {
          showError('Appointment not found')
          return
        }
      }
      
      if (!appointment || !bookingData.value) {
        showError('Unable to load appointment data')
        return
      }
      
      // Transform appointment to wizard state
      const wizardState = await transformAppointmentToWizard(appointment, bookingData.value)
      
      // Populate wizard state refs (skip cascade to avoid clearing dependent selections)
      // Use spread operators to ensure Vue detects array changes
      wizard.selectUserTypeBlock(wizardState.userTypeBlock, true)
      wizard.selectedServices.value = [...wizardState.services]
      wizard.selectedPropertyTypeBlocks.value = [...wizardState.propertyTypeBlocks]
      wizard.selectedOptionTypeBlocks.value = [...wizardState.optionTypeBlocks]
      wizard.isQuoteMode.value = wizardState.isQuoteMode
      
      // Set loaded wizard state for form field population
      loadedWizardState.value = wizardState
      loadedAppointmentId.value = appointment.id
      
      // Populate step data refs (children will sync from these)
      propertyDetailsStepData.value = wizardState.propertyDetails
      contactsStepData.value = {
        clientInfo: wizardState.contacts.client,
        agentInfo: wizardState.contacts.agent,
        anotherClientInfo: wizardState.contacts.additionalContacts.find(c => c.role === 'anotherClient') || { firstName: '', lastName: '', email: '' },
        transactionManagerInfo: wizardState.contacts.additionalContacts.find(c => c.role === 'transactionManager') || { firstName: '', lastName: '', email: '' },
        sellerInfo: wizardState.contacts.additionalContacts.find(c => c.role === 'seller') || { firstName: '', lastName: '', email: '' },
        showAnotherClient: wizardState.contacts.additionalContacts.some(c => c.role === 'anotherClient'),
        showTransactionManager: wizardState.contacts.additionalContacts.some(c => c.role === 'transactionManager'),
        showSeller: wizardState.contacts.additionalContacts.some(c => c.role === 'seller')
      }
      // NOTE: availabilityStepData is provided by AvailabilityStep component when it mounts
      // The loadedWizardState is already set above, and AvailabilityStep will read from it
      // via useAvailabilityDefaults composable, so we don't need to set it directly here
      
      // LEARNING: Automatically navigate to step 3 after loading appointment
      // WHY: Since appointment data is already loaded, skip step 2 and go directly to step 3 (Availability)
      // PATTERN: Mark intermediate steps as completed and navigate directly to target step
      // Mark step 1 (Property Details) as completed to allow navigation
      completedSteps.value.add(1) // Property Details (step 2)
      // Navigate directly to step 3 (Appointment Availability) - index 2
      activeStep.value = 2
      
      success('Appointment loaded successfully')
      // Clear dropdown selection after load so user can select again
      selectedAppointmentId.value = null
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load appointment'
      showError(errorMessage)
    } finally {
      isLoadingAppointment.value = false
    }
  }

  /**
   * LEARNING: Handle updating appointment from wizard state
   * WHY: Saves current wizard state back to the loaded appointment
   * PATTERN: Collect wizard data, update appointment via API
   */
  const handleUpdateAppointment = async (): Promise<void> => {
    if (!loadedAppointmentId.value) {
      showError('No appointment loaded')
      return
    }
    
    try {
      const appointmentData = await collectAppointmentData()
      if (!appointmentData) {
        return // Error already shown by collectAppointmentData
      }
      
      await updateAppointment.mutateAsync({
        id: loadedAppointmentId.value,
        data: appointmentData
      })
      
      success('Appointment updated successfully')
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update appointment'
      console.error('[Wizard] Update appointment error:', error)
      showError(errorMessage)
    }
  }

  /**
   * LEARNING: Handle resetting wizard state
   * WHY: Clears all wizard state and loaded appointment tracking
   * PATTERN: Clear all wizard refs and reset loaded state
   */
  const handleResetWizard = (): void => {
    wizard.selectUserTypeBlock(null, true)
    wizard.selectedServices.value = []
    wizard.selectedPropertyTypeBlocks.value = []
    wizard.selectedOptionTypeBlocks.value = []
    wizard.isQuoteMode.value = false
    
    loadedWizardState.value = null
    loadedAppointmentId.value = null
    selectedAppointmentId.value = null
    
    // Reset step data refs
    propertyDetailsStepData.value = null
    contactsStepData.value = null
    availabilityStepData.value = null
    
    // Reset validation state
    propertyDetailsStepValid.value = false
    propertyDetailsStepValidate.value = null
    propertyDetailsFieldErrors.value = {}
    contactsStepValid.value = false
    contactsStepValidate.value = null
    availabilityStepValid.value = false
    availabilityStepValidate.value = null
    
    // Reset to first step
    activeStep.value = 0
    
    success('Wizard reset successfully')
  }

  return {
    loadedWizardState,
    loadedAppointmentId,
    selectedAppointmentId,
    isLoadingAppointment,
    handleLoadAppointment,
    handleUpdateAppointment,
    handleResetWizard,
  }
}
