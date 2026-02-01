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
    <StatusButton
      :label="fieldContext.displayConfig.label"
      :color="statusButtonColor"
      :is-active="normalizedValue"
      :disabled="fieldContext.displayConfig.disabled || fieldContext.displayConfig.readOnly"
      @click.stop="handleClick"
    />
  </BaseInput>
</template>

<script setup lang="ts">
/**
 * LEARNING: BooleanInput renders status button chip
 * 
 * WHY: All boolean fields should render as status buttons, not toggle switches
 * 
 * PATTERN: Wrapper component pattern - wraps StatusButton chip with field context
 * 
 * COMPARISON: Previously used VSwitch toggle, now uses StatusButton chip for consistency
 */

import { computed, inject } from 'vue'
import BaseInput from './BaseInput.vue'
import StatusButton from '../StatusButton.vue'
import type { GlobalEntityKey } from '../../../../constants/entities'
import type { GlobalEntity } from '../../../../types/entities'
import type { GlobalFieldKey } from '../../../../constants/primitives'
import type { FieldContextType } from '../../../../composables/useFieldContext'
import { useFieldValue } from '../../../../composables/useFieldValue'
import { useEntityMetadata } from '@/composables/admin/useEntityMetadata'
import { useFieldContextMetadataEntity } from '@/composables/admin/useFieldContextMetadataEntity'
import { useStatusButtonToggle } from '@/composables/admin/useStatusButtonToggle'
import { ENTITY_CARD_SAVE_KEY, type EntityCardSaveContext } from '../entityCardConstants'

interface Props {
  fieldContext: FieldContextType<GlobalEntityKey, GlobalFieldKey<GlobalEntityKey>>
  showLabel?: boolean
}

const props = withDefaults(defineProps<Props>(), {
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
  return meta?.statusButtonColor || 'default'
})

// LEARNING: Use status button toggle composable for consistent store updates
// PATTERN: Assert type since runtime behavior is correct
const statusButtonToggle = useStatusButtonToggle({
  entityKey: fieldContext.entityKey!,
  entityId: fieldContext.entityId!,
  entity: entityForMetadata as ReturnType<typeof computed<GlobalEntity<GlobalEntityKey>>>
})

// PATTERN: Use toggleStatusButton from composable instead of manual save
const handleClick = async (event: Event) => {
  // PATTERN: Stop propagation and prevent default before any async operations
  event.stopPropagation()
  event.preventDefault()
  
  // PATTERN: Early return if field cannot be edited
  if (fieldContext.displayConfig.disabled || fieldContext.displayConfig.readOnly) {
    return
  }
  
  // PATTERN: Match TextInput/NumberInput behavior - update form value, not store
  if (entityCardSaveContext?.isNew) {
    const currentRaw = rawFieldValue.value
    
    // WHY: Ternary fields need to cycle through states, boolean fields toggle
    // PATTERN: Check if ternary, then cycle or toggle accordingly
    const isTernary = currentRaw === 'true' || currentRaw === 'false' || currentRaw === 'override'
    
    if (isTernary) {
      let newTernary: 'true' | 'false' | 'override'
      if (currentRaw === 'false') {
        newTernary = 'true'
      } else if (currentRaw === 'true') {
        newTernary = 'override'
      } else {
        newTernary = 'false'
      }
      fieldContext.setValue(newTernary)
      return
    }
    
    // WHY: useFieldContextState returns empty string '' for temp entities, but we need to treat it as false
    // PATTERN: Normalize empty string to false for boolean fields
    const normalizedRaw = currentRaw === '' ? false : currentRaw
    const isBooleanish = normalizedRaw === true || normalizedRaw === false || 
                        normalizedRaw === null || normalizedRaw === undefined
    if (!isBooleanish) {
      return
    }
    
    const currentValue = normalizedRaw === true
    const newValue = !currentValue
    
    fieldContext.setValue(newValue)
    
    if (fieldContext.entityKey === 'blockShape' && newValue === true) {
      const formInstance = fieldContext.formInstance
      if (formInstance) {
        if (fieldContext.fieldKey === 'isStateControl') {
          formInstance.setFieldValue('canHaveParts', false)
        } else if (fieldContext.fieldKey === 'canHaveParts') {
          formInstance.setFieldValue('isStateControl', false)
        }
      }
    }
    
    return
  }
  
  // LEARNING: Use composable's toggle method which handles store updates correctly
  // PATTERN: Composable handles all toggle logic including store updates via usePrimitiveMutation
  await statusButtonToggle.toggleStatusButton(fieldContext.fieldKey, event)
}
</script>
