<!--
  Calendar integration: enable, provider, calendar entries list
  WHY: Extracted from BusinessControlsTab to reduce file size and cohesion
-->
<script setup lang="ts">
import { BUSINESS_CONTROLS_TAB_STRINGS } from '@/configs/businessControlsTabStrings'
import { CALENDAR_PROVIDER_OPTIONS } from '@/constants/businessControlsOptions'

const UI_STRINGS = BUSINESS_CONTROLS_TAB_STRINGS

const HOLD_DURATION_MIN = 1
const HOLD_DURATION_MAX = 60

function clampHoldDuration(value: number): number {
  const n = Number.isNaN(value) ? 15 : Math.floor(value)
  return Math.min(HOLD_DURATION_MAX, Math.max(HOLD_DURATION_MIN, n))
}

function holdDurationRule(value: unknown): true | string {
  const n = Number(value)
  if (Number.isNaN(n)) return UI_STRINGS.calendar.holdDurationMin
  if (n < HOLD_DURATION_MIN) return UI_STRINGS.calendar.holdDurationMin
  if (n > HOLD_DURATION_MAX) return UI_STRINGS.calendar.holdDurationMax
  return true
}

defineProps<{
  calendarEnabled: boolean
  calendarProvider: string
  holdDurationMinutes: number
  calendarEntries: Array<{ email: string; label?: string; readFrom: boolean; writeTo: boolean }>
  writeToIndex: number
  calendarValidationError: string | null
  emailValidationRule: (value: string) => true | string
  saveButtonProps: { type: 'submit'; color: 'primary'; loading: boolean; disabled: boolean }
}>()

const emit = defineEmits<{
  'update:calendarEnabled': [value: boolean]
  'update:calendarProvider': [value: string]
  'update:holdDurationMinutes': [value: number]
  addCalendarEntry: []
  removeCalendarEntry: [index: number]
  updateCalendarEntry: [index: number, patch: { email?: string; label?: string }]
  setReadFrom: [index: number, value: boolean]
  setWriteTo: [index: number, value: boolean]
}>()

const calendarProviderOptions = CALENDAR_PROVIDER_OPTIONS
</script>

<template>
  <div class="mb-6">
    <div class="text-subtitle-1 mb-3">{{ UI_STRINGS.calendar.integrationTitle }}</div>
    <div class="text-body-2 mb-4 text-medium-emphasis">
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

    <VDivider class="my-4" />

    <div class="text-subtitle-2 mb-2">{{ UI_STRINGS.calendar.appointmentHoldsTitle }}</div>
    <VTextField
      :model-value="holdDurationMinutes"
      @update:model-value="(v: string | number) => emit('update:holdDurationMinutes', clampHoldDuration(Number(v)))"
      type="number"
      :min="1"
      :max="60"
      :label="UI_STRINGS.calendar.holdDurationLabel"
      :hint="UI_STRINGS.calendar.holdDurationHint"
      persistent-hint
      class="mb-4"
      :rules="[holdDurationRule]"
      validate-on="blur"
    />

    <div v-if="calendarEnabled && calendarProvider !== 'none'" class="mt-6">
      <div class="d-flex justify-space-between align-center mb-3">
        <div>
          <div class="text-subtitle-2">{{ UI_STRINGS.calendar.calendarsTitle }}</div>
          <div class="text-body-2 text-medium-emphasis">
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

      <div v-if="calendarEntries.length === 0" class="text-body-2 text-medium-emphasis mb-4">
        {{ UI_STRINGS.calendar.noCalendars }}
      </div>

      <VCard
        v-for="(entry, index) in calendarEntries"
        :key="index"
        variant="outlined"
        class="mb-4"
      >
        <VCardText>
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
              <div class="text-caption text-medium-emphasis mt-1">
                {{ UI_STRINGS.calendar.writeToOnlyOne }}
              </div>
            </VCol>
          </VRow>
        </VCardText>
      </VCard>

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
      <div class="text-body-2">
        <strong>{{ UI_STRINGS.calendar.authRequired }}</strong>
        {{ UI_STRINGS.calendar.authAfterSave }}
        {{ calendarProvider === 'google' ? 'Google' : 'Microsoft' }}
        {{ UI_STRINGS.calendar.authToAllow }}
      </div>
      <div class="text-caption mt-1">
        {{ UI_STRINGS.calendar.authPrivacy }}
      </div>
    </VAlert>

    <VAlert
      v-if="!calendarEnabled"
      type="info"
      variant="tonal"
      class="mt-4"
    >
      <div class="text-body-2">
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
