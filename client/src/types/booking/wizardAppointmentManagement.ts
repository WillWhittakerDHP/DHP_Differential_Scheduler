import type { Ref } from 'vue'
import type { WizardStateData } from '@/utils/transformers/appointmentToWizardTransformer'
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
  /** Identity of the appointment being edited (draft or existing). Used for availability overlap exclusion and create-vs-update. */
  loadedAppointmentId: Ref<string | null>
  /** Same as loadedAppointmentId; neutral name for entity identity (any flow: new draft, quote, reschedule). */
  currentAppointmentId: Ref<string | null>
  selectedAppointmentId: Ref<string | null>
  isLoadingAppointment: Ref<boolean>
  handleLoadAppointment: (appointmentIdOrRandom: string | null, options?: { mode?: 'reschedule' | 'quote' }) => Promise<void>
  handleUpdateAppointment: () => Promise<void>
  handleResetWizard: () => void
}
