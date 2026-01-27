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
import { useTabNavigation } from '@/composables/admin/useTabNavigation'
import { DAY_NAMES, TIME_INCREMENT_OPTIONS, TIMEZONE_OPTIONS } from '@/constants/availabilitySettings'
import { useLocalTime } from '@/composables/useLocalTime'

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
  saveSettings
} = useAvailabilitySettings()

const { rfc3339ToBusinessHoursHHmm, businessHoursHHmmToRfc3339 } = useLocalTime()

// LEARNING: Create computed properties for business hours in HH:mm format for UI
// WHY: Time inputs expect HH:mm format, but formData stores RFC3339 internally
// PATTERN: Computed properties convert between formats for each day
const businessHoursForUI = computed(() => {
  const hours: Record<number, { start: string; end: string }> = {}
  for (let day = 0; day <= 6; day++) {
    const dayHours = formData.value.businessHours[day as keyof typeof formData.value.businessHours]
    hours[day] = {
      start: rfc3339ToBusinessHoursHHmm(dayHours.start),
      end: rfc3339ToBusinessHoursHHmm(dayHours.end)
    }
  }
  return hours
})

// LEARNING: Watch for changes in UI business hours and update RFC3339 formData
// WHY: When user changes time inputs (HH:mm), convert back to RFC3339 for storage
// PATTERN: Function to update formData when UI values change
const updateBusinessHours = (day: number, field: 'start' | 'end', value: string): void => {
  const rfc3339Value = businessHoursHHmmToRfc3339(value)
  // LEARNING: Update both top-level businessHours and rangeConstraints.businessHours.config.hours
  // WHY: Slot generation reads from rangeConstraints.businessHours.config.hours, so both must stay in sync
  // PATTERN: Update both locations to ensure consistency
  formData.value.businessHours[day as keyof typeof formData.value.businessHours][field] = rfc3339Value
  if (formData.value.rangeConstraints?.businessHours?.config?.hours) {
    formData.value.rangeConstraints.businessHours.config.hours[day as keyof typeof formData.value.rangeConstraints.businessHours.config.hours][field] = rfc3339Value
  }
}

// LEARNING: Tab navigation for subtabs
// WHY: Provides tabbed interface for switching between different settings sections
// PATTERN: Use tab navigation composable for state management
const { currentTab: currentSubTab, navigateToTab: handleNavigateToTab } = useTabNavigation({ initialTab: 'range' })

// NEW: Computed max business hours for workHoursLimit hint
const maxBusinessHours = computed(() => {
  return calculateMaxBusinessHours(formData.value.businessHours)
})

// LEARNING: Helper functions to initialize capacity filters
// WHY: Ensures formData has proper structure when user starts configuring filters
// PATTERN: Initialize with defaults if not set
const initMaxWorkHours = () => {
  if (!formData.value.maxWorkHours) {
    formData.value.maxWorkHours = {}
  }
}

const initWorkHoursPerDay = () => {
  initMaxWorkHours()
  if (!formData.value.maxWorkHours?.day) {
    if (!formData.value.maxWorkHours) {
      formData.value.maxWorkHours = {}
    }
    formData.value.maxWorkHours.day = {
      maxHours: maxBusinessHours.value,
      enforcement: 'off'
    }
  }
}

const initCalendarWeekLimit = () => {
  initMaxWorkHours()
  if (!formData.value.maxWorkHours?.calendarWeek) {
    if (!formData.value.maxWorkHours) {
      formData.value.maxWorkHours = {}
    }
    formData.value.maxWorkHours.calendarWeek = {
      maxHours: maxBusinessHours.value * 7,
      enforcement: 'off'
    }
  }
}

const initRollingWeekLimit = () => {
  initMaxWorkHours()
  if (!formData.value.maxWorkHours?.rollingWeek) {
    if (!formData.value.maxWorkHours) {
      formData.value.maxWorkHours = {}
    }
    formData.value.maxWorkHours.rollingWeek = {
      maxHours: maxBusinessHours.value * 7,
      enforcement: 'off',
      direction: 'past'
    }
  } else if (!formData.value.maxWorkHours.rollingWeek.direction) {
    formData.value.maxWorkHours.rollingWeek.direction = 'past'
  }
}

