/**
 * Composable for availability settings management
 * WHY: Extracts API calls, validation, and state management from BusinessControlsTab
 * PATTERN: Composable handles all availability settings logic
 */

import { ref, onMounted, type Ref } from 'vue'
import apiClient from '@/utils/api'
import type { AvailabilitySettings } from '@/configs/availabilitySettings'
import { defaultAvailabilitySettings, clearAvailabilitySettingsCache } from '@/configs/availabilitySettings'
import { DAY_NAMES } from '@/constants/availabilitySettings'
import { rfc3339ToBusinessHoursTime, businessHoursTimeToRfc3339 } from '@/utils/datetime'

/**
 * Calculate maximum business hours across all days
 * LEARNING: Helper to compute workHoursLimit default from businessHours
 * WHY: Provides default value for workHoursLimit if not configured
 * PATTERN: Pure function that calculates max hours
 * 
 * @param businessHours - Business hours configuration
 * @returns Maximum hours across all days (as number)
 */
export function calculateMaxBusinessHours(businessHours: AvailabilitySettings['businessHours']): number {
  return Math.max(
    ...Object.values(businessHours).map(day => {
      const startTimeStr = rfc3339ToBusinessHoursTime(day.start)
      const endTimeStr = rfc3339ToBusinessHoursTime(day.end)
      const [startHour, startMin] = startTimeStr.split(':').map(Number)
      const [endHour, endMin] = endTimeStr.split(':').map(Number)
      const startMinutes = startHour * 60 + startMin
      const endMinutes = endHour * 60 + endMin
      return (endMinutes - startMinutes) / 60
    })
  )
}

export interface UseAvailabilitySettingsReturn {
  formData: Ref<AvailabilitySettings>
  loading: Ref<boolean>
  saving: Ref<boolean>
  error: Ref<string | null>
  success: Ref<string | null>
  loadSettings: () => Promise<void>
  validateBusinessHours: () => boolean
  saveSettings: () => Promise<void>
  resetToDefaults: () => void
}

/**
 * Composable for managing availability settings
 * WHY: Centralizes all availability settings logic (API calls, validation, state)
 * PATTERN: Returns reactive state and functions for settings management
 */
