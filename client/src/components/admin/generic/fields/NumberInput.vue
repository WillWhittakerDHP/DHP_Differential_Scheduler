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
import { ENTITY_CARD_SAVE_KEY, type EntityCardSaveContext } from '../entityCardConstants'

interface Props {
  fieldContext: FieldContextType<GlobalEntityKey, GlobalFieldKey<GlobalEntityKey>>
  showLabel?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showLabel: true
})

const { fieldContext } = props

/**
 * LEARNING: Inject EntityCard save handler for create cards
 * WHY: When creating new entities, pressing Enter should save the entire form and collapse,
 *      not just save the individual field
 * PATTERN: Use inject to access parent EntityCard's handleSave method
 */
const entityCardSaveContext = inject<EntityCardSaveContext | undefined>(ENTITY_CARD_SAVE_KEY, undefined)

// LEARNING: Use unified field value composable
// WHY: Provides consistent value access pattern that handles Vue's Ref unwrapping
// PATTERN: Always use useFieldValue for accessing field values
const fieldValue = useFieldValue(fieldContext)

// LEARNING: Handle value changes - convert string to number
// WHY: HTML inputs return strings, but we need numbers
// PATTERN: Convert string to number before setting value
const handleChange = (value: string | number) => {
  const numValue = typeof value === 'string' ? parseFloat(value) : value
  fieldContext.setValue(isNaN(numValue) ? 0 : numValue)
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

// LEARNING: Handle Enter key press with auto-save
// WHY: Allows users to save by pressing Enter, similar to blur behavior
// PATTERN: For create cards, save entire form and collapse; for existing entities, save just the field
const handleEnterKey = async (event: KeyboardEvent) => {
  // Prevent default form submission behavior
  event.preventDefault()
  
  // Validate field
  const isValid = await fieldContext.validate()
  
  if (!isValid) {
    return
  }
  
  // LEARNING: For create cards, save entire form instead of just the field
  // WHY: Creates the entity and triggers collapse logic via onSaved callback
  // PATTERN: Check if we're in a create card context and use handleSave if available
  if (entityCardSaveContext?.isNew && entityCardSaveContext.handleSave) {
    try {
      await entityCardSaveContext.handleSave()
      // Blur the field after successful save to remove focus
      fieldContext.setFocus(false)
      // Blur the actual input element
      const target = event.target as HTMLElement
      if (target && 'blur' in target && typeof target.blur === 'function') {
        target.blur()
      }
    } catch (error) {
      // Form save failed
    }
    return
  }
  
  // For existing entities, save just the field
  try {
    await fieldContext.save()
    // Blur the field after successful save to remove focus
    fieldContext.setFocus(false)
    // Blur the actual input element
    const target = event.target as HTMLElement
    if (target && 'blur' in target && typeof target.blur === 'function') {
      target.blur()
    }
  } catch (error) {
    // Auto-save failed
  }
}
</script>

