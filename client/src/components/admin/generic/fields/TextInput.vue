<template>
  <BaseInput
    v-if="fieldContext"
    :field-key="String(fieldContext.fieldKey)"
    :display-config="fieldContext.displayConfig"
    :error="fieldContext.error?.value"
    :show-label="false"
    :is-disabled="fieldContext.isDisabled.value"
  >
    <!-- LEARNING: When readonly, display as plain text for better UX -->
    <!-- WHY: Readonly inputs look disabled/confusing - plain text is clearer -->
    <!-- PATTERN: Use computed to reactively track readOnly state for v-if -->
    <span
      v-if="isReadOnly"
      class="readonly-text"
      :class="{ 'readonly-text-empty': !fieldValue || fieldValue === '' }"
    >
      {{ fieldValue || fieldContext?.displayConfig.placeholder || '' }}
    </span>
    
    <!-- LEARNING: Conditionally render textarea for long content when editable -->
    <!-- WHY: Long text is better displayed in multi-line textarea -->
    <!-- PATTERN: Check content length and newlines to determine if textarea is needed -->
    <AppTextarea
      v-else-if="shouldUseTextarea && fieldContext"
      :id="`field-${String(fieldContext.fieldKey)}`"
      :name="String(fieldContext.fieldKey)"
      :model-value="fieldValue"
      :label="fieldContext.displayConfig.label"
      :placeholder="fieldContext.displayConfig.placeholder"
      :disabled="fieldContext.displayConfig.disabled"
      :readonly="fieldContext.displayConfig.readOnly"
      :error="!!fieldContext.error?.value"
      :error-messages="fieldContext.error?.value"
      :autocomplete="AUTCOMPLETE_OFF"
      :auto-grow="true"
      :rows="1"
      :autofocus="entityCardSaveContext?.isNew && fieldContext.fieldKey === 'name'"
      class="text-input-field"
      @update:model-value="handleChange"
      @focus="handleFocus"
      @blur="handleBlur"
      @keydown="handleKeydown"
    />
    <AppTextField
      v-else-if="fieldContext"
      :id="`field-${String(fieldContext.fieldKey)}`"
      :name="String(fieldContext.fieldKey)"
      :model-value="fieldValue"
      :label="fieldContext.displayConfig.label"
      :placeholder="fieldContext.displayConfig.placeholder"
      :disabled="fieldContext.displayConfig.disabled"
      :readonly="fieldContext.displayConfig.readOnly"
      :error="!!fieldContext.error?.value"
      :error-messages="fieldContext.error?.value"
      :autocomplete="AUTCOMPLETE_OFF"
      :autofocus="entityCardSaveContext?.isNew && fieldContext.fieldKey === 'name'"
      class="text-input-field"
      @update:model-value="handleChange"
      @focus="handleFocus"
      @blur="handleBlur"
      @keydown.enter="handleEnterKey"
      @keydown="handleKeydown"
    />
  </BaseInput>
</template>

<script setup lang="ts">
/**
 * LEARNING: TextInput renders single-line text input or textarea based on content length
 * 
 * WHY: Text fields are the most common input type. Auto-converts to textarea for long content.
 * 
 * PATTERN: Wrapper component pattern - wraps Vuexy App components with field context
 * 
 * COMPARISON: React uses Ant Design Input. Vue uses Vuexy AppTextField/AppTextarea.
 *             Both provide same functionality but different APIs.
 * 
 * MIGRATION: Migrated from VTextField/VTextarea to AppTextField/AppTextarea following
 *            SelectInputs.vue pattern. App components handle labels internally.
 */

import { computed, inject, toRef } from 'vue'
import { useDisplay } from 'vuetify'
import { AUTCOMPLETE_OFF } from '../../../../utils/autocomplete'
import BaseInput from './BaseInput.vue'
import AppTextField from '@/@core/components/app-form-elements/AppTextField.vue'
import AppTextarea from '@/@core/components/app-form-elements/AppTextarea.vue'
import type { GlobalEntityKey } from '../../../../constants/entities'
import type { GlobalFieldKey } from '../../../../constants/primitives'
import type { FieldContextType } from '../../../../composables/useFieldContext'
import { useFieldValue } from '../../../../composables/useFieldValue'
import type { ValidAdminValue } from '../../../../constants/primitives'
import { ENTITY_CARD_SAVE_KEY, ENTITY_CARD_DISABLE_AUTOSAVE_KEY, type EntityCardSaveContext } from '../entityCardConstants'
import { useFieldInputHandlers } from '@/composables/admin/useFieldInputHandlers'

interface Props {
  fieldContext: FieldContextType<GlobalEntityKey, GlobalFieldKey<GlobalEntityKey>>
  showLabel?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showLabel: true
})

// LEARNING: Use toRef to maintain reactivity when accessing props
// WHY: Vue 3 best practice - destructuring props breaks reactivity, use toRef instead
const fieldContextRef = toRef(props, 'fieldContext')

const fieldContext = computed(() => {
  const context = fieldContextRef.value
  if (!context) return undefined
  return context
})

const entityCardSaveContext = inject<EntityCardSaveContext | undefined>(ENTITY_CARD_SAVE_KEY, undefined)

