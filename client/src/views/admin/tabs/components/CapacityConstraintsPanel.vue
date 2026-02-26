<!--
  Capacity constraints: per-day, calendar week, rolling week limits
  WHY: Extracted from BusinessControlsTab to reduce file size and cohesion
  PATTERN: Injects businessControlsState from parent to avoid prop/emit drilling
-->
<script setup lang="ts">
import { inject } from 'vue'
import { BUSINESS_CONTROLS_STATE_KEY } from '../businessControlsStateKey'
import { BUSINESS_CONTROLS_TAB_STRINGS } from '@/configs/businessControlsTabStrings'
import {
  ENFORCEMENT_OPTIONS,
  ROLLING_WEEK_DIRECTION_OPTIONS
} from '@/constants/businessControlsOptions'

const state = inject(BUSINESS_CONTROLS_STATE_KEY)
if (!state) throw new Error('CapacityConstraintsPanel must be used inside BusinessControlsTab')

const UI_STRINGS = BUSINESS_CONTROLS_TAB_STRINGS
const enforcementOptions = ENFORCEMENT_OPTIONS
const rollingWeekDirectionOptions = ROLLING_WEEK_DIRECTION_OPTIONS

const workHours = state.capacity.maxWorkHours
const income = state.capacity.maxIncome

function handleMaxWorkHoursDayMaxHours(v: number | string): void {
  workHours.maxWorkHoursDayMaxHours = Number(v)
}
function handleMaxWorkHoursDayEnforcement(v: 'off' | 'flexible' | 'hard'): void {
  workHours.maxWorkHoursDayEnforcement = v
}
function handleMaxIncomeDayMaxIncome(v: number | string): void {
  income.maxIncomeDayMaxIncome = Number(v)
}
function handleMaxIncomeDayEnforcement(v: 'off' | 'flexible' | 'hard'): void {
  income.maxIncomeDayEnforcement = v
}
function handleMaxWorkHoursCalendarWeekMaxHours(v: number | string): void {
  workHours.maxWorkHoursCalendarWeekMaxHours = Number(v)
}
function handleMaxWorkHoursCalendarWeekEnforcement(v: 'off' | 'flexible' | 'hard'): void {
  workHours.maxWorkHoursCalendarWeekEnforcement = v
}
function handleMaxIncomeCalendarWeekMaxIncome(v: number | string): void {
  income.maxIncomeCalendarWeekMaxIncome = Number(v)
}
function handleMaxIncomeCalendarWeekEnforcement(v: 'off' | 'flexible' | 'hard'): void {
  income.maxIncomeCalendarWeekEnforcement = v
}
function handleMaxWorkHoursRollingWeekMaxHours(v: number | string): void {
  workHours.maxWorkHoursRollingWeekMaxHours = Number(v)
}
function handleMaxWorkHoursRollingWeekEnforcement(v: 'off' | 'flexible' | 'hard'): void {
  workHours.maxWorkHoursRollingWeekEnforcement = v
}
function handleMaxWorkHoursRollingWeekDirection(v: 'past' | 'centered' | 'future'): void {
  workHours.maxWorkHoursRollingWeekDirection = v
}
function handleMaxIncomeRollingWeekMaxIncome(v: number | string): void {
  income.maxIncomeRollingWeekMaxIncome = Number(v)
}
function handleMaxIncomeRollingWeekEnforcement(v: 'off' | 'flexible' | 'hard'): void {
  income.maxIncomeRollingWeekEnforcement = v
}
function handleMaxIncomeRollingWeekDirection(v: 'past' | 'centered' | 'future'): void {
  income.maxIncomeRollingWeekDirection = v
}
</script>

