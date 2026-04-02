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
      :model-value="placementModel"
      :items="placementItems"
      :label="placementLabel"
      :placeholder="fieldContext.state.displayConfig.placeholder"
      :disabled="fieldContext.state.displayConfig.disabled"
      :readonly="fieldContext.state.displayConfig.readOnly"
      :error="!!fieldContext.state.error?.value"
      :error-messages="fieldContext.state.error?.value"
      :autocomplete="AUTCOMPLETE_OFF"
      item-title="title"
      item-value="value"
      class="select-field"
      @update:model-value="onPlacementKindUpdate"
    />
    <div
      v-if="showAnchorRow"
      class="mt-3"
    >
      <div class="text-caption text-medium-emphasis mb-1">
        Anchor edge
      </div>
      <AppSelect
        id="field-eventShape-anchorEdge"
        name="anchorEdge"
        :model-value="anchorModel"
        :items="anchorItems"
        label="Start or end of block window"
        placeholder="start | end"
        :disabled="anchorDisabled"
        :readonly="fieldContext.state.displayConfig.readOnly"
        :autocomplete="AUTCOMPLETE_OFF"
        item-title="title"
        item-value="value"
        class="select-field"
        @update:model-value="onAnchorUpdate"
      />
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
import {
  isEventAnchorEdge,
  isEventPlacementKind,
  type EventAnchorEdge,
  type EventPlacementKind,
} from '@shared/utils/eventPlacementUtils'
import { createLogger } from '@/utils/logger'

const logger = createLogger('EventShapePlacementFields')

const props = withDefaults(defineProps<FieldInputProps>(), {
  showLabel: true,
})

const { fieldContext } = props

const placementItems: { title: string; value: EventPlacementKind }[] = [
  { title: 'Primary', value: 'primary' },
  { title: 'Secondary', value: 'secondary' },
  { title: 'Marginal', value: 'marginal' },
  { title: 'Floating', value: 'floating' },
]

const anchorItems: { title: string; value: EventAnchorEdge }[] = [
  { title: 'Start', value: 'start' },
  { title: 'End', value: 'end' },
]

const placementLabel = computed(() => fieldContext.state.displayConfig.label)

const placementFromForm = useFieldValue(fieldContext)

function normalizedPlacementKind(raw: ValidAdminValue): EventPlacementKind {
  return isEventPlacementKind(raw) ? raw : 'primary'
}

const placementModel = computed(() => normalizedPlacementKind(placementFromForm.value))

const showAnchorRow = computed(() => placementModel.value !== 'primary')

const anchorDisabled = computed(
  () => fieldContext.state.displayConfig.disabled || fieldContext.state.isDisabled.value
)

const anchorModel = computed((): EventAnchorEdge | null => {
  const form = fieldContext.state.formInstance
  if (!form) {
    return null
  }
  const raw = (form.values as Record<string, unknown>).anchorEdge
  return isEventAnchorEdge(raw) ? raw : null
})

function syncAnchorToPlacementKind(kind: EventPlacementKind): void {
  const form = fieldContext.state.formInstance
  if (!form) {
    logger.warn('syncAnchorToPlacementKind skipped: formInstance missing', {
      entityKey: fieldContext.state.entityKey,
      fieldKey: String(fieldContext.state.fieldKey),
    })
    return
  }
  if (kind === 'primary') {
    const cur = (form.values as Record<string, unknown>).anchorEdge
    if (cur != null && cur !== '') {
      form.setFieldValue('anchorEdge', null)
    }
    return
  }
  const cur = (form.values as Record<string, unknown>).anchorEdge
  if (!isEventAnchorEdge(cur)) {
    form.setFieldValue('anchorEdge', 'start')
  }
}

watch(
  placementFromForm,
  (raw) => {
    syncAnchorToPlacementKind(normalizedPlacementKind(raw))
  },
  { immediate: true }
)

function onPlacementKindUpdate(next: unknown): void {
  const v = next as ValidAdminValue
  fieldContext.actions.setValue(v)
  syncAnchorToPlacementKind(normalizedPlacementKind(v))
}

function onAnchorUpdate(next: unknown): void {
  const form = fieldContext.state.formInstance
  if (!form) {
    logger.warn('onAnchorUpdate skipped: formInstance missing', {
      entityKey: fieldContext.state.entityKey,
    })
    return
  }
  if (next === 'start' || next === 'end') {
    form.setFieldValue('anchorEdge', next)
    return
  }
  form.setFieldValue('anchorEdge', null)
}
</script>

<style scoped>
.select-field {
  width: 100%;
}
</style>
