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
      :is-active="fieldValue"
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

import { computed } from 'vue'
import BaseInput from './BaseInput.vue'
import StatusButton from '../StatusButton.vue'
import type { GlobalEntityKey } from '../../../../constants/entities'
import type { GlobalFieldKey } from '../../../../constants/primitives'
import type { FieldContextType } from '../../../../composables/useFieldContext'
import { useFieldValue } from '../../../../composables/useFieldValue'
import { useEntityMetadata } from '@/composables/admin/useEntityMetadata'
import { useFieldContextMetadataEntity } from '@/composables/admin/useFieldContextMetadataEntity'
import { useStatusButtonToggle } from '@/composables/admin/useStatusButtonToggle'

interface Props {
  fieldContext: FieldContextType<GlobalEntityKey, GlobalFieldKey<GlobalEntityKey>>
  showLabel?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showLabel: true
})

const { fieldContext } = props

// LEARNING: Use unified field value composable
// WHY: Provides consistent value access pattern that handles Vue's Ref unwrapping
// PATTERN: Always use useFieldValue for accessing field values
const rawFieldValue = useFieldValue(fieldContext)


// LEARNING: Handle inverted logic for constituable field (displayed as "State Control")
// WHY: constituable: false = State Control ON, constituable: true = State Control OFF
// PATTERN: Invert value for display when fieldKey is 'constituable'
const isInverted = computed(() => String(fieldContext.fieldKey) === 'constituable')
const fieldValue = computed(() => {
  const value = rawFieldValue.value
  const boolValue = typeof value === 'boolean' ? value : false
  return isInverted.value ? !boolValue : boolValue
})


// LEARNING: Load metadata to get statusButtonColor
// WHY: StatusButton needs color from metadata (defaults to 'default' if not configured)
// PATTERN: Use useEntityMetadata to load metadata, then read statusButtonColor
// LEARNING: Use composable for entity lookup
// WHY: Extracts entity lookup logic to reusable composable
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
// WHY: useStatusButtonToggle uses usePrimitiveMutation which properly updates the store
//      This ensures status buttons persist correctly after clicking
// PATTERN: Use composable instead of fieldContext.save() for status buttons
const statusButtonToggle = useStatusButtonToggle({
  entityKey: fieldContext.entityKey!,
  entityId: fieldContext.entityId!,
  entity: entityForMetadata
})

// LEARNING: Handle click to toggle value using composable
// WHY: Status buttons should save immediately when clicked (good UX)
//      useStatusButtonToggle handles store updates correctly via usePrimitiveMutation
// PATTERN: Use toggleStatusButton from composable instead of manual save
// NOTE: Inversion logic (for constituable field) is handled at display level only
//       useStatusButtonToggle operates on stored value, which is correct
const handleClick = async (event: Event) => {
  // LEARNING: Stop propagation immediately to prevent expansion panel from intercepting click
  // WHY: Status buttons are in VExpansionPanel title, need to prevent panel expansion
  // PATTERN: Stop propagation and prevent default before any async operations
  event.stopPropagation()
  event.preventDefault()
  
  // LEARNING: Check if field is disabled or readonly
  // WHY: Don't allow toggling if field is disabled or readonly
  // PATTERN: Early return if field cannot be edited
  if (fieldContext.displayConfig.disabled || fieldContext.displayConfig.readOnly) {
    return
  }
  
  // LEARNING: Use composable's toggle method which handles store updates correctly
  // WHY: useStatusButtonToggle reads from store and toggles stored value (not display value)
  //      For constituable field, display is inverted but stored value is not, so this works correctly
  // PATTERN: Composable handles all toggle logic including store updates via usePrimitiveMutation
  await statusButtonToggle.toggleStatusButton(fieldContext.fieldKey, event)
}
</script>
