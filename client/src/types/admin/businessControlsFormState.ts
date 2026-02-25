import type { UseAdminAvailabilitySettingsReturn } from './availabilitySettings'

export type BusinessHoursDay = 0 | 1 | 2 | 3 | 4 | 5 | 6

export type UseBusinessControlsFormStateParams = Pick<
  UseAdminAvailabilitySettingsReturn,
  'formData' | 'saving' | 'error' | 'autoConfirmEnabled'
>
