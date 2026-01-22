<!--
  LEARNING: Business Controls Tab Component
  WHY: Allows admin to configure availability settings (business hours, time increments, lead time)
  PATTERN: Form with validation, API integration for loading/saving settings
  COMPARISON: React uses Ant Design Form. Vue uses Vuetify VForm with validation
  RESOURCE: https://vuetifyjs.com/en/components/forms/
-->
<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAvailabilitySettings, calculateMaxBusinessHours } from '@/composables/admin/useAvailabilitySettings'
import { DAY_NAMES, TIME_INCREMENT_OPTIONS, TIMEZONE_OPTIONS } from '@/constants/availabilitySettings'
import { rfc3339ToBusinessHoursTime, businessHoursTimeToRfc3339 } from '@/utils/datetime'

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

// LEARNING: Create computed properties for business hours in HH:mm format for UI
// WHY: Time inputs expect HH:mm format, but formData stores RFC3339 internally
// PATTERN: Computed properties convert between formats for each day
const businessHoursForUI = computed(() => {
  const hours: Record<number, { start: string; end: string }> = {}
  for (let day = 0; day <= 6; day++) {
    const dayHours = formData.value.businessHours[day as keyof typeof formData.value.businessHours]
    hours[day] = {
      start: rfc3339ToBusinessHoursTime(dayHours.start),
      end: rfc3339ToBusinessHoursTime(dayHours.end)
    }
  }
  return hours
})

// LEARNING: Watch for changes in UI business hours and update RFC3339 formData
// WHY: When user changes time inputs (HH:mm), convert back to RFC3339 for storage
// PATTERN: Function to update formData when UI values change
const updateBusinessHours = (day: number, field: 'start' | 'end', value: string): void => {
  const rfc3339Value = businessHoursTimeToRfc3339(value)
  formData.value.businessHours[day as keyof typeof formData.value.businessHours][field] = rfc3339Value
}

// NEW: Collapsible state for Business Hours
const businessHoursExpanded = ref(false) // Start collapsed to save space

// NEW: Computed max business hours for workHoursLimit hint
const maxBusinessHours = computed(() => {
  return calculateMaxBusinessHours(formData.value.businessHours)
})

// Expose constants for template use
const dayNames = DAY_NAMES
const timeIncrementOptions = TIME_INCREMENT_OPTIONS
const timezoneOptions = TIMEZONE_OPTIONS
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
          
          <!-- Business Hours Section (Collapsible) -->
          <VCard variant="outlined" class="mb-4">
            <VCardTitle 
              class="text-h6 d-flex align-center"
              style="cursor: pointer;"
              @click="businessHoursExpanded = !businessHoursExpanded"
            >
              <VIcon class="mr-2" :icon="businessHoursExpanded ? 'mdi-chevron-down' : 'mdi-chevron-right'" />
              Business Hours
              <VSpacer />
              <VChip size="small" variant="outlined" class="ml-2">
                {{ businessHoursExpanded ? 'Expanded' : 'Collapsed' }}
              </VChip>
            </VCardTitle>
            
            <VExpandTransition>
              <VCardText v-show="businessHoursExpanded">
                <div
                  v-for="day in 7"
                  :key="day - 1"
                  class="mb-4"
                >
                  <div class="text-subtitle-2 mb-2">{{ dayNames[day - 1] }}</div>
                  <VRow>
                    <VCol cols="12" sm="6" md="4">
                      <VTextField
                        :model-value="businessHoursForUI[(day - 1) as keyof typeof businessHoursForUI].start"
                        @update:model-value="(v: string) => updateBusinessHours(day - 1, 'start', v)"
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
                        :model-value="businessHoursForUI[(day - 1) as keyof typeof businessHoursForUI].end"
                        @update:model-value="(v: string) => updateBusinessHours(day - 1, 'end', v)"
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
            </VExpandTransition>
          </VCard>
          
          <!-- Work Hours & Capacity Section -->
          <VCard variant="outlined" class="mb-4">
            <VCardTitle class="text-h6">Work Hours & Capacity</VCardTitle>
            <VCardText>
              <VTextField
                v-model.number="formData.workHoursLimit"
                label="Maximum Work Hours Per Day"
                type="number"
                min="0"
                max="24"
                step="0.5"
                hint="Limits total scheduled appointments per day. Days exceeding this limit will show no available slots."
                persistent-hint
                :rules="[
                  (v: number | undefined) => v === undefined || v >= 0 || 'Work hours limit must be 0 or greater',
                  (v: number | undefined) => v === undefined || v <= 24 || 'Work hours limit cannot exceed 24 hours',
                ]"
              />
              <div class="text-caption mt-2">
                <span v-if="formData.workHoursLimit">
                  Days with more than {{ formData.workHoursLimit }} hours of scheduled appointments will be hidden.
                </span>
                <span v-else>
                  Maximum business hours: {{ maxBusinessHours.toFixed(1) }} hours (calculated from your business hours).
                  Set a lower limit to prevent overbooking.
                </span>
              </div>
            </VCardText>
          </VCard>
          
          <!-- Timezone Settings Section -->
          <VCard variant="outlined" class="mb-4">
            <VCardTitle class="text-h6">Timezone Settings</VCardTitle>
            <VCardText>
              <VSelect
                v-model="formData.timezone"
                :items="timezoneOptions"
                label="Timezone"
                hint="Used for all availability calculations and time slot generation."
                persistent-hint
                :rules="[
                  (v: string) => !!v || 'Timezone is required',
                ]"
              />
              <div class="text-caption mt-2">
                Business hours and time slots will be interpreted in the selected timezone.
                Current selection: {{ formData.timezone || 'America/New_York (default)' }}
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

