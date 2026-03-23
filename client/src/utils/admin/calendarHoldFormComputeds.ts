/**
 * Writable computeds for calendar hold form fields (admin settings).
 * WHY: useCalendarHoldFormState exceeded function length / branch limits as one block.
 */

import { computed, type Ref, type WritableComputedRef } from 'vue'
import {
  DEFAULT_CALENDAR_CONFIG,
  type AdminEntryTimeoutUnit,
  type CalendarProvider,
  type CalendarSettingsData,
} from '@/configs/calendarSettings'

function clampAdminEntryTimeoutValue(value: number): number {
  return Math.max(1, Math.min(365, Math.floor(value) || 1))
}

export function buildCalendarEnabledComputed(
  calendarFormData: Ref<CalendarSettingsData | null>
): WritableComputedRef<boolean> {
  return computed({
    get: () => calendarFormData.value?.enabled ?? DEFAULT_CALENDAR_CONFIG.enabled,
    set: (value: boolean) => {
      if (calendarFormData.value) {
        calendarFormData.value.enabled = value
      }
    },
  })
}

export function buildCalendarProviderComputed(
  calendarFormData: Ref<CalendarSettingsData | null>
): WritableComputedRef<CalendarProvider> {
  return computed({
    get: () => (calendarFormData.value?.provider ?? DEFAULT_CALENDAR_CONFIG.provider) as CalendarProvider,
    set: (value: CalendarProvider) => {
      if (calendarFormData.value) {
        calendarFormData.value.provider = value
      }
    },
  })
}

export function buildHoldDurationMinutesComputed(
  calendarFormData: Ref<CalendarSettingsData | null>
): WritableComputedRef<number> {
  return computed({
    get: () => calendarFormData.value?.holdDurationMinutes ?? DEFAULT_CALENDAR_CONFIG.holdDurationMinutes ?? 15,
    set: (value: number) => {
      if (calendarFormData.value) {
        calendarFormData.value.holdDurationMinutes = value
      }
    },
  })
}

export function buildHoldDurationMinComputed(
  calendarFormData: Ref<CalendarSettingsData | null>
): WritableComputedRef<number> {
  return computed({
    get: () => calendarFormData.value?.holdDurationMin ?? DEFAULT_CALENDAR_CONFIG.holdDurationMin ?? 1,
    set: (value: number) => {
      if (calendarFormData.value) {
        calendarFormData.value.holdDurationMin = value
      }
    },
  })
}

export function buildHoldDurationMaxComputed(
  calendarFormData: Ref<CalendarSettingsData | null>
): WritableComputedRef<number> {
  return computed({
    get: () => calendarFormData.value?.holdDurationMax ?? DEFAULT_CALENDAR_CONFIG.holdDurationMax ?? 60,
    set: (value: number) => {
      if (calendarFormData.value) {
        calendarFormData.value.holdDurationMax = value
      }
    },
  })
}

export function buildHoldDurationFallbackComputed(
  calendarFormData: Ref<CalendarSettingsData | null>
): WritableComputedRef<number> {
  return computed({
    get: () => calendarFormData.value?.holdDurationFallback ?? DEFAULT_CALENDAR_CONFIG.holdDurationFallback ?? 15,
    set: (value: number) => {
      if (calendarFormData.value) {
        calendarFormData.value.holdDurationFallback = value
      }
    },
  })
}

export function buildAdminEntryTimeoutValueComputed(
  calendarFormData: Ref<CalendarSettingsData | null>
): WritableComputedRef<number> {
  return computed({
    get: () =>
      calendarFormData.value?.adminEntryTimeout?.value ??
      DEFAULT_CALENDAR_CONFIG.adminEntryTimeout?.value ??
      30,
    set: (value: number) => {
      if (!calendarFormData.value) {
        return
      }
      if (!calendarFormData.value.adminEntryTimeout) {
        calendarFormData.value.adminEntryTimeout = { value: 30, unit: 'days' }
      }
      calendarFormData.value.adminEntryTimeout.value = clampAdminEntryTimeoutValue(value)
    },
  })
}

export function buildAdminEntryTimeoutUnitComputed(
  calendarFormData: Ref<CalendarSettingsData | null>
): WritableComputedRef<AdminEntryTimeoutUnit> {
  return computed({
    get: () =>
      (calendarFormData.value?.adminEntryTimeout?.unit ??
        DEFAULT_CALENDAR_CONFIG.adminEntryTimeout?.unit ??
        'days') as AdminEntryTimeoutUnit,
    set: (value: AdminEntryTimeoutUnit) => {
      if (!calendarFormData.value) {
        return
      }
      if (!calendarFormData.value.adminEntryTimeout) {
        calendarFormData.value.adminEntryTimeout = { value: 30, unit: 'days' }
      }
      calendarFormData.value.adminEntryTimeout.unit = value
    },
  })
}

export function buildAutoConfirmEnabledComputed(
  calendarFormData: Ref<CalendarSettingsData | null>
): WritableComputedRef<boolean> {
  return computed({
    get: () => calendarFormData.value?.autoConfirmEnabled ?? false,
    set: (value: boolean) => {
      if (calendarFormData.value) {
        calendarFormData.value.autoConfirmEnabled = value
      }
    },
  })
}
