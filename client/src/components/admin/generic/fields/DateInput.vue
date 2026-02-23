<template>
  <BaseInput
    :field-key="String(fieldContext.fieldKey)"
    :display-config="fieldContext.displayConfig"
    :error="fieldContext.error?.value"
    :show-label="false"
    :is-disabled="fieldContext.isDisabled.value"
  >
    <div @keydown="handleKeydown">
      <AppDateTimePicker
        :id="`field-${String(fieldContext.fieldKey)}`"
        :name="String(fieldContext.fieldKey)"
        :model-value="typeof fieldValue === 'string' ? fieldValue : undefined"
        :label="fieldContext.displayConfig.label"
        :placeholder="fieldContext.displayConfig.placeholder"
        :disabled="fieldContext.displayConfig.disabled"
        :readonly="fieldContext.displayConfig.readOnly"
        :error="!!fieldContext.error?.value"
        :error-messages="fieldContext.error?.value"
        :config="{ dateFormat: 'Y-m-d' }"
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

