/**
 * PATTERN: Form state and bindings for Business Controls tab (calendar, business hours, hold duration, etc.).
 * WHY: Keeps BusinessControlsTab.vue under vue-architecture limits by moving domain logic here.
 */
import { computed, type Ref } from 'vue'
import { useLocalTime } from '@/composables/useLocalTime'
import { useCalendarEntries } from '@/composables/admin/useCalendarEntries'
import type { BusinessHoursConfig } from '@/configs/availabilitySettings'
import {
  isValidCalendarEmail,
  DEFAULT_CALENDAR_CONFIG,
  type CalendarProvider,
} from '@/configs/availabilitySettings'
import type { AvailabilitySettings } from '@/configs/availabilitySettings'
import { BUSINESS_CONTROLS_TAB_STRINGS } from '@/configs/businessControlsTabStrings'
import { asEmptyString } from '@/utils/safeDefaults'

/** Valid business hours day indices (0=Sunday .. 6=Saturday). */
export type BusinessHoursDay = 0 | 1 | 2 | 3 | 4 | 5 | 6

export interface UseBusinessControlsFormStateParams {
  formData: Ref<AvailabilitySettings | null>
  saving: Ref<boolean>
  error: Ref<string | null>
  autoConfirmEnabled: Ref<boolean>
}

export function useBusinessControlsFormState(params: UseBusinessControlsFormStateParams) {
  const { formData, saving, error, autoConfirmEnabled } = params
  const { rfc3339ToBusinessHoursHHmm, businessHoursHHmmToRfc3339 } = useLocalTime()
  const UI_STRINGS = BUSINESS_CONTROLS_TAB_STRINGS

  const businessHoursForUI = computed(() => {
    if (!formData.value) return {} as Record<number, { start: string; end: string }>
    const currentFormData = formData.value
    return Object.fromEntries(
      Array.from({ length: 7 }, (_, day) => {
        const dayHours = currentFormData.businessHours[day as BusinessHoursDay]
        return [
          day,
          {
            start: rfc3339ToBusinessHoursHHmm(dayHours.start),
            end: rfc3339ToBusinessHoursHHmm(dayHours.end),
          },
        ]
      })
    ) as Record<number, { start: string; end: string }>
  })

  const isBusinessHoursConfig = (
    config: BusinessHoursConfig | { minutes: number } | { start: string; end: string }
  ): config is BusinessHoursConfig => 'hours' in config

  const updateBusinessHours = (day: number, field: 'start' | 'end', value: string): void => {
    if (!formData.value) return
    const rfc3339Value = businessHoursHHmmToRfc3339(value)
    formData.value.businessHours[day as BusinessHoursDay][field] = rfc3339Value
    const businessHoursConstraint = formData.value.rangeConstraints?.businessHours
    if (businessHoursConstraint && isBusinessHoursConfig(businessHoursConstraint.config)) {
      businessHoursConstraint.config.hours[day as BusinessHoursDay][field] = rfc3339Value
    }
  }

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

  const setCalendarProvider = (v: string): void => {
    calendarProvider.value = v as CalendarProvider
  }

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
