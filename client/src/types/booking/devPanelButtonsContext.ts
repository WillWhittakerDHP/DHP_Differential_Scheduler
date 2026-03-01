import type { Ref, ComputedRef } from 'vue'
import type { AppointmentResponse } from '@/types/appointment'
import type { UseBookingWizardReturn } from '@/types/wizard'

/**
 * Shared contract for dev panel buttons context (provide/inject).
 */
export interface DevPanelButtonsContext {
  selectedAppointmentId: Ref<string | null>
  appointmentDropdownItems: ComputedRef<Array<{ text: string; value: string }>>
  loadedAppointmentId: Ref<string | null>
  isLoadingAppointment: Ref<boolean>
  fetchAll: { isLoading: Ref<boolean>; data: Ref<AppointmentResponse[]> }
  handleLoadAppointment: (id: string | null) => Promise<void>
  handleUpdateAppointment: () => Promise<void>
  handleResetWizard: () => void
  handleResetMocks: () => void
  updateAppointment: { isPending: Ref<boolean> }
  wizard: UseBookingWizardReturn | null
}
