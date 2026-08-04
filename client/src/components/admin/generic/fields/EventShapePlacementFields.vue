<template>
  <BaseInput
    :field-key="String(fieldContext.state.fieldKey)"
    :display-config="fieldContext.state.displayConfig"
    :error="fieldContext.state.error?.value"
    :show-label="showLabel"
    :is-disabled="fieldContext.state.isDisabled.value"
  >
    <AppSelect
      :id="`field-${String(fieldContext.state.fieldKey)}`"
      :name="String(fieldContext.state.fieldKey)"
      :model-value="timingBehaviorModel"
      :items="timingBehaviorItems"
      label="Timing behavior"
      :placeholder="fieldContext.state.displayConfig.placeholder"
      :disabled="fieldContext.state.displayConfig.disabled"
      :readonly="fieldContext.state.displayConfig.readOnly"
      :error="!!fieldContext.state.error?.value"
      :error-messages="fieldContext.state.error?.value"
      :autocomplete="AUTCOMPLETE_OFF"
      item-title="title"
      item-value="value"
      class="select-field"
      @update:model-value="onTimingBehaviorUpdate"
    />
    <div class="text-body-small text-medium-emphasis mt-2">
      {{ selectedTimingBehavior.description }}
    </div>
  </BaseInput>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue'
import BaseInput from './BaseInput.vue'
import AppSelect from '@/@core/components/app-form-elements/AppSelect.vue'
import { AUTCOMPLETE_OFF } from '@/utils/autocomplete'
import { useFieldValue } from '@/composables/useFieldValue'
import type { FieldInputProps } from './fieldTypes'
import type { ValidAdminValue } from '@/constants/primitives'
import { createLogger } from '@/utils/logger'
import {
  EVENT_TIMING_BEHAVIOR_OPTIONS,
  eventTimingBehaviorFromPlacement,
  eventTimingBehaviorFromValue,
  type EventTimingBehaviorValue,
} from '@/utils/admin/eventPlacementLabels'

const logger = createLogger('EventShapePlacementFields')

const props = withDefaults(defineProps<FieldInputProps>(), {
  showLabel: true,
})

const { fieldContext } = props

const placementFromForm = useFieldValue(fieldContext)

const timingBehaviorItems = EVENT_TIMING_BEHAVIOR_OPTIONS.map((option) => ({
  title: option.title,
  value: option.value,
}))

function currentAnchorEdge(): unknown {
  const form = fieldContext.state.formInstance
  if (!form) {
    return null
  }
  return (form.values as Record<string, unknown>).anchorEdge
}

const selectedTimingBehavior = computed(() =>
  eventTimingBehaviorFromPlacement(placementFromForm.value, currentAnchorEdge())
)

const timingBehaviorModel = computed<EventTimingBehaviorValue>(() => selectedTimingBehavior.value.value)

function syncFieldsToTimingBehavior(value: EventTimingBehaviorValue): void {
  const descriptor = eventTimingBehaviorFromValue(value)
  fieldContext.actions.setValue(descriptor.placementKind as ValidAdminValue)
  const form = fieldContext.state.formInstance
  if (!form) {
    logger.warn('syncFieldsToTimingBehavior skipped: formInstance missing', {
      entityKey: fieldContext.state.entityKey,
      fieldKey: String(fieldContext.state.fieldKey),
    })
    return
  }
  form.setFieldValue('anchorEdge', descriptor.anchorEdge)
}

watch(
  placementFromForm,
  () => {
    syncFieldsToTimingBehavior(timingBehaviorModel.value)
  },
  { immediate: true }
)

function onTimingBehaviorUpdate(next: unknown): void {
  syncFieldsToTimingBehavior(eventTimingBehaviorFromValue(next).value)
}
</script>

<style scoped>
.select-field {
  width: 100%;
}
</style>
