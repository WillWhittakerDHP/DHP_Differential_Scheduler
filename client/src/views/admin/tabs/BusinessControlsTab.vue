<!--
  LEARNING: Business Controls Tab Component
  WHY: Allows admin to configure availability settings (business hours, time increments, lead time)
  PATTERN: Form with validation, API integration for loading/saving settings
  COMPARISON: React uses Ant Design Form. Vue uses Vuetify VForm with validation
  RESOURCE: https://vuetifyjs.com/en/components/forms/
-->
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import apiClient from '@/utils/api'
import type { AvailabilitySettings } from '@/configs/availabilitySettings'
import { defaultAvailabilitySettings, clearAvailabilitySettingsCache } from '@/configs/availabilitySettings'

/**
 * LEARNING: Form state management
 * WHY: Tracks form data, loading states, and validation errors
 * PATTERN: ref for reactive form data, refs for UI state
 */
const formData = ref<AvailabilitySettings>({ ...defaultAvailabilitySettings })
const loading = ref(false)
const saving = ref(false)
const error = ref<string | null>(null)
const success = ref<string | null>(null)

/**
 * Day names for display
 * LEARNING: Array mapping day numbers (0-6) to day names
 * WHY: Provides user-friendly labels for business hours inputs
 */
const dayNames = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
]

/**
 * Time increment options
 * LEARNING: Predefined options for time slot increments
 * WHY: Provides common increment values (15, 30, 60 minutes)
 */
const timeIncrementOptions = [
  { title: '15 minutes', value: 15 },
  { title: '30 minutes', value: 30 },
  { title: '60 minutes (1 hour)', value: 60 },
]

/**
 * Load settings from API
 * LEARNING: Fetches current settings from business-settings API
 * WHY: Populates form with current configuration
 * PATTERN: API call with error handling and fallback to defaults
 */
const loadSettings = async () => {
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
      error.value = `${dayNames[day]}: End time must be after start time`
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
const saveSettings = async () => {
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
const resetToDefaults = () => {
  formData.value = { ...defaultAvailabilitySettings }
  error.value = null
  success.value = null
}

/**
 * LEARNING: Load settings when component mounts
 * WHY: Populates form with current configuration on page load
 * PATTERN: onMounted lifecycle hook for initialization
 */
onMounted(() => {
  loadSettings()
})
</script>

<template>
  <div class="business-controls-tab">
    <VCard>
      <VCardTitle>Business Controls</VCardTitle>
      <VCardSubtitle>Configure availability settings for appointment scheduling</VCardSubtitle>
      
      <VCardText>
        <!-- Loading state -->
        <div v-if="loading" class="text-center py-4">
          <VProgressCircular indeterminate color="primary" />
          <div class="mt-2">Loading settings...</div>
        </div>
        
        <!-- Form -->
        <VForm v-else @submit.prevent="saveSettings">
          <!-- Success message -->
          <VAlert
            v-if="success"
            type="success"
            dismissible
            class="mb-4"
          >
            {{ success }}
          </VAlert>
          
          <!-- Error message -->
          <VAlert
            v-if="error"
            type="error"
            dismissible
            class="mb-4"
            @click:close="error = null"
          >
            {{ error }}
          </VAlert>
          
          <!-- Business Hours Section -->
          <VCard variant="outlined" class="mb-4">
            <VCardTitle class="text-h6">Business Hours</VCardTitle>
            <VCardText>
              <div
                v-for="day in 7"
                :key="day - 1"
                class="mb-4"
              >
                <div class="text-subtitle-2 mb-2">{{ dayNames[day - 1] }}</div>
                <VRow>
                  <VCol cols="12" sm="6" md="4">
                    <VTextField
                      v-model="formData.businessHours[(day - 1) as keyof typeof formData.businessHours].start"
                      label="Start Time"
                      type="time"
                      required
                      :rules="[
                        (v: string) => !!v || 'Start time is required',
                        (v: string) => /^\d{2}:\d{2}$/.test(v) || 'Invalid time format (HH:MM)',
                      ]"
                    />
                  </VCol>
                  <VCol cols="12" sm="6" md="4">
                    <VTextField
                      v-model="formData.businessHours[(day - 1) as keyof typeof formData.businessHours].end"
                      label="End Time"
                      type="time"
                      required
                      :rules="[
                        (v: string) => !!v || 'End time is required',
                        (v: string) => /^\d{2}:\d{2}$/.test(v) || 'Invalid time format (HH:MM)',
                      ]"
                    />
                  </VCol>
                </VRow>
              </div>
            </VCardText>
          </VCard>
          
          <!-- Time Increment Section -->
          <VCard variant="outlined" class="mb-4">
            <VCardTitle class="text-h6">Time Increment</VCardTitle>
            <VCardText>
              <VSelect
                v-model="formData.minuteIncrement"
                :items="timeIncrementOptions"
                label="Time Slot Increment"
                required
                :rules="[(v: number) => !!v || 'Time increment is required']"
              />
              <div class="text-caption mt-2">
                Time slots will be generated at intervals of {{ formData.minuteIncrement }} minutes
              </div>
            </VCardText>
          </VCard>
          
          <!-- Lead Time Section -->
          <VCard variant="outlined" class="mb-4">
            <VCardTitle class="text-h6">Lead Time</VCardTitle>
            <VCardText>
              <VTextField
                v-model.number="formData.leadTime"
                label="Minimum Lead Time (minutes)"
                type="number"
                min="0"
                required
                :rules="[
                  (v: number) => v !== null && v !== undefined || 'Lead time is required',
                  (v: number) => v >= 0 || 'Lead time must be 0 or greater',
                ]"
              />
              <div class="text-caption mt-2">
                Appointments must be scheduled at least {{ formData.leadTime }} minutes in advance
                ({{ Math.round(formData.leadTime / 60 * 10) / 10 }} hours)
              </div>
            </VCardText>
          </VCard>
          
          <!-- Action Buttons -->
          <div class="d-flex gap-2">
            <VBtn
              type="submit"
              color="primary"
              :loading="saving"
              :disabled="saving"
            >
              Save Settings
            </VBtn>
            <VBtn
              type="button"
              variant="outlined"
              @click="resetToDefaults"
              :disabled="saving"
            >
              Reset to Defaults
            </VBtn>
          </div>
        </VForm>
      </VCardText>
    </VCard>
  </div>
</template>

<style scoped>
.business-controls-tab {
  padding: 1rem;
}
</style>

