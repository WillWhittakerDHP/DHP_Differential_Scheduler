/**
 * PATTERN: Composable for managing dev mode state and handlers

Used by:
- BookingW...
 */
import { ref, provide, inject, type Ref, type ComputedRef } from 'vue'
import type { AppointmentResponse } from '@/types/appointment'
import { useBookingWizard } from '@/composables/booking/useBookingWizard'
import type { WizardDevOptionsBase } from '@/types/wizardDevOptions'

/** Extends shared base; adds dev mode state and handlers (TYPE_SIMILARITY 1.14). */
export interface UseWizardDevModeOptions extends WizardDevOptionsBase {
  isDevMode: boolean
  selectedAppointmentId: Ref<string | null>
  appointmentDropdownItems: ComputedRef<Array<{ text: string; value: string }>>
  loadedAppointmentId: Ref<string | null>
  isLoadingAppointment: Ref<boolean>
  fetchAll: WizardDevOptionsBase['fetchAll'] & { isLoading: Ref<boolean> }
  handleLoadAppointment: (id: string | null) => Promise<void>
  handleUpdateAppointment: () => Promise<void>
  handleResetWizard: () => void
  updateAppointment: {
    isPending: Ref<boolean>
  }
  wizard: ReturnType<typeof useBookingWizard>
}

export interface UseWizardDevModeReturn {
  resetMocksSignal: Ref<number>
  handleResetMocks: () => void
}

export function useWizardDevMode(
  options: UseWizardDevModeOptions
): UseWizardDevModeReturn {
  const {
    isDevMode,
    selectedAppointmentId,
    appointmentDropdownItems,
    loadedAppointmentId,
    isLoadingAppointment,
    fetchAll,
    handleLoadAppointment,
    handleUpdateAppointment,
    handleResetWizard,
    updateAppointment,
    wizard,
  } = options

  // PATTERN: Incrementing ref that AvailabilityStep watches
  const resetMocksSignal = ref(0)
  provide('resetMocksSignal', resetMocksSignal)

  /**
   */
  const handleResetMocks = (): void => {
    resetMocksSignal.value++
  }

  // PATTERN: Inject app-level ref and update it with button functions and state
  if (isDevMode) {
    const appDevPanelButtons = inject<Ref<{
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
      wizard: ReturnType<typeof useBookingWizard> | null
    } | null>>('devPanelButtons')

    if (appDevPanelButtons) {
      appDevPanelButtons.value = {
        selectedAppointmentId,
        appointmentDropdownItems,
        loadedAppointmentId,
        isLoadingAppointment,
        fetchAll,
        handleLoadAppointment,
        handleUpdateAppointment,
        handleResetWizard,
        handleResetMocks,
        updateAppointment,
        wizard
      }
    }
  }

  return {
    resetMocksSignal,
    handleResetMocks,
  }
}
