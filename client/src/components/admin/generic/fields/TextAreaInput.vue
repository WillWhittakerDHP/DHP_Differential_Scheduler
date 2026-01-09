<template>
  <BaseInput
    :field-key="String(fieldContext.fieldKey)"
    :display-config="fieldContext.displayConfig"
    :error="fieldContext.error?.value"
    :show-label="false"
    :is-disabled="fieldContext.isDisabled.value"
  >
    <AppTextarea
      :id="`field-${String(fieldContext.fieldKey)}`"
      :name="String(fieldContext.fieldKey)"
      :model-value="fieldValue"
      :label="fieldContext.displayConfig.label"
      :placeholder="fieldContext.displayConfig.placeholder"
      :disabled="fieldContext.displayConfig.disabled"
      :readonly="fieldContext.displayConfig.readOnly"
      :error="!!fieldContext.error?.value"
      :error-messages="fieldContext.error?.value"
      rows="4"
      :autocomplete="AUTCOMPLETE_OFF"
      @update:model-value="handleChange"
      @focus="handleFocus"
      @blur="handleBlur"
    />
  </BaseInput>
</template>

<script setup lang="ts">
/**
 * LEARNING: TextAreaInput renders multi-line text input
 * 
 * WHY: Textarea fields need multi-line input
 * 
 * PATTERN: Wrapper component pattern - wraps Vuexy App component with field context
 * 
 * COMPARISON: React uses Ant Design Input.TextArea. Vue uses Vuexy AppTextarea.
 *             Both provide multi-line text input.
 * 
 * MIGRATION: Migrated from VTextarea to AppTextarea following SelectInputs.vue pattern.
 *            App components handle labels internally.
 */

import { AUTCOMPLETE_OFF } from '../../../../utils/autocomplete'
import BaseInput from './BaseInput.vue'
import AppTextarea from '@/@core/components/app-form-elements/AppTextarea.vue'
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
const fieldValue = useFieldValue(fieldContext)

const handleChange = (value: string) => {
  fieldContext.setValue(value)
}

const handleFocus = () => {
  fieldContext.setFocus(true)
}

const handleBlur = async () => {
  fieldContext.setFocus(false)
  
  const isValid = await fieldContext.validate()
  
  if (isValid) {
    try {
      await fieldContext.save()
    } catch (error) {
      // Auto-save failed
    }
  }
}
</script>

