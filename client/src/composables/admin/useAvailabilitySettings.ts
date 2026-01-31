/**
 * Composable for availability settings management
 * WHY: Extracts API calls, validation, and state management from BusinessControlsTab
 * PATTERN: Composable handles all availability settings logic
 */

import { ref, onMounted, type Ref } from 'vue'
import apiClient from '@/utils/api'
import type { 
  AvailabilitySettings,
  WorkCapacityFilter,
  RollingWeekCapacityFilter,
  BufferConfig,
  BusinessHoursConfig,
  RawAvailabilitySettings
} from '@/configs/availabilitySettings'
import { invalidateAvailabilitySettingsCache } from '@/configs/availabilitySettings'
import { DAY_NAMES } from '@/constants/availabilitySettings'
import { useLocalTime } from '@/composables/useLocalTime'

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
  const { rfc3339ToBusinessHoursHHmm } = useLocalTime()
  return Math.max(
    ...Object.values(businessHours).map(day => {
      const startTimeStr = rfc3339ToBusinessHoursHHmm(day.start)
      const endTimeStr = rfc3339ToBusinessHoursHHmm(day.end)
      const [startHour, startMin] = startTimeStr.split(':').map(Number)
      const [endHour, endMin] = endTimeStr.split(':').map(Number)
      const startMinutes = startHour * 60 + startMin
      const endMinutes = endHour * 60 + endMin
      return (endMinutes - startMinutes) / 60
    })
  )
}

export interface UseAvailabilitySettingsReturn {
  formData: Ref<AvailabilitySettings | null>
  loading: Ref<boolean>
  saving: Ref<boolean>
  error: Ref<string | null>
  success: Ref<string | null>
  loadSettings: () => Promise<void>
  validateBusinessHours: () => boolean
  saveSettings: () => Promise<void>
}

/**
 * Composable for managing availability settings
 * WHY: Centralizes all availability settings logic (API calls, validation, state)
 * PATTERN: Returns reactive state and functions for settings management
 */
