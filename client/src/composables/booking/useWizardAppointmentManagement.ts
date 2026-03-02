/**
 * PATTERN: Composable for managing appointment operations and wizard state
Used by:...
 */
import { ref, onMounted, type Ref } from 'vue'
import type { WizardStateData } from '@/utils/transformers/appointmentToWizardTransformer'
import { createLogger } from '@/utils/logger'
import { transformAppointmentToWizard } from '@/utils/transformers/appointmentToWizardTransformer'
import type { AppointmentResponse } from '@/types/appointment'
import type { UseBookingWizardReturn } from '@/types/wizard'
import { APPOINTMENT_NOT_FOUND, ERROR_UPDATE_APPOINTMENT } from '@/constants/errorMessages'
import type {
  UseWizardAppointmentManagementOptions,
  UseWizardAppointmentManagementReturn,
} from '@/types/booking/wizardAppointmentManagement'

const logger = createLogger('useWizardAppointmentManagement')

/** Persistence key for draft-first: reload restores wizard when this id is set (quote/reschedule or future draft). */
const PERSIST_KEY_APPOINTMENT_ID = 'booking-wizard-appointment-id'

function applyWizardState(
  wizard: UseBookingWizardReturn,
  wizardState: WizardStateData,
  stepDataRefs: {
    propertyDetailsStepData: Ref<WizardStateData['propertyDetails'] | null>
    contactsStepData: Ref<unknown>
  }
): void {
  wizard.selectUserTypeBlock(wizardState.userTypeBlock)
  wizard.selectedServiceTypeBlocks.value = [...wizardState.services]
  wizard.selectedPropertyTypeBlocks.value = [...wizardState.propertyTypeBlocks]
  wizard.selectedOptionTypeBlocks.value = [...wizardState.optionTypeBlocks]
  wizard.setWizardMode(wizardState.isQuoteMode ? 'quote' : 'new')
  stepDataRefs.propertyDetailsStepData.value = wizardState.propertyDetails
  stepDataRefs.contactsStepData.value = {
    clientInfo: wizardState.contacts.client,
    agentInfo: wizardState.contacts.agent,
    anotherClientInfo: wizardState.contacts.additionalContacts.find(c => c.role === 'anotherClient') ?? { firstName: '', lastName: '', email: '' },
    transactionManagerInfo: wizardState.contacts.additionalContacts.find(c => c.role === 'transactionManager') ?? { firstName: '', lastName: '', email: '' },
    sellerInfo: wizardState.contacts.additionalContacts.find(c => c.role === 'seller') ?? { firstName: '', lastName: '', email: '' },
    showAnotherClient: wizardState.contacts.additionalContacts.some(c => c.role === 'anotherClient'),
    showTransactionManager: wizardState.contacts.additionalContacts.some(c => c.role === 'transactionManager'),
    showSeller: wizardState.contacts.additionalContacts.some(c => c.role === 'seller')
  }
}

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
  // PATTERN: Reactive refs for appointment tracking. currentAppointmentId is the neutral entity identity (same ref as loadedAppointmentId).
  const loadedWizardState = ref<WizardStateData | null>(null)
  const loadedAppointmentId = ref<string | null>(null)
  const currentAppointmentId = loadedAppointmentId
  const selectedAppointmentId = ref<string | null>(null)
  const isLoadingAppointment = ref(false)

  /**
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
        // PATTERN: Composable handles cache refresh and returns appointment from cache
        try {
          appointment = await loadAppointmentById(appointmentIdOrRandom)
          if (!appointment) {
            showError(APPOINTMENT_NOT_FOUND)
            return
          }
          selectedAppointmentId.value = appointment.id
        } catch (error) {
          logger.error('Error loading appointment by ID', { error })
          const message = error instanceof Error ? error.message : APPOINTMENT_NOT_FOUND
          showError(message)
          return
        }
      }
      
      if (!appointment || !bookingData.value) {
        showError('Unable to load appointment data')
        return
      }
      
      const wizardState = await transformAppointmentToWizard(appointment, bookingData.value)

      wizard.batchUpdate(() => {
        applyWizardState(wizard, wizardState, {
          propertyDetailsStepData,
          contactsStepData
        })
      })

      loadedWizardState.value = wizardState
      loadedAppointmentId.value = appointment.id

      // Draft-first: persist id so reload can restore (skip for dev "random" load)
      if (appointmentIdOrRandom !== 'random' && typeof localStorage !== 'undefined') {
        localStorage.setItem(PERSIST_KEY_APPOINTMENT_ID, appointment.id)
      }

      // WHEN: Loading by id (not 'random') — entry point may have set reschedule; ensure we're in reschedule mode for submit step
      if (appointmentIdOrRandom !== 'random') {
        wizard.setWizardMode('reschedule')
      }

      // WHY: Since appointment data is already loaded, skip step 2 and go directly to step 3 (Availability)
      // PATTERN: Mark intermediate steps as completed and navigate directly to target step
      completedSteps.value.add(1) // Property Details (step 2)
      activeStep.value = 2

      success('Appointment loaded successfully')
      selectedAppointmentId.value = null
    } catch (error) {
      logger.error('Failed to load appointment', { error })
      const errorMessage = error instanceof Error ? error.message : 'Failed to load appointment'
      showError(errorMessage)
    } finally {
      isLoadingAppointment.value = false
    }
  }

  /**
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
      const errorMessage = error instanceof Error ? error.message : ERROR_UPDATE_APPOINTMENT
      logger.error('Update appointment error', error)
      showError(errorMessage)
    }
  }

  /**
WHY: Clears all wizard state and loaded appointment tracking
PATTERN...
   */
  const handleResetWizard = (): void => {
    wizard.selectUserTypeBlock(null)
    wizard.selectedServiceTypeBlocks.value = []
    wizard.selectedPropertyTypeBlocks.value = []
    wizard.selectedOptionTypeBlocks.value = []
    wizard.setWizardMode('new')

    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(PERSIST_KEY_APPOINTMENT_ID)
    }
    loadedWizardState.value = null
    loadedAppointmentId.value = null
    selectedAppointmentId.value = null
    
    propertyDetailsStepData.value = null
    contactsStepData.value = null
    availabilityStepData.value = null
    
    propertyDetailsStepValid.value = false
    propertyDetailsStepValidate.value = null
    propertyDetailsFieldErrors.value = {}
    contactsStepValid.value = false
    contactsStepValidate.value = null
    availabilityStepValid.value = false
    availabilityStepValidate.value = null
    
    activeStep.value = 0
    
    success('Wizard reset successfully')
  }

  // Draft-first: on mount, restore wizard from persisted appointment id so reload keeps state
  onMounted(() => {
    if (typeof localStorage === 'undefined') return
    const persistedId = localStorage.getItem(PERSIST_KEY_APPOINTMENT_ID)
    if (persistedId && !loadedAppointmentId.value) {
      void handleLoadAppointment(persistedId)
    }
  })

  return {
    loadedWizardState,
    loadedAppointmentId,
    currentAppointmentId,
    selectedAppointmentId,
    isLoadingAppointment,
    handleLoadAppointment,
    handleUpdateAppointment,
    handleResetWizard,
  }
}
