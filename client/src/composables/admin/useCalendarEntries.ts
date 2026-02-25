/**
 * PATTERN: Composable for managing calendar entries
 * WHY: setWriteTo logic extracted to helper to reduce nesting (audit: function-complexity).
 */
import { computed, type Ref } from 'vue'
import type { CalendarEntry, AvailabilitySettings } from '@/configs/availabilitySettings'
import { DEFAULT_CALENDAR_CONFIG } from '@/configs/availabilitySettings'
import type { UseCalendarEntriesReturn } from '@/types/admin/calendarEntries'

export type { UseCalendarEntriesReturn } from '@/types/admin/calendarEntries'

/**
 * Apply writeTo at index: only one entry may have writeTo true; unsetting last writeTo moves it to another valid entry.
 */
function setWriteToAtIndex(calendars: CalendarEntry[], index: number, value: boolean): void {
  if (!Array.isArray(calendars) || index < 0 || index >= calendars.length) return
  if (value) {
    calendars.forEach((entry, i) => {
      entry.writeTo = i === index
    })
    return
  }
  const isCurrentlyWriteTo = calendars[index].writeTo
  const currentWriteToCount = calendars.filter((e) => e.writeTo).length
  if (isCurrentlyWriteTo && currentWriteToCount === 1) {
    const otherIndex = calendars.findIndex((e, i) => i !== index && e.email.trim() !== '')
    if (otherIndex >= 0) {
      calendars.forEach((entry, i) => {
        entry.writeTo = i === otherIndex
      })
    }
  } else {
    calendars[index].writeTo = false
  }
}

export function useCalendarEntries(
  formData: Ref<AvailabilitySettings | null>,
  calendarEnabled: Ref<boolean>,
  calendarProvider: Ref<'google' | 'outlook' | 'none'>
): UseCalendarEntriesReturn {
  
  const entries = computed<CalendarEntry[]>({
    get: () => {
      if (!formData.value?.calendarConfig) {
        return []
      }
      if (!Array.isArray(formData.value.calendarConfig.calendars)) {
        return []
      }
      return formData.value.calendarConfig.calendars
    },
    set: (value: CalendarEntry[]) => {
      if (formData.value) {
        if (!formData.value.calendarConfig) {
          formData.value.calendarConfig = { ...DEFAULT_CALENDAR_CONFIG }
        }
        formData.value.calendarConfig.calendars = value
      }
    }
  })
  
  const writeToIndex = computed(() => {
    return entries.value.findIndex(entry => entry.writeTo)
  })
  
  const ensureCalendarConfig = (): void => {
    if (!formData.value) return
    
    if (!formData.value.calendarConfig) {
      formData.value.calendarConfig = { ...DEFAULT_CALENDAR_CONFIG }
    }
    
    if (!Array.isArray(formData.value.calendarConfig.calendars)) {
      formData.value.calendarConfig.calendars = []
    }
  }
  
  const addEntry = (): void => {
    if (!formData.value) return
    
    ensureCalendarConfig()
    
    const isFirstEntry = entries.value.length === 0
    const newEntry: CalendarEntry = {
      email: '',
      label: '',
      readFrom: true,
      writeTo: isFirstEntry  // First calendar is writeTo by default
    }
    
    entries.value.push(newEntry)
  }
  
  const removeEntry = (index: number): void => {
    if (!formData.value?.calendarConfig?.calendars || !Array.isArray(formData.value.calendarConfig.calendars)) {
      return
    }
    
    const wasWriteTo = entries.value[index]?.writeTo
    
    formData.value.calendarConfig.calendars.splice(index, 1)
    
    if (wasWriteTo && entries.value.length > 0) {
      entries.value[0].writeTo = true
    }
  }
  
  const updateEntry = (index: number, updates: Partial<CalendarEntry>): void => {
    if (!formData.value?.calendarConfig?.calendars || !Array.isArray(formData.value.calendarConfig.calendars)) {
      return
    }
    
    if (index >= 0 && index < entries.value.length) {
      if (updates.writeTo !== undefined) {
        setWriteTo(index, updates.writeTo)
        const { writeTo: _writeTo, ...otherUpdates } = updates
        formData.value.calendarConfig.calendars[index] = {
          ...entries.value[index],
          ...otherUpdates
        }
      } else {
        formData.value.calendarConfig.calendars[index] = {
          ...entries.value[index],
          ...updates
        }
      }
    }
  }
  
  const setReadFrom = (index: number, value: boolean): void => {
    updateEntry(index, { readFrom: value })
  }
  
  const setWriteTo = (index: number, value: boolean): void => {
    const calendars = formData.value?.calendarConfig?.calendars
    if (!calendars || !Array.isArray(calendars)) return
    setWriteToAtIndex(calendars, index, value)
  }
  
  const validationError = computed<string | null>(() => {
    if (!calendarEnabled.value || calendarProvider.value === 'none') {
      return null  // No validation needed if disabled
    }
    
    if (entries.value.length === 0) {
      return 'At least one calendar must be configured when calendar integration is enabled'
    }
    
    const hasValidEmail = entries.value.some(entry => entry.email && entry.email.trim() !== '')
    if (!hasValidEmail) {
      return 'At least one calendar must have a valid email address'
    }
    
    const writeToCount = entries.value.filter(entry => entry.writeTo).length
    if (writeToCount === 0) {
      return 'At least one calendar must be selected for writing appointments'
    }
    if (writeToCount > 1) {
      return 'Only one calendar can be selected for writing appointments'
    }
    
    return null
  })
  
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
    isValid
  }
}
