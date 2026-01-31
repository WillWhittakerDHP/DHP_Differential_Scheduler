<!--
  LEARNING: Business Controls Tab Component
  WHY: Allows admin to configure availability settings (business hours, time increments, lead time)
  PATTERN: Form with validation, API integration for loading/saving settings
  COMPARISON: React uses Ant Design Form. Vue uses Vuetify VForm with validation
  RESOURCE: https://vuetifyjs.com/en/components/forms/
-->
<script setup lang="ts">
import { computed } from 'vue'
import { useAvailabilitySettings, calculateMaxBusinessHours } from '@/composables/admin/useAvailabilitySettings'
import { useTabNavigation } from '@/composables/admin/useTabNavigation'
import { DAY_NAMES, TIME_INCREMENT_OPTIONS, TIMEZONE_OPTIONS } from '@/constants/availabilitySettings'
import { useLocalTime } from '@/composables/useLocalTime'
import type { BusinessHoursConfig, AvailabilitySettings } from '@/configs/availabilitySettings'
import { BUSINESS_CONTROLS_TAB_STRINGS } from '@/configs/businessControlsTabStrings'
import { useGlobal } from '@/composables/useGlobal'
import { getAllUserTypeBlockIds } from '@/utils/eventAttendeeUtils'
import type { GlobalEntityId } from '@/types/entities'

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

// LEARNING: Use centralized UI strings from config
// WHY: Reduces hardcoding audit findings, centralizes all UI text for consistency
// PATTERN: Import UI strings from config file instead of defining in component
const UI_STRINGS = BUSINESS_CONTROLS_TAB_STRINGS

// LEARNING: Create computed properties for business hours in HH:mm format for UI
// WHY: Time inputs expect HH:mm format, but formData stores RFC3339 internally
// PATTERN: Functional transform using map instead of for loop (audit compliance)
const businessHoursForUI = computed(() => {
  if (!formData.value) {
    return {} as Record<number, { start: string; end: string }>
  }
  
  const currentFormData = formData.value
  
  // LEARNING: Use functional map instead of for loop
  // WHY: Aligns with functional-mutations rule, avoids mutation in loops
  // PATTERN: Array.from with map to create new object
  return Object.fromEntries(
    Array.from({ length: 7 }, (_, day) => {
      const dayHours = currentFormData.businessHours[day as keyof typeof currentFormData.businessHours]
      return [
        day,
        {
          start: rfc3339ToBusinessHoursHHmm(dayHours.start),
          end: rfc3339ToBusinessHoursHHmm(dayHours.end)
        }
      ]
    })
  ) as Record<number, { start: string; end: string }>
})

// LEARNING: Helper to safely access business hours config
// WHY: Type narrowing for RangeConstraint.config to access hours property
// PATTERN: Type guard function that checks if config is BusinessHoursConfig
const isBusinessHoursConfig = (config: BusinessHoursConfig | { minutes: number } | { start: string; end: string }): config is BusinessHoursConfig => {
  return 'hours' in config
}

// LEARNING: Watch for changes in UI business hours and update RFC3339 formData
// WHY: When user changes time inputs (HH:mm), convert back to RFC3339 for storage
// PATTERN: Function to update formData when UI values change with null safety
const updateBusinessHours = (day: number, field: 'start' | 'end', value: string): void => {
  if (!formData.value) return
  
  const rfc3339Value = businessHoursHHmmToRfc3339(value)
  // LEARNING: Update both top-level businessHours and rangeConstraints.businessHours.config.hours
  // WHY: Slot generation reads from rangeConstraints.businessHours.config.hours, so both must stay in sync
  // PATTERN: Update both locations to ensure consistency with type narrowing
  formData.value.businessHours[day as keyof typeof formData.value.businessHours][field] = rfc3339Value
  
  const businessHoursConstraint = formData.value.rangeConstraints?.businessHours
  if (businessHoursConstraint && isBusinessHoursConfig(businessHoursConstraint.config)) {
    businessHoursConstraint.config.hours[day as keyof typeof businessHoursConstraint.config.hours][field] = rfc3339Value
  }
}

// LEARNING: Tab navigation for main tabs (Constraints and Calendar)
// WHY: Provides tabbed interface for switching between main sections
// PATTERN: Use tab navigation composable for state management
const { currentTab: currentMainTab } = useTabNavigation({ initialTab: 'constraints' })

// LEARNING: Tab navigation for subtabs (Constraints)
// WHY: Provides tabbed interface for switching between different constraint types
// PATTERN: Use tab navigation composable for state management
const { currentTab: currentSubTab } = useTabNavigation({ initialTab: 'range' })

// LEARNING: Tab navigation for Calendar panel subtabs
// WHY: Provides tabbed interface for Duration Rounding, Timezone, and Grid (Slot Increment moved to Grid tab)
// PATTERN: Use tab navigation composable for state management
const { currentTab: currentCalendarTab } = useTabNavigation({ initialTab: 'rounding' })

// LEARNING: Get global data for UserTypeBlock selection
// WHY: Need to display available UserTypeBlock instances for major/minor attendee configuration
// PATTERN: Use useGlobal composable to access global entities
const { getGlobalData, getGlobalEntities } = useGlobal()

