/**
 * LEARNING: Wizard Dev Mode Management
 * WHY: Encapsulates dev mode logic and dev panel buttons injection
 * PATTERN: Composable for managing dev mode state and handlers
 * 
 * Used by:
 * - BookingWizard.vue
 */

import { ref, provide, inject, type Ref, type ComputedRef } from 'vue'
import type { AppointmentResponse } from '@/types/appointment'

export interface UseWizardDevModeOptions {
  isDevMode: boolean
  selectedAppointmentId: Ref<string | null>
  appointmentDropdownItems: ComputedRef<Array<{ text: string; value: string }>>
  loadedAppointmentId: Ref<string | null>
  isLoadingAppointment: Ref<boolean>
  fetchAll: {
    isLoading: Ref<boolean>
    data: Ref<AppointmentResponse[]>
  }
  handleLoadAppointment: (id: string | null) => Promise<void>
  handleResetWizard: () => void
}

export interface UseWizardDevModeReturn {
  resetMocksSignal: Ref<number>
  handleResetMocks: () => void
}

/**
 * LEARNING: Manage dev mode logic and dev panel buttons
 * WHY: Encapsulates dev mode state and handlers, provides reset mocks signal
 * PATTERN: Composable that provides dev mode handlers and injects app-level buttons
 */
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
    handleResetWizard,
  } = options

  // LEARNING: Reset mocks signal for provide/inject
  // WHY: Allows BookingWizard to trigger mock reset in AvailabilityStep
  // PATTERN: Incrementing ref that AvailabilityStep watches
  const resetMocksSignal = ref(0)
  provide('resetMocksSignal', resetMocksSignal)

  /**
   * LEARNING: Handle resetting mock calendar data
   * WHY: Allows developers to regenerate mock busy periods for testing
   * PATTERN: Provide reset function that AvailabilityStep can call via inject
   */
  const handleResetMocks = (): void => {
    // Emit reset signal via provide/inject
    // AvailabilityStep will inject this and call resetMocks when signal changes
    resetMocksSignal.value++
  }

  // LEARNING: Update app-level dev panel buttons
  // WHY: DevPanelsContainer is rendered in App.vue, so buttons must be provided at app level
  // PATTERN: Inject app-level ref and update it with button functions and state
  if (isDevMode) {
    const appDevPanelButtons = inject<Ref<{
      selectedAppointmentId: Ref<string | null>
      appointmentDropdownItems: ComputedRef<Array<{ text: string; value: string }>>
      loadedAppointmentId: Ref<string | null>
      isLoadingAppointment: Ref<boolean>
      fetchAll: { isLoading: Ref<boolean>; data: Ref<AppointmentResponse[]> }
      handleLoadAppointment: (id: string | null) => Promise<void>
      handleResetWizard: () => void
      handleResetMocks: () => void
    } | null>>('devPanelButtons')

    if (appDevPanelButtons) {
      appDevPanelButtons.value = {
        selectedAppointmentId,
        appointmentDropdownItems,
        loadedAppointmentId,
        isLoadingAppointment,
        fetchAll,
        handleLoadAppointment,
        handleResetWizard,
        handleResetMocks
      }
    }
  }

  return {
    resetMocksSignal,
    handleResetMocks,
  }
}
