<template>
  <BaseInput
    :field-key="String(fieldContext.fieldKey)"
    :display-config="fieldContext.displayConfig"
    :error="fieldContext.error?.value"
    :show-label="false"
    :is-disabled="fieldContext.isDisabled.value"
  >
    <!-- LEARNING: Disable autocomplete for admin configuration fields -->
    <!-- WHY: These are NOT password/login fields - password managers should ignore them -->
    <!-- NOTE: VSwitch doesn't support autocomplete attribute, but adding for consistency -->
    <!-- PATTERN: VSwitch accepts label prop directly, so BaseInput has show-label="false" -->
    <VSwitch
      :id="`field-${String(fieldContext.fieldKey)}`"
      :model-value="fieldValue"
      :label="fieldContext.displayConfig.label"
      :disabled="fieldContext.displayConfig.disabled"
      :readonly="fieldContext.displayConfig.readOnly"
      :error="!!fieldContext.error?.value"
      @update:model-value="(value: string | number | boolean | string[] | null) => { void handleChange(Boolean(value)) }"
      @focus="handleFocus"
      @blur="handleBlur"
    />
  </BaseInput>
</template>

<script setup lang="ts">
/**
 * LEARNING: BooleanInput renders toggle switch
 * 
 * WHY: Boolean fields need toggle UI, not checkbox
 * 
 * PATTERN: Wrapper component pattern - wraps Vuetify VSwitch with field context
 * 
 * COMPARISON: React uses Ant Design Switch. Vue uses Vuetify VSwitch.
 *             Both provide toggle functionality with immediate save.
 * 
 * MIGRATION: Updated to follow SelectInputs.vue pattern - BaseInput has show-label="false",
 *            label passed directly to VSwitch. Vuexy doesn't have App wrapper for switches,
 *            so VSwitch is used directly.
 */

import { computed } from 'vue'
import BaseInput from './BaseInput.vue'
import type { GlobalEntityKey } from '../../../../constants/entities'
import type { GlobalFieldKey } from '../../../../constants/primitives'
import type { FieldContextType } from '../../../../composables/useFieldContext'
import { useFieldValue } from '../../../../composables/useFieldValue'

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

// LEARNING: Handle value changes with immediate save for booleans
// WHY: Boolean toggles should save immediately (good UX)
// PATTERN: Save on change for boolean fields
const handleChange = async (value: boolean) => {
  // LEARNING: Handle inverted logic for constituable field
  // WHY: When fieldKey is 'constituable', toggle ON means constituable: false
  // PATTERN: Invert value before setting if this is the constituable field
  const actualValue = isInverted.value ? !value : value
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

const handleFocus = () => {
  fieldContext.setFocus(true)
}

const handleBlur = () => {
  fieldContext.setFocus(false)
}
</script>

