<!--
  Overlap constraints: appointment buffers, drive time to/from, lunch placeholder
  WHY: Extracted from BusinessControlsTab to reduce file size and cohesion
-->
<script setup lang="ts">
import { BUSINESS_CONTROLS_TAB_STRINGS } from '@/configs/businessControlsTabStrings'
import {
  ENFORCEMENT_OPTIONS,
  BUFFER_PLACEMENT_OPTIONS,
  DRIVE_TIME_APPLY_TO_OPTIONS
} from '@/constants/businessControlsOptions'

const UI_STRINGS = BUSINESS_CONTROLS_TAB_STRINGS

defineProps<{
  buffersAppointmentMinutes: number
  buffersAppointmentPlacement: 'off' | 'before' | 'after' | 'both'
  buffersAppointmentEnforcement: 'off' | 'flexible' | 'hard'
  buffersDriveToCandidateMinutes: number
  buffersDriveToCandidateEnforcement: 'off' | 'flexible' | 'hard'
  buffersDriveToCandidateApplyTo: string
  buffersDriveFromCandidateMinutes: number
  buffersDriveFromCandidateEnforcement: 'off' | 'flexible' | 'hard'
  buffersDriveFromCandidateApplyTo: string
  overlapSourcesOutOfOfficeEnforcement: 'off' | 'flexible' | 'hard'
  defaultLocationPlaceId: string
  saveButtonProps: { type: 'submit'; color: 'primary'; loading: boolean; disabled: boolean }
}>()

const emit = defineEmits<{
  'update:buffersAppointmentMinutes': [value: number]
  'update:buffersAppointmentPlacement': [value: 'off' | 'before' | 'after' | 'both']
  'update:buffersAppointmentEnforcement': [value: 'off' | 'flexible' | 'hard']
  'update:buffersDriveToCandidateMinutes': [value: number]
  'update:buffersDriveToCandidateEnforcement': [value: 'off' | 'flexible' | 'hard']
  'update:buffersDriveToCandidateApplyTo': [value: string]
  'update:buffersDriveFromCandidateMinutes': [value: number]
  'update:buffersDriveFromCandidateEnforcement': [value: 'off' | 'flexible' | 'hard']
  'update:buffersDriveFromCandidateApplyTo': [value: string]
  'update:overlapSourcesOutOfOfficeEnforcement': [value: 'off' | 'flexible' | 'hard']
}>()

const enforcementOptions = ENFORCEMENT_OPTIONS
const bufferPlacementOptions = BUFFER_PLACEMENT_OPTIONS
const driveTimeApplyToOptions = DRIVE_TIME_APPLY_TO_OPTIONS
</script>

