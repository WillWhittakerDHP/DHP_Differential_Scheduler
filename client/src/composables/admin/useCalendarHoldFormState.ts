/**
 * Form state for calendar_settings tab (hold duration, admin timeout, calendars). showApplyCoupon/useBrandColors live in wizard tab.
 */
import { computed } from 'vue'
import { useCalendarEntries } from '@/composables/admin/useCalendarEntries'
import { isValidCalendarEmail, type CalendarProvider, type CalendarEntry } from '@/configs/calendarSettings'
import { BUSINESS_CONTROLS_TAB_STRINGS } from '@/configs/businessControlsTabStrings'
import type { UseBusinessControlsFormStateParams } from '@/types/admin/businessControlsFormState'
import {
  buildAdminEntryTimeoutUnitComputed,
  buildAdminEntryTimeoutValueComputed,
  buildAutoConfirmEnabledComputed,
  buildCalendarEnabledComputed,
  buildCalendarProviderComputed,
  buildHoldDurationFallbackComputed,
  buildHoldDurationMaxComputed,
  buildHoldDurationMinComputed,
  buildHoldDurationMinutesComputed,
} from '@/utils/admin/calendarHoldFormComputeds'

export interface UseCalendarHoldFormStateReturn {
  fields: {
    calendarEnabled: import('vue').ComputedRef<boolean>
    calendarProvider: import('vue').ComputedRef<CalendarProvider>
    holdDurationMinutes: import('vue').ComputedRef<number>
    holdDurationMin: import('vue').ComputedRef<number>
    holdDurationMax: import('vue').ComputedRef<number>
    holdDurationFallback: import('vue').ComputedRef<number>
    adminEntryTimeoutValue: import('vue').ComputedRef<number>
    adminEntryTimeoutUnit: import('vue').ComputedRef<import('@/configs/calendarSettings').AdminEntryTimeoutUnit>
    autoConfirmEnabled: import('vue').WritableComputedRef<boolean>
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

  const calendarEnabled = buildCalendarEnabledComputed(calendarFormData)
  const calendarProvider = buildCalendarProviderComputed(calendarFormData)
  const holdDurationMinutes = buildHoldDurationMinutesComputed(calendarFormData)
  const holdDurationMin = buildHoldDurationMinComputed(calendarFormData)
  const holdDurationMax = buildHoldDurationMaxComputed(calendarFormData)
  const holdDurationFallback = buildHoldDurationFallbackComputed(calendarFormData)
  const adminEntryTimeoutValue = buildAdminEntryTimeoutValueComputed(calendarFormData)
  const adminEntryTimeoutUnit = buildAdminEntryTimeoutUnitComputed(calendarFormData)
  const autoConfirmEnabled = buildAutoConfirmEnabledComputed(calendarFormData)

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
    if (!value || value.trim() === '') {
      return true
    }
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
