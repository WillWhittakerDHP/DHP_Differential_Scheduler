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
        const settings = response.data.setting_value as AvailabilitySettings
        
        // Validate settings structure
        if (
          settings.businessHours &&
          settings.minuteIncrement &&
          settings.leadTime !== undefined
        ) {
          formData.value = settings
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
      const [startHour, startMin] = dayHours.start.split(':').map(Number)
      const [endHour, endMin] = dayHours.end.split(':').map(Number)
      
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
      // Save settings to API
      await apiClient.put('/business-settings/availability_settings', {
        setting_value: formData.value,
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
    formData.value = { ...defaultAvailabilitySettings }
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
