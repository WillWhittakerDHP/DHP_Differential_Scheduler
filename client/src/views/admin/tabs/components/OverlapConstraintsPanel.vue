<!--
  Overlap constraints: appointment buffers, drive time to/from, lunch placeholder
  WHY: Thin component; handlers and label/hint computeds in useOverlapConstraintsPanel.
  PATTERN: Injects businessControlsState from parent to avoid prop/emit drilling
-->
<script setup lang="ts">
import OverlapRuleSection from './OverlapRuleSection.vue'
import { useOverlapConstraintsPanel } from '@/composables/admin/useOverlapConstraintsPanel'

const overlap = useOverlapConstraintsPanel()
const {
  state,
  UI_STRINGS,
  enforcementOptions,
  bufferPlacementOptions,
  driveTimeApplyToOptions,
  defaultLocationPlaceId,
  driveToMinutesLabel,
  driveToMinutesHint,
  driveFromMinutesLabel,
  driveFromMinutesHint,
  handleBuffersAppointmentMinutes,
  handleBuffersAppointmentPlacement,
  handleBuffersAppointmentEnforcement,
  handleBuffersDriveToCandidateMinutes,
  handleBuffersDriveToCandidateApplyTo,
  handleBuffersDriveToCandidateEnforcement,
  handleBuffersDriveFromCandidateMinutes,
  handleBuffersDriveFromCandidateApplyTo,
  handleBuffersDriveFromCandidateEnforcement,
} = overlap
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
