<!--
  Duration rounding: enable, increment, method
  WHY: Extracted from BusinessControlsTab to reduce file size and cohesion
-->
<script setup lang="ts">
import { computed, inject, unref } from 'vue'
import { BUSINESS_CONTROLS_STATE_KEY } from '../businessControlsStateKey'
import { BUSINESS_CONTROLS_TAB_STRINGS } from '@/configs/businessControlsTabStrings'
import {
  ROUNDING_INCREMENT_OPTIONS,
  ROUNDING_METHOD_OPTIONS
} from '@/constants/businessControlsOptions'
import { durationRoundingMatchesOrg } from '@/utils/admin/orgDefaultPolicyBadges'

const UI_STRINGS = BUSINESS_CONTROLS_TAB_STRINGS

const props = defineProps<{
  durationRoundingEnabled: boolean
  durationRoundingIncrement: number
  durationRoundingMethod: string
  saveButtonProps: { type: 'submit'; color: 'primary'; loading: boolean; disabled: boolean }
}>()

const emit = defineEmits<{
  'update:durationRoundingEnabled': [value: boolean]
  'update:durationRoundingIncrement': [value: number]
  'update:durationRoundingMethod': [value: string]
}>()

const roundingIncrementOptions = ROUNDING_INCREMENT_OPTIONS
const roundingMethodOptions = ROUNDING_METHOD_OPTIONS

const state = inject(BUSINESS_CONTROLS_STATE_KEY, null)

const durationRoundingOrgBadge = computed((): 'match' | 'override' | null => {
  if (state == null) {
    return null
  }
  const orgModule = state.organizationDefaults
  const loading = unref(orgModule.loading)
  const org = unref(orgModule.formData)
  if (loading || org == null) {
    return null
  }
  const m = durationRoundingMatchesOrg(
    props.durationRoundingEnabled,
    props.durationRoundingIncrement,
    props.durationRoundingMethod,
    org
  )
  if (m === null) {
    return null
  }
  return m ? 'match' : 'override'
})
</script>

<template>
  <div class="mb-6">
    <div class="d-flex align-center flex-wrap gap-2 mb-3">
      <div class="text-body-large">{{ UI_STRINGS.sections.durationRoundingTitle }}</div>
      <VChip
        v-if="durationRoundingOrgBadge !== null"
        size="small"
        variant="tonal"
        :color="durationRoundingOrgBadge === 'match' ? 'success' : 'warning'"
      >
        {{
          durationRoundingOrgBadge === 'match'
            ? UI_STRINGS.orgDefaultBadges.orgDefault
            : UI_STRINGS.orgDefaultBadges.override
        }}
      </VChip>
    </div>
    <VSwitch
      :model-value="durationRoundingEnabled"
      @update:model-value="(v: boolean | null) => emit('update:durationRoundingEnabled', v === true)"
      :label="UI_STRINGS.labels.enableDurationRounding"
      class="mb-4"
    />
    <div v-if="durationRoundingEnabled" class="ml-8">
      <VSelect
        :model-value="durationRoundingIncrement"
        @update:model-value="(v: number | string) => emit('update:durationRoundingIncrement', Number(v))"
        :items="roundingIncrementOptions"
        :label="UI_STRINGS.labels.roundingIncrement"
        :hint="UI_STRINGS.hints.roundingIncrement"
        persistent-hint
        :rules="[
          (v: number) => !!v || UI_STRINGS.validation.roundingIncrementRequired,
        ]"
        class="mb-4"
      />
      <VSelect
        :model-value="durationRoundingMethod"
        @update:model-value="emit('update:durationRoundingMethod', $event)"
        :items="roundingMethodOptions"
        :label="UI_STRINGS.labels.roundingMethod"
        :hint="UI_STRINGS.hints.roundingMethod"
        persistent-hint
        class="mb-2"
      />
    </div>
    <div class="text-body-small mt-2">
      {{ UI_STRINGS.help.durationRoundingDescription }}
    </div>
  </div>

  <div class="d-flex gap-2 mt-4">
    <VBtn v-bind="saveButtonProps">
      {{ UI_STRINGS.buttons.saveSettings }}
    </VBtn>
  </div>
</template>