<template>
  <div>
    <VExpansionPanels class="mb-4">
      <VExpansionPanel :title="UI_STRINGS.panels.perDayLimit">
        <VExpansionPanelText>
          <VRow>
            <VCol cols="12" sm="6" md="4">
              <VTextField
                :model-value="workHours.maxWorkHoursDayMaxHours"
                @update:model-value="handleMaxWorkHoursDayMaxHours"
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
                :model-value="workHours.maxWorkHoursDayEnforcement"
                @update:model-value="handleMaxWorkHoursDayEnforcement"
                :items="enforcementOptions"
                :label="UI_STRINGS.labels.enforcement"
                :hint="UI_STRINGS.hints.enforcement"
                persistent-hint
              />
            </VCol>
          </VRow>
          <VRow class="mt-2">
            <VCol cols="12" sm="6" md="4">
              <VTextField
                :model-value="income.maxIncomeDayMaxIncome"
                @update:model-value="handleMaxIncomeDayMaxIncome"
                :label="UI_STRINGS.labels.maximumIncomePerDay"
                type="number"
                min="0"
                step="1"
                :rules="[(v: number) => v >= 0 || UI_STRINGS.validation.mustBeZeroOrGreater]"
              />
            </VCol>
            <VCol cols="12" sm="6" md="4">
              <VSelect
                :model-value="income.maxIncomeDayEnforcement"
                @update:model-value="handleMaxIncomeDayEnforcement"
                :items="enforcementOptions"
                :label="UI_STRINGS.labels.enforcement"
                :hint="UI_STRINGS.hints.enforcement"
                persistent-hint
              />
            </VCol>
          </VRow>
        </VExpansionPanelText>
      </VExpansionPanel>

      <VExpansionPanel :title="UI_STRINGS.panels.calendarWeekLimit">
        <VExpansionPanelText>
          <VRow>
            <VCol cols="12" sm="6" md="4">
              <VTextField
                :model-value="workHours.maxWorkHoursCalendarWeekMaxHours"
                @update:model-value="handleMaxWorkHoursCalendarWeekMaxHours"
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
                :model-value="workHours.maxWorkHoursCalendarWeekEnforcement"
                @update:model-value="handleMaxWorkHoursCalendarWeekEnforcement"
                :items="enforcementOptions"
                :label="UI_STRINGS.labels.enforcement"
                :hint="UI_STRINGS.hints.enforcement"
                persistent-hint
              />
            </VCol>
          </VRow>
          <VRow class="mt-2">
            <VCol cols="12" sm="6" md="4">
              <VTextField
                :model-value="income.maxIncomeCalendarWeekMaxIncome"
                @update:model-value="handleMaxIncomeCalendarWeekMaxIncome"
                :label="UI_STRINGS.labels.maximumIncomePerWeek"
                type="number"
                min="0"
                step="1"
                :rules="[(v: number) => v >= 0 || UI_STRINGS.validation.mustBeZeroOrGreater]"
              />
            </VCol>
            <VCol cols="12" sm="6" md="4">
              <VSelect
                :model-value="income.maxIncomeCalendarWeekEnforcement"
                @update:model-value="handleMaxIncomeCalendarWeekEnforcement"
                :items="enforcementOptions"
                :label="UI_STRINGS.labels.enforcement"
                :hint="UI_STRINGS.hints.enforcement"
                persistent-hint
              />
            </VCol>
          </VRow>
        </VExpansionPanelText>
      </VExpansionPanel>

      <VExpansionPanel :title="UI_STRINGS.panels.rollingWeekLimit">
        <VExpansionPanelText>
          <VRow>
            <VCol cols="12" sm="6" md="3">
              <VTextField
                :model-value="workHours.maxWorkHoursRollingWeekMaxHours"
                @update:model-value="handleMaxWorkHoursRollingWeekMaxHours"
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
                :model-value="workHours.maxWorkHoursRollingWeekEnforcement"
                @update:model-value="handleMaxWorkHoursRollingWeekEnforcement"
                :items="enforcementOptions"
                :label="UI_STRINGS.labels.enforcement"
                :hint="UI_STRINGS.hints.enforcement"
                persistent-hint
              />
            </VCol>
            <VCol cols="12" sm="6" md="3">
              <VSelect
                :model-value="workHours.maxWorkHoursRollingWeekDirection"
                @update:model-value="handleMaxWorkHoursRollingWeekDirection"
                :items="rollingWeekDirectionOptions"
                :label="UI_STRINGS.labels.direction"
                :hint="UI_STRINGS.hints.direction"
                persistent-hint
              />
            </VCol>
          </VRow>
          <VRow class="mt-2">
            <VCol cols="12" sm="6" md="3">
              <VTextField
                :model-value="income.maxIncomeRollingWeekMaxIncome"
                @update:model-value="handleMaxIncomeRollingWeekMaxIncome"
                :label="UI_STRINGS.labels.maximumIncome7Days"
                type="number"
                min="0"
                step="1"
                :rules="[(v: number) => v >= 0 || UI_STRINGS.validation.mustBeZeroOrGreater]"
              />
            </VCol>
            <VCol cols="12" sm="6" md="3">
              <VSelect
                :model-value="income.maxIncomeRollingWeekEnforcement"
                @update:model-value="handleMaxIncomeRollingWeekEnforcement"
                :items="enforcementOptions"
                :label="UI_STRINGS.labels.enforcement"
                :hint="UI_STRINGS.hints.enforcement"
                persistent-hint
              />
            </VCol>
            <VCol cols="12" sm="6" md="3">
              <VSelect
                :model-value="income.maxIncomeRollingWeekDirection"
                @update:model-value="handleMaxIncomeRollingWeekDirection"
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

    <div class="text-body-small mt-2 pa-2 hint-box">
      {{ UI_STRINGS.help.enforcement }}
    </div>

    <div class="d-flex gap-2 mt-4">
      <VBtn v-bind="state.saveButtonProps">
        {{ UI_STRINGS.buttons.saveSettings }}
      </VBtn>
    </div>
  </div>
</template>

<style scoped>
.hint-box {
  background-color: rgba(var(--v-theme-on-surface), 0.05);
  border-radius: 4px;
  font-size: 0.75rem;
}
</style>
