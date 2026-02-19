<!--
  LEARNING: Business Controls Tab Component
  WHY: Allows admin to configure availability settings (business hours, time increments, lead time)
  PATTERN: Form with validation, API integration; delegates to panel components and composables
-->
<script setup lang="ts">
import { computed, inject, type Ref } from 'vue'
import { useAvailabilitySettings, calculateMaxBusinessHours } from '@/composables/admin/useAvailabilitySettings'
import { useTabNavigation } from '@/composables/admin/useTabNavigation'
import { useCalendarEntries } from '@/composables/admin/useCalendarEntries'
import { useCapacitySettings } from '@/composables/admin/useCapacitySettings'
import { useBufferSettings } from '@/composables/admin/useBufferSettings'
import { useDefaultLocation } from '@/composables/admin/useDefaultLocation'
import { useDifferentialPerspectives } from '@/composables/admin/useDifferentialPerspectives'
import { DAY_NAMES, TIMEZONE_OPTIONS } from '@/constants/availabilitySettings'
import { useLocalTime } from '@/composables/useLocalTime'
import type { BusinessHoursConfig } from '@/configs/availabilitySettings'
import { isValidCalendarEmail, DEFAULT_CALENDAR_CONFIG } from '@/configs/availabilitySettings'
import { BUSINESS_CONTROLS_TAB_STRINGS } from '@/configs/businessControlsTabStrings'
import type { CalendarProvider, DriveTimeApplyTo } from '@/configs/availabilitySettings'
import RangeConstraintsPanel from './components/RangeConstraintsPanel.vue'
import CapacityConstraintsPanel from './components/CapacityConstraintsPanel.vue'
import OverlapConstraintsPanel from './components/OverlapConstraintsPanel.vue'
import CalendarIntegrationPanel from './components/CalendarIntegrationPanel.vue'
import DurationRoundingPanel from './components/DurationRoundingPanel.vue'
import PlacesTimezonePanel from './components/PlacesTimezonePanel.vue'
import GridConfigPanel from './components/GridConfigPanel.vue'
import BusinessRulesTab from './BusinessRulesTab.vue'

const adminCurrentTab = inject<Ref<string>>('adminCurrentTab')
const isTabActive = computed(() => adminCurrentTab?.value === 'business')

const {
  formData,
  loading,
  saving,
  error,
  success,
  saveSettings
} = useAvailabilitySettings({
  enabled: isTabActive
})

const { rfc3339ToBusinessHoursHHmm, businessHoursHHmmToRfc3339 } = useLocalTime()
const UI_STRINGS = BUSINESS_CONTROLS_TAB_STRINGS

/** Valid business hours day indices (0=Sunday .. 6=Saturday). */
type BusinessHoursDay = 0 | 1 | 2 | 3 | 4 | 5 | 6

