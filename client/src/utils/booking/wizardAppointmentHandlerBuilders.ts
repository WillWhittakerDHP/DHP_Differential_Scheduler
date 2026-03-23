/**
 * WHY: Factory functions for wizard appointment handlers (keeps useWizardAppointmentManagement under audit limits).
 */

import { ref, type Ref } from 'vue'
import type { WizardStateData } from '@/utils/transformers/appointmentToWizardTransformer'
import type { UseWizardAppointmentManagementOptions } from '@/types/booking/wizardAppointmentManagement'
import { createLogger } from '@/utils/logger'
import { resetWizardStepValidationRefs } from '@/utils/booking/wizardStepValidationReset'
import { resolveWizardStateForAppointmentLoad } from '@/utils/booking/wizardAppointmentLoadOrchestrator'
import { commitLoadedAppointmentToWizardUi } from '@/utils/booking/wizardAppointmentCommitLoaded'
import { PERSIST_KEY_APPOINTMENT_ID } from '@/utils/booking/wizardAppointmentInitialRoute'
import { ERROR_UPDATE_APPOINTMENT } from '@/constants/errorMessages'

const logger = createLogger('wizardAppointmentHandlerBuilders')

export type WizardAppointmentRefsBundle = {
  loadedWizardState: Ref<WizardStateData | null>
  loadedAppointmentId: Ref<string | null>
  currentAppointmentId: Ref<string | null>
  selectedAppointmentId: Ref<string | null>
  isLoadingAppointment: Ref<boolean>
}

export function createWizardAppointmentRefs(): WizardAppointmentRefsBundle {
  const loadedWizardState = ref<WizardStateData | null>(null)
  const loadedAppointmentId = ref<string | null>(null)
  const currentAppointmentId = loadedAppointmentId
  const selectedAppointmentId = ref<string | null>(null)
  const isLoadingAppointment = ref(false)
  return {
    loadedWizardState,
    loadedAppointmentId,
    currentAppointmentId,
    selectedAppointmentId,
    isLoadingAppointment,
  }
}

export function createLoadAppointmentHandler(
  options: UseWizardAppointmentManagementOptions,
  refs: WizardAppointmentRefsBundle
): (
  appointmentIdOrRandom: string | null,
  loadOptions?: { mode?: 'reschedule' | 'quote' }
) => Promise<void> {
  const {
    bookingData,
    fetchRandom,
    loadAppointmentById,
    showError,
    success,
    wizard,
    propertyDetailsStepData,
    contactsStepData,
    completedSteps,
    activeStep,
  } = options

  return async (appointmentIdOrRandom, loadOptions) => {
    if (!appointmentIdOrRandom) {
      return
    }

    refs.isLoadingAppointment.value = true
    try {
      const resolved = await resolveWizardStateForAppointmentLoad({
        appointmentIdOrRandom,
        fetchRandom,
        loadAppointmentById,
        bookingDataSnapshot: bookingData.value,
        logger,
      })
      if (!resolved.ok) {
        showError(resolved.message)
        return
      }

      commitLoadedAppointmentToWizardUi({
        appointmentIdOrRandom,
        appointment: resolved.appointment,
        wizardState: resolved.wizardState,
        wizard,
        propertyDetailsStepData,
        contactsStepData,
        loadedWizardState: refs.loadedWizardState,
        loadedAppointmentId: refs.loadedAppointmentId,
        selectedAppointmentId: refs.selectedAppointmentId,
        completedSteps,
        activeStep,
        loadOptions,
        success,
      })
    } catch (error) {
      logger.error('Failed to load appointment', { error })
      const errorMessage = error instanceof Error ? error.message : 'Failed to load appointment'
      showError(errorMessage)
    } finally {
      refs.isLoadingAppointment.value = false
    }
  }
}

export function createUpdateAppointmentHandler(
  options: UseWizardAppointmentManagementOptions,
  refs: WizardAppointmentRefsBundle
): () => Promise<void> {
  const { collectAppointmentData, updateAppointment, showError, success } = options

  return async () => {
    if (!refs.loadedAppointmentId.value) {
      showError('No appointment loaded')
      return
    }

    try {
      const appointmentData = await collectAppointmentData()
      if (!appointmentData) {
        return
      }

      await updateAppointment.mutateAsync({
        id: refs.loadedAppointmentId.value,
        data: appointmentData,
      })

      success('Appointment updated successfully')
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : ERROR_UPDATE_APPOINTMENT
      logger.error('Update appointment error', error)
      showError(errorMessage)
    }
  }
}

export function createResetWizardHandler(
  options: UseWizardAppointmentManagementOptions,
  refs: WizardAppointmentRefsBundle
): () => void {
  const {
    wizard,
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
    activeStep,
    success,
  } = options

  return () => {
    wizard.selectUserTypeBlock(null)
    wizard.selectedServiceTypeBlocks.value = []
    wizard.selectedPropertyTypeBlocks.value = []
    wizard.selectedOptionTypeBlocks.value = []
    wizard.setWizardMode('new')

    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(PERSIST_KEY_APPOINTMENT_ID)
    }
    refs.loadedWizardState.value = null
    refs.loadedAppointmentId.value = null
    refs.selectedAppointmentId.value = null

    resetWizardStepValidationRefs({
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
      activeStep,
    })

    success('Wizard reset successfully')
  }
}