// LEARNING: Get available UserTypeBlock instances for attendee selection
// WHY: Provides list of all state control blocks (UserTypeBlocks) for major/minor configuration
// PATTERN: Filter BlockInstances by blockShape.isStateControl
const availableUserTypeBlocks = computed(() => {
  const globalData = getGlobalData()
  if (!globalData) return []
  
  const userTypeBlockIds = getAllUserTypeBlockIds(globalData)
  const blockInstances = getGlobalEntities('blockInstance')
  
  return userTypeBlockIds
    .map(id => blockInstances.find(bi => bi.id === id))
    .filter((bi): bi is NonNullable<typeof bi> => bi !== undefined)
    .map(bi => ({
      id: bi.id,
      title: bi.name || `Block ${bi.id}`,
      value: bi.id
    }))
})

// LEARNING: Computed properties for major/minor attendee selection
// WHY: Provides v-model bindings for multi-select components
// PATTERN: Computed with getter/setter for two-way binding
const majorAttendees = computed({
  get: () => formData.value?.differentialPerspectives?.majorAttendees || [],
  set: (value: GlobalEntityId[]) => {
    if (!formData.value) return
    if (!formData.value.differentialPerspectives) {
      formData.value.differentialPerspectives = {}
    }
    formData.value.differentialPerspectives.majorAttendees = value
  }
})

const minorAttendees = computed({
  get: () => formData.value?.differentialPerspectives?.minorAttendees || [],
  set: (value: GlobalEntityId[]) => {
    if (!formData.value) return
    if (!formData.value.differentialPerspectives) {
      formData.value.differentialPerspectives = {}
    }
    formData.value.differentialPerspectives.minorAttendees = value
  }
})

const majorLabel = computed({
  get: () => formData.value?.differentialPerspectives?.majorLabel || 'Inspector',
  set: (value: string) => {
    if (!formData.value) return
    if (!formData.value.differentialPerspectives) {
      formData.value.differentialPerspectives = {}
    }
    formData.value.differentialPerspectives.majorLabel = value
  }
})

const minorLabel = computed({
  get: () => formData.value?.differentialPerspectives?.minorLabel || 'Minor Formal Presentation',
  set: (value: string) => {
    if (!formData.value) return
    if (!formData.value.differentialPerspectives) {
      formData.value.differentialPerspectives = {}
    }
    formData.value.differentialPerspectives.minorLabel = value
  }
})

const differentialGraphDefaultLabel = computed({
  get: () => formData.value?.differentialPerspectives?.differentialGraphDefaultLabel || 'Select a Time Slot',
  set: (value: string) => {
    if (!formData.value) return
    if (!formData.value.differentialPerspectives) {
      formData.value.differentialPerspectives = {}
    }
    formData.value.differentialPerspectives.differentialGraphDefaultLabel = value
  }
})

const majorStateLabel = computed({
  get: () => formData.value?.differentialPerspectives?.majorStateLabel || '',
  set: (value: string) => {
    if (!formData.value) return
    if (!formData.value.differentialPerspectives) {
      formData.value.differentialPerspectives = {}
    }
    formData.value.differentialPerspectives.majorStateLabel = value
  }
})

const minorStateLabel = computed({
  get: () => formData.value?.differentialPerspectives?.minorStateLabel || '',
  set: (value: string) => {
    if (!formData.value) return
    if (!formData.value.differentialPerspectives) {
      formData.value.differentialPerspectives = {}
    }
    formData.value.differentialPerspectives.minorStateLabel = value
  }
})

// LEARNING: Computed max business hours for workHoursLimit hint
// WHY: Provides default value for workHoursLimit if not configured
// PATTERN: Null-safe computed with early return
const maxBusinessHours = computed(() => {
  if (!formData.value) return 0
  return calculateMaxBusinessHours(formData.value.businessHours)
})

// LEARNING: Generic helper to create computed properties for optional nested form data
// WHY: Eliminates duplication across 11+ similar computed properties, prevents double ensure calls
// PATTERN: Factory function that generates computed properties with consistent get/set pattern
function createNestedComputed<TValue, TParent>(
  options: {
    getValue: () => TValue | undefined
    getDefault: () => TValue
    getCurrentParent: () => TParent | undefined
    ensureParent: (current: TParent | undefined) => TParent
    updateWithValue: (ensuredParent: TParent, value: TValue) => TParent
    setParent: (parent: TParent) => void
  }
) {
  return computed({
    get: () => {
      const value = options.getValue()
      return value !== undefined ? value : options.getDefault()
    },
    set: (value: TValue) => {
      if (!formData.value) return
      const currentParent = options.getCurrentParent()
      const ensuredParent = options.ensureParent(currentParent)
      const updatedParent = options.updateWithValue(ensuredParent, value)
      options.setParent(updatedParent)
    }
  })
}

// LEARNING: Helper functions to initialize capacity filters using functional patterns
// WHY: Ensures formData has proper structure when user starts configuring filters
// PATTERN: Pure builder functions that return new objects instead of mutating
type MaxWorkHours = NonNullable<AvailabilitySettings['maxWorkHours']>
const ensureMaxWorkHours = (current: MaxWorkHours | undefined) => {
  return current || {}
}

// LEARNING: Generic helper to ensure nested object exists in parent
// WHY: Eliminates duplication across ensure functions (maxWorkHours, buffers, rangeConstraints)
// PATTERN: Factory function that ensures parent exists, then ensures child key exists with defaults
function createEnsureNested<TParent extends Record<string, unknown>>(
  ensureParent: (current: TParent | undefined) => TParent,
  key: string,
  createDefault: () => unknown,
  ensureAdditional?: (current: TParent) => TParent
) {
  return (current: TParent | undefined): TParent => {
    const parent = ensureParent(current)
    if (!parent[key]) {
      const updated = {
        ...parent,
        [key]: createDefault()
      } as TParent
      return ensureAdditional ? ensureAdditional(updated) : updated
    }
    return ensureAdditional ? ensureAdditional(parent) : parent
  }
}

