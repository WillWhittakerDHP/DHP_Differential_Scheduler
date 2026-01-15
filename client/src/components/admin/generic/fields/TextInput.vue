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

import { computed, inject, toRef, unref, type Ref } from 'vue'
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
// PATTERN: Use toRef to create reactive reference to prop
// NOTE: toRef handles undefined props - returns undefined ref if prop doesn't exist
const fieldContextRef = toRef(props, 'fieldContext')

// LEARNING: Computed to safely access fieldContext with fallback
// WHY: fieldContext prop might be undefined initially, need to handle gracefully
// PATTERN: Use computed to safely access fieldContext.value and unwrap the ref
const fieldContext = computed(() => {
  const context = fieldContextRef.value
  if (!context) return undefined
  // fieldContextRef.value is already the FieldContextType, not a Ref
  return context
})

/**
 * LEARNING: Inject EntityCard save handler for create cards
 * WHY: When creating new entities, pressing Enter should save the entire form and collapse,
 *      not just save the individual field
 * PATTERN: Use inject to access parent EntityCard's handleSave method
 */
const entityCardSaveContext = inject<EntityCardSaveContext | undefined>(ENTITY_CARD_SAVE_KEY, undefined)

/**
 * LEARNING: Inject disableAutoSave flag from EntityCard
 * WHY: Allows parent to disable field blur auto-save (e.g., in bulk edit modals)
 * PATTERN: Use inject to access parent EntityCard's disableAutoSave flag
 */
const disableAutoSave = inject<boolean | undefined>(ENTITY_CARD_DISABLE_AUTOSAVE_KEY, false)

// LEARNING: Access field value directly from context.value
// WHY: context.value is a Ref<ValidAdminValue> from vee-validate's useField
//      When passed as prop, Vue may unwrap it, so we handle both cases
// PATTERN: Access context.value directly - if it's a Ref, access .value; if unwrapped, use directly
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
// WHY: v-if needs reactive computed to update when displayConfig.readOnly changes
// PATTERN: Use computed to explicitly track displayConfig.readOnly - Vue tracks property access in computed
// NOTE: Vue 3 best practice - access fieldContext through computed to ensure reactivity
const isReadOnly = computed(() => {
  // LEARNING: Access fieldContext.value safely
  // WHY: fieldContext is computed, accessing .value ensures Vue tracks prop changes
  // PATTERN: Access fieldContext.value, then nested properties, to establish reactivity dependency
  const context = fieldContext.value
  if (!context) return false
  const displayConfig = context.displayConfig
  const readOnly = displayConfig.readOnly
  return readOnly === true
})

// LEARNING: Use Vuetify's display composable for responsive behavior
// WHY: Provides access to current breakpoint and screen size information
// PATTERN: Use useDisplay() to get responsive utilities
const { width } = useDisplay()

// LEARNING: Determine if textarea should be used based on content length
// WHY: Long text or multi-line content is better displayed in textarea
// PATTERN: Check content length and newlines, adjust threshold based on screen size
//          Mobile: lower threshold (30 chars), Desktop: higher threshold (50 chars)
const shouldUseTextarea = computed(() => {
  const value = fieldValue.value
  if (!value || typeof value !== 'string') {
    return false
  }
  
  // Check for newlines - always use textarea if content has newlines
  if (value.includes('\n')) {
    return true
  }
  
  // Adjust threshold based on screen size
  // Mobile-first: lower threshold for smaller screens
  const isMobile = width.value < 600 // sm breakpoint
  const threshold = isMobile ? 30 : 50
  
  // Use textarea if content exceeds threshold
  return value.length > threshold
})

// LEARNING: Handle value changes with field context
// WHY: Field context manages form state and validation
// PATTERN: Delegate to field context for state management
const handleChange = (value: string) => {
  const context = fieldContext.value
  if (!context) return
  context.setValue(value)
}

// FIX: Use shared field input handlers from composable
// LEARNING: Create handlers reactively using computed
// WHY: fieldContext might be undefined initially, and handlers need to reference current context
// PATTERN: Use computed to create handlers that reference current fieldContext.value
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
// WHY: handlers computed updates when fieldContext changes, ensuring handlers reference current context
// PATTERN: Access handlers.value in template and methods
const handleFocus = () => handlers.value.handleFocus()
const handleBlur = () => handlers.value.handleBlur()
const handleEnterKey = () => handlers.value.handleEnterKey()
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