<template>
  <div>
    <VExpansionPanels class="mb-4">
      <VExpansionPanel :title="UI_STRINGS.panels.appointmentBuffers">
        <VExpansionPanelText>
          <VRow>
            <VCol cols="12" sm="6" md="3">
              <VTextField
                :model-value="buffersAppointmentMinutes"
                @update:model-value="(v: number | string) => emit('update:buffersAppointmentMinutes', Number(v))"
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
                :model-value="buffersAppointmentPlacement"
                @update:model-value="(v: 'off' | 'before' | 'after' | 'both') => emit('update:buffersAppointmentPlacement', v)"
                :items="bufferPlacementOptions"
                :label="UI_STRINGS.labels.placement"
                :hint="UI_STRINGS.hints.placement"
                persistent-hint
              />
            </VCol>
            <VCol cols="12" sm="6" md="3">
              <VSelect
                :model-value="buffersAppointmentEnforcement"
                @update:model-value="(v: 'off' | 'flexible' | 'hard') => emit('update:buffersAppointmentEnforcement', v)"
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
            <div class="text-body-2">
              <strong>{{ UI_STRINGS.driveTime.calculatedTitle }}</strong>
            </div>
            <div class="text-caption">
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
            <div class="text-body-2">
              <strong>{{ UI_STRINGS.driveTime.estimatedTitle }}</strong>
            </div>
            <div class="text-caption">
              {{ UI_STRINGS.driveTime.estimatedCaption }}
            </div>
          </VAlert>
          <div class="text-body-2 mb-4 text-medium-emphasis">
            {{ UI_STRINGS.help.driveToCandidateDescription }}
          </div>
          <VRow>
            <VCol cols="12" sm="6" md="3">
              <VTextField
                :model-value="buffersDriveToCandidateMinutes"
                @update:model-value="(v: number | string) => emit('update:buffersDriveToCandidateMinutes', Number(v))"
                :label="defaultLocationPlaceId ? UI_STRINGS.driveTime.fallbackMinutesLabel : UI_STRINGS.driveTime.minutesLabel"
                type="number"
                min="0"
                step="5"
                :hint="defaultLocationPlaceId ? UI_STRINGS.driveTime.fallbackHint : UI_STRINGS.hints.driveToCandidateMinutes"
                persistent-hint
                :rules="[
                  (v: number) => v >= 0 || UI_STRINGS.validation.bufferTimeMin,
                ]"
              />
            </VCol>
            <VCol cols="12" sm="6" md="3">
              <VSelect
                :model-value="buffersDriveToCandidateApplyTo"
                @update:model-value="(v: string) => emit('update:buffersDriveToCandidateApplyTo', v)"
                :items="driveTimeApplyToOptions"
                :label="UI_STRINGS.labels.applyTo"
                :hint="UI_STRINGS.hints.driveTimeApplyTo"
                persistent-hint
              />
            </VCol>
            <VCol cols="12" sm="6" md="3">
              <VSelect
                :model-value="buffersDriveToCandidateEnforcement"
                @update:model-value="(v: 'off' | 'flexible' | 'hard') => emit('update:buffersDriveToCandidateEnforcement', v)"
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
            <div class="text-body-2">
              <strong>{{ UI_STRINGS.driveTime.calculatedRoutesTitle }}</strong>
            </div>
            <div class="text-caption">
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
            <div class="text-body-2">
              <strong>{{ UI_STRINGS.driveTime.staticTitle }}</strong>
            </div>
            <div class="text-caption">
              {{ UI_STRINGS.driveTime.staticCaption }}
            </div>
          </VAlert>
          <div class="text-body-2 mb-4 text-medium-emphasis">
            {{ UI_STRINGS.help.driveFromCandidateDescription }}
          </div>
          <VRow>
            <VCol cols="12" sm="6" md="3">
              <VTextField
                :model-value="buffersDriveFromCandidateMinutes"
                @update:model-value="(v: number | string) => emit('update:buffersDriveFromCandidateMinutes', Number(v))"
                :label="defaultLocationPlaceId ? UI_STRINGS.driveTime.fallbackMinutesLabel : UI_STRINGS.driveTime.minutesLabel"
                type="number"
                min="0"
                step="5"
                :hint="defaultLocationPlaceId ? UI_STRINGS.driveTime.fallbackHint : UI_STRINGS.hints.driveFromCandidateMinutes"
                persistent-hint
                :rules="[
                  (v: number) => v >= 0 || UI_STRINGS.validation.bufferTimeMin,
                ]"
              />
            </VCol>
            <VCol cols="12" sm="6" md="3">
              <VSelect
                :model-value="buffersDriveFromCandidateApplyTo"
                @update:model-value="(v: string) => emit('update:buffersDriveFromCandidateApplyTo', v)"
                :items="driveTimeApplyToOptions"
                :label="UI_STRINGS.labels.applyTo"
                :hint="UI_STRINGS.hints.driveTimeApplyTo"
                persistent-hint
              />
            </VCol>
            <VCol cols="12" sm="6" md="3">
              <VSelect
                :model-value="buffersDriveFromCandidateEnforcement"
                @update:model-value="(v: 'off' | 'flexible' | 'hard') => emit('update:buffersDriveFromCandidateEnforcement', v)"
                :items="enforcementOptions"
                :label="UI_STRINGS.labels.enforcement"
                :hint="UI_STRINGS.hints.bufferEnforcement"
                persistent-hint
              />
            </VCol>
          </VRow>
        </VExpansionPanelText>
      </VExpansionPanel>

      <VExpansionPanel :title="UI_STRINGS.panels.outOfOfficeEvents">
        <VExpansionPanelText>
          <div class="text-body-2 mb-4 text-medium-emphasis">
            {{ UI_STRINGS.help.outOfOfficeDescription }}
          </div>
          <VRow>
            <VCol cols="12" sm="6" md="3">
              <VSelect
                :model-value="overlapSourcesOutOfOfficeEnforcement"
                @update:model-value="(v: 'off' | 'flexible' | 'hard') => emit('update:overlapSourcesOutOfOfficeEnforcement', v)"
                :items="enforcementOptions"
                :label="UI_STRINGS.labels.enforcement"
                :hint="UI_STRINGS.hints.bufferEnforcement"
                persistent-hint
              />
            </VCol>
          </VRow>
        </VExpansionPanelText>
      </VExpansionPanel>

      <!-- @audit-allow:todo-aging:orphaned - Future work: Lunch Buffer UI -->
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

    <div class="text-caption mt-2 pa-2" style="background-color: rgba(0,0,0,0.05); border-radius: 4px; font-size: 0.75rem;">
      {{ UI_STRINGS.help.placement }}
    </div>

    <div class="d-flex gap-2 mt-4">
      <VBtn v-bind="saveButtonProps">
        {{ UI_STRINGS.buttons.saveSettings }}
      </VBtn>
    </div>
  </div>
</template>