// LEARNING: Specialized helper for maxWorkHours computed properties
// WHY: Eliminates repetition across 6 similar maxWorkHours computed properties
// PATTERN: Factory function that handles maxWorkHours parent/setter pattern
function createMaxWorkHoursComputed<TValue, TFilter extends 'day' | 'calendarWeek' | 'rollingWeek'>(
  filter: TFilter,
  property: string,
  getDefault: () => TValue,
  ensureFunction: (current: MaxWorkHours | undefined) => MaxWorkHours
) {
  return createNestedComputed<TValue, MaxWorkHours>({
    getValue: () => {
      const filterValue = formData.value?.maxWorkHours?.[filter]
      if (!filterValue) return undefined
      return (filterValue as unknown as Record<string, TValue>)[property]
    },
    getDefault,
    getCurrentParent: () => formData.value?.maxWorkHours,
    ensureParent: ensureFunction,
    updateWithValue: (parent, value) => ({
      ...parent,
      [filter]: {
        ...parent[filter]!,
        [property]: value
      } as MaxWorkHours[TFilter]
    }),
    setParent: (parent) => {
      if (formData.value) formData.value.maxWorkHours = parent
    }
  })
}

const ensureWorkHoursPerDay = createEnsureNested(
  ensureMaxWorkHours,
  'day',
  () => ({
    maxHours: maxBusinessHours.value,
    enforcement: 'off' as const
  })
)

const ensureCalendarWeekLimit = createEnsureNested(
  ensureMaxWorkHours,
  'calendarWeek',
  () => ({
    maxHours: maxBusinessHours.value * 7,
    enforcement: 'off' as const
  })
)

const ensureRollingWeekLimit = createEnsureNested(
  ensureMaxWorkHours,
  'rollingWeek',
  () => ({
    maxHours: maxBusinessHours.value * 7,
    enforcement: 'off' as const,
    direction: 'past' as const
  }),
  (parent) => {
    // Ensure direction exists even if rollingWeek already exists
    if (parent.rollingWeek && !parent.rollingWeek.direction) {
      return {
        ...parent,
        rollingWeek: {
          ...parent.rollingWeek,
          direction: 'past' as const
        }
      }
    }
    return parent
  }
)

// LEARNING: Computed properties with getters/setters for capacity filter values
// WHY: v-model requires valid member expressions, can't use optional chaining
// PATTERN: Use specialized helper to eliminate repetition across maxWorkHours properties
const maxWorkHoursDayMaxHours = createMaxWorkHoursComputed('day', 'maxHours', () => maxBusinessHours.value, ensureWorkHoursPerDay)
const maxWorkHoursDayEnforcement = createMaxWorkHoursComputed('day', 'enforcement', () => 'off' as const, ensureWorkHoursPerDay)

const maxWorkHoursCalendarWeekMaxHours = createMaxWorkHoursComputed('calendarWeek', 'maxHours', () => maxBusinessHours.value * 7, ensureCalendarWeekLimit)
const maxWorkHoursCalendarWeekEnforcement = createMaxWorkHoursComputed('calendarWeek', 'enforcement', () => 'off' as const, ensureCalendarWeekLimit)

const maxWorkHoursRollingWeekMaxHours = createMaxWorkHoursComputed('rollingWeek', 'maxHours', () => maxBusinessHours.value * 7, ensureRollingWeekLimit)
const maxWorkHoursRollingWeekEnforcement = createMaxWorkHoursComputed('rollingWeek', 'enforcement', () => 'off' as const, ensureRollingWeekLimit)
const maxWorkHoursRollingWeekDirection = createMaxWorkHoursComputed('rollingWeek', 'direction', () => 'past' as const, ensureRollingWeekLimit)

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

// Buffer placement options (for appointment buffer placement)
const bufferPlacementOptions = [
  { title: 'Off', value: 'off' },
  { title: 'Before', value: 'before' },
  { title: 'After', value: 'after' },
  { title: 'Both', value: 'both' }
]

// LEARNING: Helper functions to initialize buffers using functional patterns
// WHY: Ensures formData has proper structure when user starts configuring buffers
// PATTERN: Pure builder functions that return new objects instead of mutating
type Buffers = NonNullable<AvailabilitySettings['buffers']>
const ensureBuffers = (current: Buffers | undefined) => {
  return current || {}
}

// LEARNING: Specialized helper for buffer computed properties
// WHY: Eliminates repetition across buffer computed properties (minutes/placement/enforcement)
// PATTERN: Factory function that handles buffers parent/setter pattern
function createBuffersComputed<TValue>(
  bufferType: keyof Buffers,
  property: string,
  getDefault: () => TValue,
  ensureFunction: (current: Buffers | undefined) => Buffers
) {
  return createNestedComputed<TValue, Buffers>({
    getValue: () => {
      const bufferValue = formData.value?.buffers?.[bufferType]
      if (!bufferValue) return undefined
      return (bufferValue as unknown as Record<string, TValue>)[property]
    },
    getDefault,
    getCurrentParent: () => formData.value?.buffers,
    ensureParent: ensureFunction,
    updateWithValue: (parent, value) => ({
      ...parent,
      [bufferType]: {
        ...parent[bufferType]!,
        [property]: value
      }
    } as Buffers),
    setParent: (parent) => {
      if (formData.value) formData.value.buffers = parent
    }
  })
}

