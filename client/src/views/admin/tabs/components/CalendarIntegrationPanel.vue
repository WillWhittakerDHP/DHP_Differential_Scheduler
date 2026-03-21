<!--
  Calendar integration: enable, provider, calendar entries list (expansion panels)
  WHY: Extracted from BusinessControlsTab to reduce file size and cohesion
-->
<script setup lang="ts">
import { ref } from 'vue'
import { BUSINESS_CONTROLS_TAB_STRINGS } from '@/configs/businessControlsTabStrings'
import { CALENDAR_PROVIDER_OPTIONS } from '@/constants/businessControlsOptions'

const UI_STRINGS = BUSINESS_CONTROLS_TAB_STRINGS

defineProps<{
  calendarEnabled: boolean
  calendarProvider: string
  calendarEntries: Array<{ email: string; label?: string; readFrom: boolean; writeTo: boolean }>
  writeToIndex: number
  calendarValidationError: string | null
  emailValidationRule: (value: string) => true | string
  saveButtonProps: { type: 'submit'; color: 'primary'; loading: boolean; disabled: boolean }
}>()

const emit = defineEmits<{
  'update:calendarEnabled': [value: boolean]
  'update:calendarProvider': [value: string]
  addCalendarEntry: []
  removeCalendarEntry: [index: number]
  updateCalendarEntry: [index: number, patch: { email?: string; label?: string }]
  setReadFrom: [index: number, value: boolean]
  setWriteTo: [index: number, value: boolean]
}>()

const calendarProviderOptions = CALENDAR_PROVIDER_OPTIONS

/** Expansion state: none expanded by default (empty array). */
const expandedPanels = ref<number[]>([])

function panelTitle(entry: { email: string; label?: string }, index: number): string {
  if (entry.label?.trim()) return entry.label
  if (entry.email?.trim()) return entry.email
  return `Calendar ${index + 1}`
}
</script>

