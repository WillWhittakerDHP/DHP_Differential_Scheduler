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
import type { BusinessHoursConfig, AvailabilitySettings, CalendarProvider, DriveTimeApplyTo, DriveTimeConfig, Coordinates } from '@/configs/availabilitySettings'
import { isValidCalendarEmail, DEFAULT_CALENDAR_CONFIG } from '@/configs/availabilitySettings'
import { BUSINESS_CONTROLS_TAB_STRINGS } from '@/configs/businessControlsTabStrings'
import { useGlobal } from '@/composables/useGlobal'
import { getAllUserTypeBlockIds } from '@/utils/eventAttendeeUtils'
import type { GlobalEntityId } from '@/types/entities'
import BusinessRulesTab from './BusinessRulesTab.vue'
import AddressAutocomplete from '@/components/common/AddressAutocomplete.vue'

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

const UI_STRINGS = BUSINESS_CONTROLS_TAB_STRINGS

// WHY: Time inputs expect HH:mm format, but formData stores RFC3339 internally
const businessHoursForUI = computed(() => {
  if (!formData.value) {
    return {} as Record<number, { start: string; end: string }>
  }
  
  const currentFormData = formData.value
  
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

const isBusinessHoursConfig = (config: BusinessHoursConfig | { minutes: number } | { start: string; end: string }): config is BusinessHoursConfig => {
  return 'hours' in config
}

// LEARNING: Watch for changes in UI business hours and update RFC3339 formData
const updateBusinessHours = (day: number, field: 'start' | 'end', value: string): void => {
  if (!formData.value) return
  
  const rfc3339Value = businessHoursHHmmToRfc3339(value)
  // PATTERN: Update both locations to ensure consistency with type narrowing
  formData.value.businessHours[day as keyof typeof formData.value.businessHours][field] = rfc3339Value
  
  const businessHoursConstraint = formData.value.rangeConstraints?.businessHours
  if (businessHoursConstraint && isBusinessHoursConfig(businessHoursConstraint.config)) {
    businessHoursConstraint.config.hours[day as keyof typeof businessHoursConstraint.config.hours][field] = rfc3339Value
  }
}

// PATTERN: Use tab navigation composable for state management
const { currentTab: currentMainTab } = useTabNavigation({ initialTab: 'constraints' })

// PATTERN: Use tab navigation composable for state management
const { currentTab: currentSubTab } = useTabNavigation({ initialTab: 'range' })

// PATTERN: Use tab navigation composable for state management
// Session 2.0.2: Changed default to 'integration' for calendar integration tab
const { currentTab: currentCalendarTab } = useTabNavigation({ initialTab: 'integration' })

// PATTERN: Use useGlobal composable to access global entities
const { getGlobalData, getGlobalEntities } = useGlobal()

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

const maxBusinessHours = computed(() => {
  if (!formData.value) return 0
  return calculateMaxBusinessHours(formData.value.businessHours)
})

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
type MaxWorkHours = NonNullable<AvailabilitySettings['maxWorkHours']>
const ensureMaxWorkHours = (current: MaxWorkHours | undefined) => {
  return current || {}
}

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

const maxWorkHoursDayMaxHours = createMaxWorkHoursComputed('day', 'maxHours', () => maxBusinessHours.value, ensureWorkHoursPerDay)
const maxWorkHoursDayEnforcement = createMaxWorkHoursComputed('day', 'enforcement', () => 'off' as const, ensureWorkHoursPerDay)

const maxWorkHoursCalendarWeekMaxHours = createMaxWorkHoursComputed('calendarWeek', 'maxHours', () => maxBusinessHours.value * 7, ensureCalendarWeekLimit)
const maxWorkHoursCalendarWeekEnforcement = createMaxWorkHoursComputed('calendarWeek', 'enforcement', () => 'off' as const, ensureCalendarWeekLimit)

const maxWorkHoursRollingWeekMaxHours = createMaxWorkHoursComputed('rollingWeek', 'maxHours', () => maxBusinessHours.value * 7, ensureRollingWeekLimit)
const maxWorkHoursRollingWeekEnforcement = createMaxWorkHoursComputed('rollingWeek', 'enforcement', () => 'off' as const, ensureRollingWeekLimit)
const maxWorkHoursRollingWeekDirection = createMaxWorkHoursComputed('rollingWeek', 'direction', () => 'past' as const, ensureRollingWeekLimit)

const enforcementOptions = [
  { title: 'Off', value: 'off' },
  { title: 'Flexible', value: 'flexible' },
  { title: 'Hard', value: 'hard' }
]

const rollingWeekDirectionOptions = [
  { title: 'Past 7 days', value: 'past' },
  { title: 'Centered (3 before + day + 3 after)', value: 'centered' },
  { title: 'Future 7 days', value: 'future' }
]

const bufferPlacementOptions = [
  { title: 'Off', value: 'off' },
  { title: 'Before', value: 'before' },
  { title: 'After', value: 'after' },
  { title: 'Both', value: 'both' }
]

// LEARNING: Drive time applyTo options for first/last appointment rules
// WHY: Allows admin to configure when drive time buffers apply
// PATTERN: Array of options matching DriveTimeApplyTo type
const driveTimeApplyToOptions: { title: string; value: DriveTimeApplyTo }[] = [
  { title: 'All Appointments', value: 'all' },
  { title: 'First Appointment Only', value: 'first_only' },
  { title: 'Last Appointment Only', value: 'last_only' },
  { title: 'None (Disabled)', value: 'none' }
]

// LEARNING: Helper functions to initialize buffers using functional patterns
type Buffers = NonNullable<AvailabilitySettings['buffers']>
const ensureBuffers = (current: Buffers | undefined) => {
  return current || {}
}

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

// LEARNING: Ensure functions for new drive time buffer structure
// WHY: driveTimeTo/driveTimeFrom replace legacy driveTime with semantic meaning and applyTo rules
// PATTERN: createEnsureNested with DriveTimeConfig defaults

const ensureDriveTimeTo = createEnsureNested(
  ensureBuffers,
  'driveTimeTo',
  () => ({
    minutes: 30,
    enforcement: 'hard' as const,
    applyTo: 'first_only' as const
  } as DriveTimeConfig)
)

const ensureDriveTimeFrom = createEnsureNested(
  ensureBuffers,
  'driveTimeFrom',
  () => ({
    minutes: 15,
    enforcement: 'hard' as const,
    applyTo: 'last_only' as const
  } as DriveTimeConfig)
)

// PATTERN: Factory function for drive time buffer computed properties
// WHY: DriveTimeConfig doesn't have 'placement', uses different fields than BufferConfig
function createDriveTimeComputed<TValue>(
  bufferType: 'driveTimeTo' | 'driveTimeFrom',
  property: keyof DriveTimeConfig,
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

// Computed properties for driveTimeTo
const buffersDriveTimeToMinutes = createDriveTimeComputed('driveTimeTo', 'minutes', () => 30, ensureDriveTimeTo)
const buffersDriveTimeToEnforcement = createDriveTimeComputed('driveTimeTo', 'enforcement', () => 'hard' as const, ensureDriveTimeTo)
const buffersDriveTimeToApplyTo = createDriveTimeComputed('driveTimeTo', 'applyTo', () => 'first_only' as const, ensureDriveTimeTo)

// Computed properties for driveTimeFrom
const buffersDriveTimeFromMinutes = createDriveTimeComputed('driveTimeFrom', 'minutes', () => 15, ensureDriveTimeFrom)
const buffersDriveTimeFromEnforcement = createDriveTimeComputed('driveTimeFrom', 'enforcement', () => 'hard' as const, ensureDriveTimeFrom)
const buffersDriveTimeFromApplyTo = createDriveTimeComputed('driveTimeFrom', 'applyTo', () => 'last_only' as const, ensureDriveTimeFrom)

// Computed properties for defaultLocation
// LEARNING: defaultLocation is at root level of AvailabilitySettings, not nested in buffers
// WHY: Used for drive time calculations but conceptually separate from buffer configs
const defaultLocationAddress = computed({
  get: () => formData.value?.defaultLocation?.address ?? '',
  set: (value: string) => {
    if (formData.value) {
      if (!formData.value.defaultLocation) {
        formData.value.defaultLocation = { address: '' }
      }
      formData.value.defaultLocation.address = value
    }
  }
})

const defaultLocationLabel = computed({
  get: () => formData.value?.defaultLocation?.label ?? '',
  set: (value: string) => {
    if (formData.value) {
      if (!formData.value.defaultLocation) {
        formData.value.defaultLocation = { address: '' }
      }
      formData.value.defaultLocation.label = value
    }
  }
})

// LEARNING: Computed property for default location coordinates
// WHY: AddressAutocomplete extracts coordinates from Google Places API
// PATTERN: Coordinates stored alongside address for drive time calculations
const defaultLocationCoordinates = computed({
  get: () => formData.value?.defaultLocation?.coordinates,
  set: (value: Coordinates | undefined) => {
    if (formData.value) {
      if (!formData.value.defaultLocation) {
        formData.value.defaultLocation = { address: '' }
      }
      formData.value.defaultLocation.coordinates = value
    }
  }
})

// LEARNING: Computed property for default location Place ID (Session 2.2.2)
// WHY: Routes API uses Place IDs for more accurate routing than coordinates or addresses
// PATTERN: placeId > coordinates > address (priority order for route calculations)
const defaultLocationPlaceId = computed({
  get: () => formData.value?.defaultLocation?.placeId,
  set: (value: string | undefined) => {
    if (formData.value) {
      if (!formData.value.defaultLocation) {
        formData.value.defaultLocation = { address: '' }
      }
      formData.value.defaultLocation.placeId = value
    }
  }
})

// LEARNING: Helper functions to initialize range constraints using functional patterns
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

const buffersAppointmentMinutes = createBuffersComputed('appointment', 'minutes', () => 0, ensureAppointmentBuffer)
const buffersAppointmentPlacement = createBuffersComputed('appointment', 'placement', () => 'off' as const, ensureAppointmentBuffer)
const buffersAppointmentEnforcement = createBuffersComputed('appointment', 'enforcement', () => 'hard' as const, ensureAppointmentBuffer)

const saveButtonProps = computed(() => ({
  type: 'submit' as const,
  color: 'primary' as const,
  loading: saving.value,
  disabled: saving.value
}))

const dayNames = DAY_NAMES
const timeIncrementOptions = TIME_INCREMENT_OPTIONS
const timezoneOptions = TIMEZONE_OPTIONS

const roundingIncrementOptions = [
  { title: '5 minutes', value: 5 },
  { title: '10 minutes', value: 10 },
  { title: '15 minutes', value: 15 },
  { title: '30 minutes', value: 30 },
  { title: '60 minutes', value: 60 }
]

const roundingMethodOptions = [
  { title: 'Round Up', value: 'roundUp' },
  { title: 'Round Down', value: 'roundDown' },
  { title: 'Round Nearest', value: 'roundNearest' }
]

// Calendar Integration options
// Session 2.0.2: Added for Google Calendar API integration
const calendarProviderOptions: { title: string; value: CalendarProvider }[] = [
  { title: 'None', value: 'none' },
  { title: 'Google Calendar', value: 'google' },
  { title: 'Microsoft Outlook', value: 'outlook' }
]

// Calendar config computed properties with defaults
// PATTERN: Ensure calendarConfig exists before accessing
const calendarEnabled = computed({
  get: () => formData.value?.calendarConfig?.enabled ?? DEFAULT_CALENDAR_CONFIG.enabled,
  set: (value: boolean) => {
    if (formData.value) {
      if (!formData.value.calendarConfig) {
        formData.value.calendarConfig = { ...DEFAULT_CALENDAR_CONFIG }
      }
      formData.value.calendarConfig.enabled = value
    }
  }
})

const calendarProvider = computed({
  get: () => formData.value?.calendarConfig?.provider ?? DEFAULT_CALENDAR_CONFIG.provider,
  set: (value: CalendarProvider) => {
    if (formData.value) {
      if (!formData.value.calendarConfig) {
        formData.value.calendarConfig = { ...DEFAULT_CALENDAR_CONFIG }
      }
      formData.value.calendarConfig.provider = value
    }
  }
})

const calendarPrimary = computed({
  get: () => formData.value?.calendarConfig?.calendars?.primary ?? '',
  set: (value: string) => {
    if (formData.value) {
      if (!formData.value.calendarConfig) {
        formData.value.calendarConfig = { ...DEFAULT_CALENDAR_CONFIG }
      }
      formData.value.calendarConfig.calendars.primary = value
    }
  }
})

const calendarWork = computed({
  get: () => formData.value?.calendarConfig?.calendars?.work ?? '',
  set: (value: string) => {
    if (formData.value) {
      if (!formData.value.calendarConfig) {
        formData.value.calendarConfig = { ...DEFAULT_CALENDAR_CONFIG }
      }
      formData.value.calendarConfig.calendars.work = value
    }
  }
})

const calendarPersonal = computed({
  get: () => formData.value?.calendarConfig?.calendars?.personal ?? '',
  set: (value: string) => {
    if (formData.value) {
      if (!formData.value.calendarConfig) {
        formData.value.calendarConfig = { ...DEFAULT_CALENDAR_CONFIG }
      }
      formData.value.calendarConfig.calendars.personal = value
    }
  }
})

// Email validation rules
// PATTERN: Returns true if valid, or error message string if invalid
const emailValidationRule = (value: string): true | string => {
  if (!value || value.trim() === '') return true // Empty is OK (optional)
  return isValidCalendarEmail(value) ? true : 'Please enter a valid email address'
}
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
        <VTab value="rules">Rules</VTab>
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
                  
                  <!-- Drive Time To Buffer (Arrival) -->
                  <!-- LEARNING: Travel time TO arrive at appointment, applied BEFORE start time -->
                  <!-- WHY: Ensures enough time to travel to the appointment location -->
                  <!-- PATTERN: DriveTimeConfig with applyTo instead of placement -->
                  <VExpansionPanel :title="UI_STRINGS.panels.driveTimeToBuffer">
                    <VExpansionPanelText>
                      <div class="text-body-2 mb-4 text-medium-emphasis">
                        {{ UI_STRINGS.help.driveTimeToDescription }}
                      </div>
                      <VRow>
                        <VCol cols="12" sm="6" md="3">
                          <VTextField
                            v-model.number="buffersDriveTimeToMinutes"
                            label="Minutes"
                            type="number"
                            min="0"
                            step="5"
                            :hint="UI_STRINGS.hints.driveTimeToMinutes"
                            persistent-hint
                            :rules="[
                              (v: number) => v >= 0 || UI_STRINGS.validation.bufferTimeMin,
                            ]"
                          />
                        </VCol>
                        <VCol cols="12" sm="6" md="3">
                          <VSelect
                            v-model="buffersDriveTimeToApplyTo"
                            :items="driveTimeApplyToOptions"
                            :label="UI_STRINGS.labels.applyTo"
                            :hint="UI_STRINGS.hints.driveTimeApplyTo"
                            persistent-hint
                          />
                        </VCol>
                        <VCol cols="12" sm="6" md="3">
                          <VSelect
                            v-model="buffersDriveTimeToEnforcement"
                            :items="enforcementOptions"
                            :label="UI_STRINGS.labels.enforcement"
                            :hint="UI_STRINGS.hints.bufferEnforcement"
                            persistent-hint
                          />
                        </VCol>
                      </VRow>
                    </VExpansionPanelText>
                  </VExpansionPanel>
                  
                  <!-- Drive Time From Buffer (Departure) -->
                  <!-- LEARNING: Travel time FROM appointment, applied AFTER end time -->
                  <!-- WHY: Ensures enough time to travel from the appointment to the next location -->
                  <!-- PATTERN: DriveTimeConfig with applyTo instead of placement -->
                  <VExpansionPanel :title="UI_STRINGS.panels.driveTimeFromBuffer">
                    <VExpansionPanelText>
                      <div class="text-body-2 mb-4 text-medium-emphasis">
                        {{ UI_STRINGS.help.driveTimeFromDescription }}
                      </div>
                      <VRow>
                        <VCol cols="12" sm="6" md="3">
                          <VTextField
                            v-model.number="buffersDriveTimeFromMinutes"
                            label="Minutes"
                            type="number"
                            min="0"
                            step="5"
                            :hint="UI_STRINGS.hints.driveTimeFromMinutes"
                            persistent-hint
                            :rules="[
                              (v: number) => v >= 0 || UI_STRINGS.validation.bufferTimeMin,
                            ]"
                          />
                        </VCol>
                        <VCol cols="12" sm="6" md="3">
                          <VSelect
                            v-model="buffersDriveTimeFromApplyTo"
                            :items="driveTimeApplyToOptions"
                            :label="UI_STRINGS.labels.applyTo"
                            :hint="UI_STRINGS.hints.driveTimeApplyTo"
                            persistent-hint
                          />
                        </VCol>
                        <VCol cols="12" sm="6" md="3">
                          <VSelect
                            v-model="buffersDriveTimeFromEnforcement"
                            :items="enforcementOptions"
                            :label="UI_STRINGS.labels.enforcement"
                            :hint="UI_STRINGS.hints.bufferEnforcement"
                            persistent-hint
                          />
                        </VCol>
                      </VRow>
                    </VExpansionPanelText>
                  </VExpansionPanel>
                  
                  <!-- Lunch Buffer -->
                  <!-- TODO: Implement Lunch Buffer UI
                    * When implementing, follow the pattern used for Appointment Buffers above
                    * Use ensureBuffers() and ensureLunchBuffer() helper functions (create if needed)
                    * Create computed properties with getters/setters for lunch minutes/placement/enforcement (similar to buffersAppointmentMinutes, buffersAppointmentPlacement, buffersAppointmentEnforcement)
                    * Use VTextField for minutes, VSelect for placement and enforcement (reuse bufferPlacementOptions and enforcementOptions)
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
        
        <!-- Rules Tab -->
        <VWindowItem key="rules" value="rules">
          <BusinessRulesTab />
        </VWindowItem>
        
        <!-- Calendar Tab -->
        <VWindowItem key="calendar" value="calendar">
          <!-- LEARNING: Subtabs for Calendar sections -->
          <!-- WHY: Provides tabbed interface for switching between Slot Increment, Duration Rounding, and Timezone -->
          <!-- PATTERN: VTabs/VWindow pattern matching Constraints panel -->
          <VTabs v-model="currentCalendarTab" class="mb-4">
            <VTab value="integration">Integration</VTab>
            <VTab value="rounding">{{ UI_STRINGS.tabs.rounding }}</VTab>
            <VTab value="places">Places</VTab>
            <VTab value="grid">Grid</VTab>
          </VTabs>
          
          <VWindow v-model="currentCalendarTab">
              
              <!-- Calendar Integration Tab -->
              <!-- Session 2.0.2: Added for Google Calendar API integration -->
              <VWindowItem key="integration" value="integration">
                <div class="mb-6">
                  <div class="text-subtitle-1 mb-3">Calendar Integration</div>
                  <div class="text-body-2 mb-4 text-medium-emphasis">
                    Connect external calendars to check availability and prevent double-booking.
                    Calendar busy periods will be blocked when scheduling appointments.
                  </div>
                  
                  <!-- Enable/Disable Toggle -->
                  <VSwitch
                    v-model="calendarEnabled"
                    label="Enable Calendar Integration"
                    hint="When enabled, the system will check connected calendars for availability"
                    persistent-hint
                    class="mb-4"
                  />
                  
                  <!-- Provider Selection -->
                  <VSelect
                    v-model="calendarProvider"
                    :items="calendarProviderOptions"
                    label="Calendar Provider"
                    hint="Select your calendar service provider"
                    persistent-hint
                    :disabled="!calendarEnabled"
                    class="mb-4"
                  />
                  
                  <!-- Calendar Email Fields (only show when enabled and provider selected) -->
                  <div v-if="calendarEnabled && calendarProvider !== 'none'" class="mt-6">
                    <div class="text-subtitle-2 mb-3">Calendar Email Addresses</div>
                    <div class="text-body-2 mb-4 text-medium-emphasis">
                      Enter the email addresses for each calendar to check. Leave optional fields empty if not used.
                    </div>
                    
                    <!-- Primary Calendar -->
                    <VTextField
                      v-model="calendarPrimary"
                      label="Primary Calendar"
                      hint="Your main calendar email address (e.g., you@example.com)"
                      persistent-hint
                      placeholder="Enter email address"
                      :rules="[emailValidationRule]"
                      validate-on="blur"
                      class="mb-4"
                    >
                      <template #prepend-inner>
                        <VIcon>mdi-calendar-account</VIcon>
                      </template>
                    </VTextField>
                    
                    <!-- Work Calendar -->
                    <VTextField
                      v-model="calendarWork"
                      label="Work Calendar (Optional)"
                      hint="Separate work calendar if you have one"
                      persistent-hint
                      placeholder="Enter email address"
                      :rules="[emailValidationRule]"
                      validate-on="blur"
                      class="mb-4"
                    >
                      <template #prepend-inner>
                        <VIcon>mdi-briefcase-clock</VIcon>
                      </template>
                    </VTextField>
                    
                    <!-- Personal Calendar -->
                    <VTextField
                      v-model="calendarPersonal"
                      label="Personal Calendar (Optional)"
                      hint="Personal calendar to block personal appointments"
                      persistent-hint
                      placeholder="Enter email address"
                      :rules="[emailValidationRule]"
                      validate-on="blur"
                      class="mb-4"
                    >
                      <template #prepend-inner>
                        <VIcon>mdi-calendar-heart</VIcon>
                      </template>
                    </VTextField>
                  </div>
                  
                  <!-- Info Alert for OAuth -->
                  <VAlert
                    v-if="calendarEnabled && calendarProvider !== 'none'"
                    type="info"
                    variant="tonal"
                    class="mt-4"
                  >
                    <div class="text-body-2">
                      <strong>Authentication Required:</strong> After saving, you'll need to authenticate with {{ calendarProvider === 'google' ? 'Google' : 'Microsoft' }} 
                      to allow the system to access your calendar data.
                    </div>
                    <div class="text-caption mt-1">
                      Calendar data is only used to check availability. No events will be modified without your permission.
                    </div>
                  </VAlert>
                  
                  <!-- Disabled state hint -->
                  <VAlert
                    v-if="!calendarEnabled"
                    type="info"
                    variant="tonal"
                    class="mt-4"
                  >
                    <div class="text-body-2">
                      Calendar integration is currently disabled. Enable it above to configure calendar connections.
                    </div>
                  </VAlert>
                </div>
                
                <!-- Action Buttons -->
                <div class="d-flex gap-2 mt-4">
                  <VBtn v-bind="saveButtonProps">
                    {{ UI_STRINGS.buttons.saveSettings }}
                  </VBtn>
                </div>
              </VWindowItem>
              
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
              
              <!-- Places Tab -->
              <!-- Session 2.2.2: Renamed from Timezone, added Default Location -->
              <VWindowItem key="places" value="places">
                <!-- Default Location Section -->
                <!-- LEARNING: Starting/ending point for first/last appointment drive times -->
                <!-- WHY: Needed to calculate travel time from home/office to first appointment and back -->
                <!-- PATTERN: Address with coordinates from Google Places API for drive time calculations -->
                <div class="mb-6">
                  <div class="text-subtitle-1 mb-3">Default Location</div>
                  <div class="text-body-2 mb-4 text-medium-emphasis">
                    {{ UI_STRINGS.help.defaultLocationDescription }}
                  </div>
                  <VRow>
                    <VCol cols="12" md="8">
                      <!-- LEARNING: AddressAutocomplete replaces plain TextField -->
                      <!-- WHY: Provides address suggestions and extracts coordinates + placeId for distance calculations -->
                      <!-- Session 2.2.2: Added placeId binding for Routes API integration -->
                      <AddressAutocomplete
                        v-model="defaultLocationAddress"
                        :coordinates="defaultLocationCoordinates"
                        :place-id="defaultLocationPlaceId"
                        :label="UI_STRINGS.labels.defaultLocationAddress"
                        :hint="UI_STRINGS.hints.defaultLocationAddress"
                        placeholder="Start typing your address..."
                        @update:coordinates="defaultLocationCoordinates = $event"
                        @update:place-id="defaultLocationPlaceId = $event"
                      />
                      <!-- Show coordinates and placeId when available -->
                      <div v-if="defaultLocationCoordinates || defaultLocationPlaceId" class="text-caption mt-1 text-medium-emphasis">
                        <div v-if="defaultLocationCoordinates">
                          <VIcon size="x-small" class="me-1">mdi-crosshairs-gps</VIcon>
                          Coordinates: {{ defaultLocationCoordinates.lat.toFixed(6) }}, {{ defaultLocationCoordinates.lng.toFixed(6) }}
                        </div>
                        <div v-if="defaultLocationPlaceId" class="mt-1">
                          <VIcon size="x-small" class="me-1">mdi-map-marker-check</VIcon>
                          Place ID: {{ defaultLocationPlaceId.substring(0, 20) }}...
                        </div>
                      </div>
                    </VCol>
                    <VCol cols="12" md="4">
                      <VTextField
                        v-model="defaultLocationLabel"
                        :label="UI_STRINGS.labels.defaultLocationLabel"
                        :hint="UI_STRINGS.hints.defaultLocationLabel"
                        persistent-hint
                        placeholder="Home Office"
                      />
                    </VCol>
                  </VRow>
                </div>
                
                <VDivider class="my-6" />
                
                <!-- Timezone Section -->
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