const ensureAppointmentBuffer = createEnsureNested(
  ensureBuffers,
  'appointment',
  () => ({
    type: 'appointment' as const,
    minutes: 0,
    placement: 'off' as const,
    enforcement: 'hard' as const
  })
)

// LEARNING: Helper functions to initialize range constraints using functional patterns
// WHY: Ensures formData has proper structure when user starts configuring range constraints
// PATTERN: Pure builder functions that return new objects instead of mutating
type RangeConstraints = NonNullable<AvailabilitySettings['rangeConstraints']>
const ensureRangeConstraints = (current: RangeConstraints | undefined) => {
  return current || {}
}

const ensureLeadTimeConstraint = createEnsureNested(
  ensureRangeConstraints,
  'leadTime',
  () => ({
    type: 'leadTime' as const,
    enforcement: 'hard' as const,
    config: {
      minutes: 60 // Default 1 hour
    }
  })
)

// LEARNING: Computed properties for range constraint settings
// WHY: v-model requires valid member expressions, handle optional nested objects
// PATTERN: Use generic helper to eliminate duplication and double ensure calls
const rangeConstraintsLeadTimeMinutes = createNestedComputed({
  getValue: () => {
    const leadTime = formData.value?.rangeConstraints?.leadTime
    if (leadTime && leadTime.type === 'leadTime' && 'minutes' in leadTime.config) {
      return leadTime.config.minutes
    }
    return undefined
  },
  getDefault: () => 60, // Default 1 hour
  getCurrentParent: () => formData.value?.rangeConstraints,
  ensureParent: ensureLeadTimeConstraint,
  updateWithValue: (parent, value) => ({
    ...parent,
    leadTime: {
      ...parent.leadTime!,
      type: 'leadTime' as const,
      enforcement: parent.leadTime!.enforcement,
      config: {
        minutes: value
      }
    }
  }),
  setParent: (parent) => {
    if (formData.value) formData.value.rangeConstraints = parent
  }
})

// LEARNING: Computed properties for buffer settings
// WHY: v-model requires valid member expressions, handle optional nested objects
// PATTERN: Use specialized helper to eliminate repetition across buffer properties
const buffersAppointmentMinutes = createBuffersComputed('appointment', 'minutes', () => 0, ensureAppointmentBuffer)
const buffersAppointmentPlacement = createBuffersComputed('appointment', 'placement', () => 'off' as const, ensureAppointmentBuffer)
const buffersAppointmentEnforcement = createBuffersComputed('appointment', 'enforcement', () => 'hard' as const, ensureAppointmentBuffer)

// LEARNING: Save button props computed for reuse
// WHY: Save button appears multiple times with identical props - extract to computed for DRY
// PATTERN: Computed object that can be spread into VBtn component
const saveButtonProps = computed(() => ({
  type: 'submit' as const,
  color: 'primary' as const,
  loading: saving.value,
  disabled: saving.value
}))

// Expose constants for template use
const dayNames = DAY_NAMES
const timeIncrementOptions = TIME_INCREMENT_OPTIONS
const timezoneOptions = TIMEZONE_OPTIONS

// LEARNING: Rounding increment options
// WHY: Provides predefined options for rounding increment selection
// PATTERN: Array of objects with title and value for VSelect
const roundingIncrementOptions = [
  { title: '5 minutes', value: 5 },
  { title: '10 minutes', value: 10 },
  { title: '15 minutes', value: 15 },
  { title: '30 minutes', value: 30 },
  { title: '60 minutes', value: 60 }
]

// LEARNING: Rounding method options
// WHY: Provides predefined options for rounding method selection
// PATTERN: Array of objects with title and value for VSelect
const roundingMethodOptions = [
  { title: 'Round Up', value: 'roundUp' },
  { title: 'Round Down', value: 'roundDown' },
  { title: 'Round Nearest', value: 'roundNearest' }
]
</script>

