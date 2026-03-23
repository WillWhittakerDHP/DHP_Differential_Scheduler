/**
 * PATTERN: Composable for managing appointment operations and wizard state
Used by:...
 */
import { onMounted } from 'vue'
import { useRoute } from 'vue-router'
import type { UseWizardAppointmentManagementOptions, UseWizardAppointmentManagementReturn } from '@/types/booking/wizardAppointmentManagement'
import { scheduleInitialAppointmentLoadFromRouteAndStorage } from '@/utils/booking/wizardAppointmentInitialRoute'
import {
  createWizardAppointmentRefs,
  createLoadAppointmentHandler,
  createUpdateAppointmentHandler,
  createResetWizardHandler,
} from '@/utils/booking/wizardAppointmentHandlerBuilders'

export function useWizardAppointmentManagement(
  options: UseWizardAppointmentManagementOptions
): UseWizardAppointmentManagementReturn {
  const route = useRoute()
  const refs = createWizardAppointmentRefs()
  const handleLoadAppointment = createLoadAppointmentHandler(options, refs)
  const handleUpdateAppointment = createUpdateAppointmentHandler(options, refs)
  const handleResetWizard = createResetWizardHandler(options, refs)

  onMounted(() => {
    scheduleInitialAppointmentLoadFromRouteAndStorage(route, refs.loadedAppointmentId, handleLoadAppointment)
  })

  return {
    loadedWizardState: refs.loadedWizardState,
    loadedAppointmentId: refs.loadedAppointmentId,
    currentAppointmentId: refs.currentAppointmentId,
    selectedAppointmentId: refs.selectedAppointmentId,
    isLoadingAppointment: refs.isLoadingAppointment,
    handleLoadAppointment,
    handleUpdateAppointment,
    handleResetWizard,
  }
}
