<template>
  <BaseInput
    :field-key="String(fieldContext.fieldKey)"
    :display-config="fieldContext.displayConfig"
    :error="fieldContext.error?.value"
    :show-label="false"
    :is-disabled="fieldContext.isDisabled.value"
  >
    <AppTextField
      :id="`field-${String(fieldContext.fieldKey)}`"
      :name="String(fieldContext.fieldKey)"
      type="number"
      :model-value="fieldValue"
      :label="fieldContext.displayConfig.label"
      :placeholder="fieldContext.displayConfig.placeholder"
      :disabled="fieldContext.displayConfig.disabled"
      :readonly="fieldContext.displayConfig.readOnly"
      :error="!!fieldContext.error?.value"
      :error-messages="fieldContext.error?.value"
      :autocomplete="AUTCOMPLETE_OFF"
      class="number-input-field"
      @update:model-value="handleChange"
      @focus="handleFocus"
      @blur="handleBlur"
      @keydown="handleKeydown"
    />
  </BaseInput>
</template>

<script setup lang="ts">
/**
 * WHY: Number fields need numeric validation and formatting

PATTERN: Wrapper c...
 */
import { inject } from 'vue'
import { AUTCOMPLETE_OFF } from '@/utils/autocomplete'
import BaseInput from './BaseInput.vue'
import AppTextField from '@/@core/components/app-form-elements/AppTextField.vue'
import { useFieldValue } from '@/composables/useFieldValue'
import { ENTITY_CARD_SAVE_KEY, ENTITY_CARD_DISABLE_AUTOSAVE_KEY, type EntityCardSaveContext } from '../entityCardConstants'
import { useFieldInputHandlers } from '@/composables/admin/useFieldInputHandlers'

import type { FieldInputProps } from './fieldTypes'

const props = withDefaults(defineProps<FieldInputProps>(), {
  showLabel: true
})

const { fieldContext } = props

const entityCardSaveContext = inject<EntityCardSaveContext | undefined>(ENTITY_CARD_SAVE_KEY, undefined)

const disableAutoSave = inject<boolean | undefined>(ENTITY_CARD_DISABLE_AUTOSAVE_KEY, false)

// LEARNING: Use unified field value composable
const fieldValue = useFieldValue(fieldContext)

// PATTERN: Convert string to number before setting value
const handleChange = (value: string | number) => {
  const numValue = typeof value === 'string' ? parseFloat(value) : value
  fieldContext.setValue(isNaN(numValue) ? 0 : numValue)
}

// FIX: Use shared field input handlers from composable (includes keyboard guard)
const { handleFocus, handleBlur, handleKeydown } = useFieldInputHandlers({
  fieldContext,
  disableAutoSave,
  entityCardSaveContext,
  fieldType: 'number'
})
</script>

<style scoped>
.number-input-field {
  width: 100%;
  min-width: 200px; /* Minimum width to match typical name field width */
}

@media (max-width: 600px) {
  .number-input-field {
    width: 100%;
    min-width: 0; /* Allow shrinking on mobile */
  }
}
</style>

