<template>
  <BaseInput
    :field-key="String(fieldContext.state.fieldKey)"
    :display-config="fieldContext.state.displayConfig"
    :error="fieldContext.state.error?.value"
    :show-label="false"
    :is-disabled="fieldContext.state.isDisabled.value"
  >
    <div @keydown="handleKeydown">
      <AppDateTimePicker
        :id="`field-${String(fieldContext.state.fieldKey)}`"
        :name="String(fieldContext.state.fieldKey)"
        :model-value="typeof fieldValue === 'string' ? fieldValue : undefined"
        :label="fieldContext.state.displayConfig.label"
        :placeholder="fieldContext.state.displayConfig.placeholder"
        :disabled="fieldContext.state.displayConfig.disabled"
        :readonly="fieldContext.state.displayConfig.readOnly"
        :error="!!fieldContext.state.error?.value"
        :error-messages="fieldContext.state.error?.value"
        :config="datePickerConfig"
        @update:model-value="handleChange"
        @on-open="handleFocus"
        @on-close="handleBlur"
      />
    </div>
  </BaseInput>
</template>

<script setup lang="ts">
/**
 * PATTERN: Wrapper component pattern - wraps Vuexy AppDateTimePicker with field con...
 */
import BaseInput from './BaseInput.vue'
import AppDateTimePicker from '@/@core/components/app-form-elements/AppDateTimePicker.vue'
import { useFieldInputSetup } from '@/composables/admin/useFieldInputSetup'

import type { FieldInputProps } from './fieldTypes'

const datePickerConfig = { dateFormat: 'Y-m-d' as const }

const props = withDefaults(defineProps<FieldInputProps>(), {
  showLabel: true
})

const { fieldContext } = props

// FIX: Use shared field input setup from composable (includes keyboard guard)
const { fieldValue, handleChange, handleFocus, handleBlur, handleKeydown } = useFieldInputSetup(
  fieldContext,
  { fieldType: 'date' }
)
</script>

