<!--
  LEARNING: Business Controls Tab Component
  WHY: Allows admin to configure availability settings (business hours, time increments, lead time)
  PATTERN: Form with validation, API integration for loading/saving settings
  COMPARISON: React uses Ant Design Form. Vue uses Vuetify VForm with validation
  RESOURCE: https://vuetifyjs.com/en/components/forms/
-->
<script setup lang="ts">
import { useAvailabilitySettings } from '@/composables/admin/useAvailabilitySettings'
import { DAY_NAMES, TIME_INCREMENT_OPTIONS } from '@/constants/availabilitySettings'

/**
 * LEARNING: Use availability settings composable
 * WHY: All logic moved to composable - component is pure rendering
 * PATTERN: Composable handles all state, API calls, and validation
 */
const {
  formData,
  loading,
  saving,
  error,
  success,
  saveSettings,
  resetToDefaults
} = useAvailabilitySettings()

// Expose constants for template use
const dayNames = DAY_NAMES
const timeIncrementOptions = TIME_INCREMENT_OPTIONS
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