<template>
  <div class="mb-6">
    <div class="text-body-large mb-3">{{ UI_STRINGS.calendar.integrationTitle }}</div>
    <div class="text-body-medium mb-4 text-medium-emphasis">
      {{ UI_STRINGS.calendar.integrationDescription }}
    </div>

    <VSwitch
      :model-value="calendarEnabled"
      @update:model-value="(v: boolean | null) => emit('update:calendarEnabled', v === true)"
      :label="UI_STRINGS.calendar.enableLabel"
      :hint="UI_STRINGS.calendar.enableHint"
      persistent-hint
      class="mb-4"
    />

    <VSelect
      :model-value="calendarProvider"
      @update:model-value="emit('update:calendarProvider', $event)"
      :items="calendarProviderOptions"
      :label="UI_STRINGS.calendar.providerLabel"
      :hint="UI_STRINGS.calendar.providerHint"
      persistent-hint
      :disabled="!calendarEnabled"
      class="mb-4"
    />

    <div v-if="calendarEnabled && calendarProvider !== 'none'" class="mt-6">
      <div class="d-flex justify-space-between align-center mb-3">
        <div>
          <div class="text-label-large">{{ UI_STRINGS.calendar.calendarsTitle }}</div>
          <div class="text-body-medium text-medium-emphasis">
            {{ UI_STRINGS.calendar.calendarsDescription }}
          </div>
        </div>
        <VBtn
          color="primary"
          variant="outlined"
          size="small"
          @click="emit('addCalendarEntry')"
        >
          <VIcon start>mdi-plus</VIcon>
          {{ UI_STRINGS.calendar.addCalendar }}
        </VBtn>
      </div>

      <div v-if="calendarEntries.length === 0" class="text-body-medium text-medium-emphasis mb-4">
        {{ UI_STRINGS.calendar.noCalendars }}
      </div>

      <VExpansionPanels
        v-model="expandedPanels"
        multiple
        variant="accordion"
        class="mb-4"
      >
        <VExpansionPanel
          v-for="(entry, index) in calendarEntries"
          :key="index"
          :value="index"
        >
          <VExpansionPanelTitle>
            <VIcon start>mdi-calendar</VIcon>
            {{ panelTitle(entry, index) }}
          </VExpansionPanelTitle>
          <VExpansionPanelText>
            <VRow>
              <VCol cols="12" md="5">
                <VTextField
                  :model-value="entry.email"
                  @update:model-value="(v: string) => emit('updateCalendarEntry', index, { email: v })"
                  :label="UI_STRINGS.calendar.emailLabel"
                  :hint="UI_STRINGS.calendar.emailHint"
                  persistent-hint
                  :placeholder="UI_STRINGS.placeholders.emailAddress"
                  :rules="[emailValidationRule]"
                  validate-on="blur"
                  required
                >
                  <template #prepend-inner>
                    <VIcon>mdi-email</VIcon>
                  </template>
                </VTextField>
              </VCol>
              <VCol cols="12" md="4">
                <VTextField
                  :model-value="entry.label ?? ''"
                  @update:model-value="(v: string) => emit('updateCalendarEntry', index, { label: v })"
                  :label="UI_STRINGS.calendar.labelOptional"
                  :hint="UI_STRINGS.calendar.labelHint"
                  persistent-hint
                  :placeholder="UI_STRINGS.placeholders.workCalendar"
                >
                  <template #prepend-inner>
                    <VIcon>mdi-label</VIcon>
                  </template>
                </VTextField>
              </VCol>
              <VCol cols="12" md="3" class="d-flex align-center">
                <VBtn
                  color="error"
                  variant="text"
                  size="small"
                  @click="emit('removeCalendarEntry', index)"
                >
                  <VIcon start>mdi-delete</VIcon>
                  {{ UI_STRINGS.calendar.remove }}
                </VBtn>
              </VCol>
            </VRow>

            <VRow class="mt-2">
              <VCol cols="12" sm="6" md="4">
                <VCheckbox
                  :model-value="entry.readFrom"
                  @update:model-value="(v: boolean | null) => emit('setReadFrom', index, v === true)"
                  :label="UI_STRINGS.calendar.readFrom"
                  :hint="UI_STRINGS.calendar.readFromHint"
                  persistent-hint
                  density="compact"
                >
                  <template #prepend>
                    <VIcon size="small">mdi-calendar-search</VIcon>
                  </template>
                </VCheckbox>
              </VCol>
              <VCol cols="12" sm="6" md="8">
                <VCheckbox
                  :model-value="entry.writeTo"
                  @update:model-value="(v: boolean | null) => emit('setWriteTo', index, v === true)"
                  :label="UI_STRINGS.calendar.writeTo"
                  :hint="UI_STRINGS.calendar.writeToHint"
                  persistent-hint
                  density="compact"
                  :disabled="!entry.writeTo && writeToIndex >= 0 && writeToIndex !== index"
                >
                  <template #prepend>
                    <VIcon size="small">mdi-calendar-plus</VIcon>
                  </template>
                </VCheckbox>
                <div class="text-body-small text-medium-emphasis mt-1">
                  {{ UI_STRINGS.calendar.writeToOnlyOne }}
                </div>
              </VCol>
            </VRow>
          </VExpansionPanelText>
        </VExpansionPanel>
      </VExpansionPanels>

      <VAlert
        v-if="calendarValidationError"
        type="warning"
        variant="tonal"
        density="compact"
        class="mt-2"
      >
        {{ calendarValidationError }}
      </VAlert>
    </div>

    <VAlert
      v-if="calendarEnabled && calendarProvider !== 'none'"
      type="info"
      variant="tonal"
      class="mt-4"
    >
      <div class="text-body-medium">
        <strong>{{ UI_STRINGS.calendar.authRequired }}</strong>
        {{ UI_STRINGS.calendar.authAfterSave }}
        {{ calendarProvider === 'google' ? 'Google' : 'Microsoft' }}
        {{ UI_STRINGS.calendar.authToAllow }}
      </div>
      <div class="text-body-small mt-1">
        {{ UI_STRINGS.calendar.authPrivacy }}
      </div>
    </VAlert>

    <VAlert
      v-if="!calendarEnabled"
      type="info"
      variant="tonal"
      class="mt-4"
    >
      <div class="text-body-medium">
        {{ UI_STRINGS.calendar.disabledHint }}
      </div>
    </VAlert>
  </div>

  <div class="d-flex gap-2 mt-4">
    <VBtn v-bind="saveButtonProps">
      {{ UI_STRINGS.buttons.saveSettings }}
    </VBtn>
  </div>
</template>
