/**
 * WHY: Calendar config, hold duration, and calendar entries for Business Controls; split from useBusinessControlsFormState (audit: function-complexity).
 */
import { computed } from 'vue'
import { useCalendarEntries } from '@/composables/admin/useCalendarEntries'
import {
  isValidCalendarEmail,
  DEFAULT_CALENDAR_CONFIG,
  type CalendarProvider,
} from '@/configs/availabilitySettings'
import { BUSINESS_CONTROLS_TAB_STRINGS } from '@/configs/businessControlsTabStrings'
import type { UseBusinessControlsFormStateParams } from '@/types/admin/businessControlsFormState'

export function useCalendarHoldFormState(params: UseBusinessControlsFormStateParams) {
  const { formData, saving, error } = params
  const UI_STRINGS = BUSINESS_CONTROLS_TAB_STRINGS

  const calendarEnabled = computed({
    get: () => formData.value?.calendarConfig?.enabled ?? DEFAULT_CALENDAR_CONFIG.enabled,
    set: (value: boolean) => {
      if (formData.value) {
        if (!formData.value.calendarConfig) {
          formData.value.calendarConfig = { ...DEFAULT_CALENDAR_CONFIG }
        }
        formData.value.calendarConfig.enabled = value
      }
    },
  })

  const calendarProvider = computed({
    get: () =>
      (formData.value?.calendarConfig?.provider ?? DEFAULT_CALENDAR_CONFIG.provider) as CalendarProvider,
    set: (value: CalendarProvider) => {
      if (formData.value) {
        if (!formData.value.calendarConfig) {
          formData.value.calendarConfig = { ...DEFAULT_CALENDAR_CONFIG }
        }
        formData.value.calendarConfig.provider = value
      }
    },
  })

  const holdDurationMinutes = computed({
    get: () =>
      formData.value?.calendarConfig?.holdDurationMinutes ??
      DEFAULT_CALENDAR_CONFIG.holdDurationMinutes ??
      15,
    set: (value: number) => {
      if (formData.value) {
        if (!formData.value.calendarConfig) {
          formData.value.calendarConfig = { ...DEFAULT_CALENDAR_CONFIG }
        }
        formData.value.calendarConfig.holdDurationMinutes = value
      }
    },
  })

  const holdDurationMin = computed({
    get: () =>
      formData.value?.calendarConfig?.holdDurationMin ??
      DEFAULT_CALENDAR_CONFIG.holdDurationMin ??
      1,
    set: (value: number) => {
      if (formData.value) {
        if (!formData.value.calendarConfig) formData.value.calendarConfig = { ...DEFAULT_CALENDAR_CONFIG }
        formData.value.calendarConfig.holdDurationMin = value
      }
    },
  })

  const holdDurationMax = computed({
    get: () =>
      formData.value?.calendarConfig?.holdDurationMax ??
      DEFAULT_CALENDAR_CONFIG.holdDurationMax ??
      60,
    set: (value: number) => {
      if (formData.value) {
        if (!formData.value.calendarConfig) formData.value.calendarConfig = { ...DEFAULT_CALENDAR_CONFIG }
        formData.value.calendarConfig.holdDurationMax = value
      }
    },
  })

  const holdDurationFallback = computed({
    get: () =>
      formData.value?.calendarConfig?.holdDurationFallback ??
      DEFAULT_CALENDAR_CONFIG.holdDurationFallback ??
      15,
    set: (value: number) => {
      if (formData.value) {
        if (!formData.value.calendarConfig) formData.value.calendarConfig = { ...DEFAULT_CALENDAR_CONFIG }
        formData.value.calendarConfig.holdDurationFallback = value
      }
    },
  })

  const {
    entries: calendarEntries,
    addEntry: addCalendarEntry,
    removeEntry: removeCalendarEntry,
    updateEntry: updateCalendarEntry,
    setReadFrom,
    setWriteTo,
    writeToIndex,
    validationError: calendarValidationError,
  } = useCalendarEntries(formData, calendarEnabled, calendarProvider)

  const emailValidationRule = (value: string): true | string => {
    if (!value || value.trim() === '') return true
    return isValidCalendarEmail(value) ? true : UI_STRINGS.validation.emailInvalid
  }

  const saveButtonProps = computed(() => ({
    type: 'submit' as const,
    color: 'primary' as const,
    loading: saving.value,
    disabled: saving.value,
  }))

  const clearError = (): void => {
    error.value = null
  }

  const setCalendarProvider = (v: string): void => {
    calendarProvider.value = v as CalendarProvider
  }

  return {
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
  }
}
