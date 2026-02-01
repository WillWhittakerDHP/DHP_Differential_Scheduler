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
      @keydown.enter="handleEnterKey"
    />
  </BaseInput>
</template>

<script setup lang="ts">
/**
 * LEARNING: NumberInput renders numeric input
 * 
 * WHY: Number fields need numeric validation and formatting
 * 
 * PATTERN: Wrapper component pattern - wraps Vuexy App component with field context
 * 
 * COMPARISON: React uses Ant Design InputNumber. Vue uses Vuexy AppTextField with type="number".
 *             Both provide numeric input with validation.
 * 
 * MIGRATION: Migrated from VTextField to AppTextField following SelectInputs.vue pattern.
 *            App components handle labels internally.
 */

import { inject } from 'vue'
import { AUTCOMPLETE_OFF } from '../../../../utils/autocomplete'
import BaseInput from './BaseInput.vue'
import AppTextField from '@/@core/components/app-form-elements/AppTextField.vue'
import type { GlobalEntityKey } from '../../../../constants/entities'
import type { GlobalFieldKey } from '../../../../constants/primitives'
import type { FieldContextType } from '../../../../composables/useFieldContext'
import { useFieldValue } from '../../../../composables/useFieldValue'
import { ENTITY_CARD_SAVE_KEY, ENTITY_CARD_DISABLE_AUTOSAVE_KEY, type EntityCardSaveContext } from '../entityCardConstants'
import { useFieldInputHandlers } from '@/composables/admin/useFieldInputHandlers'

interface Props {
  fieldContext: FieldContextType<GlobalEntityKey, GlobalFieldKey<GlobalEntityKey>>
  showLabel?: boolean
}

const props = withDefaults(defineProps<Props>(), {
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

// FIX: Use shared field input handlers from composable
const { handleFocus, handleBlur, handleEnterKey } = useFieldInputHandlers({
  fieldContext,
  disableAutoSave,
  entityCardSaveContext
})
</script>

<style scoped>
/* LEARNING: Responsive number input field styling */
/* WHY: Number fields should match text field width for consistency */
/* PATTERN: Use CSS to make fields responsive and fit content */
/* LEARNING: Minimum width matches name field, but can grow larger */
/* WHY: Ensures consistency - all text/number fields are at least as wide as name field */
/*      But allows growth for longer numbers */
.number-input-field {
  width: 100%;
  min-width: 200px; /* Minimum width to match typical name field width */
}

/* LEARNING: On mobile, make fields stack and take full width */
/* WHY: Better UX on small screens */
@media (max-width: 600px) {
  .number-input-field {
    width: 100%;
    min-width: 0; /* Allow shrinking on mobile */
  }
}
</style>

