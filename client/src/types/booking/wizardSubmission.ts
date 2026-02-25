import type { Ref } from 'vue'
import type { AppointmentRequest } from '@/types/appointment'

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
