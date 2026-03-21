import type { ComputedRef } from 'vue'
import type { WizardDevOptionsBase } from '@/types/wizardDevOptions'

export type UseAppointmentDropdownOptions = WizardDevOptionsBase

export interface UseAppointmentDropdownReturn {
  appointmentDropdownItems: ComputedRef<Array<{ text: string; value: string }>>
}
