<!--
  WHY: Encapsulates calendar sub-tabs (integration, confirmation, places, grid) for Business Controls.
  PATTERN: Injects shared state; owns sub-tab navigation and panel layout.
-->
<script setup lang="ts">
import { computed, inject } from 'vue'
import { BUSINESS_CONTROLS_STATE_KEY, type BusinessControlsState } from './businessControlsStateKey'
import { useTabNavigation } from '@/composables/admin/useTabNavigation'
import { TIMEZONE_OPTIONS } from '@/constants/availabilitySettings'
import { BUSINESS_CONTROLS_TAB_STRINGS } from '@/configs/businessControlsTabStrings'
import CalendarIntegrationPanel from './components/CalendarIntegrationPanel.vue'
import AppointmentConfirmationPanel from './components/AppointmentConfirmationPanel.vue'
import PlacesTimezonePanel from './components/PlacesTimezonePanel.vue'
import GridConfigPanel from './components/GridConfigPanel.vue'

const _injectedState = inject(BUSINESS_CONTROLS_STATE_KEY)
if (!_injectedState) throw new Error('BusinessControlsCalendarSection must be used inside BusinessControlsTab')
const state: BusinessControlsState = _injectedState
const { currentTab: currentCalendarTab } = useTabNavigation({ initialTab: 'integration' })

const UI_STRINGS = BUSINESS_CONTROLS_TAB_STRINGS
const timezoneOptions = TIMEZONE_OPTIONS

const appointmentConfirmationPanelModel = computed(() => {
  const fs = state.formState
  if (!fs) {
    return null
  }
  return {
    holdDurationMinutes: fs.holdDurationMinutes,
    holdDurationMin: fs.holdDurationMin,
    holdDurationMax: fs.holdDurationMax,
    holdDurationFallback: fs.holdDurationFallback,
    adminEntryTimeoutValue: fs.adminEntryTimeoutValue,
    adminEntryTimeoutUnit: fs.adminEntryTimeoutUnit,
    autoConfirmEnabled: state.autoConfirmEnabled,
  }
})
</script>

<template>
  <div>
    <VTabs v-model="currentCalendarTab" class="mb-4">
      <VTab value="integration">{{ UI_STRINGS.tabs.integration }}</VTab>
      <VTab value="confirmation">{{ UI_STRINGS.tabs.confirmationAndHolds }}</VTab>
      <VTab value="places">{{ UI_STRINGS.tabs.places }}</VTab>
      <VTab value="grid">{{ UI_STRINGS.tabs.grid }}</VTab>
    </VTabs>

    <VWindow v-model="currentCalendarTab">
      <VWindowItem key="integration" value="integration">
        <CalendarIntegrationPanel
          v-if="state?.formState"
          :calendar-enabled="state.formState.calendarEnabled"
          :calendar-provider="state.formState.calendarProvider"
          :calendar-entries="state.formState.calendarEntries"
          :write-to-index="state.formState.writeToIndex"
          :calendar-validation-error="state.formState.calendarValidationError"
          :email-validation-rule="state.formState.emailValidationRule"
          :save-button-props="state.saveButtonProps"
          @update:calendar-enabled="(v: boolean) => { state.formState.calendarEnabled = v }"
          @update:calendar-provider="state.formState.setCalendarProvider"
          @add-calendar-entry="state.formState.addCalendarEntry"
          @remove-calendar-entry="state.formState.removeCalendarEntry"
          @update-calendar-entry="state.formState.updateCalendarEntry"
          @set-read-from="state.formState.setReadFrom"
          @set-write-to="state.formState.setWriteTo"
        />
      </VWindowItem>

      <VWindowItem key="confirmation" value="confirmation">
        <AppointmentConfirmationPanel
          v-if="appointmentConfirmationPanelModel"
          :panel-model="appointmentConfirmationPanelModel"
          :save-button-props="state.saveButtonProps"
          @update:hold-duration-minutes="(v: number) => { state.formState!.holdDurationMinutes = v }"
          @update:hold-duration-min="(v: number) => { state.formState!.holdDurationMin = v }"
          @update:hold-duration-max="(v: number) => { state.formState!.holdDurationMax = v }"
          @update:hold-duration-fallback="(v: number) => { state.formState!.holdDurationFallback = v }"
          @update:admin-entry-timeout-value="(v: number) => { state.formState!.adminEntryTimeoutValue = v }"
          @update:admin-entry-timeout-unit="(v: 'days' | 'weeks') => { state.formState!.adminEntryTimeoutUnit = v }"
          @update:auto-confirm-enabled="state.formState!.setAutoConfirmEnabled"
        />
      </VWindowItem>

      <VWindowItem key="places" value="places">
        <PlacesTimezonePanel
          v-if="state?.formState && state?.location"
          :default-location-address="state.location.defaultLocationAddress"
          :default-location-label="state.location.defaultLocationLabel"
          :default-location-coordinates="state.location.defaultLocationCoordinates"
          :default-location-place-id="state.location.defaultLocationPlaceId"
          :timezone="state.formState.timezone"
          :timezone-options="[...timezoneOptions]"
          :save-button-props="state.saveButtonProps"
          @update:default-location-address="(v: string) => { state.location.defaultLocationAddress = v }"
          @update:default-location-label="(v: string) => { state.location.defaultLocationLabel = v }"
          @update:default-location-coordinates="(v) => { state.location.defaultLocationCoordinates = v }"
          @update:default-location-place-id="(v: string) => { state.location.defaultLocationPlaceId = v }"
          @update:timezone="state.formState.setTimezone"
        />
      </VWindowItem>

      <VWindowItem key="grid" value="grid">
        <GridConfigPanel />
      </VWindowItem>
    </VWindow>
  </div>
</template>
