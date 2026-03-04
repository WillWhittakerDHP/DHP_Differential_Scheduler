import type { Ref } from 'vue'
import type { AppointmentRequest } from '@/types/appointment'

export interface UseWizardSubmissionParams {
  collectAppointmentData: () => Promise<AppointmentRequest | null>
  createAppointment: {
    mutateAsync: (data: AppointmentRequest) => Promise<unknown>
  }
  /** When set, submit performs update instead of create (entity identity from draft-first). */
  currentAppointmentId: Ref<string | null>
  updateAppointment: {
    mutateAsync: (params: { id: string; data: AppointmentRequest }) => Promise<unknown>
  }
  activeStep: Ref<number>
  completedSteps: Ref<Set<number>>
  showError: (message: string) => void
  success: (message: string) => void
}

export interface UseWizardSubmissionReturn {
  handleSubmit: () => Promise<void>
  /** True when we have an existing appointment and submit will update. */
  isUpdateSubmit: Ref<boolean>
}