export function useAvailabilitySettings(): UseAvailabilitySettingsReturn {
  const formData = ref<AvailabilitySettings>({ ...defaultAvailabilitySettings })
  const loading = ref(false)
  const saving = ref(false)
  const error = ref<string | null>(null)
  const success = ref<string | null>(null)

  /**
   * Load settings from API
   * LEARNING: Fetches current settings from business-settings API
   * WHY: Populates form with current configuration
   * PATTERN: API call with error handling and fallback to defaults
   */
  const loadSettings = async (): Promise<void> => {
    loading.value = true
    error.value = null
    
    try {
      const response = await apiClient.get('/business-settings/availability_settings')
      
      if (response.data && response.data.setting_value) {
        const rawSettings = response.data.setting_value as {
          businessHours?: {
            [key: string]: { start: string; end: string } // API returns HH:mm format
          }
          minuteIncrement?: number
          leadTime?: number
        }
        
        // Validate settings structure
        if (
          rawSettings.businessHours &&
          rawSettings.minuteIncrement &&
          rawSettings.leadTime !== undefined
        ) {
          // LEARNING: Convert business hours from HH:mm (API format) to RFC3339 (internal format)
          // WHY: API returns HH:mm, but we store as RFC3339 internally
          // PATTERN: Map over business hours and convert each time string
          formData.value = {
            businessHours: {
              0: {
                start: businessHoursTimeToRfc3339(rawSettings.businessHours['0']?.start || '09:00'),
                end: businessHoursTimeToRfc3339(rawSettings.businessHours['0']?.end || '19:00')
              },
              1: {
                start: businessHoursTimeToRfc3339(rawSettings.businessHours['1']?.start || '09:00'),
                end: businessHoursTimeToRfc3339(rawSettings.businessHours['1']?.end || '19:00')
              },
              2: {
                start: businessHoursTimeToRfc3339(rawSettings.businessHours['2']?.start || '09:00'),
                end: businessHoursTimeToRfc3339(rawSettings.businessHours['2']?.end || '19:00')
              },
              3: {
                start: businessHoursTimeToRfc3339(rawSettings.businessHours['3']?.start || '09:00'),
                end: businessHoursTimeToRfc3339(rawSettings.businessHours['3']?.end || '19:00')
              },
              4: {
                start: businessHoursTimeToRfc3339(rawSettings.businessHours['4']?.start || '09:00'),
                end: businessHoursTimeToRfc3339(rawSettings.businessHours['4']?.end || '19:00')
              },
              5: {
                start: businessHoursTimeToRfc3339(rawSettings.businessHours['5']?.start || '09:00'),
                end: businessHoursTimeToRfc3339(rawSettings.businessHours['5']?.end || '19:00')
              },
              6: {
                start: businessHoursTimeToRfc3339(rawSettings.businessHours['6']?.start || '09:00'),
                end: businessHoursTimeToRfc3339(rawSettings.businessHours['6']?.end || '19:00')
              }
            },
            minuteIncrement: rawSettings.minuteIncrement,
            leadTime: rawSettings.leadTime,
            workHoursLimit: rawSettings.workHoursLimit, // Use configured or undefined
            timezone: rawSettings.timezone || 'America/New_York' // Default to Eastern
          }
        } else {
          // Invalid structure, use defaults
          formData.value = { ...defaultAvailabilitySettings }
        }
      } else {
        // No settings found, use defaults
        formData.value = { ...defaultAvailabilitySettings }
      }
    } catch (err: any) {
      // Use defaults if API call fails
      formData.value = { ...defaultAvailabilitySettings }
    } finally {
      loading.value = false
    }
  }

  /**
   * Validate business hours
   * LEARNING: Ensures end time is after start time for each day
   * WHY: Prevents invalid time ranges (e.g., end before start)
   * PATTERN: Validation function that checks time logic
   */
  const validateBusinessHours = (): boolean => {
    for (let day = 0; day <= 6; day++) {
      const dayHours = formData.value.businessHours[day as keyof typeof formData.value.businessHours]
      // LEARNING: Extract time-of-day from RFC3339 business hours
      // WHY: Business hours stored as RFC3339, need to extract HH:mm for validation
      // PATTERN: Convert RFC3339 to HH:mm, then parse
      const startTimeStr = rfc3339ToBusinessHoursTime(dayHours.start)
      const endTimeStr = rfc3339ToBusinessHoursTime(dayHours.end)
      
      const [startHour, startMin] = startTimeStr.split(':').map(Number)
      const [endHour, endMin] = endTimeStr.split(':').map(Number)
      
      const startMinutes = startHour * 60 + startMin
      const endMinutes = endHour * 60 + endMin
      
      if (endMinutes <= startMinutes) {
        error.value = `${DAY_NAMES[day]}: End time must be after start time`
        return false
      }
    }
    return true
  }

  /**
   * Save settings to API
   * LEARNING: Saves form data to business-settings API
   * WHY: Persists admin configuration changes
   * PATTERN: API call with error handling and success feedback
   */
  const saveSettings = async (): Promise<void> => {
    // Clear previous messages
    error.value = null
    success.value = null
    
    // Validate business hours
    if (!validateBusinessHours()) {
      return
    }
    
    saving.value = true
    
    try {
      // LEARNING: Convert business hours from RFC3339 (internal format) to HH:mm (API format)
      // WHY: API expects HH:mm format, but we store as RFC3339 internally
      // PATTERN: Convert each business hour before sending to API
      const settingsToSave = {
        businessHours: {
          0: {
            start: rfc3339ToBusinessHoursTime(formData.value.businessHours[0].start),
            end: rfc3339ToBusinessHoursTime(formData.value.businessHours[0].end)
          },
          1: {
            start: rfc3339ToBusinessHoursTime(formData.value.businessHours[1].start),
            end: rfc3339ToBusinessHoursTime(formData.value.businessHours[1].end)
          },
          2: {
            start: rfc3339ToBusinessHoursTime(formData.value.businessHours[2].start),
            end: rfc3339ToBusinessHoursTime(formData.value.businessHours[2].end)
          },
          3: {
            start: rfc3339ToBusinessHoursTime(formData.value.businessHours[3].start),
            end: rfc3339ToBusinessHoursTime(formData.value.businessHours[3].end)
          },
          4: {
            start: rfc3339ToBusinessHoursTime(formData.value.businessHours[4].start),
            end: rfc3339ToBusinessHoursTime(formData.value.businessHours[4].end)
          },
          5: {
            start: rfc3339ToBusinessHoursTime(formData.value.businessHours[5].start),
            end: rfc3339ToBusinessHoursTime(formData.value.businessHours[5].end)
          },
          6: {
            start: rfc3339ToBusinessHoursTime(formData.value.businessHours[6].start),
            end: rfc3339ToBusinessHoursTime(formData.value.businessHours[6].end)
          }
        },
        minuteIncrement: formData.value.minuteIncrement,
        leadTime: formData.value.leadTime
      }
      
      // Save settings to API
      await apiClient.put('/business-settings/availability_settings', {
        setting_value: settingsToSave,
      })
      
      // Clear cache to force refresh
      clearAvailabilitySettingsCache()
      
      success.value = 'Settings saved successfully!'
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        success.value = null
      }, 3000)
    } catch (err: any) {
      error.value = err.response?.data?.error || 'Failed to save settings. Please try again.'
    } finally {
      saving.value = false
    }
  }

  /**
   * Reset form to defaults
   * LEARNING: Resets form data to default values
   * WHY: Allows admin to quickly reset to default configuration
   * PATTERN: Simple reset function
   */
  const resetToDefaults = (): void => {
    formData.value = { 
      ...defaultAvailabilitySettings,
      workHoursLimit: undefined, // Reset to undefined (will be calculated)
      timezone: 'America/New_York' // Reset to default
    }
    error.value = null
    success.value = null
  }

  /**
   * LEARNING: Load settings when composable is used
   * WHY: Populates form with current configuration on page load
   * PATTERN: onMounted lifecycle hook for initialization
   */
  onMounted(() => {
    loadSettings()
  })

  return {
    formData,
    loading,
    saving,
    error,
    success,
    loadSettings,
    validateBusinessHours,
    saveSettings,
    resetToDefaults
  }
}
