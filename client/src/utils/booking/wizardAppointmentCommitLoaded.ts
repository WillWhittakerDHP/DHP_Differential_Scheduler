/**
 * WHY: Success path after appointment fetch + transform (extracted for smaller handler builders).
 */

import type { Ref } from 'vue'
import type { WizardStateData } from '@/utils/transformers/appointmentToWizardTransformer'
import type { AppointmentResponse } from '@/types/appointment'
import type { UseWizardAppointmentManagementOptions } from '@/types/booking/wizardAppointmentManagement'
import { applyWizardStateFromAppointment } from '@/utils/booking/wizardAppointmentApplyState'
import { PERSIST_KEY_APPOINTMENT_ID } from '@/utils/booking/wizardAppointmentInitialRoute'

export function commitLoadedAppointmentToWizardUi(input: {
  appointmentIdOrRandom: string
  appointment: AppointmentResponse
  wizardState: WizardStateData
  wizard: UseWizardAppointmentManagementOptions['wizard']
  propertyDetailsStepData: UseWizardAppointmentManagementOptions['propertyDetailsStepData']
  contactsStepData: UseWizardAppointmentManagementOptions['contactsStepData']
  loadedWizardState: Ref<WizardStateData | null>
  loadedAppointmentId: Ref<string | null>
  selectedAppointmentId: Ref<string | null>
  completedSteps: UseWizardAppointmentManagementOptions['completedSteps']
  activeStep: UseWizardAppointmentManagementOptions['activeStep']
  loadOptions: { mode?: 'reschedule' | 'quote' } | undefined
  success: (message: string) => void
}): void {
  input.selectedAppointmentId.value = input.appointment.id
  input.wizard.batchUpdate(() => {
    applyWizardStateFromAppointment(input.wizard, input.wizardState, {
      propertyDetailsStepData: input.propertyDetailsStepData,
      contactsStepData: input.contactsStepData,
    })
  })
  input.loadedWizardState.value = input.wizardState
  input.loadedAppointmentId.value = input.appointment.id

  if (input.appointmentIdOrRandom !== 'random' && typeof localStorage !== 'undefined') {
    localStorage.setItem(PERSIST_KEY_APPOINTMENT_ID, input.appointment.id)
  }

  if (input.appointmentIdOrRandom !== 'random') {
    input.wizard.setWizardMode(input.loadOptions?.mode ?? 'reschedule')
  }

  input.completedSteps.value.add(1)
  input.activeStep.value = 2
  input.success('Appointment loaded successfully')
  input.selectedAppointmentId.value = null
}
