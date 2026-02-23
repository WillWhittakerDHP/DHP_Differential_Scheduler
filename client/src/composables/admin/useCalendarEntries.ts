/**
 * PATTERN: Composable for managing calendar entries
PATTERN: Composable handles sta...
 */
import { computed, type Ref } from 'vue'
import type { CalendarEntry, AvailabilitySettings } from '@/configs/availabilitySettings'
import { DEFAULT_CALENDAR_CONFIG } from '@/configs/availabilitySettings'

export interface UseCalendarEntriesReturn {
  /** Calendar entries array */
  entries: Ref<CalendarEntry[]>
  
  /** Add a new calendar entry */
  addEntry: () => void
  
  /** Remove a calendar entry by index */
  removeEntry: (index: number) => void
  
  /** Update a calendar entry */
  updateEntry: (index: number, updates: Partial<CalendarEntry>) => void
  
  /** Set readFrom for a calendar entry */
  setReadFrom: (index: number, value: boolean) => void
  
  /** Set writeTo for a calendar entry (ensures only one is writeTo) */
  setWriteTo: (index: number, value: boolean) => void
  
  /** Index of the calendar that is writeTo (-1 if none) */
  writeToIndex: Ref<number>
  
  /** Validation error message (or null if valid) */
  validationError: Ref<string | null>
  
  /** Whether calendar configuration is valid */
  isValid: Ref<boolean>
}

/**
 * Composable for managing calendar entries
 * 
 * @param formData - Ref to AvailabilitySettings form data
 * @param calendarEnabled - Ref to whether calendar integration is enabled
 * @param calendarProvider - Ref to calendar provider ('google' | 'outlook' | 'none')
 * @returns Calendar entries management functions and state
 */
export function useCalendarEntries(
  formData: Ref<AvailabilitySettings | null>,
  calendarEnabled: Ref<boolean>,
  calendarProvider: Ref<'google' | 'outlook' | 'none'>
): UseCalendarEntriesReturn {
  
  /**
   * Get current calendar entries from formData
   */
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
  
  /**
   * Index of the calendar that is writeTo
   */
  const writeToIndex = computed(() => {
    return entries.value.findIndex(entry => entry.writeTo)
  })
  
  /**
   * Ensure calendarConfig exists in formData
   */
  const ensureCalendarConfig = (): void => {
    if (!formData.value) return
    
    if (!formData.value.calendarConfig) {
      formData.value.calendarConfig = { ...DEFAULT_CALENDAR_CONFIG }
    }
    
    if (!Array.isArray(formData.value.calendarConfig.calendars)) {
      formData.value.calendarConfig.calendars = []
    }
  }
  
  /**
   * Add a new calendar entry
   */
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
  
  /**
   * Remove a calendar entry by index
   */
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
  
  /**
   * Update a calendar entry
   */
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
  
  /**
   * Set readFrom for a calendar entry
   */
  const setReadFrom = (index: number, value: boolean): void => {
    updateEntry(index, { readFrom: value })
  }
  
  /**
   * Set writeTo for a calendar entry
   */
  const setWriteTo = (index: number, value: boolean): void => {
    if (!formData.value?.calendarConfig?.calendars || !Array.isArray(formData.value.calendarConfig.calendars)) {
      return
    }
    
    if (value) {
      entries.value.forEach((entry, i) => {
        if (i === index) {
          entry.writeTo = true
        } else {
          entry.writeTo = false
        }
      })
    } else {
      // Setting this calendar to NOT writeTo
      // Check if this is currently the only writeTo calendar
      const isCurrentlyWriteTo = entries.value[index].writeTo
      const currentWriteToCount = entries.value.filter(e => e.writeTo).length
      
      if (isCurrentlyWriteTo && currentWriteToCount === 1) {
        const otherIndex = entries.value.findIndex((e, i) => i !== index && e.email.trim() !== '')
        if (otherIndex >= 0) {
          entries.value.forEach((entry, i) => {
            if (i === otherIndex) {
              entry.writeTo = true
            } else {
              entry.writeTo = false
            }
          })
        } else {
          // No other calendar available - can't unset this one
          // Keep it as writeTo (don't change)
          return
        }
      } else {
        entries.value[index].writeTo = false
      }
    }
  }
  
  /**
   * Validation error message
   */
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
  
  /**
   * Whether calendar configuration is valid
   */
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