// LEARNING: Computed properties with getters/setters for capacity filter values
// WHY: v-model requires valid member expressions, can't use optional chaining
// PATTERN: Computed with get/set to handle optional objects
const maxWorkHoursDayMaxHours = computed({
  get: () => {
    if (!formData.value.maxWorkHours?.day) {
      return maxBusinessHours.value
    }
    return formData.value.maxWorkHours.day.maxHours
  },
  set: (value: number) => {
    initWorkHoursPerDay()
    if (formData.value.maxWorkHours?.day) {
      formData.value.maxWorkHours.day.maxHours = value
    }
  }
})

const maxWorkHoursDayEnforcement = computed({
  get: () => {
    if (!formData.value.maxWorkHours?.day) {
      return 'off'
    }
    return formData.value.maxWorkHours.day.enforcement
  },
  set: (value: 'off' | 'flexible' | 'hard') => {
    initWorkHoursPerDay()
    if (formData.value.maxWorkHours?.day) {
      formData.value.maxWorkHours.day.enforcement = value
    }
  }
})

const maxWorkHoursCalendarWeekMaxHours = computed({
  get: () => {
    if (!formData.value.maxWorkHours?.calendarWeek) {
      return maxBusinessHours.value * 7
    }
    return formData.value.maxWorkHours.calendarWeek.maxHours
  },
  set: (value: number) => {
    initCalendarWeekLimit()
    if (formData.value.maxWorkHours?.calendarWeek) {
      formData.value.maxWorkHours.calendarWeek.maxHours = value
    }
  }
})

const maxWorkHoursCalendarWeekEnforcement = computed({
  get: () => {
    if (!formData.value.maxWorkHours?.calendarWeek) {
      return 'off'
    }
    return formData.value.maxWorkHours.calendarWeek.enforcement
  },
  set: (value: 'off' | 'flexible' | 'hard') => {
    initCalendarWeekLimit()
    if (formData.value.maxWorkHours?.calendarWeek) {
      formData.value.maxWorkHours.calendarWeek.enforcement = value
    }
  }
})

const maxWorkHoursRollingWeekMaxHours = computed({
  get: () => {
    if (!formData.value.maxWorkHours?.rollingWeek) {
      return maxBusinessHours.value * 7
    }
    return formData.value.maxWorkHours.rollingWeek.maxHours
  },
  set: (value: number) => {
    initRollingWeekLimit()
    if (formData.value.maxWorkHours?.rollingWeek) {
      formData.value.maxWorkHours.rollingWeek.maxHours = value
    }
  }
})

const maxWorkHoursRollingWeekEnforcement = computed({
  get: () => {
    if (!formData.value.maxWorkHours?.rollingWeek) {
      return 'off'
    }
    return formData.value.maxWorkHours.rollingWeek.enforcement
  },
  set: (value: 'off' | 'flexible' | 'hard') => {
    initRollingWeekLimit()
    if (formData.value.maxWorkHours?.rollingWeek) {
      formData.value.maxWorkHours.rollingWeek.enforcement = value
    }
  }
})

const maxWorkHoursRollingWeekDirection = computed({
  get: () => {
    if (!formData.value.maxWorkHours?.rollingWeek) {
      return 'past'
    }
    return formData.value.maxWorkHours.rollingWeek.direction || 'past'
  },
  set: (value: 'past' | 'centered' | 'future') => {
    initRollingWeekLimit()
    if (formData.value.maxWorkHours?.rollingWeek) {
      formData.value.maxWorkHours.rollingWeek.direction = value
    }
  }
})

// Enforcement options for selects
const enforcementOptions = [
  { title: 'Off', value: 'off' },
  { title: 'Flexible', value: 'flexible' },
  { title: 'Hard', value: 'hard' }
]

// Rolling week direction options
const rollingWeekDirectionOptions = [
  { title: 'Past 7 days', value: 'past' },
  { title: 'Centered (3 before + day + 3 after)', value: 'centered' },
  { title: 'Future 7 days', value: 'future' }
]

// Buffer mode options (includes leadTime mode for leadTime buffer)
const bufferModeOptions = [
  { title: 'Off', value: 'off' },
  { title: 'Lead Time', value: 'leadTime' },
  { title: 'Before', value: 'before' },
  { title: 'After', value: 'after' },
  { title: 'Both', value: 'both' }
]

// Buffer placement options (for appointment buffer placement)
const bufferPlacementOptions = [
  { title: 'Off', value: 'off' },
  { title: 'Before', value: 'before' },
  { title: 'After', value: 'after' },
  { title: 'Both', value: 'both' }
]

