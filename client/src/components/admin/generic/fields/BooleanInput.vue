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
      @click="handleClick"
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
import { useAdmin } from '@/composables/useAdmin'

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
  return isInverted.value ? !rawFieldValue.value : rawFieldValue.value
})

// LEARNING: Fetch metadata to get statusButtonColor
// WHY: StatusButton needs color from metadata (defaults to 'default' if not configured)
// PATTERN: Use useEntityMetadata to fetch metadata, then read statusButtonColor
const admin = useAdmin()
const entityForMetadata = computed(() => {
  if (!fieldContext.entityKey || !fieldContext.entityId) {
    return null
  }
  try {
    return admin.getEntity(fieldContext.entityKey, fieldContext.entityId)
  } catch {
    return null
  }
})

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

// LEARNING: Handle click to toggle value with immediate save
// WHY: Status buttons should save immediately when clicked (good UX)
// PATTERN: Toggle value and save on click
const handleClick = async (event: Event) => {
  // LEARNING: Stop propagation to prevent VExpansionPanel from intercepting click
  // WHY: Status buttons are in VExpansionPanel title, need to prevent panel expansion
  // PATTERN: Stop propagation and prevent default
  event.stopPropagation()
  event.preventDefault()
  
  // LEARNING: Check if field is disabled or readonly
  // WHY: Don't allow toggling if field is disabled or readonly
  // PATTERN: Early return if field cannot be edited
  if (fieldContext.displayConfig.disabled || fieldContext.displayConfig.readOnly) {
    return
  }
  
  // Toggle the value
  const newValue = !fieldValue.value
  
  // LEARNING: Handle inverted logic for constituable field
  // WHY: When fieldKey is 'constituable', toggle ON means constituable: false
  // PATTERN: Invert value before setting if this is the constituable field
  const actualValue = isInverted.value ? !newValue : newValue
  fieldContext.setValue(actualValue)
  
  // Immediate save for boolean fields
  try {
    const isValid = await fieldContext.validate()
    
    if (isValid) {
      await fieldContext.save()
    }
  } catch (error) {
    // Auto-save failed
  }
}
</script>
