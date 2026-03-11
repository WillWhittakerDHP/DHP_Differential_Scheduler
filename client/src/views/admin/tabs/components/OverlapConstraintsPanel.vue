<!--
  Overlap constraints: appointment buffers, drive time to/from, lunch placeholder
  WHY: Thin component; handlers and label/hint computeds in useOverlapConstraintsPanel.
  PATTERN: Receives businessControlsState via prop when used under BusinessControlsTab (data-flow-health).
-->
<script setup lang="ts">
import OverlapRuleSection from './OverlapRuleSection.vue'
import { useOverlapConstraintsPanel } from '@/composables/admin/useOverlapConstraintsPanel'
import type { BusinessControlsState } from '@/views/admin/tabs/businessControlsStateKey'

const props = defineProps<{
  businessControlsState: BusinessControlsState
}>()

const overlap = useOverlapConstraintsPanel(props.businessControlsState)
</script>

<template>
  <div>
    <VExpansionPanels class="mb-4">
      <VExpansionPanel :title="overlap.UI_STRINGS.panels.appointmentBuffers">
        <VExpansionPanelText>
          <VRow>
            <VCol cols="12" sm="6" md="3">
              <VTextField
                :model-value="overlap.state.buffers.buffersAppointmentMinutes"
                @update:model-value="overlap.handleBuffersAppointmentMinutes"
                :label="overlap.UI_STRINGS.labels.bufferTime"
                type="number"
                min="0"
                step="5"
                :hint="overlap.UI_STRINGS.hints.bufferTime"
                persistent-hint
                :rules="[
                  (v: number) => v >= 0 || overlap.UI_STRINGS.validation.bufferTimeMin,
                ]"
              />
            </VCol>
            <VCol cols="12" sm="6" md="3">
              <VSelect
                :model-value="overlap.state.buffers.buffersAppointmentPlacement"
                @update:model-value="overlap.handleBuffersAppointmentPlacement"
                :items="overlap.bufferPlacementOptions"
                :label="overlap.UI_STRINGS.labels.placement"
                :hint="overlap.UI_STRINGS.hints.placement"
                persistent-hint
              />
            </VCol>
            <VCol cols="12" sm="6" md="3">
              <VSelect
                :model-value="overlap.state.buffers.buffersAppointmentEnforcement"
                @update:model-value="overlap.handleBuffersAppointmentEnforcement"
                :items="overlap.enforcementOptions"
                :label="overlap.UI_STRINGS.labels.enforcement"
                :hint="overlap.UI_STRINGS.hints.bufferEnforcement"
                persistent-hint
              />
            </VCol>
          </VRow>
        </VExpansionPanelText>
      </VExpansionPanel>

      <VExpansionPanel :title="overlap.UI_STRINGS.panels.driveToCandidateBuffer">
        <VExpansionPanelText>
          <VAlert
            v-if="overlap.defaultLocationPlaceId"
            type="success"
            variant="tonal"
            density="compact"
            class="mb-4"
          >
            <template #prepend>
              <VIcon>mdi-map-marker-check</VIcon>
            </template>
            <div class="text-body-medium">
              <strong>{{ overlap.UI_STRINGS.driveTime.calculatedTitle }}</strong>
            </div>
            <div class="text-body-small">
              {{ overlap.UI_STRINGS.driveTime.calculatedCaption }}
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
              <strong>{{ overlap.UI_STRINGS.driveTime.estimatedTitle }}</strong>
            </div>
            <div class="text-body-small">
              {{ overlap.UI_STRINGS.driveTime.estimatedCaption }}
            </div>
          </VAlert>
          <div class="text-body-medium mb-4 text-medium-emphasis">
            {{ overlap.UI_STRINGS.help.driveToCandidateDescription }}
          </div>
          <VRow>
            <VCol cols="12" sm="6" md="3">
              <VTextField
                :model-value="overlap.state.buffers.buffersDriveToCandidateMinutes"
                @update:model-value="overlap.handleBuffersDriveToCandidateMinutes"
                :label="overlap.driveToMinutesLabel.value"
                type="number"
                min="0"
                step="5"
                :hint="overlap.driveToMinutesHint.value"
                persistent-hint
                :rules="[
                  (v: number) => v >= 0 || overlap.UI_STRINGS.validation.bufferTimeMin,
                ]"
              />
            </VCol>
            <VCol cols="12" sm="6" md="3">
              <VSelect
                :model-value="overlap.state.buffers.buffersDriveToCandidateApplyTo"
                @update:model-value="overlap.handleBuffersDriveToCandidateApplyTo"
                :items="overlap.driveTimeApplyToOptions"
                :label="overlap.UI_STRINGS.labels.applyTo"
                :hint="overlap.UI_STRINGS.hints.driveTimeApplyTo"
                persistent-hint
              />
            </VCol>
            <VCol cols="12" sm="6" md="3">
              <VSelect
                :model-value="overlap.state.buffers.buffersDriveToCandidateEnforcement"
                @update:model-value="overlap.handleBuffersDriveToCandidateEnforcement"
                :items="overlap.enforcementOptions"
                :label="overlap.UI_STRINGS.labels.enforcement"
                :hint="overlap.UI_STRINGS.hints.bufferEnforcement"
                persistent-hint
              />
            </VCol>
          </VRow>
        </VExpansionPanelText>
      </VExpansionPanel>

      <VExpansionPanel :title="overlap.UI_STRINGS.panels.driveFromCandidateBuffer">
        <VExpansionPanelText>
          <VAlert
            v-if="overlap.defaultLocationPlaceId"
            type="success"
            variant="tonal"
            density="compact"
            class="mb-4"
          >
            <template #prepend>
              <VIcon>mdi-map-marker-check</VIcon>
            </template>
            <div class="text-body-medium">
              <strong>{{ overlap.UI_STRINGS.driveTime.calculatedRoutesTitle }}</strong>
            </div>
            <div class="text-body-small">
              {{ overlap.UI_STRINGS.driveTime.calculatedRoutesCaption }}
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
              <strong>{{ overlap.UI_STRINGS.driveTime.staticTitle }}</strong>
            </div>
            <div class="text-body-small">
              {{ overlap.UI_STRINGS.driveTime.staticCaption }}
            </div>
          </VAlert>
          <div class="text-body-medium mb-4 text-medium-emphasis">
            {{ overlap.UI_STRINGS.help.driveFromCandidateDescription }}
          </div>
          <VRow>
            <VCol cols="12" sm="6" md="3">
              <VTextField
                :model-value="overlap.state.buffers.buffersDriveFromCandidateMinutes"
                @update:model-value="overlap.handleBuffersDriveFromCandidateMinutes"
                :label="overlap.driveFromMinutesLabel.value"
                type="number"
                min="0"
                step="5"
                :hint="overlap.driveFromMinutesHint.value"
                persistent-hint
                :rules="[
                  (v: number) => v >= 0 || overlap.UI_STRINGS.validation.bufferTimeMin,
                ]"
              />
            </VCol>
            <VCol cols="12" sm="6" md="3">
              <VSelect
                :model-value="overlap.state.buffers.buffersDriveFromCandidateApplyTo"
                @update:model-value="overlap.handleBuffersDriveFromCandidateApplyTo"
                :items="overlap.driveTimeApplyToOptions"
                :label="overlap.UI_STRINGS.labels.applyTo"
                :hint="overlap.UI_STRINGS.hints.driveTimeApplyTo"
                persistent-hint
              />
            </VCol>
            <VCol cols="12" sm="6" md="3">
              <VSelect
                :model-value="overlap.state.buffers.buffersDriveFromCandidateEnforcement"
                @update:model-value="overlap.handleBuffersDriveFromCandidateEnforcement"
                :items="overlap.enforcementOptions"
                :label="overlap.UI_STRINGS.labels.enforcement"
                :hint="overlap.UI_STRINGS.hints.bufferEnforcement"
                persistent-hint
              />
            </VCol>
          </VRow>
        </VExpansionPanelText>
      </VExpansionPanel>

      <OverlapRuleSection />

      <!-- TODO(PROJECT_PLAN Phase 6.8): Lunch Buffer UI — constraint config; deferred until admin force-create/overrides. -->
      <VExpansionPanel :title="overlap.UI_STRINGS.panels.lunchBuffer">
        <VExpansionPanelText>
          <VAlert type="info" variant="tonal">
            <div class="text-body-medium">{{ overlap.UI_STRINGS.help.lunchNotSetup }}</div>
            <div class="text-body-small mt-1">
              {{ overlap.UI_STRINGS.help.lunchDescription }}
            </div>
          </VAlert>
        </VExpansionPanelText>
      </VExpansionPanel>
    </VExpansionPanels>

    <div class="text-body-small mt-2 pa-2" style="background-color: rgba(0,0,0,0.05); border-radius: 4px; font-size: 0.75rem;">
      {{ overlap.UI_STRINGS.help.placement }}
    </div>

    <div class="d-flex gap-2 mt-4">
      <VBtn v-bind="overlap.state.saveButtonProps">
        {{ overlap.UI_STRINGS.buttons.saveSettings }}
      </VBtn>
    </div>
  </div>
</template>
