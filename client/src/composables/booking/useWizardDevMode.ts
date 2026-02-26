/**
 * PATTERN: Composable for managing dev mode state and handlers; provides shared DevPanelButtonsContext (audit: duplication).
 */
import { ref, provide, inject } from 'vue'
import type { Ref } from 'vue'
import type { DevPanelButtonsContext } from '@/types/booking/devPanelButtonsContext'
import type {
  UseWizardDevModeOptions,
  UseWizardDevModeReturn,
} from '@/types/booking/wizardDevMode'
import { resetMocksSignalKey } from '@/composables/booking/injectionKeys'


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
  provide(resetMocksSignalKey, resetMocksSignal)

  const handleResetMocks = (): void => {
    resetMocksSignal.value++
  }

  if (isDevMode) {
    const appDevPanelButtons = inject<Ref<DevPanelButtonsContext | null>>('devPanelButtons')
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
        wizard,
      }
    }
  }

  return {
    resetMocksSignal,
    handleResetMocks,
  }
}
