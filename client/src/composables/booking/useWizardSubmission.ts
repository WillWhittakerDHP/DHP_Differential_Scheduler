/**
 * Wizard submission: orchestrates appointment creation/update, error handling, and step advancement.
 */
import { computed } from 'vue'
import { ERROR_CREATE_APPOINTMENT, ERROR_UPDATE_APPOINTMENT } from '@/constants/errorMessages'
import { createLogger } from '@/utils/logger'
import type {
  UseWizardSubmissionParams,
  UseWizardSubmissionReturn,
} from '@/types/booking/wizardSubmission'

const logger = createLogger('useWizardSubmission')

export function useWizardSubmission(
  params: UseWizardSubmissionParams
): UseWizardSubmissionReturn {
  const {
    collectAppointmentData,
    createAppointment,
    currentAppointmentId,
    updateAppointment,
    activeStep,
    completedSteps,
    showError,
    success
  } = params

  const isUpdateSubmit = computed(() => currentAppointmentId.value != null && currentAppointmentId.value !== '')

  const handleSubmit = async (): Promise<void> => {
    try {
      const appointmentData = await collectAppointmentData()
      if (!appointmentData) {
        return // Error already shown
      }

      const id = currentAppointmentId.value
      if (id) {
        await updateAppointment.mutateAsync({ id, data: appointmentData })
        success('Appointment updated successfully!')
      } else {
        await createAppointment.mutateAsync(appointmentData)
        success('Appointment created successfully!')
      }

      // PATTERN: Set activeStep to confirmation step index (step 4, index 4)
      for (let i = 0; i < 4; i++) {
        completedSteps.value.add(i)
      }
      activeStep.value = 4 // Confirmation step is at index 4
    } catch (error) {
      logger.error(isUpdateSubmit.value ? 'Update appointment failed' : 'Create appointment failed', { error })
      const errorMessage = error instanceof Error ? error.message : (isUpdateSubmit.value ? ERROR_UPDATE_APPOINTMENT : ERROR_CREATE_APPOINTMENT)
      showError(errorMessage)
    }
  }

  return {
    handleSubmit,
    isUpdateSubmit
  }
}
