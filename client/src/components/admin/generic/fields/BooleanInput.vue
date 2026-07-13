<template>
  <BaseInput
    :field-key="String(fieldContext.state.fieldKey)"
    :display-config="fieldContext.state.displayConfig"
    :error="fieldContext.state.error?.value"
    :show-label="false"
    :show-help="false"
    :is-disabled="fieldContext.state.isDisabled.value"
  >
    <!-- WHY: All boolean fields should render as status buttons for consistency -->
    <!-- PATTERN: Use StatusButton component instead of VSwitch toggle -->
    <VTooltip v-if="tooltipText" location="top" open-delay="300">
      <template #activator="{ props: tooltipActivatorProps }">
        <div v-bind="tooltipActivatorProps" @keydown="handleKeydown">
          <StatusButton
            :label="displayLabel"
            :color="statusButtonColor"
            :is-active="normalizedValue"
            :disabled="statusButtonDisabled"
            @click.stop="handleClick"
          />
        </div>
      </template>
      <span>{{ tooltipText }}</span>
    </VTooltip>
    <div v-else @keydown="handleKeydown">
      <StatusButton
        :label="displayLabel"
        :color="statusButtonColor"
        :is-active="normalizedValue"
        :disabled="statusButtonDisabled"
        @click.stop="handleClick"
      />
    </div>
  </BaseInput>
</template>

<script setup lang="ts">
/**
 * WHY: All boolean fields should render as status buttons, not toggle switches
...
 */
import { computed, inject } from 'vue'
import BaseInput from './BaseInput.vue'
import StatusButton from '../StatusButton.vue'
import { useFieldValue } from '@/composables/useFieldValue'
import { fieldKeyboardGuard } from '@/utils/admin/fieldKeyboardGuard'
import { useEntityMetadata } from '@/composables/admin/useEntityMetadata'
import { useFieldContextMetadataEntity } from '@/composables/admin/useFieldContextMetadataEntity'
import { useBooleanInputClick } from '@/composables/admin/useBooleanInputClick'
import { useStatusButtonToggle } from '@/composables/admin/useStatusButtonToggle'
import { ENTITY_CARD_SAVE_KEY, type EntityCardSaveContext } from '../entityCardConstants'
import { STATUS_BUTTON_LABELS } from '@/constants/statusButtonLabels'
import type { FieldInputProps } from './fieldTypes'

/** Readable Vuetify theme colors per flag — avoids grey/default chips on the title row. */
const STATUS_BUTTON_THEME_COLORS: Record<string, string> = {
  composite: 'primary',
  orchestrator: 'info',
  allowMultiple: 'warning',
  requiresUnitNumber: 'info',
  preClosing: 'warning',
  isMultiFamily: 'info',
  requiresAgent: 'success',
  active: 'success',
}

const props = withDefaults(defineProps<FieldInputProps>(), {
  showLabel: true
})

const { fieldContext } = props

const entityCardSaveContext = inject<EntityCardSaveContext | undefined>(ENTITY_CARD_SAVE_KEY, undefined)

const rawFieldValue = useFieldValue(fieldContext)

const normalizedValue = computed(() => {
  const value = rawFieldValue.value
  
  if (value === 'true' || value === 'false' || value === 'override') {
    return value as 'true' | 'false' | 'override'
  }
  
  if (value === undefined || value === null || value === '') {
    const fieldKeyStr = String(fieldContext.state.fieldKey)
    const isTernaryField = fieldKeyStr === 'major' || fieldKeyStr === 'minor' || fieldKeyStr === 'differential'
    
    if (isTernaryField) {
      return 'false' as const
    }
    
    return false
  }
  
  return value === true
})

// PATTERN: Composable handles both temporary and existing entities
const entityForMetadata = useFieldContextMetadataEntity(fieldContext)

const fetchedMetadata = useEntityMetadata(
  fieldContext.state.entityKey,
  entityForMetadata
)

const statusButtonColor = computed(() => {
  const fieldKeyStr = String(fieldContext.state.fieldKey)
  const preset = STATUS_BUTTON_THEME_COLORS[fieldKeyStr]
  if (preset) {
    return preset
  }
  const metadata = fetchedMetadata.fieldMetadata.value
  const meta = metadata[fieldKeyStr]
  const color = meta?.statusButtonColor
  if (color !== undefined && color !== null && color !== '' && color !== 'default' && color !== 'secondary') {
    return color
  }
  return 'primary'
})

// WHY: Label reflects current state (e.g., Active/Inactive) instead of static field label
const displayLabel = computed((): string => {
  const fieldKeyStr = String(fieldContext.state.fieldKey)
  const labelMap = STATUS_BUTTON_LABELS[fieldKeyStr]
  if (!labelMap) {
    return fieldContext.state.displayConfig.label
  }
  const value = normalizedValue.value
  if (value === 'override' && labelMap.override) {
    return labelMap.override
  }
  if (value === true || value === 'true') {
    return labelMap.true
  }
  return labelMap.false
})

const tooltipText = computed((): string => {
  const help = fieldContext.state.displayConfig.helpText
  if (help === undefined || help === null) {
    return ''
  }
  const trimmed = String(help).trim()
  return trimmed
})

// PATTERN: Assert type since runtime behavior is correct
const statusButtonToggle = useStatusButtonToggle({
  entityKey: fieldContext.state.entityKey!,
  entityId: fieldContext.state.entityId!,
})

const isEditable = computed(
  () => !fieldContext.state.displayConfig.disabled && !fieldContext.state.displayConfig.readOnly
)

const statusButtonDisabled = computed(
  () => fieldContext.state.displayConfig.disabled || fieldContext.state.displayConfig.readOnly
)
const handleClick = useBooleanInputClick({
  fieldContext,
  entityCardSaveContext,
  rawFieldValue,
  statusButtonToggle,
})

const { handleKeydown } = fieldKeyboardGuard({
  fieldType: 'boolean',
  isEditable,
  onToggle: (event: KeyboardEvent) => {
    handleClick(event)
  }
})
</script>
