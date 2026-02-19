/**
 * useWizardSubmission Composable
 * 
 * LEARNING: Extracts submission logic from BookingWizard component
 * WHY: Moves appointment submission orchestration logic to composable
 * PATTERN: Composable that provides submission function
 */

import { type Ref } from 'vue'
import type { AppointmentRequest } from '@/types/appointment'
import { ERROR_CREATE_APPOINTMENT } from '@/constants/errorMessages'
import { createLogger } from '@/utils/logger'

const logger = createLogger('useWizardSubmission')

export interface UseWizardSubmissionParams {
  collectAppointmentData: () => Promise<AppointmentRequest | null>
  createAppointment: {
    mutateAsync: (data: AppointmentRequest) => Promise<unknown>
  }
  activeStep: Ref<number>
  completedSteps: Ref<Set<number>>
  showError: (message: string) => void
  success: (message: string) => void
}

export interface UseWizardSubmissionReturn {
  handleSubmit: () => Promise<void>
}

/**
 * useWizardSubmission composable
 * 
 * LEARNING: Provides submission logic for wizard
 * WHY: Extracts submission logic from component to composable
 * PATTERN: Composable that returns submission function
 */
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

  /**
   * LEARNING: Submit handler for appointment creation
   * WHY: Creates appointment when wizard is submitted
   * PATTERN: Async function that collects data, calls mutation, handles success/error
   */
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

