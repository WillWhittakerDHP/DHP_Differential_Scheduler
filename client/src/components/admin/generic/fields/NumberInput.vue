<template>
  <BaseInput
    :field-key="String(fieldContext.state.fieldKey)"
    :display-config="fieldContext.state.displayConfig"
    :error="fieldContext.state.error?.value"
    :show-label="false"
    :is-disabled="fieldContext.state.isDisabled.value"
  >
    <AppTextField
      :id="`field-${String(fieldContext.state.fieldKey)}`"
      :name="String(fieldContext.state.fieldKey)"
      type="number"
      :model-value="fieldValue"
      :label="fieldContext.state.displayConfig.label"
      :placeholder="fieldContext.state.displayConfig.placeholder"
      :disabled="fieldContext.state.displayConfig.disabled"
      :readonly="fieldContext.state.displayConfig.readOnly"
      :error="!!fieldContext.state.error?.value"
      :error-messages="fieldContext.state.error?.value"
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

const fieldValue = useFieldValue(fieldContext)

// PATTERN: Convert string to number before setting value
const handleChange = (value: string | number) => {
  const numValue = typeof value === 'string' ? parseFloat(value) : value
  fieldContext.actions.setValue(isNaN(numValue) ? 0 : numValue)
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
