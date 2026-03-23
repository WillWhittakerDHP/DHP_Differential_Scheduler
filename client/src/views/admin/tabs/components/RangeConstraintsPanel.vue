<!--
  Range constraints: business hours, lead time, date range placeholder
  WHY: Extracted from BusinessControlsTab to reduce file size and cohesion
-->
<script setup lang="ts">
import { BUSINESS_CONTROLS_TAB_STRINGS } from '@/configs/businessControlsTabStrings'

const UI_STRINGS = BUSINESS_CONTROLS_TAB_STRINGS

defineProps<{
  businessHoursForUi: Record<number, { start: string; end: string }>
  updateBusinessHours: (day: number, field: 'start' | 'end', value: string) => void
  dayNames: readonly string[]
  rangeConstraintsLeadTimeMinutes: number
  saveButtonProps: { type: 'submit'; color: 'primary'; loading: boolean; disabled: boolean }
}>()

const emit = defineEmits<{
  'update:rangeConstraintsLeadTimeMinutes': [value: number]
}>()

function handleRangeConstraintsLeadTimeMinutes(v: number | string): void {
  emit('update:rangeConstraintsLeadTimeMinutes', Number(v))
}
</script>

<template>
  <div>
    <VExpansionPanels class="mb-4">
      <VExpansionPanel :title="UI_STRINGS.panels.businessHours">
        <VExpansionPanelText>
          <div
            v-for="day in 7"
            :key="day - 1"
            class="mb-4"
          >
            <div class="text-label-large mb-2">{{ dayNames[day - 1] }}</div>
            <VRow>
              <VCol cols="12" sm="6" md="4">
                <VTextField
                  :model-value="businessHoursForUi[(day - 1) as keyof typeof businessHoursForUi]?.start"
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
                  :model-value="businessHoursForUi[(day - 1) as keyof typeof businessHoursForUi]?.end"
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

      <VExpansionPanel :title="UI_STRINGS.panels.leadTimeConstraint">
        <VExpansionPanelText>
          <VTextField
            :model-value="rangeConstraintsLeadTimeMinutes"
            @update:model-value="handleRangeConstraintsLeadTimeMinutes"
            :label="UI_STRINGS.labels.minimumLeadTime"
            type="number"
            min="0"
            required
            :rules="[
              (v: number) => v !== null && v !== undefined || UI_STRINGS.validation.leadTimeRequired,
              (v: number) => v >= 0 || UI_STRINGS.validation.leadTimeMin,
            ]"
          />
          <div class="text-body-small mt-2">
            {{ UI_STRINGS.help.leadTimeDescription }} {{ rangeConstraintsLeadTimeMinutes }} {{ UI_STRINGS.help.leadTimeMinutes }}
            ({{ Math.round(rangeConstraintsLeadTimeMinutes / 60 * 10) / 10 }} {{ UI_STRINGS.help.leadTimeHours }})
          </div>
          <div class="text-body-small mt-1 hint-text">
            {{ UI_STRINGS.help.leadTimeFilter }}
          </div>
        </VExpansionPanelText>
      </VExpansionPanel>

      <!-- DEFERRED PLAN-68: Date Range Constraint UI (PROJECT_PLAN Phase 6.8) — constraint config; deferred until admin force-create/overrides. -->
      <VExpansionPanel :title="UI_STRINGS.panels.dateRangeConstraint">
        <VExpansionPanelText>
          <VAlert type="info" variant="tonal">
            <div class="text-body-medium">{{ UI_STRINGS.help.dateRangeNotSetup }}</div>
            <div class="text-body-small mt-1">
              {{ UI_STRINGS.help.dateRangeDescription }}
            </div>
          </VAlert>
        </VExpansionPanelText>
      </VExpansionPanel>
    </VExpansionPanels>

    <div class="text-body-small mt-2 pa-2 hint-box">
      {{ UI_STRINGS.help.rangeConstraints }}
    </div>

    <div class="d-flex gap-2 mt-4">
      <VBtn v-bind="saveButtonProps">
        {{ UI_STRINGS.buttons.saveSettings }}
      </VBtn>
    </div>
  </div>
</template>

<style scoped>
.hint-text {
  color: rgba(var(--v-theme-on-surface), 0.6);
}

.hint-box {
  background-color: rgba(var(--v-theme-on-surface), 0.05);
  border-radius: 4px;
  font-size: 0.75rem;
}
</style>
