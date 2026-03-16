/**
 * Form state for calendar_settings tab (hold duration, admin timeout, calendars). showApplyCoupon/useBrandColors live in wizard tab.
 */
import { computed } from 'vue'
import { useCalendarEntries } from '@/composables/admin/useCalendarEntries'
import {
  isValidCalendarEmail,
  DEFAULT_CALENDAR_CONFIG,
  type CalendarProvider,
  type AdminEntryTimeoutUnit,
  type CalendarEntry,
} from '@/configs/calendarSettings'
import { BUSINESS_CONTROLS_TAB_STRINGS } from '@/configs/businessControlsTabStrings'
import type { UseBusinessControlsFormStateParams } from '@/types/admin/businessControlsFormState'

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
    autoConfirmEnabled: import('vue').ComputedRef<boolean>
    calendarEntries: import('vue').Ref<CalendarEntry[]>
    writeToIndex: import('vue').Ref<number>
    calendarValidationError: import('vue').Ref<string | null>
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
  const { calendarFormData, calendarSaving, calendarError } = params
  const UI_STRINGS = BUSINESS_CONTROLS_TAB_STRINGS

  const calendarEnabled = computed({
    get: () => calendarFormData.value?.enabled ?? DEFAULT_CALENDAR_CONFIG.enabled,
    set: (value: boolean) => {
      if (calendarFormData.value) calendarFormData.value.enabled = value
    },
  })

  const calendarProvider = computed({
    get: () => (calendarFormData.value?.provider ?? DEFAULT_CALENDAR_CONFIG.provider) as CalendarProvider,
    set: (value: CalendarProvider) => {
      if (calendarFormData.value) calendarFormData.value.provider = value
    },
  })

  const holdDurationMinutes = computed({
    get: () => calendarFormData.value?.holdDurationMinutes ?? DEFAULT_CALENDAR_CONFIG.holdDurationMinutes ?? 15,
    set: (value: number) => {
      if (calendarFormData.value) calendarFormData.value.holdDurationMinutes = value
    },
  })

  const holdDurationMin = computed({
    get: () => calendarFormData.value?.holdDurationMin ?? DEFAULT_CALENDAR_CONFIG.holdDurationMin ?? 1,
    set: (value: number) => {
      if (calendarFormData.value) calendarFormData.value.holdDurationMin = value
    },
  })

  const holdDurationMax = computed({
    get: () => calendarFormData.value?.holdDurationMax ?? DEFAULT_CALENDAR_CONFIG.holdDurationMax ?? 60,
    set: (value: number) => {
      if (calendarFormData.value) calendarFormData.value.holdDurationMax = value
    },
  })

  const holdDurationFallback = computed({
    get: () => calendarFormData.value?.holdDurationFallback ?? DEFAULT_CALENDAR_CONFIG.holdDurationFallback ?? 15,
    set: (value: number) => {
      if (calendarFormData.value) calendarFormData.value.holdDurationFallback = value
    },
  })

  const adminEntryTimeoutValue = computed({
    get: () => calendarFormData.value?.adminEntryTimeout?.value ?? DEFAULT_CALENDAR_CONFIG.adminEntryTimeout?.value ?? 30,
    set: (value: number) => {
      if (calendarFormData.value) {
        if (!calendarFormData.value.adminEntryTimeout) {
          calendarFormData.value.adminEntryTimeout = { value: 30, unit: 'days' }
        }
        calendarFormData.value.adminEntryTimeout.value = Math.max(1, Math.min(365, Math.floor(value) || 1))
      }
    },
  })

  const adminEntryTimeoutUnit = computed({
    get: () => (calendarFormData.value?.adminEntryTimeout?.unit ?? DEFAULT_CALENDAR_CONFIG.adminEntryTimeout?.unit ?? 'days') as AdminEntryTimeoutUnit,
    set: (value: AdminEntryTimeoutUnit) => {
      if (calendarFormData.value) {
        if (!calendarFormData.value.adminEntryTimeout) {
          calendarFormData.value.adminEntryTimeout = { value: 30, unit: 'days' }
        }
        calendarFormData.value.adminEntryTimeout.unit = value
      }
    },
  })

  const autoConfirmEnabled = computed({
    get: () => calendarFormData.value?.autoConfirmEnabled ?? false,
    set: (value: boolean) => {
      if (calendarFormData.value) calendarFormData.value.autoConfirmEnabled = value
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
  } = useCalendarEntries(calendarFormData, calendarEnabled, calendarProvider)

  const emailValidationRule = (value: string): true | string => {
    if (!value || value.trim() === '') return true
    return isValidCalendarEmail(value) ? true : UI_STRINGS.validation.emailInvalid
  }

  const saveButtonProps = computed(() => ({
    type: 'submit' as const,
    color: 'primary' as const,
    loading: calendarSaving.value,
    disabled: calendarSaving.value,
  }))

  const clearError = (): void => {
    calendarError.value = null
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
      autoConfirmEnabled,
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
