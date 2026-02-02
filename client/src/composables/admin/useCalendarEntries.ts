/**
 * Composable for managing calendar entries
 * LEARNING: Manages dynamic list of calendars with read/write permissions
 * WHY: Extracts calendar entry management logic from BusinessControlsTab component
 * PATTERN: Composable handles state management and business rules enforcement
 */

import { computed, type Ref } from 'vue'
import type { CalendarEntry, CalendarConfig, AvailabilitySettings } from '@/configs/availabilitySettings'
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
 * LEARNING: Provides reactive state and functions for calendar entry management
 * WHY: Centralizes calendar entry logic and enforces business rules
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
   * LEARNING: Computed property that reads from formData.calendarConfig.calendars
   * WHY: Provides reactive access to calendar entries array
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
   * LEARNING: Computed property that finds the index of the writeTo calendar
   * WHY: Provides easy access to which calendar is configured for writing
   */
  const writeToIndex = computed(() => {
    return entries.value.findIndex(entry => entry.writeTo)
  })
  
  /**
   * Ensure calendarConfig exists in formData
   * LEARNING: Helper function to initialize calendarConfig if needed
   * WHY: Prevents null reference errors when accessing calendarConfig
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
   * LEARNING: Creates a new calendar entry with default values
   * WHY: Allows users to add multiple calendars dynamically
   * PATTERN: First entry gets writeTo by default, others don't
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
   * LEARNING: Removes entry from array and handles writeTo reassignment if needed
   * WHY: Allows users to remove calendars they no longer need
   */
  const removeEntry = (index: number): void => {
    if (!formData.value?.calendarConfig?.calendars || !Array.isArray(formData.value.calendarConfig.calendars)) {
      return
    }
    
    const wasWriteTo = entries.value[index]?.writeTo
    
    formData.value.calendarConfig.calendars.splice(index, 1)
    
    // If we removed the writeTo calendar, assign writeTo to the first remaining calendar
    if (wasWriteTo && entries.value.length > 0) {
      entries.value[0].writeTo = true
    }
  }
  
  /**
   * Update a calendar entry
   * LEARNING: Merges updates into existing entry
   * WHY: Allows updating individual fields of a calendar entry
   */
  const updateEntry = (index: number, updates: Partial<CalendarEntry>): void => {
    if (!formData.value?.calendarConfig?.calendars || !Array.isArray(formData.value.calendarConfig.calendars)) {
      return
    }
    
    if (index >= 0 && index < entries.value.length) {
      // If updating writeTo, handle the business rule
      if (updates.writeTo !== undefined) {
        setWriteTo(index, updates.writeTo)
        // Don't apply writeTo update directly - setWriteTo handles it
        const { writeTo, ...otherUpdates } = updates
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
   * LEARNING: Updates readFrom flag for a specific entry
   * WHY: Allows toggling readFrom independently
   */
  const setReadFrom = (index: number, value: boolean): void => {
    updateEntry(index, { readFrom: value })
  }
  
  /**
   * Set writeTo for a calendar entry
   * LEARNING: Ensures only one calendar has writeTo: true
   * WHY: Business rule - only one calendar can receive appointments
   * PATTERN: If setting to true, unset all others; if setting to false, ensure at least one remains writeTo
   */
  const setWriteTo = (index: number, value: boolean): void => {
    if (!formData.value?.calendarConfig?.calendars || !Array.isArray(formData.value.calendarConfig.calendars)) {
      return
    }
    
    if (value) {
      // Setting this calendar to writeTo - unset all others
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
        // This is the only writeTo calendar - find another one to assign
        const otherIndex = entries.value.findIndex((e, i) => i !== index && e.email.trim() !== '')
        if (otherIndex >= 0) {
          // Assign writeTo to another calendar
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
        // Safe to unset this one
        entries.value[index].writeTo = false
      }
    }
  }
  
  /**
   * Validation error message
   * LEARNING: Computed property that validates calendar configuration
   * WHY: Provides user feedback about configuration issues
   */
  const validationError = computed<string | null>(() => {
    if (!calendarEnabled.value || calendarProvider.value === 'none') {
      return null  // No validation needed if disabled
    }
    
    if (entries.value.length === 0) {
      return 'At least one calendar must be configured when calendar integration is enabled'
    }
    
    // Check that at least one calendar has an email
    const hasValidEmail = entries.value.some(entry => entry.email && entry.email.trim() !== '')
    if (!hasValidEmail) {
      return 'At least one calendar must have a valid email address'
    }
    
    // Check that exactly one calendar has writeTo
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
   * LEARNING: Computed property based on validationError
   * WHY: Provides boolean flag for UI state
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
