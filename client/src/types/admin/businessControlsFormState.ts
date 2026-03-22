import type { Ref } from 'vue'
import type { UseAdminAvailabilitySettingsReturn } from './availabilitySettings'
import type { CalendarSettingsData } from '@/configs/calendarSettings'
import type { WizardSettingsData } from '@/configs/wizardSettings'

export type BusinessHoursDay = 0 | 1 | 2 | 3 | 4 | 5 | 6

export interface UseBusinessControlsFormStateParams {
  formData: UseAdminAvailabilitySettingsReturn['formData']
  saving: UseAdminAvailabilitySettingsReturn['saving']
  error: UseAdminAvailabilitySettingsReturn['error']
  calendarFormData: Ref<CalendarSettingsData | null>
  calendarSaving: Ref<boolean>
  calendarError: Ref<string | null>
  wizardFormData: Ref<WizardSettingsData | null>
}
