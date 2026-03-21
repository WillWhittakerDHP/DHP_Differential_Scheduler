<template>
  <BaseInput
    :field-key="String(fieldContext.state.fieldKey)"
    :display-config="fieldContext.state.displayConfig"
    :error="fieldContext.state.error?.value"
    :show-label="false"
    :is-disabled="fieldContext.state.isDisabled.value"
  >
    <AppTextarea
      :id="`field-${String(fieldContext.state.fieldKey)}`"
      :name="String(fieldContext.state.fieldKey)"
      :model-value="fieldValue"
      :label="fieldContext.state.displayConfig.label"
      :placeholder="fieldContext.state.displayConfig.placeholder"
      :disabled="fieldContext.state.displayConfig.disabled"
      :readonly="fieldContext.state.displayConfig.readOnly"
      :error="!!fieldContext.state.error?.value"
      :error-messages="fieldContext.state.error?.value"
      rows="4"
      :autocomplete="AUTCOMPLETE_OFF"
      @update:model-value="handleChange"
      @focus="handleFocus"
      @blur="handleBlur"
      @keydown="handleKeydown"
    />
  </BaseInput>
</template>

<script setup lang="ts">
/**
 * PATTERN: Wrapper component pattern - wraps Vuexy App component with field context...
 */
import { AUTCOMPLETE_OFF } from '@/utils/autocomplete'
import BaseInput from './BaseInput.vue'
import AppTextarea from '@/@core/components/app-form-elements/AppTextarea.vue'
import { useFieldInputSetup } from '@/composables/admin/useFieldInputSetup'

import type { FieldInputProps } from './fieldTypes'

const props = withDefaults(defineProps<FieldInputProps>(), {
  showLabel: true
})

const { fieldContext } = props

// FIX: Use shared field input setup from composable (includes keyboard guard)
const { fieldValue, handleChange, handleFocus, handleBlur, handleKeydown } = useFieldInputSetup(
  fieldContext,
  { fieldType: 'textarea' }
)
</script>