const disableAutoSave = inject<boolean | undefined>(ENTITY_CARD_DISABLE_AUTOSAVE_KEY, false)

// FIX: Handle Vue's prop unwrapping - context.value may be unwrapped to the actual value
const fieldValue = computed(() => {
  const context = fieldContext.value
  if (!context) {
    return '' as ValidAdminValue
  }
  
  // LEARNING: Access value using useFieldValue composable which handles Ref unwrapping
  // WHY: useFieldValue is designed to handle Vue's Ref unwrapping when fieldContext is passed as prop
  // PATTERN: Use useFieldValue composable which properly handles both Ref and unwrapped cases
  // NOTE: This is the correct way to access field values - it handles all edge cases
  const val = useFieldValue(context).value
  return val as ValidAdminValue
})

// LEARNING: Computed property to reactively track readOnly state
const isReadOnly = computed(() => {
  // PATTERN: Access fieldContext.value, then nested properties, to establish reactivity dependency
  const context = fieldContext.value
  if (!context) return false
  const displayConfig = context.displayConfig
  const readOnly = displayConfig.readOnly
  return readOnly === true
})

// LEARNING: Use Vuetify's display composable for responsive behavior
const { width } = useDisplay()

const shouldUseTextarea = computed(() => {
  const value = fieldValue.value
  if (!value || typeof value !== 'string') {
    return false
  }
  
  if (value.includes('\n')) {
    return true
  }
  
  const isMobile = width.value < 600 // sm breakpoint
  const threshold = isMobile ? 30 : 50
  
  return value.length > threshold
})

// WHY: Field context manages form state and validation
// PATTERN: Delegate to field context for state management
const handleChange = (value: string) => {
  const context = fieldContext.value
  if (!context) return
  context.setValue(value)
}

// FIX: Use shared field input handlers from composable
const handlers = computed(() => {
  const context = fieldContext.value
  if (!context) {
    return {
      handleFocus: () => {},
      handleBlur: () => {},
      handleEnterKey: () => {}
    }
  }
  return useFieldInputHandlers({
    fieldContext: context,
    disableAutoSave,
    entityCardSaveContext
  })
})

// LEARNING: Access handlers through computed to ensure reactivity
const handleFocus = () => handlers.value.handleFocus()
const handleBlur = () => handlers.value.handleBlur()
const handleEnterKey = (event: KeyboardEvent) => handlers.value.handleEnterKey(event)

const handleKeydown = (event: KeyboardEvent): void => {
  if (event.key !== ' ' && event.key !== 'Spacebar' && event.keyCode !== 32) {
    return
  }
  
  const context = fieldContext.value
  if (!context) {
    return
  }
  
  const isEditable = !context.displayConfig.disabled && !context.displayConfig.readOnly
  
  if (isEditable) {
    event.stopPropagation()
  }
}
</script>

<style scoped>
/* LEARNING: Responsive text input field styling */
/* WHY: Fields should fit content and wrap appropriately on different screen sizes */
/* PATTERN: Use CSS to make fields responsive and fit content */
/* LEARNING: Minimum width matches name field, but can grow larger */
/* WHY: Ensures consistency - all text/number fields are at least as wide as name field */
/*      But allows growth for longer content (names, numbers, etc.) */
.text-input-field {
  width: 100%;
  min-width: 200px; /* Minimum width to match typical name field width */
}

/* LEARNING: Title row fields should size based on content */
/* WHY: Name fields in title row should fit their text content, not be constrained to fixed width */
/* PATTERN: Use CSS selector to detect when field is in title row context */
:deep(.title-row-field) .text-input-field {
  width: auto;
  min-width: 150px;
  max-width: 100%;
}

/* LEARNING: On mobile, make fields stack and take full width */
/* WHY: Better UX on small screens */
@media (max-width: 600px) {
  .text-input-field {
    width: 100%;
    min-width: 0; /* Allow shrinking on mobile */
  }
}

/* LEARNING: Readonly text display styling */
/* WHY: Plain text looks better than disabled input for readonly fields */
/* PATTERN: Use text styling that matches input appearance */
/* LEARNING: Minimum width matches name field for consistency */
/* WHY: Readonly text should match editable field width */
.readonly-text {
  display: inline-block;
  width: 100%;
  min-width: 200px; /* Minimum width to match typical name field width */
  padding: 8px 12px;
  min-height: 40px; /* Match input height */
  line-height: 24px;
  color: rgba(var(--v-theme-on-surface), 0.87);
  font-size: 16px;
}

/* LEARNING: Title row readonly text should size based on content */
/* WHY: Name fields in title row should fit their text content */
/* PATTERN: Use CSS selector to detect when field is in title row context */
:deep(.title-row-field) .readonly-text {
  width: auto;
  min-width: 150px;
  max-width: 100%;
}

/* LEARNING: On mobile, allow readonly text to shrink */
/* WHY: Better UX on small screens */
@media (max-width: 600px) {
  .readonly-text {
    min-width: 0; /* Allow shrinking on mobile */
  }
}

.readonly-text-empty {
  color: rgba(var(--v-theme-on-surface), 0.38); /* Match placeholder color */
  font-style: italic;
}
</style>

