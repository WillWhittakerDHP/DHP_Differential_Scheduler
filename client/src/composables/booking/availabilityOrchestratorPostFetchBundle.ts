/**
 * PATTERN: Single composables entry for post-fetch phase — reduces @/composables/ import fan-out (composable-health).
 * Re-exports use relative paths so this file does not multiply @/composables/ scan hits.
 */
export { useOptionTypeBlockSelection } from './useOptionTypeBlockSelection'
export { useAppointmentDuration } from './useAppointmentDuration'
export { useMockCalendarRefresh } from './useMockCalendarRefresh'
export { usePerspectiveMapping } from './usePerspectiveMapping'
export { useAvailabilitySlotColor } from './useAvailabilitySlotColor'
export {
  wireAppointmentDurationToRef,
  wireDisplayedMonthToVDatePicker,
  wireSelectedDateToDisplayedMonth,
  wireVDatePickerToDisplayedMonth,
} from './useAvailabilityOrchestratorCalendarWatches'
export { wireFirstAvailableDateNotice } from './useAvailabilityOrchestratorFirstAvailableWatch'
export type { AvailabilityOrchestratorTimeSlotsShell } from './useAvailabilityOrchestratorTimeSlotsShell'
export type { AvailabilityOrchestratorSlotComputeds } from './useAvailabilityOrchestratorSlotComputeds'
