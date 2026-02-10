<!--
  Places and timezone: default location, timezone settings
  WHY: Extracted from BusinessControlsTab to reduce file size and cohesion
-->
<script setup lang="ts">
import { BUSINESS_CONTROLS_TAB_STRINGS } from '@/configs/businessControlsTabStrings'
import AddressAutocomplete from '@/components/common/AddressAutocomplete.vue'
import type { Coordinates } from '@/configs/availabilitySettings'

defineProps<{
  defaultLocationAddress: string
  defaultLocationLabel: string
  defaultLocationCoordinates: Coordinates | undefined
  defaultLocationPlaceId: string
  timezone: string
  timezoneOptions: Array<{ title: string; value: string }>
  saveButtonProps: { type: 'submit'; color: 'primary'; loading: boolean; disabled: boolean }
}>()

const emit = defineEmits<{
  'update:defaultLocationAddress': [value: string]
  'update:defaultLocationLabel': [value: string]
  'update:defaultLocationCoordinates': [value: Coordinates | undefined]
  'update:defaultLocationPlaceId': [value: string]
  'update:timezone': [value: string]
}>()

const UI_STRINGS = BUSINESS_CONTROLS_TAB_STRINGS
</script>

<template>
  <div class="mb-6">
    <div class="text-subtitle-1 mb-3">{{ UI_STRINGS.sections.defaultLocationTitle }}</div>
    <div class="text-body-2 mb-4 text-medium-emphasis">
      {{ UI_STRINGS.help.defaultLocationDescription }}
    </div>
    <VRow>
      <VCol cols="12" md="8">
        <AddressAutocomplete
          :model-value="defaultLocationAddress"
          :coordinates="defaultLocationCoordinates"
          :place-id="defaultLocationPlaceId"
          :label="UI_STRINGS.labels.defaultLocationAddress"
          :hint="UI_STRINGS.hints.defaultLocationAddress"
          :placeholder="UI_STRINGS.placeholders.addressTyping"
          @update:model-value="emit('update:defaultLocationAddress', $event)"
          @update:coordinates="emit('update:defaultLocationCoordinates', $event)"
          @update:place-id="(e: string | undefined) => emit('update:defaultLocationPlaceId', e ?? '')"
        />
        <div v-if="defaultLocationCoordinates || defaultLocationPlaceId" class="text-caption mt-1 text-medium-emphasis">
          <div v-if="defaultLocationCoordinates">
            <VIcon size="x-small" class="me-1">mdi-crosshairs-gps</VIcon>
            {{ UI_STRINGS.sections.coordinatesLabel }}
            {{ defaultLocationCoordinates.lat.toFixed(6) }}, {{ defaultLocationCoordinates.lng.toFixed(6) }}
          </div>
          <div v-if="defaultLocationPlaceId" class="mt-1">
            <VIcon size="x-small" class="me-1">mdi-map-marker-check</VIcon>
            {{ UI_STRINGS.sections.placeIdLabel }}
            {{ defaultLocationPlaceId.substring(0, 20) }}...
          </div>
        </div>
      </VCol>
      <VCol cols="12" md="4">
        <VTextField
          :model-value="defaultLocationLabel"
          @update:model-value="emit('update:defaultLocationLabel', $event)"
          :label="UI_STRINGS.labels.defaultLocationLabel"
          :hint="UI_STRINGS.hints.defaultLocationLabel"
          persistent-hint
          :placeholder="UI_STRINGS.placeholders.homeOffice"
        />
      </VCol>
    </VRow>
  </div>

  <VDivider class="my-6" />

  <div class="mb-4">
    <div class="text-subtitle-1 mb-3">{{ UI_STRINGS.sections.timezoneSettingsTitle }}</div>
    <VSelect
      :model-value="timezone"
      @update:model-value="emit('update:timezone', $event)"
      :items="timezoneOptions"
      :label="UI_STRINGS.labels.timezone"
      :hint="UI_STRINGS.hints.timezone"
      persistent-hint
      :rules="[
        (v: string) => !!v || UI_STRINGS.validation.timezoneRequired,
      ]"
    />
    <div class="text-caption mt-2">
      {{ UI_STRINGS.help.timezone }}
      {{ UI_STRINGS.help.currentSelection }} {{ timezone || UI_STRINGS.help.notSet }}
    </div>
  </div>

  <div class="d-flex gap-2 mt-4">
    <VBtn v-bind="saveButtonProps">
      {{ UI_STRINGS.buttons.saveSettings }}
    </VBtn>
  </div>
</template>
