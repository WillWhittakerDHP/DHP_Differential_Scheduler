<template>
  <BaseInput
    :field-key="String(fieldContext.fieldKey)"
    :display-config="fieldContext.displayConfig"
    :error="fieldContext.error?.value"
    :show-label="false"
    :is-disabled="fieldContext.isDisabled.value"
  >
    <!-- LEARNING: BooleanInput renders status button chip (not toggle switch) -->
    <!-- WHY: All boolean fields should render as status buttons for consistency -->
    <!-- PATTERN: Use StatusButton component instead of VSwitch toggle -->
    <div @keydown="handleKeydown">
      <StatusButton
        :label="displayLabel"
        :color="statusButtonColor"
        :is-active="normalizedValue"
        :disabled="fieldContext.displayConfig.disabled || fieldContext.displayConfig.readOnly"
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
import type { GlobalEntityKey } from '@/constants/entities'
import type { GlobalEntity } from '@/types/entities'
import { useFieldValue } from '@/composables/useFieldValue'
import { fieldKeyboardGuard } from '@/utils/admin/fieldKeyboardGuard'
import { useEntityMetadata } from '@/composables/admin/useEntityMetadata'
import { useFieldContextMetadataEntity } from '@/composables/admin/useFieldContextMetadataEntity'
import { useBooleanInputClick } from '@/composables/admin/useBooleanInputClick'
import { useStatusButtonToggle } from '@/composables/admin/useStatusButtonToggle'
import { ENTITY_CARD_SAVE_KEY, type EntityCardSaveContext } from '../entityCardConstants'
import { STATUS_BUTTON_LABELS } from '@/constants/statusButtonLabels'
import type { FieldInputProps } from './fieldTypes'

const props = withDefaults(defineProps<FieldInputProps>(), {
  showLabel: true
})

const { fieldContext } = props

const entityCardSaveContext = inject<EntityCardSaveContext | undefined>(ENTITY_CARD_SAVE_KEY, undefined)

// LEARNING: Use unified field value composable
const rawFieldValue = useFieldValue(fieldContext)

const normalizedValue = computed(() => {
  const value = rawFieldValue.value
  
  if (value === 'true' || value === 'false' || value === 'override') {
    return value as 'true' | 'false' | 'override'
  }
  
  if (value === undefined || value === null || value === '') {
    const fieldKeyStr = String(fieldContext.fieldKey)
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
  fieldContext.entityKey,
  entityForMetadata
)

const statusButtonColor = computed(() => {
  const metadata = fetchedMetadata.fieldMetadata.value
  const fieldKeyStr = String(fieldContext.fieldKey)
  const meta = metadata[fieldKeyStr]
  const color = meta?.statusButtonColor
  return color !== undefined && color !== null && color !== '' ? color : 'default'
})

// WHY: Label reflects current state (e.g., Active/Inactive) instead of static field label
const displayLabel = computed((): string => {
  const fieldKeyStr = String(fieldContext.fieldKey)
  const labelMap = STATUS_BUTTON_LABELS[fieldKeyStr]
  if (!labelMap) {
    return fieldContext.displayConfig.label
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

// LEARNING: Use status button toggle composable for consistent store updates
// PATTERN: Assert type since runtime behavior is correct
const statusButtonToggle = useStatusButtonToggle({
  entityKey: fieldContext.entityKey!,
  entityId: fieldContext.entityId!,
  entity: entityForMetadata as ReturnType<typeof computed<GlobalEntity<GlobalEntityKey>>>
})

const isEditable = computed(
  () => !fieldContext.displayConfig.disabled && !fieldContext.displayConfig.readOnly
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