const businessHoursForUI = computed(() => {
  if (!formData.value) return {} as Record<number, { start: string; end: string }>
  const currentFormData = formData.value
  return Object.fromEntries(
    Array.from({ length: 7 }, (_, day) => {
      const dayHours = currentFormData.businessHours[day as BusinessHoursDay]
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

const isBusinessHoursConfig = (
  config: BusinessHoursConfig | { minutes: number } | { start: string; end: string }
): config is BusinessHoursConfig => 'hours' in config

const updateBusinessHours = (day: number, field: 'start' | 'end', value: string): void => {
  if (!formData.value) return
  const rfc3339Value = businessHoursHHmmToRfc3339(value)
  formData.value.businessHours[day as BusinessHoursDay][field] = rfc3339Value
  const businessHoursConstraint = formData.value.rangeConstraints?.businessHours
  if (businessHoursConstraint && isBusinessHoursConfig(businessHoursConstraint.config)) {
    businessHoursConstraint.config.hours[day as BusinessHoursDay][field] = rfc3339Value
  }
}

const { currentTab: currentMainTab } = useTabNavigation({ initialTab: 'constraints' })
const { currentTab: currentSubTab } = useTabNavigation({ initialTab: 'range' })
const { currentTab: currentCalendarTab } = useTabNavigation({ initialTab: 'integration' })

const maxBusinessHours = computed(() => {
  if (!formData.value) return 0
  return calculateMaxBusinessHours(formData.value.businessHours)
})

const capacity = useCapacitySettings({ formData, maxBusinessHours })
const buffers = useBufferSettings({ formData })
const location = useDefaultLocation({ formData })
const differential = useDifferentialPerspectives({ formData })

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
  get: () => (formData.value?.calendarConfig?.provider ?? DEFAULT_CALENDAR_CONFIG.provider) as CalendarProvider,
  set: (value: CalendarProvider) => {
    if (formData.value) {
      if (!formData.value.calendarConfig) {
        formData.value.calendarConfig = { ...DEFAULT_CALENDAR_CONFIG }
      }
      formData.value.calendarConfig.provider = value
    }
  }
})

const {
  entries: calendarEntries,
  addEntry: addCalendarEntry,
  removeEntry: removeCalendarEntry,
  updateEntry: updateCalendarEntry,
  setReadFrom,
  setWriteTo,
  writeToIndex,
  validationError: calendarValidationError,
  isValid: _calendarIsValid
} = useCalendarEntries(formData, calendarEnabled, calendarProvider)

const emailValidationRule = (value: string): true | string => {
  if (!value || value.trim() === '') return true
  return isValidCalendarEmail(value) ? true : UI_STRINGS.validation.emailInvalid
}

const saveButtonProps = computed(() => ({
  type: 'submit' as const,
  color: 'primary' as const,
  loading: saving.value,
  disabled: saving.value
}))

const clearError = (): void => {
  error.value = null
}

const dayNames = DAY_NAMES
const timezoneOptions = TIMEZONE_OPTIONS

const durationRoundingEnabled = computed({
  get: () => formData.value?.durationRounding?.enabled ?? false,
  set: (v: boolean) => {
    if (formData.value?.durationRounding) formData.value.durationRounding.enabled = v
  }
})
const durationRoundingIncrement = computed({
  get: () => formData.value?.durationRounding?.increment ?? 15,
  set: (v: number) => {
    if (formData.value?.durationRounding) formData.value.durationRounding.increment = v
  }
})
const durationRoundingMethod = computed({
  get: () => formData.value?.durationRounding?.method ?? 'roundNearest',
  set: (v: string) => {
    if (formData.value?.durationRounding) formData.value.durationRounding.method = v as 'roundUp' | 'roundDown' | 'roundNearest'
  }
})

const timezone = computed({
  get: () => formData.value?.timezone ?? '',
  set: (v: string) => {
    if (formData.value) formData.value.timezone = v
  }
})

const minuteIncrement = computed({
  get: () => formData.value?.minuteIncrement ?? 15,
  set: (v: number) => {
    if (formData.value) formData.value.minuteIncrement = v
  }
})

function setCalendarProvider(v: string): void {
  calendarProvider.value = v as CalendarProvider
}
function setTimezone(v: string): void {
  timezone.value = v
}
function setMinuteIncrement(v: number): void {
  minuteIncrement.value = v
}
</script>

<template>
  <div class="business-controls-tab">
    <div v-if="loading" class="text-center py-4">
      <VProgressCircular indeterminate color="primary" />
      <div class="mt-2">{{ UI_STRINGS.loading }}</div>
    </div>

    <VForm v-else @submit.prevent="saveSettings">
      <VAlert v-if="success" type="success" dismissible class="mb-4">
        {{ success }}
      </VAlert>
      <VAlert
        v-if="error"
        type="error"
        dismissible
        class="mb-4"
        @click:close="clearError"
      >
        {{ error }}
      </VAlert>

      <VTabs v-model="currentMainTab" class="mb-4">
        <VTab value="constraints">{{ UI_STRINGS.tabs.constraints }}</VTab>
        <VTab value="calendar">{{ UI_STRINGS.tabs.calendar }}</VTab>
        <VTab value="rules">{{ UI_STRINGS.tabs.rules }}</VTab>
      </VTabs>

      <VWindow v-model="currentMainTab">
        <VWindowItem key="constraints" value="constraints">
          <VTabs v-model="currentSubTab" class="mb-4">
            <VTab value="range">{{ UI_STRINGS.tabs.range }}</VTab>
            <VTab value="capacity">{{ UI_STRINGS.tabs.capacity }}</VTab>
            <VTab value="overlap">{{ UI_STRINGS.tabs.overlap }}</VTab>
          </VTabs>

          <VWindow v-model="currentSubTab">
            <VWindowItem key="range" value="range">
              <RangeConstraintsPanel
                :business-hours-for-ui="businessHoursForUI"
                :update-business-hours="updateBusinessHours"
                :day-names="dayNames"
                :range-constraints-lead-time-minutes="buffers.rangeConstraintsLeadTimeMinutes.value"
                :save-button-props="saveButtonProps"
                @update:range-constraints-lead-time-minutes="(v: number) => { buffers.rangeConstraintsLeadTimeMinutes.value = v }"
              />
            </VWindowItem>

            <VWindowItem key="capacity" value="capacity">
              <CapacityConstraintsPanel
                :max-work-hours-day-max-hours="capacity.maxWorkHoursDayMaxHours.value"
                :max-work-hours-day-enforcement="capacity.maxWorkHoursDayEnforcement.value"
                :max-work-hours-calendar-week-max-hours="capacity.maxWorkHoursCalendarWeekMaxHours.value"
                :max-work-hours-calendar-week-enforcement="capacity.maxWorkHoursCalendarWeekEnforcement.value"
                :max-work-hours-rolling-week-max-hours="capacity.maxWorkHoursRollingWeekMaxHours.value"
                :max-work-hours-rolling-week-enforcement="capacity.maxWorkHoursRollingWeekEnforcement.value"
                :max-work-hours-rolling-week-direction="capacity.maxWorkHoursRollingWeekDirection.value"
                :save-button-props="saveButtonProps"
                @update:max-work-hours-day-max-hours="(v: number) => { capacity.maxWorkHoursDayMaxHours.value = v }"
                @update:max-work-hours-day-enforcement="(v) => { capacity.maxWorkHoursDayEnforcement.value = v }"
                @update:max-work-hours-calendar-week-max-hours="(v: number) => { capacity.maxWorkHoursCalendarWeekMaxHours.value = v }"
                @update:max-work-hours-calendar-week-enforcement="(v) => { capacity.maxWorkHoursCalendarWeekEnforcement.value = v }"
                @update:max-work-hours-rolling-week-max-hours="(v: number) => { capacity.maxWorkHoursRollingWeekMaxHours.value = v }"
                @update:max-work-hours-rolling-week-enforcement="(v) => { capacity.maxWorkHoursRollingWeekEnforcement.value = v }"
                @update:max-work-hours-rolling-week-direction="(v) => { capacity.maxWorkHoursRollingWeekDirection.value = v }"
              />
            </VWindowItem>

            <VWindowItem key="overlap" value="overlap">
              <OverlapConstraintsPanel
                :buffers-appointment-minutes="buffers.buffersAppointmentMinutes.value"
                :buffers-appointment-placement="buffers.buffersAppointmentPlacement.value"
                :buffers-appointment-enforcement="buffers.buffersAppointmentEnforcement.value"
                :buffers-drive-to-candidate-minutes="buffers.buffersDriveToCandidateMinutes.value"
                :buffers-drive-to-candidate-enforcement="buffers.buffersDriveToCandidateEnforcement.value"
                :buffers-drive-to-candidate-apply-to="buffers.buffersDriveToCandidateApplyTo.value"
                :buffers-drive-from-candidate-minutes="buffers.buffersDriveFromCandidateMinutes.value"
                :buffers-drive-from-candidate-enforcement="buffers.buffersDriveFromCandidateEnforcement.value"
                :buffers-drive-from-candidate-apply-to="buffers.buffersDriveFromCandidateApplyTo.value"
                :overlap-sources-out-of-office-enforcement="buffers.overlapSourcesOutOfOfficeEnforcement.value"
                :default-location-place-id="location.defaultLocationPlaceId.value"
                :save-button-props="saveButtonProps"
                @update:buffers-appointment-minutes="(v: number) => { buffers.buffersAppointmentMinutes.value = v }"
                @update:buffers-appointment-placement="(v) => { buffers.buffersAppointmentPlacement.value = v }"
                @update:buffers-appointment-enforcement="(v) => { buffers.buffersAppointmentEnforcement.value = v }"
                @update:buffers-drive-to-candidate-minutes="(v: number) => { buffers.buffersDriveToCandidateMinutes.value = v }"
                @update:buffers-drive-to-candidate-enforcement="(v) => { buffers.buffersDriveToCandidateEnforcement.value = v }"
                @update:buffers-drive-to-candidate-apply-to="(v) => { buffers.buffersDriveToCandidateApplyTo.value = v as DriveTimeApplyTo }"
                @update:buffers-drive-from-candidate-minutes="(v: number) => { buffers.buffersDriveFromCandidateMinutes.value = v }"
                @update:buffers-drive-from-candidate-enforcement="(v) => { buffers.buffersDriveFromCandidateEnforcement.value = v }"
                @update:buffers-drive-from-candidate-apply-to="(v) => { buffers.buffersDriveFromCandidateApplyTo.value = v as DriveTimeApplyTo }"
                @update:overlap-sources-out-of-office-enforcement="(v) => { buffers.overlapSourcesOutOfOfficeEnforcement.value = v }"
              />
            </VWindowItem>
          </VWindow>
        </VWindowItem>

        <VWindowItem key="rules" value="rules">
          <BusinessRulesTab />
        </VWindowItem>

        <VWindowItem key="calendar" value="calendar">
          <VTabs v-model="currentCalendarTab" class="mb-4">
            <VTab value="integration">{{ UI_STRINGS.tabs.integration }}</VTab>
            <VTab value="rounding">{{ UI_STRINGS.tabs.rounding }}</VTab>
            <VTab value="places">{{ UI_STRINGS.tabs.places }}</VTab>
            <VTab value="grid">{{ UI_STRINGS.tabs.grid }}</VTab>
          </VTabs>

          <VWindow v-model="currentCalendarTab">
            <VWindowItem key="integration" value="integration">
              <CalendarIntegrationPanel
                :calendar-enabled="calendarEnabled"
                :calendar-provider="calendarProvider"
                :calendar-entries="calendarEntries"
                :write-to-index="writeToIndex"
                :calendar-validation-error="calendarValidationError"
                :email-validation-rule="emailValidationRule"
                :save-button-props="saveButtonProps"
                @update:calendar-enabled="(v: boolean) => { calendarEnabled = v }"
                @update:calendar-provider="setCalendarProvider"
                @add-calendar-entry="addCalendarEntry"
                @remove-calendar-entry="removeCalendarEntry"
                @update-calendar-entry="updateCalendarEntry"
                @set-read-from="setReadFrom"
                @set-write-to="setWriteTo"
              />
            </VWindowItem>

            <VWindowItem key="rounding" value="rounding">
              <DurationRoundingPanel
                :duration-rounding-enabled="durationRoundingEnabled"
                :duration-rounding-increment="durationRoundingIncrement"
                :duration-rounding-method="durationRoundingMethod"
                :save-button-props="saveButtonProps"
                @update:duration-rounding-enabled="(v: boolean) => { durationRoundingEnabled = v }"
                @update:duration-rounding-increment="(v: number) => { durationRoundingIncrement = v }"
                @update:duration-rounding-method="(v: string) => { durationRoundingMethod = v as 'roundUp' | 'roundDown' | 'roundNearest' }"
              />
            </VWindowItem>

            <VWindowItem key="places" value="places">
              <PlacesTimezonePanel
                :default-location-address="location.defaultLocationAddress.value"
                :default-location-label="location.defaultLocationLabel.value"
                :default-location-coordinates="location.defaultLocationCoordinates.value"
                :default-location-place-id="location.defaultLocationPlaceId.value"
                :timezone="timezone"
                :timezone-options="[...timezoneOptions]"
                :save-button-props="saveButtonProps"
                @update:default-location-address="(v: string) => { location.defaultLocationAddress.value = v }"
                @update:default-location-label="(v: string) => { location.defaultLocationLabel.value = v }"
                @update:default-location-coordinates="(v) => { location.defaultLocationCoordinates.value = v }"
                @update:default-location-place-id="(v: string) => { location.defaultLocationPlaceId.value = v }"
                @update:timezone="setTimezone"
              />
            </VWindowItem>

            <VWindowItem key="grid" value="grid">
              <GridConfigPanel
                :minute-increment="minuteIncrement"
                :major-attendees="differential.majorAttendees.value"
                :minor-attendees="differential.minorAttendees.value"
                :major-label="differential.majorLabel.value"
                :minor-label="differential.minorLabel.value"
                :differential-graph-default-label="differential.differentialGraphDefaultLabel.value"
                :major-state-label="differential.majorStateLabel.value"
                :minor-state-label="differential.minorStateLabel.value"
                :available-user-type-blocks="differential.availableUserTypeBlocks.value"
                :save-button-props="saveButtonProps"
                @update:minute-increment="setMinuteIncrement"
                @update:major-attendees="(v) => { differential.majorAttendees.value = v }"
                @update:minor-attendees="(v) => { differential.minorAttendees.value = v }"
                @update:major-label="(v: string) => { differential.majorLabel.value = v }"
                @update:minor-label="(v: string) => { differential.minorLabel.value = v }"
                @update:differential-graph-default-label="(v: string) => { differential.differentialGraphDefaultLabel.value = v }"
                @update:major-state-label="(v: string) => { differential.majorStateLabel.value = v }"
                @update:minor-state-label="(v: string) => { differential.minorStateLabel.value = v }"
              />
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