// LEARNING: Helper functions to initialize buffers
// WHY: Ensures formData has proper structure when user starts configuring buffers
// PATTERN: Initialize with defaults if not set
const initBuffers = () => {
  if (!formData.value.buffers) {
    formData.value.buffers = {}
  }
}

// LEARNING: Helper functions to initialize range constraints
// WHY: Ensures formData has proper structure when user starts configuring range constraints
// PATTERN: Initialize with defaults if not set
const initRangeConstraints = () => {
  if (!formData.value.rangeConstraints) {
    formData.value.rangeConstraints = {}
  }
}

const initLeadTimeConstraint = () => {
  initRangeConstraints()
  if (!formData.value.rangeConstraints?.leadTime) {
    if (!formData.value.rangeConstraints) {
      formData.value.rangeConstraints = {}
    }
    formData.value.rangeConstraints.leadTime = {
      type: 'leadTime',
      enforcement: 'hard',
      config: {
        minutes: 60 // Default 1 hour
      }
    }
  }
}

const initAppointmentBuffer = () => {
  initBuffers()
  if (!formData.value.buffers?.appointment) {
    if (!formData.value.buffers) {
      formData.value.buffers = {}
    }
    formData.value.buffers.appointment = {
      type: 'appointment',
      minutes: 0,
      mode: 'off'
    }
  }
}

// LEARNING: Computed properties for range constraint settings
// WHY: v-model requires valid member expressions, handle optional nested objects
// PATTERN: Computed with get/set to handle optional range constraint settings
const rangeConstraintsLeadTimeMinutes = computed({
  get: () => {
    if (!formData.value.rangeConstraints?.leadTime) {
      return 60 // Default 1 hour
    }
    return formData.value.rangeConstraints.leadTime.config.minutes
  },
  set: (value: number) => {
    initLeadTimeConstraint()
    if (formData.value.rangeConstraints?.leadTime) {
      formData.value.rangeConstraints.leadTime.config.minutes = value
    }
  }
})

const buffersAppointmentMinutes = computed({
  get: () => {
    if (!formData.value.buffers?.appointment) {
      return 0
    }
    return formData.value.buffers.appointment.minutes
  },
  set: (value: number) => {
    initAppointmentBuffer()
    if (formData.value.buffers?.appointment) {
      formData.value.buffers.appointment.minutes = value
    }
  }
})

const buffersAppointmentPlacement = computed({
  get: () => {
    if (!formData.value.buffers?.appointment) {
      return 'off'
    }
    return formData.value.buffers.appointment.placement || 'off'
  },
  set: (value: 'off' | 'before' | 'after' | 'both') => {
    initAppointmentBuffer()
    if (formData.value.buffers?.appointment) {
      formData.value.buffers.appointment.placement = value
    }
  }
})

const buffersAppointmentEnforcement = computed({
  get: () => {
    if (!formData.value.buffers?.appointment) {
      return 'hard'
    }
    return formData.value.buffers.appointment.enforcement || 'hard'
  },
  set: (value: 'off' | 'flexible' | 'hard') => {
    initAppointmentBuffer()
    if (formData.value.buffers?.appointment) {
      formData.value.buffers.appointment.enforcement = value
    }
  }
})

// Expose constants for template use
const dayNames = DAY_NAMES
const timeIncrementOptions = TIME_INCREMENT_OPTIONS
const timezoneOptions = TIMEZONE_OPTIONS
</script>

