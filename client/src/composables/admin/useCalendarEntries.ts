/**
 * PATTERN: Composable for managing calendar entries (reads/writes calendar_settings formData.calendars).
 */
import { computed, type Ref } from 'vue'
import type { CalendarEntry } from '@/configs/calendarSettings'
import type { CalendarSettingsData } from '@/configs/calendarSettings'
import type { UseCalendarEntriesReturn } from '@/types/admin/calendarEntries'
import { asEmptyArray } from '@/utils/safeDefaults'

function clearAllWriteToExcept(calendars: CalendarEntry[], index: number): void {
  calendars.forEach((entry, i) => {
    entry.writeTo = i === index
  })
}

function reassignWriteTo(calendars: CalendarEntry[], excludeIndex: number): void {
  const otherIndex = calendars.findIndex((e, i) => i !== excludeIndex && e.email.trim() !== '')
  if (otherIndex >= 0) {
    clearAllWriteToExcept(calendars, otherIndex)
  }
}

function setWriteToAtIndex(calendars: CalendarEntry[], index: number, value: boolean): void {
  if (!Array.isArray(calendars) || index < 0 || index >= calendars.length) return
  if (value) {
    clearAllWriteToExcept(calendars, index)
    return
  }
  const isCurrentlyWriteTo = calendars[index].writeTo
  const writeToCount = calendars.filter((e) => e.writeTo).length
  if (isCurrentlyWriteTo && writeToCount === 1) {
    reassignWriteTo(calendars, index)
  } else {
    calendars[index].writeTo = false
  }
}

function ensureCalendarsArray(formData: Ref<CalendarSettingsData | null>): void {
  if (!formData.value) return
  if (!Array.isArray(formData.value.calendars)) {
    formData.value.calendars = []
  }
}

function addEntryStandalone(formData: Ref<CalendarSettingsData | null>, entriesLength: number): void {
  if (!formData.value) return
  ensureCalendarsArray(formData)
  const calendars = formData.value.calendars
  const newEntry: CalendarEntry = {
    email: '',
    label: '',
    readFrom: true,
    writeTo: entriesLength === 0,
  }
  calendars.push(newEntry)
}

function removeEntryStandalone(
  formData: Ref<CalendarSettingsData | null>,
  index: number,
  entries: CalendarEntry[]
): void {
  const calendars = formData.value?.calendars
  if (!calendars || !Array.isArray(calendars)) return
  const wasWriteTo = entries[index]?.writeTo
  calendars.splice(index, 1)
  if (wasWriteTo && calendars.length > 0) {
    calendars[0].writeTo = true
  }
}

function updateEntryStandalone(
  formData: Ref<CalendarSettingsData | null>,
  index: number,
  updates: Partial<CalendarEntry>,
  entries: CalendarEntry[],
  setWriteToAtIndexFn: (calendars: CalendarEntry[], i: number, value: boolean) => void
): void {
  const calendars = formData.value?.calendars
  if (!calendars || index < 0 || index >= entries.length) return
  const { writeTo: _w, ...otherUpdates } = updates
  if (updates.writeTo !== undefined) {
    setWriteToAtIndexFn(calendars, index, updates.writeTo)
  }
  calendars[index] = { ...entries[index], ...otherUpdates }
}

function computeValidationError(
  entries: CalendarEntry[],
  calendarEnabled: boolean,
  calendarProvider: string
): string | null {
  if (!calendarEnabled || calendarProvider === 'none') return null
  if (entries.length === 0) {
    return 'At least one calendar must be configured when calendar integration is enabled'
  }
  const hasValidEmail = entries.some((e) => Boolean(e.email?.trim()))
  if (!hasValidEmail) return 'At least one calendar must have a valid email address'
  const writeToCount = entries.filter((e) => e.writeTo).length
  if (writeToCount === 0) return 'At least one calendar must be selected for writing appointments'
  if (writeToCount > 1) return 'Only one calendar can be selected for writing appointments'
  return null
}

export function useCalendarEntries(
  formData: Ref<CalendarSettingsData | null>,
  calendarEnabled: Ref<boolean>,
  calendarProvider: Ref<'google' | 'outlook' | 'none'>
): UseCalendarEntriesReturn {
  const entries = computed<CalendarEntry[]>({
    get: () => asEmptyArray(formData.value?.calendars),
    set: (value: CalendarEntry[]) => {
      if (!formData.value) return
      ensureCalendarsArray(formData)
      formData.value.calendars = value
    },
  })

  const writeToIndex = computed(() => entries.value.findIndex((e) => e.writeTo))

  const addEntry = (): void => addEntryStandalone(formData, entries.value.length)

  const removeEntry = (index: number): void => removeEntryStandalone(formData, index, entries.value)

  const setWriteTo = (index: number, value: boolean): void => {
    const calendars = formData.value?.calendars
    if (calendars && Array.isArray(calendars)) setWriteToAtIndex(calendars, index, value)
  }

  const updateEntry = (index: number, updates: Partial<CalendarEntry>): void => {
    updateEntryStandalone(formData, index, updates, entries.value, setWriteToAtIndex)
  }

  const setReadFrom = (index: number, value: boolean): void => updateEntry(index, { readFrom: value })

  const validationError = computed<string | null>(() =>
    computeValidationError(
      entries.value,
      calendarEnabled.value,
      calendarProvider.value
    )
  )

  const isValid = computed(() => validationError.value === null)

  return {
    entries,
    addEntry,
    removeEntry,
    updateEntry,
    setReadFrom,
    setWriteTo,
    writeToIndex,
    validationError,
    isValid,
  }
}
