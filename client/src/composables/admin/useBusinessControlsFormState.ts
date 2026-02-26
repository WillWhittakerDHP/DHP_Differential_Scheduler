/**
 * PATTERN: Form state and bindings for Business Controls tab; composes useBusinessHoursFormState and useCalendarHoldFormState (audit: function-complexity).
 */
import type { ComputedRef } from 'vue'
import { computed } from 'vue'
import { useBusinessHoursFormState } from '@/composables/admin/useBusinessHoursFormState'
import { useCalendarHoldFormState } from '@/composables/admin/useCalendarHoldFormState'
import { asEmptyString } from '@/utils/safeDefaults'
import type { UseBusinessControlsFormStateParams } from '@/types/admin/businessControlsFormState'
import type { UseBusinessHoursFormStateReturn } from '@/composables/admin/useBusinessHoursFormState'
import type { UseCalendarHoldFormStateReturn } from '@/composables/admin/useCalendarHoldFormState'

/** Grouped return for composable-health (oversized-return repair). Tab spreads to flat for provide. */
export interface UseBusinessControlsFormStateReturn {
  businessHours: Pick<UseBusinessHoursFormStateReturn, 'businessHoursForUI' | 'isBusinessHoursConfig' | 'updateBusinessHours'>
  calendar: {
    calendarEnabled: UseCalendarHoldFormStateReturn['fields']['calendarEnabled']
    calendarProvider: UseCalendarHoldFormStateReturn['fields']['calendarProvider']
    holdDurationMinutes: UseCalendarHoldFormStateReturn['fields']['holdDurationMinutes']
    holdDurationMin: UseCalendarHoldFormStateReturn['fields']['holdDurationMin']
    holdDurationMax: UseCalendarHoldFormStateReturn['fields']['holdDurationMax']
    holdDurationFallback: UseCalendarHoldFormStateReturn['fields']['holdDurationFallback']
    calendarEntries: UseCalendarHoldFormStateReturn['fields']['calendarEntries']
    addCalendarEntry: UseCalendarHoldFormStateReturn['actions']['addCalendarEntry']
    removeCalendarEntry: UseCalendarHoldFormStateReturn['actions']['removeCalendarEntry']
    updateCalendarEntry: UseCalendarHoldFormStateReturn['actions']['updateCalendarEntry']
    setReadFrom: UseCalendarHoldFormStateReturn['actions']['setReadFrom']
    setWriteTo: UseCalendarHoldFormStateReturn['actions']['setWriteTo']
    writeToIndex: UseCalendarHoldFormStateReturn['fields']['writeToIndex']
    calendarValidationError: UseCalendarHoldFormStateReturn['fields']['calendarValidationError']
    emailValidationRule: UseCalendarHoldFormStateReturn['ui']['emailValidationRule']
    saveButtonProps: UseCalendarHoldFormStateReturn['ui']['saveButtonProps']
    clearError: UseCalendarHoldFormStateReturn['actions']['clearError']
    setCalendarProvider: UseCalendarHoldFormStateReturn['actions']['setCalendarProvider']
  }
  rounding: {
    durationRoundingEnabled: ComputedRef<boolean>
    durationRoundingIncrement: ComputedRef<number>
    durationRoundingMethod: ComputedRef<string>
    timezone: ComputedRef<string>
    minuteIncrement: ComputedRef<number>
    setTimezone: (v: string) => void
    setMinuteIncrement: (v: number) => void
    setAutoConfirmEnabled: (v: boolean) => void
  }
}

export function useBusinessControlsFormState(params: UseBusinessControlsFormStateParams): UseBusinessControlsFormStateReturn {
  const { formData, autoConfirmEnabled } = params

  const {
    businessHoursForUI,
    isBusinessHoursConfig,
    updateBusinessHours,
  } = useBusinessHoursFormState(formData)

  const calendarHold = useCalendarHoldFormState(params)
  const {
    calendarEnabled,
    calendarProvider,
    holdDurationMinutes,
    holdDurationMin,
    holdDurationMax,
    holdDurationFallback,
    calendarEntries,
    writeToIndex,
    calendarValidationError,
  } = calendarHold.fields
  const {
    addCalendarEntry,
    removeCalendarEntry,
    updateCalendarEntry,
    setReadFrom,
    setWriteTo,
    clearError,
    setCalendarProvider,
  } = calendarHold.actions
  const { emailValidationRule, saveButtonProps } = calendarHold.ui

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
    businessHours: {
      businessHoursForUI,
      isBusinessHoursConfig,
      updateBusinessHours,
    },
    calendar: {
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
    },
    rounding: {
      durationRoundingEnabled,
      durationRoundingIncrement,
      durationRoundingMethod,
      timezone,
      minuteIncrement,
      setTimezone,
      setMinuteIncrement,
      setAutoConfirmEnabled,
    },
  }
}
