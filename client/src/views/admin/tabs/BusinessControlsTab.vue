<!--
  LEARNING: Business Controls Tab Component
  WHY: Allows admin to configure availability settings (business hours, time increments, lead time)
  PATTERN: Form with validation, API integration; delegates to panel components and composables
-->
<script setup lang="ts">
import { computed, inject, type Ref } from 'vue'
import { useAdminAvailabilitySettings, calculateMaxBusinessHours } from '@/composables/admin/useAdminAvailabilitySettings'
import { useTabNavigation } from '@/composables/admin/useTabNavigation'
import { useBusinessControlsFormState } from '@/composables/admin/useBusinessControlsFormState'
import { useCapacitySettings } from '@/composables/admin/useCapacitySettings'
import { useBufferSettings } from '@/composables/admin/useBufferSettings'
import { useDefaultLocation } from '@/composables/admin/useDefaultLocation'
import { useDifferentialPerspectives } from '@/composables/admin/useDifferentialPerspectives'
import type {
  UseBufferSettingsParams,
  UseDefaultLocationParams,
  UseDifferentialPerspectivesParams
} from '@/types/availabilitySettingsParams'
import { DAY_NAMES, TIMEZONE_OPTIONS } from '@/constants/availabilitySettings'
import { BUSINESS_CONTROLS_TAB_STRINGS } from '@/configs/businessControlsTabStrings'
import type { DriveTimeApplyTo } from '@/configs/availabilitySettings'
import RangeConstraintsPanel from './components/RangeConstraintsPanel.vue'
import CapacityConstraintsPanel from './components/CapacityConstraintsPanel.vue'
import OverlapConstraintsPanel from './components/OverlapConstraintsPanel.vue'
import CalendarIntegrationPanel from './components/CalendarIntegrationPanel.vue'
import AppointmentConfirmationPanel from './components/AppointmentConfirmationPanel.vue'
import DurationRoundingPanel from './components/DurationRoundingPanel.vue'
import PlacesTimezonePanel from './components/PlacesTimezonePanel.vue'
import GridConfigPanel from './components/GridConfigPanel.vue'
import BusinessRulesTab from './BusinessRulesTab.vue'
import PropertyMappingsTab from './PropertyMappingsTab.vue'

const adminCurrentTab = inject<Ref<string>>('adminCurrentTab')
const isTabActive = computed(() => adminCurrentTab?.value === 'business')

const {
  formData,
  autoConfirmEnabled,
  loading,
  saving,
  error,
  success,
  saveSettings
} = useAdminAvailabilitySettings({
  enabled: isTabActive
})

const formState = useBusinessControlsFormState({
  formData,
  saving,
  error,
  autoConfirmEnabled
})
const {
  businessHoursForUI,
  updateBusinessHours,
  calendarEnabled,
  calendarProvider,
  holdDurationMinutes,
  holdDurationMin,
  holdDurationMax,
  holdDurationFallback,
  calendarEntries,
  addCalendarEntry,
  removeCalendarEntry,
  updateCalendarEntry,
  setReadFrom,
  setWriteTo,
  writeToIndex,
  calendarValidationError,
  emailValidationRule,
  saveButtonProps,
  clearError,
  durationRoundingEnabled,
  durationRoundingIncrement,
  durationRoundingMethod,
  timezone,
  minuteIncrement,
  setCalendarProvider,
  setTimezone,
  setMinuteIncrement,
  setAutoConfirmEnabled
} = formState

const { currentTab: currentMainTab } = useTabNavigation({ initialTab: 'constraints' })
const { currentTab: currentSubTab } = useTabNavigation({ initialTab: 'range' })
const { currentTab: currentCalendarTab } = useTabNavigation({ initialTab: 'integration' })
const { currentTab: currentRulesSubTab } = useTabNavigation({ initialTab: 'rules' })

const maxBusinessHours = computed(() => {
  if (!formData.value) return 0
  return calculateMaxBusinessHours(formData.value.businessHours)
})

const capacity = useCapacitySettings({ formData, maxBusinessHours })
const buffers = useBufferSettings({ formData } as UseBufferSettingsParams)
const location = useDefaultLocation({ formData } as UseDefaultLocationParams)
const differential = useDifferentialPerspectives({ formData } as UseDifferentialPerspectivesParams)

