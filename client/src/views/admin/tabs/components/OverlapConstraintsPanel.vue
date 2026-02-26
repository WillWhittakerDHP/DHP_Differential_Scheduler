<!--
  Overlap constraints: appointment buffers, drive time to/from, lunch placeholder
  WHY: Extracted from BusinessControlsTab to reduce file size and cohesion
  PATTERN: Injects businessControlsState from parent to avoid prop/emit drilling
-->
<script setup lang="ts">
import { computed, inject } from 'vue'
import { BUSINESS_CONTROLS_STATE_KEY } from '../businessControlsStateKey'
import OverlapRuleSection from './OverlapRuleSection.vue'
import { BUSINESS_CONTROLS_TAB_STRINGS } from '@/configs/businessControlsTabStrings'
import {
  ENFORCEMENT_OPTIONS,
  BUFFER_PLACEMENT_OPTIONS,
  DRIVE_TIME_APPLY_TO_OPTIONS
} from '@/constants/businessControlsOptions'

const state = inject(BUSINESS_CONTROLS_STATE_KEY)
if (!state) throw new Error('OverlapConstraintsPanel must be used inside BusinessControlsTab')

const UI_STRINGS = BUSINESS_CONTROLS_TAB_STRINGS
const enforcementOptions = ENFORCEMENT_OPTIONS
const bufferPlacementOptions = BUFFER_PLACEMENT_OPTIONS
const driveTimeApplyToOptions = DRIVE_TIME_APPLY_TO_OPTIONS

const defaultLocationPlaceId = computed(() => state.location.defaultLocationPlaceId)
const driveToMinutesLabel = computed(() =>
  defaultLocationPlaceId.value ? UI_STRINGS.driveTime.backupMinutesLabel : UI_STRINGS.driveTime.minutesLabel
)
const driveToMinutesHint = computed(() =>
  defaultLocationPlaceId.value ? UI_STRINGS.driveTime.backupHint : UI_STRINGS.hints.driveToCandidateMinutes
)
const driveFromMinutesLabel = computed(() =>
  defaultLocationPlaceId.value ? UI_STRINGS.driveTime.backupMinutesLabel : UI_STRINGS.driveTime.minutesLabel
)
const driveFromMinutesHint = computed(() =>
  defaultLocationPlaceId.value ? UI_STRINGS.driveTime.backupHint : UI_STRINGS.hints.driveFromCandidateMinutes
)

function handleBuffersAppointmentMinutes(v: number | string): void {
  state.buffers.buffersAppointmentMinutes = Number(v)
}
function handleBuffersAppointmentPlacement(v: 'off' | 'before' | 'after' | 'both'): void {
  state.buffers.buffersAppointmentPlacement = v
}
function handleBuffersAppointmentEnforcement(v: 'off' | 'flexible' | 'hard'): void {
  state.buffers.buffersAppointmentEnforcement = v
}
function handleBuffersDriveToCandidateMinutes(v: number | string): void {
  state.buffers.buffersDriveToCandidateMinutes = Number(v)
}
function handleBuffersDriveToCandidateApplyTo(v: string): void {
  state.buffers.buffersDriveToCandidateApplyTo = v
}
function handleBuffersDriveToCandidateEnforcement(v: 'off' | 'flexible' | 'hard'): void {
  state.buffers.buffersDriveToCandidateEnforcement = v
}
function handleBuffersDriveFromCandidateMinutes(v: number | string): void {
  state.buffers.buffersDriveFromCandidateMinutes = Number(v)
}
function handleBuffersDriveFromCandidateApplyTo(v: string): void {
  state.buffers.buffersDriveFromCandidateApplyTo = v
}
function handleBuffersDriveFromCandidateEnforcement(v: 'off' | 'flexible' | 'hard'): void {
  state.buffers.buffersDriveFromCandidateEnforcement = v
}
</script>