<template>
  <div class="business-controls-tab">
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
      
      <!-- LEARNING: Expansion panels for Controls sections -->
      <!-- WHY: Provides collapsible interface for organizing different settings sections -->
      <!-- PATTERN: VExpansionPanels with nested tabs for Constraints -->
      <VExpansionPanels>
        <!-- Constraints Panel -->
        <VExpansionPanel title="Constraints">
          <VExpansionPanelText>
            <!-- LEARNING: Subtabs for Constraints sections -->
            <!-- WHY: Provides tabbed interface for switching between different constraint types -->
            <!-- PATTERN: VTabs/VWindow pattern matching DataManagementTab -->
            <VTabs v-model="currentSubTab" class="mb-4">
              <VTab value="range">Range</VTab>
              <VTab value="capacity">Capacity</VTab>
              <VTab value="overlap">Overlap</VTab>
            </VTabs>
            
            <VWindow v-model="currentSubTab">
              <!-- Range Tab -->
              <VWindowItem key="range" value="range">
                <!-- Range Constraints Expansion Panels -->
                <VExpansionPanels class="mb-4">
                  <!-- Business Hours -->
                  <VExpansionPanel title="Business Hours">
                    <VExpansionPanelText>
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
                    </VExpansionPanelText>
                  </VExpansionPanel>
                  
                  <!-- Lead Time Constraint -->
                  <VExpansionPanel title="Lead Time Constraint">
                    <VExpansionPanelText>
                      <VTextField
                        v-model.number="rangeConstraintsLeadTimeMinutes"
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
                        Appointments must be scheduled at least {{ rangeConstraintsLeadTimeMinutes }} minutes in advance
                        ({{ Math.round(rangeConstraintsLeadTimeMinutes / 60 * 10) / 10 }} hours)
                      </div>
                      <div class="text-caption mt-1" style="color: rgba(0,0,0,0.6);">
                        Lead time filters out slots that are too soon (before current time + lead time minutes)
                      </div>
                    </VExpansionPanelText>
                  </VExpansionPanel>
                  
                  <!-- Date Range Constraint -->
                  <!-- TODO: Implement Date Range Constraint UI
                    * When implementing, follow the pattern used for Lead Time Constraint above
                    * Use initRangeConstraints() and initDateRangeConstraint() helper functions (create if needed)
                    * Create computed properties with getters/setters for dateRange start/end dates (similar to rangeConstraintsLeadTimeMinutes)
                    * Use VTextField with type="datetime-local" or VDatePicker/VTimePicker components for date/time input
                    * Convert between RFC3339 format (stored in formData) and local datetime format (for UI)
                    * Reference: formData.value.rangeConstraints?.dateRange structure matches RangeConstraint interface
                    * See: client/src/configs/availabilitySettings.ts for DateRangeConfig interface (start: string, end: string RFC3339)
                    * Use the useAvailabilitySettings composable's formData, saveSettings, and validation patterns
                  -->
                  <VExpansionPanel title="Date Range Constraint">
                    <VExpansionPanelText>
                      <VAlert type="info" variant="tonal">
                        <div class="text-body-2">Not Set-up</div>
                        <div class="text-caption mt-1">
                          Date range constraints allow you to set absolute start and end boundaries for when appointments can be scheduled.
                        </div>
                      </VAlert>
                    </VExpansionPanelText>
                  </VExpansionPanel>
                </VExpansionPanels>
                
                <!-- Help text -->
                <div class="text-caption mt-2 pa-2" style="background-color: rgba(0,0,0,0.05); border-radius: 4px; font-size: 0.75rem;">
                  <strong>Range Constraints:</strong> Filter slots by when they can occur. Lead time prevents scheduling too close to current time. Date range sets absolute boundaries.
                </div>
                
                <!-- Action Buttons -->
                <div class="d-flex gap-2 mt-4">
                  <VBtn
                    type="submit"
                    color="primary"
                    :loading="saving"
                    :disabled="saving"
                  >
                    Save Settings
                  </VBtn>
                </div>
              </VWindowItem>
              
              <!-- Capacity Tab -->
              <VWindowItem key="capacity" value="capacity">
                <!-- Capacity Constraints Expansion Panels -->
                <VExpansionPanels class="mb-4">
                  <!-- Per Day Limit -->
                  <VExpansionPanel title="Per Day Limit">
                    <VExpansionPanelText>
                      <VRow>
                        <VCol cols="12" sm="6" md="4">
                          <VTextField
                            v-model.number="maxWorkHoursDayMaxHours"
                            label="Maximum Hours Per Day"
                            type="number"
                            min="0"
                            max="24"
                            step="0.5"
                            :rules="[
                              (v: number) => v >= 0 || 'Must be 0 or greater',
                              (v: number) => v <= 24 || 'Cannot exceed 24 hours',
                            ]"
                          />
                        </VCol>
                        <VCol cols="12" sm="6" md="4">
                          <VSelect
                            v-model="maxWorkHoursDayEnforcement"
                            :items="enforcementOptions"
                            label="Enforcement"
                            hint="Off: No filtering | Flexible: Block if limit already exceeded | Hard: Block if would exceed limit"
                            persistent-hint
                          />
                        </VCol>
                      </VRow>
                    </VExpansionPanelText>
                  </VExpansionPanel>
                  
                  <!-- Calendar Week Limit -->
                  <VExpansionPanel title="Calendar Week Limit (Monday-Sunday)">
                    <VExpansionPanelText>
                      <VRow>
                        <VCol cols="12" sm="6" md="4">
                          <VTextField
                            v-model.number="maxWorkHoursCalendarWeekMaxHours"
                            label="Maximum Hours Per Week"
                            type="number"
                            min="0"
                            step="0.5"
                            :rules="[
                              (v: number) => v >= 0 || 'Must be 0 or greater',
                            ]"
                          />
                        </VCol>
                        <VCol cols="12" sm="6" md="4">
                          <VSelect
                            v-model="maxWorkHoursCalendarWeekEnforcement"
                            :items="enforcementOptions"
                            label="Enforcement"
                            hint="Off: No filtering | Flexible: Block if limit already exceeded | Hard: Block if would exceed limit"
                            persistent-hint
                          />
                        </VCol>
                      </VRow>
                    </VExpansionPanelText>
                  </VExpansionPanel>
                  
                  <!-- Rolling Week Limit -->
                  <VExpansionPanel title="Rolling Week Limit (7-day window)">
                    <VExpansionPanelText>
                      <VRow>
                        <VCol cols="12" sm="6" md="3">
                          <VTextField
                            v-model.number="maxWorkHoursRollingWeekMaxHours"
                            label="Maximum Hours (7 days)"
                            type="number"
                            min="0"
                            step="0.5"
                            :rules="[
                              (v: number) => v >= 0 || 'Must be 0 or greater',
                            ]"
                          />
                        </VCol>
                        <VCol cols="12" sm="6" md="3">
                          <VSelect
                            v-model="maxWorkHoursRollingWeekEnforcement"
                            :items="enforcementOptions"
                            label="Enforcement"
                            hint="Off: No filtering | Flexible: Block if limit already exceeded | Hard: Block if would exceed limit"
                            persistent-hint
                          />
                        </VCol>
                        <VCol cols="12" sm="6" md="3">
                          <VSelect
                            v-model="maxWorkHoursRollingWeekDirection"
                            :items="rollingWeekDirectionOptions"
                            label="Direction"
                            hint="How the 7-day window is calculated relative to appointment date"
                            persistent-hint
                          />
                        </VCol>
                      </VRow>
                    </VExpansionPanelText>
                  </VExpansionPanel>
                </VExpansionPanels>
                
                <!-- Help text -->
                <div class="text-caption mt-2 pa-2" style="background-color: rgba(0,0,0,0.05); border-radius: 4px; font-size: 0.75rem;">
                  <strong>Enforcement:</strong> Off = No filtering | Flexible = Block if limit already exceeded | Hard = Block if would exceed limit
                </div>
                
                <!-- Action Buttons -->
                <div class="d-flex gap-2 mt-4">
                  <VBtn
                    type="submit"
                    color="primary"
                    :loading="saving"
                    :disabled="saving"
                  >
                    Save Settings
                  </VBtn>
                </div>
              </VWindowItem>
              
              <!-- Overlap Tab -->
              <VWindowItem key="overlap" value="overlap">
                <!-- Overlap Constraints Expansion Panels -->
                <VExpansionPanels class="mb-4">
                  <!-- Appointment Buffers -->
                  <VExpansionPanel title="Appointment Buffers">
                    <VExpansionPanelText>
                      <VRow>
                        <VCol cols="12" sm="6" md="3">
                          <VTextField
                            v-model.number="buffersAppointmentMinutes"
                            label="Buffer Time (minutes)"
                            type="number"
                            min="0"
                            step="5"
                            hint="Time to add around candidate appointments when checking availability"
                            persistent-hint
                            :rules="[
                              (v: number) => v >= 0 || 'Buffer time must be 0 or greater',
                            ]"
                          />
                        </VCol>
                        <VCol cols="12" sm="6" md="3">
                          <VSelect
                            v-model="buffersAppointmentPlacement"
                            :items="bufferPlacementOptions"
                            label="Placement"
                            hint="Where to apply buffer time: Before (before start), After (after end), Both (before and after), Off (no buffer)"
                            persistent-hint
                          />
                        </VCol>
                        <VCol cols="12" sm="6" md="3">
                          <VSelect
                            v-model="buffersAppointmentEnforcement"
                            :items="enforcementOptions"
                            label="Enforcement"
                            hint="How strictly to enforce buffer: Off (not applied), Flexible (warn), Hard (block)"
                            persistent-hint
                          />
                        </VCol>
                      </VRow>
                    </VExpansionPanelText>
                  </VExpansionPanel>
                  
                  <!-- Drive Time Buffer -->
                  <!-- TODO: Implement Drive Time Buffer UI
                    * When implementing, follow the pattern used for Appointment Buffers above
                    * Use initBuffers() and initDriveTimeBuffer() helper functions (create if needed)
                    * Create computed properties with getters/setters for driveTime minutes/placement/enforcement (similar to buffersAppointmentMinutes, buffersAppointmentPlacement, buffersAppointmentEnforcement)
                    * Use VTextField for minutes, VSelect for placement and enforcement (reuse bufferPlacementOptions and enforcementOptions)
                    * Reference: formData.value.buffers?.driveTime structure matches BufferConfig interface
                    * See: client/src/configs/availabilitySettings.ts for BufferConfig interface (type: 'driveTime', minutes, placement, enforcement)
                    * Use the useAvailabilitySettings composable's formData, saveSettings, and validation patterns
                    * Drive time buffers add travel time between appointments to prevent scheduling conflicts
                  -->
                  <VExpansionPanel title="Drive Time Buffer">
                    <VExpansionPanelText>
                      <VAlert type="info" variant="tonal">
                        <div class="text-body-2">Not Set-up</div>
                        <div class="text-caption mt-1">
                          Drive time buffers add travel time between appointments to prevent scheduling conflicts when appointments are at different locations.
                        </div>
                      </VAlert>
                    </VExpansionPanelText>
                  </VExpansionPanel>
                  
                  <!-- Lunch Buffer -->
                  <!-- TODO: Implement Lunch Buffer UI
                    * When implementing, follow the pattern used for Appointment Buffers above
                    * Use initBuffers() and initLunchBuffer() helper functions (create if needed)
                    * Create computed properties with getters/setters for lunch minutes/placement/enforcement (similar to buffersAppointmentMinutes, buffersAppointmentPlacement, buffersAppointmentEnforcement)
                    * Use VTextField for minutes, VSelect for placement and enforcement (reuse bufferPlacementOptions and enforcementOptions)
                    * Reference: formData.value.buffers?.lunch structure matches BufferConfig interface
                    * See: client/src/configs/availabilitySettings.ts for BufferConfig interface (type: 'lunch', minutes, placement, enforcement)
                    * Use the useAvailabilitySettings composable's formData, saveSettings, and validation patterns
                    * Lunch buffers block time for lunch breaks to prevent scheduling during meal times
                  -->
                  <VExpansionPanel title="Lunch Buffer">
                    <VExpansionPanelText>
                      <VAlert type="info" variant="tonal">
                        <div class="text-body-2">Not Set-up</div>
                        <div class="text-caption mt-1">
                          Lunch buffers block time for lunch breaks to prevent scheduling appointments during meal times.
                        </div>
                      </VAlert>
                    </VExpansionPanelText>
                  </VExpansionPanel>
                </VExpansionPanels>
                
                <!-- Help text -->
                <div class="text-caption mt-2 pa-2" style="background-color: rgba(0,0,0,0.05); border-radius: 4px; font-size: 0.75rem;">
                  <strong>Placement:</strong> Off = No buffer | Before = Gap before | After = Gap after | Both = Gaps both sides. <strong>Enforcement:</strong> Off = Not applied | Flexible = Warn | Hard = Block
                </div>
              
              <!-- Action Buttons -->
              <div class="d-flex gap-2 mt-4">
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
            </VWindowItem>
            </VWindow>
          </VExpansionPanelText>
        </VExpansionPanel>
        
        <!-- Calendar Panel -->
        <VExpansionPanel title="Calendar">
          <VExpansionPanelText>
            <!-- Time Increment -->
            <div class="mb-6">
              <div class="text-subtitle-1 mb-3">Time Increment</div>
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
            </div>
            
            <!-- Timezone Settings -->
            <div class="mb-4">
              <div class="text-subtitle-1 mb-3">Timezone Settings</div>
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
                Current selection: {{ formData.timezone || 'Not set' }}
              </div>
            </div>
            
            <!-- Action Buttons -->
            <div class="d-flex gap-2 mt-4">
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
          </VExpansionPanelText>
        </VExpansionPanel>
      </VExpansionPanels>
    </VForm>
  </div>
</template>

<style scoped>
.business-controls-tab {
  padding: 1rem;
}
</style>