<template>
  <div class="business-controls-tab">
    <!-- Loading state -->
    <div v-if="loading" class="text-center py-4">
      <VProgressCircular indeterminate color="primary" />
      <div class="mt-2">{{ UI_STRINGS.loading }}</div>
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
      
      <!-- LEARNING: Main tabs for Controls sections -->
      <!-- WHY: Provides tabbed interface for switching between Constraints and Calendar -->
      <!-- PATTERN: VTabs/VWindow pattern matching DataManagementTab and other admin tabs -->
      <VTabs v-model="currentMainTab" class="mb-4">
        <VTab value="constraints">{{ UI_STRINGS.tabs.constraints }}</VTab>
        <VTab value="calendar">{{ UI_STRINGS.tabs.calendar }}</VTab>
      </VTabs>
      
      <VWindow v-model="currentMainTab">
        <!-- Constraints Tab -->
        <VWindowItem key="constraints" value="constraints">
          <!-- LEARNING: Subtabs for Constraints sections -->
          <!-- WHY: Provides tabbed interface for switching between different constraint types -->
          <!-- PATTERN: VTabs/VWindow pattern matching DataManagementTab -->
          <VTabs v-model="currentSubTab" class="mb-4">
            <VTab value="range">{{ UI_STRINGS.tabs.range }}</VTab>
            <VTab value="capacity">{{ UI_STRINGS.tabs.capacity }}</VTab>
            <VTab value="overlap">{{ UI_STRINGS.tabs.overlap }}</VTab>
          </VTabs>
          
          <VWindow v-model="currentSubTab">
              <!-- Range Tab -->
              <VWindowItem key="range" value="range">
                <!-- Range Constraints Expansion Panels -->
                <VExpansionPanels class="mb-4">
                  <!-- Business Hours -->
                  <VExpansionPanel :title="UI_STRINGS.panels.businessHours">
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
                              :model-value="businessHoursForUI[(day - 1) as keyof typeof businessHoursForUI]?.start"
                              @update:model-value="(v: string) => updateBusinessHours(day - 1, 'start', v)"
                              :label="UI_STRINGS.labels.startTime"
                              type="time"
                              required
                              :rules="[
                                (v: string) => !!v || UI_STRINGS.validation.startTimeRequired,
                                (v: string) => /^\d{2}:\d{2}$/.test(v) || UI_STRINGS.validation.invalidTimeFormat,
                              ]"
                            />
                          </VCol>
                          <VCol cols="12" sm="6" md="4">
                            <VTextField
                              :model-value="businessHoursForUI[(day - 1) as keyof typeof businessHoursForUI]?.end"
                              @update:model-value="(v: string) => updateBusinessHours(day - 1, 'end', v)"
                              :label="UI_STRINGS.labels.endTime"
                              type="time"
                              required
                              :rules="[
                                (v: string) => !!v || UI_STRINGS.validation.endTimeRequired,
                                (v: string) => /^\d{2}:\d{2}$/.test(v) || UI_STRINGS.validation.invalidTimeFormat,
                              ]"
                            />
                          </VCol>
                        </VRow>
                      </div>
                    </VExpansionPanelText>
                  </VExpansionPanel>
                  
                  <!-- Lead Time Constraint -->
                  <VExpansionPanel :title="UI_STRINGS.panels.leadTimeConstraint">
                    <VExpansionPanelText>
                      <VTextField
                        v-model.number="rangeConstraintsLeadTimeMinutes"
                        :label="UI_STRINGS.labels.minimumLeadTime"
                        type="number"
                        min="0"
                        required
                        :rules="[
                          (v: number) => v !== null && v !== undefined || UI_STRINGS.validation.leadTimeRequired,
                          (v: number) => v >= 0 || UI_STRINGS.validation.leadTimeMin,
                        ]"
                      />
                      <div class="text-caption mt-2">
                        {{ UI_STRINGS.help.leadTimeDescription }} {{ rangeConstraintsLeadTimeMinutes }} {{ UI_STRINGS.help.leadTimeMinutes }}
                        ({{ Math.round(rangeConstraintsLeadTimeMinutes / 60 * 10) / 10 }} {{ UI_STRINGS.help.leadTimeHours }})
                      </div>
                      <div class="text-caption mt-1" style="color: rgba(0,0,0,0.6);">
                        {{ UI_STRINGS.help.leadTimeFilter }}
                      </div>
                    </VExpansionPanelText>
                  </VExpansionPanel>
                  
                  <!-- Date Range Constraint -->
                  <!-- TODO: Implement Date Range Constraint UI
                    * When implementing, follow the pattern used for Lead Time Constraint above
                    * Use ensureRangeConstraints() and ensureDateRangeConstraint() helper functions (create if needed)
                    * Create computed properties with getters/setters for dateRange start/end dates (similar to rangeConstraintsLeadTimeMinutes)
                    * Use VTextField with type="datetime-local" or VDatePicker/VTimePicker components for date/time input
                    * Convert between RFC3339 format (stored in formData) and local datetime format (for UI)
                    * Reference: formData.value.rangeConstraints?.dateRange structure matches RangeConstraint interface
                    * See: client/src/configs/availabilitySettings.ts for DateRangeConfig interface (start: string, end: string RFC3339)
                    * Use the useAvailabilitySettings composable's formData, saveSettings, and validation patterns
                  -->
                  <VExpansionPanel :title="UI_STRINGS.panels.dateRangeConstraint">
                    <VExpansionPanelText>
                      <VAlert type="info" variant="tonal">
                        <div class="text-body-2">{{ UI_STRINGS.help.dateRangeNotSetup }}</div>
                        <div class="text-caption mt-1">
                          {{ UI_STRINGS.help.dateRangeDescription }}
                        </div>
                      </VAlert>
                    </VExpansionPanelText>
                  </VExpansionPanel>
                </VExpansionPanels>
                
                <!-- Help text -->
                <div class="text-caption mt-2 pa-2" style="background-color: rgba(0,0,0,0.05); border-radius: 4px; font-size: 0.75rem;">
                  {{ UI_STRINGS.help.rangeConstraints }}
                </div>
                
                <!-- Action Buttons -->
                <div class="d-flex gap-2 mt-4">
                  <VBtn v-bind="saveButtonProps">
                    {{ UI_STRINGS.buttons.saveSettings }}
                  </VBtn>
                </div>
              </VWindowItem>
              
              <!-- Capacity Tab -->
              <VWindowItem key="capacity" value="capacity">
                <!-- Capacity Constraints Expansion Panels -->
                <VExpansionPanels class="mb-4">
                  <!-- Per Day Limit -->
                  <VExpansionPanel :title="UI_STRINGS.panels.perDayLimit">
                    <VExpansionPanelText>
                      <VRow>
                        <VCol cols="12" sm="6" md="4">
                          <VTextField
                            v-model.number="maxWorkHoursDayMaxHours"
                            :label="UI_STRINGS.labels.maximumHoursPerDay"
                            type="number"
                            min="0"
                            max="24"
                            step="0.5"
                            :rules="[
                              (v: number) => v >= 0 || UI_STRINGS.validation.mustBeZeroOrGreater,
                              (v: number) => v <= 24 || UI_STRINGS.validation.cannotExceed24Hours,
                            ]"
                          />
                        </VCol>
                        <VCol cols="12" sm="6" md="4">
                          <VSelect
                            v-model="maxWorkHoursDayEnforcement"
                            :items="enforcementOptions"
                            :label="UI_STRINGS.labels.enforcement"
                            :hint="UI_STRINGS.hints.enforcement"
                            persistent-hint
                          />
                        </VCol>
                      </VRow>
                    </VExpansionPanelText>
                  </VExpansionPanel>
                  
                  <!-- Calendar Week Limit -->
                  <VExpansionPanel :title="UI_STRINGS.panels.calendarWeekLimit">
                    <VExpansionPanelText>
                      <VRow>
                        <VCol cols="12" sm="6" md="4">
                          <VTextField
                            v-model.number="maxWorkHoursCalendarWeekMaxHours"
                            :label="UI_STRINGS.labels.maximumHoursPerWeek"
                            type="number"
                            min="0"
                            step="0.5"
                            :rules="[
                              (v: number) => v >= 0 || UI_STRINGS.validation.mustBeZeroOrGreater,
                            ]"
                          />
                        </VCol>
                        <VCol cols="12" sm="6" md="4">
                          <VSelect
                            v-model="maxWorkHoursCalendarWeekEnforcement"
                            :items="enforcementOptions"
                            :label="UI_STRINGS.labels.enforcement"
                            :hint="UI_STRINGS.hints.enforcement"
                            persistent-hint
                          />
                        </VCol>
                      </VRow>
                    </VExpansionPanelText>
                  </VExpansionPanel>
                  
                  <!-- Rolling Week Limit -->
                  <VExpansionPanel :title="UI_STRINGS.panels.rollingWeekLimit">
                    <VExpansionPanelText>
                      <VRow>
                        <VCol cols="12" sm="6" md="3">
                          <VTextField
                            v-model.number="maxWorkHoursRollingWeekMaxHours"
                            :label="UI_STRINGS.labels.maximumHours7Days"
                            type="number"
                            min="0"
                            step="0.5"
                            :rules="[
                              (v: number) => v >= 0 || UI_STRINGS.validation.mustBeZeroOrGreater,
                            ]"
                          />
                        </VCol>
                        <VCol cols="12" sm="6" md="3">
                          <VSelect
                            v-model="maxWorkHoursRollingWeekEnforcement"
                            :items="enforcementOptions"
                            :label="UI_STRINGS.labels.enforcement"
                            :hint="UI_STRINGS.hints.enforcement"
                            persistent-hint
                          />
                        </VCol>
                        <VCol cols="12" sm="6" md="3">
                          <VSelect
                            v-model="maxWorkHoursRollingWeekDirection"
                            :items="rollingWeekDirectionOptions"
                            :label="UI_STRINGS.labels.direction"
                            :hint="UI_STRINGS.hints.direction"
                            persistent-hint
                          />
                        </VCol>
                      </VRow>
                    </VExpansionPanelText>
                  </VExpansionPanel>
                </VExpansionPanels>
                
                <!-- Help text -->
                <div class="text-caption mt-2 pa-2" style="background-color: rgba(0,0,0,0.05); border-radius: 4px; font-size: 0.75rem;">
                  {{ UI_STRINGS.help.enforcement }}
                </div>
                
                <!-- Action Buttons -->
                <div class="d-flex gap-2 mt-4">
                  <VBtn v-bind="saveButtonProps">
                    {{ UI_STRINGS.buttons.saveSettings }}
                  </VBtn>
                </div>
              </VWindowItem>
              
              <!-- Overlap Tab -->
              <VWindowItem key="overlap" value="overlap">
                <!-- Overlap Constraints Expansion Panels -->
                <VExpansionPanels class="mb-4">
                  <!-- Appointment Buffers -->
                  <VExpansionPanel :title="UI_STRINGS.panels.appointmentBuffers">
                    <VExpansionPanelText>
                      <VRow>
                        <VCol cols="12" sm="6" md="3">
                          <VTextField
                            v-model.number="buffersAppointmentMinutes"
                            :label="UI_STRINGS.labels.bufferTime"
                            type="number"
                            min="0"
                            step="5"
                            :hint="UI_STRINGS.hints.bufferTime"
                            persistent-hint
                            :rules="[
                              (v: number) => v >= 0 || UI_STRINGS.validation.bufferTimeMin,
                            ]"
                          />
                        </VCol>
                        <VCol cols="12" sm="6" md="3">
                          <VSelect
                            v-model="buffersAppointmentPlacement"
                            :items="bufferPlacementOptions"
                            :label="UI_STRINGS.labels.placement"
                            :hint="UI_STRINGS.hints.placement"
                            persistent-hint
                          />
                        </VCol>
                        <VCol cols="12" sm="6" md="3">
                          <VSelect
                            v-model="buffersAppointmentEnforcement"
                            :items="enforcementOptions"
                            :label="UI_STRINGS.labels.enforcement"
                            :hint="UI_STRINGS.hints.bufferEnforcement"
                            persistent-hint
                          />
                        </VCol>
                      </VRow>
                    </VExpansionPanelText>
                  </VExpansionPanel>
                  
                  <!-- Drive Time Buffer -->
                  <!-- TODO: Implement Drive Time Buffer UI
                    * When implementing, follow the pattern used for Appointment Buffers above
                    * Use ensureBuffers() and ensureDriveTimeBuffer() helper functions (create if needed)
                    * Create computed properties with getters/setters for driveTime minutes/placement/enforcement (similar to buffersAppointmentMinutes, buffersAppointmentPlacement, buffersAppointmentEnforcement)
                    * Use VTextField for minutes, VSelect for placement and enforcement (reuse bufferPlacementOptions and enforcementOptions)
                    * Reference: formData.value.buffers?.driveTime structure matches BufferConfig interface
                    * See: client/src/configs/availabilitySettings.ts for BufferConfig interface (type: 'driveTime', minutes, placement, enforcement)
                    * Use the useAvailabilitySettings composable's formData, saveSettings, and validation patterns
                    * Drive time buffers add travel time between appointments to prevent scheduling conflicts
                  -->
                  <VExpansionPanel :title="UI_STRINGS.panels.driveTimeBuffer">
                    <VExpansionPanelText>
                      <VAlert type="info" variant="tonal">
                        <div class="text-body-2">{{ UI_STRINGS.help.driveTimeNotSetup }}</div>
                        <div class="text-caption mt-1">
                          {{ UI_STRINGS.help.driveTimeDescription }}
                        </div>
                      </VAlert>
                    </VExpansionPanelText>
                  </VExpansionPanel>
                  
                  <!-- Lunch Buffer -->
                  <!-- TODO: Implement Lunch Buffer UI
                    * When implementing, follow the pattern used for Appointment Buffers above
                    * Use ensureBuffers() and ensureLunchBuffer() helper functions (create if needed)
                    * Create computed properties with getters/setters for lunch minutes/placement/enforcement (similar to buffersAppointmentMinutes, buffersAppointmentPlacement, buffersAppointmentEnforcement)
                    * Use VTextField for minutes, VSelect for placement and enforcement (reuse bufferPlacementOptions and enforcementOptions)
                    * Reference: formData.value.buffers?.lunch structure matches BufferConfig interface
                    * See: client/src/configs/availabilitySettings.ts for BufferConfig interface (type: 'lunch', minutes, placement, enforcement)
                    * Use the useAvailabilitySettings composable's formData, saveSettings, and validation patterns
                    * Lunch buffers block time for lunch breaks to prevent scheduling during meal times
                  -->
                  <VExpansionPanel :title="UI_STRINGS.panels.lunchBuffer">
                    <VExpansionPanelText>
                      <VAlert type="info" variant="tonal">
                        <div class="text-body-2">{{ UI_STRINGS.help.lunchNotSetup }}</div>
                        <div class="text-caption mt-1">
                          {{ UI_STRINGS.help.lunchDescription }}
                        </div>
                      </VAlert>
                    </VExpansionPanelText>
                  </VExpansionPanel>
                </VExpansionPanels>
                
                <!-- Help text -->
                <div class="text-caption mt-2 pa-2" style="background-color: rgba(0,0,0,0.05); border-radius: 4px; font-size: 0.75rem;">
                  {{ UI_STRINGS.help.placement }}
                </div>
              
              <!-- Action Buttons -->
              <div class="d-flex gap-2 mt-4">
                <VBtn v-bind="saveButtonProps">
                  {{ UI_STRINGS.buttons.saveSettings }}
                </VBtn>
              </div>
            </VWindowItem>
          </VWindow>
        </VWindowItem>
        
        <!-- Calendar Tab -->
        <VWindowItem key="calendar" value="calendar">
          <!-- LEARNING: Subtabs for Calendar sections -->
          <!-- WHY: Provides tabbed interface for switching between Slot Increment, Duration Rounding, and Timezone -->
          <!-- PATTERN: VTabs/VWindow pattern matching Constraints panel -->
          <VTabs v-model="currentCalendarTab" class="mb-4">
            <VTab value="rounding">{{ UI_STRINGS.tabs.rounding }}</VTab>
            <VTab value="timezone">{{ UI_STRINGS.tabs.timezone }}</VTab>
            <VTab value="grid">Grid</VTab>
          </VTabs>
          
          <VWindow v-model="currentCalendarTab">
              
              <!-- Duration Rounding Tab -->
              <VWindowItem key="rounding" value="rounding">
                <div class="mb-6">
                  <div class="text-subtitle-1 mb-3">Duration Rounding</div>
                  <VSwitch
                    v-if="formData && formData.durationRounding"
                    v-model="formData.durationRounding.enabled"
                    :label="UI_STRINGS.labels.enableDurationRounding"
                    class="mb-4"
                  />
                  <div v-if="formData && formData.durationRounding && formData.durationRounding.enabled" class="ml-8">
                    <VSelect
                      v-model="formData.durationRounding.increment"
                      :items="roundingIncrementOptions"
                      :label="UI_STRINGS.labels.roundingIncrement"
                      :hint="UI_STRINGS.hints.roundingIncrement"
                      persistent-hint
                      :rules="[
                        (v: number) => !!v || UI_STRINGS.validation.roundingIncrementRequired,
                      ]"
                      class="mb-4"
                    />
                    <VSelect
                      v-model="formData.durationRounding.method"
                      :items="roundingMethodOptions"
                      :label="UI_STRINGS.labels.roundingMethod"
                      :hint="UI_STRINGS.hints.roundingMethod"
                      persistent-hint
                      class="mb-2"
                    />
                  </div>
                  <div v-if="formData" class="text-caption mt-2">
                    {{ UI_STRINGS.help.durationRoundingDescription }}
                  </div>
                </div>
                
                <!-- Action Buttons -->
                <div class="d-flex gap-2 mt-4">
                  <VBtn v-bind="saveButtonProps">
                    {{ UI_STRINGS.buttons.saveSettings }}
                  </VBtn>
                </div>
              </VWindowItem>
              
              <!-- Timezone Tab -->
              <VWindowItem key="timezone" value="timezone">
                <div class="mb-4">
                  <div class="text-subtitle-1 mb-3">Timezone Settings</div>
                  <VSelect
                    v-if="formData"
                    v-model="formData.timezone"
                    :items="timezoneOptions"
                    :label="UI_STRINGS.labels.timezone"
                    :hint="UI_STRINGS.hints.timezone"
                    persistent-hint
                    :rules="[
                      (v: string) => !!v || UI_STRINGS.validation.timezoneRequired,
                    ]"
                  />
                  <div v-if="formData" class="text-caption mt-2">
                    {{ UI_STRINGS.help.timezone }}
                    {{ UI_STRINGS.help.currentSelection }} {{ formData.timezone || UI_STRINGS.help.notSet }}
                  </div>
                </div>
                
                <!-- Action Buttons -->
                <div class="d-flex gap-2 mt-4">
                  <VBtn v-bind="saveButtonProps">
                    {{ UI_STRINGS.buttons.saveSettings }}
                  </VBtn>
                </div>
              </VWindowItem>
              
              <!-- Grid Tab -->
              <VWindowItem key="grid" value="grid">
                <div class="mb-6">
                  <div class="text-subtitle-1 mb-3">Grid Configuration</div>
                  
                  <!-- Slot Increment Section -->
                  <div class="mb-6">
                    <div class="text-subtitle-2 mb-3">Slot Increment</div>
                    <VSelect
                      v-if="formData"
                      v-model="formData.minuteIncrement"
                      :items="timeIncrementOptions"
                      :label="UI_STRINGS.labels.timeSlotIncrement"
                      required
                      :rules="[(v: number) => !!v || UI_STRINGS.validation.timeIncrementRequired]"
                      class="mb-2"
                    />
                    <div v-if="formData" class="text-caption">
                      {{ UI_STRINGS.help.timeSlots }} {{ formData.minuteIncrement }} minutes
                    </div>
                  </div>
                  
                  <VDivider class="my-6" />
                  
                  <!-- Differential Perspectives Section -->
                  <div class="mb-6">
                    <div class="text-subtitle-2 mb-3">Differential Perspectives</div>
                    <div class="text-body-2 mb-4 text-medium-emphasis">
                      Configure which attendees make an event "major" vs "minor" for differential scheduling, and customize display labels.
                      Major attendees arrive earlier than minor attendees.
                    </div>
                    
                    <VSelect
                      v-model="majorAttendees"
                      :items="availableUserTypeBlocks"
                      label="Major Attendees"
                      hint="UserTypeBlock instances that make an event &quot;major&quot; (e.g., Inspector)"
                      persistent-hint
                      multiple
                      chips
                      closable-chips
                      class="mb-4"
                    />
                    
                    <VTextField
                      v-model="majorLabel"
                      label="Major Label"
                      hint="Display label for major perspective (e.g., Major)"
                      persistent-hint
                      class="mb-4"
                    />
                    
                    <VSelect
                      v-model="minorAttendees"
                      :items="availableUserTypeBlocks"
                      label="Minor Attendees"
                      hint="UserTypeBlock instances that make an event &quot;minor&quot; (e.g., Client)"
                      persistent-hint
                      multiple
                      chips
                      closable-chips
                      class="mb-4"
                    />
                    
                    <VTextField
                      v-model="minorLabel"
                      label="Minor Label"
                      hint="Display label for minor perspective (e.g., Minor Formal Presentation)"
                      persistent-hint
                      class="mb-4"
                    />
                    
                    <VTextField
                      v-model="differentialGraphDefaultLabel"
                      label="Differential Graph Default Label"
                      hint="Message shown when no time slot is selected (e.g., Select a Time Slot)"
                      persistent-hint
                      class="mb-4"
                    />
                    
                    <VTextField
                      v-model="majorStateLabel"
                      label="Major State Label"
                      hint="Message shown when major perspective is selected (e.g., Showing Major Times). Leave empty to use default format."
                      persistent-hint
                      class="mb-4"
                    />
                    
                    <VTextField
                      v-model="minorStateLabel"
                      label="Minor State Label"
                      hint="Message shown when minor perspective is selected (e.g., Showing Client FormalPresentation Times). Leave empty to use default format."
                      persistent-hint
                    />
                    
                    <div class="text-caption mt-4 text-medium-emphasis">
                      <div class="mb-1"><strong>Major Attendees:</strong> Events with these attendees are considered "major" perspective.</div>
                      <div class="mb-1"><strong>Minor Attendees:</strong> Events with these attendees are considered "minor" perspective.</div>
                      <div class="mb-1"><strong>Labels:</strong> Customize how major and minor perspectives are displayed in the UI.</div>
                      <div class="mb-1"><strong>Differential Graph Default Label:</strong> Large message shown over the differential graph when no time slot is selected.</div>
                      <div class="mb-1"><strong>State Labels:</strong> Messages shown when a time slot is selected. If left empty, defaults to "Showing {Major/Minor Label} times".</div>
                      <div>If not configured, the system falls back to hardcoded "Major" (major) and "Minor" (minor) event names, and default labels.</div>
                    </div>
                  </div>
                </div>
                
                <!-- Action Buttons -->
                <div class="d-flex gap-2 mt-4">
                  <VBtn v-bind="saveButtonProps">
                    {{ UI_STRINGS.buttons.saveSettings }}
                  </VBtn>
                </div>
              </VWindowItem>
          </VWindow>
        </VWindowItem>
      </VWindow>
    </VForm>
  </div>
</template>

<style scoped>
.business-controls-tab {
  padding: 1rem;
}
</style>

