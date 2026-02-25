/**
 * PATTERN: Form state and bindings for Business Controls tab; composes useBusinessHoursFormState and useCalendarHoldFormState (audit: function-complexity).
 */
import { computed } from 'vue'
import { useBusinessHoursFormState } from '@/composables/admin/useBusinessHoursFormState'
import { useCalendarHoldFormState } from '@/composables/admin/useCalendarHoldFormState'
import { asEmptyString } from '@/utils/safeDefaults'
import type { UseBusinessControlsFormStateParams } from '@/types/admin/businessControlsFormState'

export type {
  BusinessHoursDay,
  UseBusinessControlsFormStateParams,
} from '@/types/admin/businessControlsFormState'

export function useBusinessControlsFormState(params: UseBusinessControlsFormStateParams) {
  const { formData, autoConfirmEnabled } = params

  const {
    businessHoursForUI,
    isBusinessHoursConfig,
    updateBusinessHours,
  } = useBusinessHoursFormState(formData)

  const {
    calendarEnabled,
    calendarProvider,
    holdDurationMinutes,
    holdDurationMin,
    holdDurationMax,
    holdDurationFallback,
    calendarEntries,
    addCalendarEntry,
    removeCalendarEntry,
    updateCalendarEntry,
    setReadFrom,
    setWriteTo,
    writeToIndex,
    calendarValidationError,
    emailValidationRule,
    saveButtonProps,
    clearError,
    setCalendarProvider,
  } = useCalendarHoldFormState(params)

  const durationRoundingEnabled = computed({
    get: () => formData.value?.durationRounding?.enabled ?? false,
    set: (v: boolean) => {
      if (formData.value?.durationRounding) formData.value.durationRounding.enabled = v
    },
  })

  const durationRoundingIncrement = computed({
    get: () => formData.value?.durationRounding?.increment ?? 15,
    set: (v: number) => {
      if (formData.value?.durationRounding) formData.value.durationRounding.increment = v
    },
  })

  const durationRoundingMethod = computed({
    get: () => formData.value?.durationRounding?.method ?? 'roundNearest',
    set: (v: string) => {
      if (formData.value?.durationRounding) {
        formData.value.durationRounding.method = v as 'roundUp' | 'roundDown' | 'roundNearest'
      }
    },
  })

  const timezone = computed({
    get: () => asEmptyString(formData.value?.timezone),
    set: (v: string) => {
      if (formData.value) formData.value.timezone = v
    },
  })

  const minuteIncrement = computed({
    get: () => formData.value?.minuteIncrement ?? 15,
    set: (v: number) => {
      if (formData.value) formData.value.minuteIncrement = v
    },
  })

  const setTimezone = (v: string): void => {
    timezone.value = v
  }

  const setMinuteIncrement = (v: number): void => {
    minuteIncrement.value = v
  }

  const setAutoConfirmEnabled = (v: boolean): void => {
    autoConfirmEnabled.value = v
  }

  return {
    businessHoursForUI,
    isBusinessHoursConfig,
    updateBusinessHours,
    calendarEnabled,
    calendarProvider,
    holdDurationMinutes,
    holdDurationMin,
    holdDurationMax,
    holdDurationFallback,
    calendarEntries,
    addCalendarEntry,
    removeCalendarEntry,
    updateCalendarEntry,
    setReadFrom,
    setWriteTo,
    writeToIndex,
    calendarValidationError,
    emailValidationRule,
    saveButtonProps,
    clearError,
    durationRoundingEnabled,
    durationRoundingIncrement,
    durationRoundingMethod,
    timezone,
    minuteIncrement,
    setCalendarProvider,
    setTimezone,
    setMinuteIncrement,
    setAutoConfirmEnabled,
  }
}
