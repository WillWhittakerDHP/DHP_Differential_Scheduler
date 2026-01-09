<template>
  <BaseInput
    :field-key="String(fieldContext.fieldKey)"
    :display-config="fieldContext.displayConfig"
    :error="fieldContext.error?.value"
    :show-label="false"
    :is-disabled="fieldContext.isDisabled.value"
  >
    <AppDateTimePicker
      :id="`field-${String(fieldContext.fieldKey)}`"
      :name="String(fieldContext.fieldKey)"
      :model-value="fieldValue"
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
  </BaseInput>
</template>

<script setup lang="ts">
/**
 * LEARNING: DateInput renders date input with FlatPickr date picker
 * 
 * WHY: Date fields need date picker UI with better UX than native HTML date input
 * 
 * PATTERN: Wrapper component pattern - wraps Vuexy AppDateTimePicker with field context
 * 
 * COMPARISON: React uses Ant Design DatePicker. Vue uses Vuexy AppDateTimePicker (FlatPickr).
 *             Both provide date input with validation.
 * 
 * MIGRATION: Migrated from VTextField with type="date" to AppDateTimePicker following
 *            SelectInputs.vue pattern. App components handle labels internally.
 *            Configured FlatPickr for date-only mode (no time picker) with Y-m-d format.
 */

import BaseInput from './BaseInput.vue'
import AppDateTimePicker from '@/@core/components/app-form-elements/AppDateTimePicker.vue'
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

