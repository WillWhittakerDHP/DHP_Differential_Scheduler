/**
 * WHY: useWizardSubmission Composable

WHY: Moves appointment submission orches...
 */
import { ERROR_CREATE_APPOINTMENT } from '@/constants/errorMessages'
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
    activeStep,
    completedSteps,
    showError,
    success
  } = params

  const handleSubmit = async (): Promise<void> => {
    try {
      const appointmentData = await collectAppointmentData()
      
      if (!appointmentData) {
        return // Error already shown
      }

      await createAppointment.mutateAsync(appointmentData)
      
      success('Appointment created successfully!')
      
      // PATTERN: Set activeStep to confirmation step index (step 4, index 4)
      for (let i = 0; i < 4; i++) {
        completedSteps.value.add(i)
      }
      activeStep.value = 4 // Confirmation step is at index 4
    } catch (error) {
      logger.error('Create appointment failed', { error })
      const errorMessage = error instanceof Error ? error.message : ERROR_CREATE_APPOINTMENT
      showError(errorMessage)
    }
  }

  return {
    handleSubmit
  }
}
