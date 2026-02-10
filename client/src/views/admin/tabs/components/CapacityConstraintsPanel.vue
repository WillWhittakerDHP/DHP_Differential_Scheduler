<!--
  Capacity constraints: per-day, calendar week, rolling week limits
  WHY: Extracted from BusinessControlsTab to reduce file size and cohesion
-->
<script setup lang="ts">
import { BUSINESS_CONTROLS_TAB_STRINGS } from '@/configs/businessControlsTabStrings'
import {
  ENFORCEMENT_OPTIONS,
  ROLLING_WEEK_DIRECTION_OPTIONS
} from '@/constants/businessControlsOptions'

const UI_STRINGS = BUSINESS_CONTROLS_TAB_STRINGS

const props = defineProps<{
  maxWorkHoursDayMaxHours: number
  maxWorkHoursDayEnforcement: 'off' | 'flexible' | 'hard'
  maxWorkHoursCalendarWeekMaxHours: number
  maxWorkHoursCalendarWeekEnforcement: 'off' | 'flexible' | 'hard'
  maxWorkHoursRollingWeekMaxHours: number
  maxWorkHoursRollingWeekEnforcement: 'off' | 'flexible' | 'hard'
  maxWorkHoursRollingWeekDirection: 'past' | 'centered' | 'future'
  saveButtonProps: { type: 'submit'; color: 'primary'; loading: boolean; disabled: boolean }
}>()

const emit = defineEmits<{
  'update:maxWorkHoursDayMaxHours': [value: number]
  'update:maxWorkHoursDayEnforcement': [value: 'off' | 'flexible' | 'hard']
  'update:maxWorkHoursCalendarWeekMaxHours': [value: number]
  'update:maxWorkHoursCalendarWeekEnforcement': [value: 'off' | 'flexible' | 'hard']
  'update:maxWorkHoursRollingWeekMaxHours': [value: number]
  'update:maxWorkHoursRollingWeekEnforcement': [value: 'off' | 'flexible' | 'hard']
  'update:maxWorkHoursRollingWeekDirection': [value: 'past' | 'centered' | 'future']
}>()

const enforcementOptions = ENFORCEMENT_OPTIONS
const rollingWeekDirectionOptions = ROLLING_WEEK_DIRECTION_OPTIONS
</script>

<template>
  <div>
    <VExpansionPanels class="mb-4">
      <VExpansionPanel :title="UI_STRINGS.panels.perDayLimit">
        <VExpansionPanelText>
          <VRow>
            <VCol cols="12" sm="6" md="4">
              <VTextField
                :model-value="props.maxWorkHoursDayMaxHours"
                @update:model-value="(v: number | string) => emit('update:maxWorkHoursDayMaxHours', Number(v))"
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
                :model-value="props.maxWorkHoursDayEnforcement"
                @update:model-value="(v: 'off' | 'flexible' | 'hard') => emit('update:maxWorkHoursDayEnforcement', v)"
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
                :model-value="props.maxWorkHoursCalendarWeekMaxHours"
                @update:model-value="(v: number | string) => emit('update:maxWorkHoursCalendarWeekMaxHours', Number(v))"
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
                :model-value="props.maxWorkHoursCalendarWeekEnforcement"
                @update:model-value="(v: 'off' | 'flexible' | 'hard') => emit('update:maxWorkHoursCalendarWeekEnforcement', v)"
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
                :model-value="props.maxWorkHoursRollingWeekMaxHours"
                @update:model-value="(v: number | string) => emit('update:maxWorkHoursRollingWeekMaxHours', Number(v))"
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
                :model-value="props.maxWorkHoursRollingWeekEnforcement"
                @update:model-value="(v: 'off' | 'flexible' | 'hard') => emit('update:maxWorkHoursRollingWeekEnforcement', v)"
                :items="enforcementOptions"
                :label="UI_STRINGS.labels.enforcement"
                :hint="UI_STRINGS.hints.enforcement"
                persistent-hint
              />
            </VCol>
            <VCol cols="12" sm="6" md="3">
              <VSelect
                :model-value="props.maxWorkHoursRollingWeekDirection"
                @update:model-value="(v: 'past' | 'centered' | 'future') => emit('update:maxWorkHoursRollingWeekDirection', v)"
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

    <div class="text-caption mt-2 pa-2" style="background-color: rgba(0,0,0,0.05); border-radius: 4px; font-size: 0.75rem;">
      {{ UI_STRINGS.help.enforcement }}
    </div>

    <div class="d-flex gap-2 mt-4">
      <VBtn v-bind="saveButtonProps">
        {{ UI_STRINGS.buttons.saveSettings }}
      </VBtn>
    </div>
  </div>
</template>