export function useAvailabilitySettings(): UseAvailabilitySettingsReturn {
  const formData = ref<AvailabilitySettings | null>(null)
  const loading = ref(false)
  const saving = ref(false)
  const error = ref<string | null>(null)
  const success = ref<string | null>(null)

  // LEARNING: Get time conversion functions from useLocalTime composable
  // WHY: Need to convert RFC3339 business hours to HH:mm for validation
  // PATTERN: Use composable at top of composable function for access throughout
  const { rfc3339ToBusinessHoursHHmm } = useLocalTime()

  const isBusinessHoursConfig = (config: BusinessHoursConfig | { minutes: number } | { start: string; end: string }): config is BusinessHoursConfig => {
    return 'hours' in config
  }

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
      
      if (!response.data || !response.data.setting_value) {
        throw new Error('No settings found in API response')
      }
      
      const rawSettings = response.data.setting_value as RawAvailabilitySettings
      
      // Validate - fail fast if missing required fields
      if (!rawSettings.rangeConstraints?.businessHours) {
        throw new Error('rangeConstraints.businessHours is required')
      }
      if (!rawSettings.minuteIncrement) {
        throw new Error('minuteIncrement is required')
      }
      
      // Extract business hours from rangeConstraints.businessHours.config.hours
      const businessHoursConfig = rawSettings.rangeConstraints.businessHours.config as BusinessHoursConfig
      if (!businessHoursConfig.hours) {
        throw new Error('rangeConstraints.businessHours.config.hours is required')
      }
      const businessHours = businessHoursConfig.hours
      
      // Use settings directly - no migration
      // LEARNING: Initialize durationRounding with defaults if not present
      // WHY: Ensures formData always has durationRounding structure for UI binding
      // PATTERN: Provide default values for optional nested config
      const durationRounding = rawSettings.durationRounding || {
        enabled: false,
        increment: rawSettings.minuteIncrement || 15,
        method: 'roundUp' as const
      }
      
      formData.value = {
        businessHours: businessHours,
        minuteIncrement: rawSettings.minuteIncrement,
        rangeConstraints: rawSettings.rangeConstraints,
        buffers: rawSettings.buffers,
        maxWorkHours: rawSettings.maxWorkHours,
        timezone: rawSettings.timezone,
        durationRounding,
        differentialPerspectives: rawSettings.differentialPerspectives
      }
    } catch (err: any) {
      // Explicit error - no fallbacks
      error.value = err instanceof Error ? err.message : 'Failed to load settings from API'
      throw err
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
    if (!formData.value) {
      error.value = 'Settings must be loaded before validation'
      return false
    }
    for (let day = 0; day <= 6; day++) {
      const dayHours = formData.value.businessHours[day as keyof typeof formData.value.businessHours]
      // LEARNING: Extract time-of-day from RFC3339 business hours
      // WHY: Business hours stored as RFC3339, need to extract HH:mm for validation
      // PATTERN: Convert RFC3339 to HH:mm, then parse
      const startTimeStr = rfc3339ToBusinessHoursHHmm(dayHours.start)
      const endTimeStr = rfc3339ToBusinessHoursHHmm(dayHours.end)
      
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
    
    if (!formData.value) {
      error.value = 'Settings must be loaded before saving'
      return
    }
    
    // Validate business hours
    if (!validateBusinessHours()) {
      return
    }
    
    saving.value = true
    
    try {
      
      // LEARNING: Server expects RFC3339 format directly
      // WHY: Server is source of truth for RFC3339 format, no conversion needed
      // PATTERN: Send business hours directly in RFC3339 format
      const settingsToSave: {
        businessHours: AvailabilitySettings['businessHours']
        minuteIncrement: number
        rangeConstraints?: AvailabilitySettings['rangeConstraints']
        buffers?: {
          appointment?: BufferConfig
          driveTime?: BufferConfig
          lunch?: BufferConfig
        }
        maxWorkHours?: {
          day?: WorkCapacityFilter
          calendarWeek?: WorkCapacityFilter
          rollingWeek?: RollingWeekCapacityFilter
        }
        timezone?: string
        durationRounding?: {
          enabled: boolean
          increment?: number
          method?: 'roundUp' | 'roundDown' | 'roundNearest'
        }
      } = {
        businessHours: formData.value.businessHours,
        minuteIncrement: formData.value.minuteIncrement
      }
      
      // Include range constraints if configured
      if (formData.value.rangeConstraints) {
        settingsToSave.rangeConstraints = formData.value.rangeConstraints
        // LEARNING: Ensure rangeConstraints.businessHours.config.hours matches top-level businessHours
        // WHY: Slot generation reads from rangeConstraints.businessHours.config.hours, not top-level
        // PATTERN: Sync both locations to ensure consistency
        const businessHoursConstraint = settingsToSave.rangeConstraints.businessHours
        if (businessHoursConstraint && isBusinessHoursConfig(businessHoursConstraint.config)) {
          businessHoursConstraint.config.hours = formData.value.businessHours
        }
      } else {
        // Create rangeConstraints with businessHours if it doesn't exist
        settingsToSave.rangeConstraints = {
          businessHours: {
            type: 'businessHours',
            enforcement: 'hard',
            config: {
              hours: formData.value.businessHours
            }
          }
        }
      }
      
      // Include buffer settings if configured (leadTime removed, only overlap constraints remain)
      if (formData.value.buffers) {
        settingsToSave.buffers = formData.value.buffers
      }
      
      // Include capacity settings if configured
      if (formData.value.maxWorkHours) {
        settingsToSave.maxWorkHours = formData.value.maxWorkHours
      }
      if (formData.value.timezone) {
        settingsToSave.timezone = formData.value.timezone
      }
      // LEARNING: Always include durationRounding if it exists in formData
      // WHY: Ensures rounding configuration is persisted even with default values
      // PATTERN: Include optional config if present in formData
      if (formData.value.durationRounding) {
        settingsToSave.durationRounding = formData.value.durationRounding
      }
      
      // Include differentialPerspectives if configured
      if (formData.value.differentialPerspectives) {
        settingsToSave.differentialPerspectives = formData.value.differentialPerspectives
      }
      
      // Save settings to API
      await apiClient.put('/business-settings/availability_settings', {
        setting_value: settingsToSave,
      })
      
      // Clear cache to force refresh
      invalidateAvailabilitySettingsCache()
      
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
    saveSettings
  }
}