const UI_STRINGS = BUSINESS_CONTROLS_TAB_STRINGS
const dayNames = DAY_NAMES
const timezoneOptions = TIMEZONE_OPTIONS
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
            <VTab value="rounding">{{ UI_STRINGS.tabs.rounding }}</VTab>
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
                :max-income-day-max-income="capacity.maxIncomeDayMaxIncome.value"
                :max-income-day-enforcement="capacity.maxIncomeDayEnforcement.value"
                :max-income-calendar-week-max-income="capacity.maxIncomeCalendarWeekMaxIncome.value"
                :max-income-calendar-week-enforcement="capacity.maxIncomeCalendarWeekEnforcement.value"
                :max-income-rolling-week-max-income="capacity.maxIncomeRollingWeekMaxIncome.value"
                :max-income-rolling-week-enforcement="capacity.maxIncomeRollingWeekEnforcement.value"
                :max-income-rolling-week-direction="capacity.maxIncomeRollingWeekDirection.value"
                :save-button-props="saveButtonProps"
                @update:max-work-hours-day-max-hours="(v: number) => { capacity.maxWorkHoursDayMaxHours.value = v }"
                @update:max-work-hours-day-enforcement="(v) => { capacity.maxWorkHoursDayEnforcement.value = v }"
                @update:max-work-hours-calendar-week-max-hours="(v: number) => { capacity.maxWorkHoursCalendarWeekMaxHours.value = v }"
                @update:max-work-hours-calendar-week-enforcement="(v) => { capacity.maxWorkHoursCalendarWeekEnforcement.value = v }"
                @update:max-work-hours-rolling-week-max-hours="(v: number) => { capacity.maxWorkHoursRollingWeekMaxHours.value = v }"
                @update:max-work-hours-rolling-week-enforcement="(v) => { capacity.maxWorkHoursRollingWeekEnforcement.value = v }"
                @update:max-work-hours-rolling-week-direction="(v) => { capacity.maxWorkHoursRollingWeekDirection.value = v }"
                @update:max-income-day-max-income="(v: number) => { capacity.maxIncomeDayMaxIncome.value = v }"
                @update:max-income-day-enforcement="(v) => { capacity.maxIncomeDayEnforcement.value = v }"
                @update:max-income-calendar-week-max-income="(v: number) => { capacity.maxIncomeCalendarWeekMaxIncome.value = v }"
                @update:max-income-calendar-week-enforcement="(v) => { capacity.maxIncomeCalendarWeekEnforcement.value = v }"
                @update:max-income-rolling-week-max-income="(v: number) => { capacity.maxIncomeRollingWeekMaxIncome.value = v }"
                @update:max-income-rolling-week-enforcement="(v) => { capacity.maxIncomeRollingWeekEnforcement.value = v }"
                @update:max-income-rolling-week-direction="(v) => { capacity.maxIncomeRollingWeekDirection.value = v }"
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

            <VWindowItem key="rounding" value="rounding">
              <DurationRoundingPanel
                :duration-rounding-enabled="durationRoundingEnabled"
                :duration-rounding-increment="durationRoundingIncrement"
                :duration-rounding-method="durationRoundingMethod"
                :save-button-props="saveButtonProps"
                @update:duration-rounding-enabled="(v: boolean) => { durationRoundingEnabled = v }"
                @update:duration-rounding-increment="(v: number) => { durationRoundingIncrement = v }"
                @update:duration-rounding-method="(v: string) => { durationRoundingMethod = v }"
              />
            </VWindowItem>
          </VWindow>
        </VWindowItem>

        <VWindowItem key="rules" value="rules">
          <VTabs v-model="currentRulesSubTab" class="mb-4">
            <VTab value="rules">{{ UI_STRINGS.tabs.rules }}</VTab>
            <VTab value="mls">{{ UI_STRINGS.tabs.mlsMapping }}</VTab>
          </VTabs>
          <VWindow v-model="currentRulesSubTab">
            <VWindowItem key="rules" value="rules">
              <BusinessRulesTab />
            </VWindowItem>
            <VWindowItem key="mls" value="mls">
              <PropertyMappingsTab :enabled-override="currentRulesSubTab === 'mls'" />
            </VWindowItem>
          </VWindow>
        </VWindowItem>

        <VWindowItem key="calendar" value="calendar">
          <VTabs v-model="currentCalendarTab" class="mb-4">
            <VTab value="integration">{{ UI_STRINGS.tabs.integration }}</VTab>
            <VTab value="confirmation">{{ UI_STRINGS.tabs.confirmationAndHolds }}</VTab>
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

            <VWindowItem key="confirmation" value="confirmation">
              <AppointmentConfirmationPanel
                :hold-duration-minutes="holdDurationMinutes"
                :hold-duration-min="holdDurationMin"
                :hold-duration-max="holdDurationMax"
                :hold-duration-fallback="holdDurationFallback"
                :auto-confirm-enabled="autoConfirmEnabled"
                :save-button-props="saveButtonProps"
                @update:hold-duration-minutes="(v: number) => { holdDurationMinutes = v }"
                @update:hold-duration-min="(v: number) => { holdDurationMin = v }"
                @update:hold-duration-max="(v: number) => { holdDurationMax = v }"
                @update:hold-duration-fallback="(v: number) => { holdDurationFallback = v }"
                @update:auto-confirm-enabled="setAutoConfirmEnabled"
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
