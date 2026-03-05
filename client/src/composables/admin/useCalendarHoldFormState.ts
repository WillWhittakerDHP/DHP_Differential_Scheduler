/**
 */
import { computed } from 'vue'
import { useCalendarEntries } from '@/composables/admin/useCalendarEntries'
import {
  isValidCalendarEmail,
  DEFAULT_CALENDAR_CONFIG,
  type CalendarProvider,
  type AdminEntryTimeoutUnit,
} from '@/configs/availabilitySettings'
import { BUSINESS_CONTROLS_TAB_STRINGS } from '@/configs/businessControlsTabStrings'
import type { UseBusinessControlsFormStateParams } from '@/types/admin/businessControlsFormState'
import type { CalendarEntry } from '@/configs/availabilitySettings'
import type { Ref } from 'vue'

/** Grouped return for composable-health (oversized-return repair). */
export interface UseCalendarHoldFormStateReturn {
  fields: {
    calendarEnabled: import('vue').ComputedRef<boolean>
    calendarProvider: import('vue').ComputedRef<CalendarProvider>
    holdDurationMinutes: import('vue').ComputedRef<number>
    holdDurationMin: import('vue').ComputedRef<number>
    holdDurationMax: import('vue').ComputedRef<number>
    holdDurationFallback: import('vue').ComputedRef<number>
    adminEntryTimeoutValue: import('vue').ComputedRef<number>
    adminEntryTimeoutUnit: import('vue').ComputedRef<AdminEntryTimeoutUnit>
    calendarEntries: Ref<CalendarEntry[]>
    writeToIndex: Ref<number>
    calendarValidationError: Ref<string | null>
  }
  actions: {
    addCalendarEntry: () => void
    removeCalendarEntry: (index: number) => void
    updateCalendarEntry: (index: number, updates: Partial<CalendarEntry>) => void
    setReadFrom: (index: number, value: boolean) => void
    setWriteTo: (index: number, value: boolean) => void
    clearError: () => void
    setCalendarProvider: (v: string) => void
  }
  ui: {
    emailValidationRule: (value: string) => true | string
    saveButtonProps: import('vue').ComputedRef<{ type: 'submit'; color: 'primary'; loading: boolean; disabled: boolean }>
  }
}

export function useCalendarHoldFormState(params: UseBusinessControlsFormStateParams): UseCalendarHoldFormStateReturn {
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

  const adminEntryTimeoutValue = computed({
    get: () =>
      formData.value?.calendarConfig?.adminEntryTimeout?.value ??
      DEFAULT_CALENDAR_CONFIG.adminEntryTimeout?.value ??
      30,
    set: (value: number) => {
      if (formData.value) {
        if (!formData.value.calendarConfig) formData.value.calendarConfig = { ...DEFAULT_CALENDAR_CONFIG }
        if (!formData.value.calendarConfig.adminEntryTimeout) {
          formData.value.calendarConfig.adminEntryTimeout = {
            value: 30,
            unit: 'days',
          }
        }
        formData.value.calendarConfig.adminEntryTimeout.value = Math.max(1, Math.min(365, Math.floor(value) || 1))
      }
    },
  })

  const adminEntryTimeoutUnit = computed({
    get: () =>
      (formData.value?.calendarConfig?.adminEntryTimeout?.unit ??
        DEFAULT_CALENDAR_CONFIG.adminEntryTimeout?.unit ??
        'days') as AdminEntryTimeoutUnit,
    set: (value: AdminEntryTimeoutUnit) => {
      if (formData.value) {
        if (!formData.value.calendarConfig) formData.value.calendarConfig = { ...DEFAULT_CALENDAR_CONFIG }
        if (!formData.value.calendarConfig.adminEntryTimeout) {
          formData.value.calendarConfig.adminEntryTimeout = {
            value: 30,
            unit: 'days',
          }
        }
        formData.value.calendarConfig.adminEntryTimeout.unit = value
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
    fields: {
      calendarEnabled,
      calendarProvider,
      holdDurationMinutes,
      holdDurationMin,
      holdDurationMax,
      holdDurationFallback,
      adminEntryTimeoutValue,
      adminEntryTimeoutUnit,
      calendarEntries,
      writeToIndex,
      calendarValidationError,
    },
    actions: {
      addCalendarEntry,
      removeCalendarEntry,
      updateCalendarEntry,
      setReadFrom,
      setWriteTo,
      clearError,
      setCalendarProvider,
    },
    ui: {
      emailValidationRule,
      saveButtonProps,
    },
  }
}