<template>
  <div>
    <VExpansionPanels class="mb-4">
      <VExpansionPanel :title="UI_STRINGS.panels.appointmentBuffers">
        <VExpansionPanelText>
          <VRow>
            <VCol cols="12" sm="6" md="3">
              <VTextField
                :model-value="state.buffers.buffersAppointmentMinutes"
                @update:model-value="handleBuffersAppointmentMinutes"
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
                :model-value="state.buffers.buffersAppointmentPlacement"
                @update:model-value="handleBuffersAppointmentPlacement"
                :items="bufferPlacementOptions"
                :label="UI_STRINGS.labels.placement"
                :hint="UI_STRINGS.hints.placement"
                persistent-hint
              />
            </VCol>
            <VCol cols="12" sm="6" md="3">
              <VSelect
                :model-value="state.buffers.buffersAppointmentEnforcement"
                @update:model-value="handleBuffersAppointmentEnforcement"
                :items="enforcementOptions"
                :label="UI_STRINGS.labels.enforcement"
                :hint="UI_STRINGS.hints.bufferEnforcement"
                persistent-hint
              />
            </VCol>
          </VRow>
        </VExpansionPanelText>
      </VExpansionPanel>

      <VExpansionPanel :title="UI_STRINGS.panels.driveToCandidateBuffer">
        <VExpansionPanelText>
          <VAlert
            v-if="defaultLocationPlaceId"
            type="success"
            variant="tonal"
            density="compact"
            class="mb-4"
          >
            <template #prepend>
              <VIcon>mdi-map-marker-check</VIcon>
            </template>
            <div class="text-body-medium">
              <strong>{{ UI_STRINGS.driveTime.calculatedTitle }}</strong>
            </div>
            <div class="text-body-small">
              {{ UI_STRINGS.driveTime.calculatedCaption }}
            </div>
          </VAlert>
          <VAlert
            v-else
            type="info"
            variant="tonal"
            density="compact"
            class="mb-4"
          >
            <template #prepend>
              <VIcon>mdi-information</VIcon>
            </template>
            <div class="text-body-medium">
              <strong>{{ UI_STRINGS.driveTime.estimatedTitle }}</strong>
            </div>
            <div class="text-body-small">
              {{ UI_STRINGS.driveTime.estimatedCaption }}
            </div>
          </VAlert>
          <div class="text-body-medium mb-4 text-medium-emphasis">
            {{ UI_STRINGS.help.driveToCandidateDescription }}
          </div>
          <VRow>
            <VCol cols="12" sm="6" md="3">
              <VTextField
                :model-value="state.buffers.buffersDriveToCandidateMinutes"
                @update:model-value="handleBuffersDriveToCandidateMinutes"
                :label="driveToMinutesLabel"
                type="number"
                min="0"
                step="5"
                :hint="driveToMinutesHint"
                persistent-hint
                :rules="[
                  (v: number) => v >= 0 || UI_STRINGS.validation.bufferTimeMin,
                ]"
              />
            </VCol>
            <VCol cols="12" sm="6" md="3">
              <VSelect
                :model-value="state.buffers.buffersDriveToCandidateApplyTo"
                @update:model-value="handleBuffersDriveToCandidateApplyTo"
                :items="driveTimeApplyToOptions"
                :label="UI_STRINGS.labels.applyTo"
                :hint="UI_STRINGS.hints.driveTimeApplyTo"
                persistent-hint
              />
            </VCol>
            <VCol cols="12" sm="6" md="3">
              <VSelect
                :model-value="state.buffers.buffersDriveToCandidateEnforcement"
                @update:model-value="handleBuffersDriveToCandidateEnforcement"
                :items="enforcementOptions"
                :label="UI_STRINGS.labels.enforcement"
                :hint="UI_STRINGS.hints.bufferEnforcement"
                persistent-hint
              />
            </VCol>
          </VRow>
        </VExpansionPanelText>
      </VExpansionPanel>

      <VExpansionPanel :title="UI_STRINGS.panels.driveFromCandidateBuffer">
        <VExpansionPanelText>
          <VAlert
            v-if="defaultLocationPlaceId"
            type="success"
            variant="tonal"
            density="compact"
            class="mb-4"
          >
            <template #prepend>
              <VIcon>mdi-map-marker-check</VIcon>
            </template>
            <div class="text-body-medium">
              <strong>{{ UI_STRINGS.driveTime.calculatedRoutesTitle }}</strong>
            </div>
            <div class="text-body-small">
              {{ UI_STRINGS.driveTime.calculatedRoutesCaption }}
            </div>
          </VAlert>
          <VAlert
            v-else
            type="info"
            variant="tonal"
            density="compact"
            class="mb-4"
          >
            <template #prepend>
              <VIcon>mdi-information</VIcon>
            </template>
            <div class="text-body-medium">
              <strong>{{ UI_STRINGS.driveTime.staticTitle }}</strong>
            </div>
            <div class="text-body-small">
              {{ UI_STRINGS.driveTime.staticCaption }}
            </div>
          </VAlert>
          <div class="text-body-medium mb-4 text-medium-emphasis">
            {{ UI_STRINGS.help.driveFromCandidateDescription }}
          </div>
          <VRow>
            <VCol cols="12" sm="6" md="3">
              <VTextField
                :model-value="state.buffers.buffersDriveFromCandidateMinutes"
                @update:model-value="handleBuffersDriveFromCandidateMinutes"
                :label="driveFromMinutesLabel"
                type="number"
                min="0"
                step="5"
                :hint="driveFromMinutesHint"
                persistent-hint
                :rules="[
                  (v: number) => v >= 0 || UI_STRINGS.validation.bufferTimeMin,
                ]"
              />
            </VCol>
            <VCol cols="12" sm="6" md="3">
              <VSelect
                :model-value="state.buffers.buffersDriveFromCandidateApplyTo"
                @update:model-value="handleBuffersDriveFromCandidateApplyTo"
                :items="driveTimeApplyToOptions"
                :label="UI_STRINGS.labels.applyTo"
                :hint="UI_STRINGS.hints.driveTimeApplyTo"
                persistent-hint
              />
            </VCol>
            <VCol cols="12" sm="6" md="3">
              <VSelect
                :model-value="state.buffers.buffersDriveFromCandidateEnforcement"
                @update:model-value="handleBuffersDriveFromCandidateEnforcement"
                :items="enforcementOptions"
                :label="UI_STRINGS.labels.enforcement"
                :hint="UI_STRINGS.hints.bufferEnforcement"
                persistent-hint
              />
            </VCol>
          </VRow>
        </VExpansionPanelText>
      </VExpansionPanel>

      <OverlapRuleSection />

      <!-- @audit-allow:todo-aging:orphaned - Future work: Lunch Buffer UI -->
      <VExpansionPanel :title="UI_STRINGS.panels.lunchBuffer">
        <VExpansionPanelText>
          <VAlert type="info" variant="tonal">
            <div class="text-body-medium">{{ UI_STRINGS.help.lunchNotSetup }}</div>
            <div class="text-body-small mt-1">
              {{ UI_STRINGS.help.lunchDescription }}
            </div>
          </VAlert>
        </VExpansionPanelText>
      </VExpansionPanel>
    </VExpansionPanels>

    <div class="text-body-small mt-2 pa-2" style="background-color: rgba(0,0,0,0.05); border-radius: 4px; font-size: 0.75rem;">
      {{ UI_STRINGS.help.placement }}
    </div>

    <div class="d-flex gap-2 mt-4">
      <VBtn v-bind="state.saveButtonProps">
        {{ UI_STRINGS.buttons.saveSettings }}
      </VBtn>
    </div>
  </div>
</template>
