/**
 * PATTERN: Single composables entry for business controls tab — reduces @/composables/ import fan-out (composable-health).
 */
export { useAdminAvailabilitySettings, calculateMaxBusinessHours } from './useAdminAvailabilitySettings'
export { useAdminCalendarSettings } from './useAdminCalendarSettings'
export { useAdminWizardSettings } from './useAdminWizardSettings'
export { useTabNavigation } from './useTabNavigation'
export { useBusinessControlsFormState } from './useBusinessControlsFormState'
export { useWizardSettings } from './useWizardSettings'
export { useCapacitySettings } from './useCapacitySettings'
export { useBufferSettings } from './useBufferSettings'
export { useDefaultLocation } from './useDefaultLocation'
export { useDifferentialPerspectives } from './useDifferentialPerspectives'
