<template>
  <BaseInput
    :field-key="String(fieldContext.fieldKey)"
    :display-config="fieldContext.displayConfig"
    :error="fieldContext.error?.value"
    :show-label="false"
    :is-disabled="fieldContext.isDisabled.value"
  >
    <!-- LEARNING: When readonly, display as plain text for better UX -->
    <!-- WHY: Readonly inputs look disabled/confusing - plain text is clearer -->
    <!-- PATTERN: Conditional rendering based on readOnly state -->
    <span
      v-if="fieldContext.displayConfig.readOnly"
      class="readonly-text"
      :class="{ 'readonly-text-empty': !fieldValue || fieldValue === '' }"
    >
      {{ fieldValue || fieldContext.displayConfig.placeholder || '' }}
    </span>
    
    <!-- LEARNING: Conditionally render textarea for long content when editable -->
    <!-- WHY: Long text is better displayed in multi-line textarea -->
    <!-- PATTERN: Check content length and newlines to determine if textarea is needed -->
    <AppTextarea
      v-else-if="shouldUseTextarea"
      :id="`field-${String(fieldContext.fieldKey)}`"
      :name="String(fieldContext.fieldKey)"
      :model-value="fieldValue"
      :label="fieldContext.displayConfig.label"
      :placeholder="fieldContext.displayConfig.placeholder"
      :disabled="fieldContext.displayConfig.disabled"
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
      v-else
      :id="`field-${String(fieldContext.fieldKey)}`"
      :name="String(fieldContext.fieldKey)"
      :model-value="fieldValue"
      :label="fieldContext.displayConfig.label"
      :placeholder="fieldContext.displayConfig.placeholder"
      :disabled="fieldContext.displayConfig.disabled"
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

import { computed, inject } from 'vue'
import { useDisplay } from 'vuetify'
import { AUTCOMPLETE_OFF } from '../../../../utils/autocomplete'
import BaseInput from './BaseInput.vue'
import AppTextField from '@/@core/components/app-form-elements/AppTextField.vue'
import AppTextarea from '@/@core/components/app-form-elements/AppTextarea.vue'
import type { GlobalEntityKey } from '../../../../constants/entities'
import type { GlobalFieldKey } from '../../../../constants/primitives'
import type { FieldContextType } from '../../../../composables/useFieldContext'
import { useFieldValue } from '../../../../composables/useFieldValue'
import { ENTITY_CARD_SAVE_KEY, type EntityCardSaveContext } from '../entityCardConstants'
// Render logger disabled - too verbose
// import type { RenderLogger } from '../../../../utils/renderLogger'
// import { RENDER_LOGGER_KEY } from '../../../../utils/renderLoggerKeys'

interface Props {
  fieldContext: FieldContextType<GlobalEntityKey, GlobalFieldKey<GlobalEntityKey>>
  showLabel?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showLabel: true
})

const { fieldContext } = props

// Render logger disabled - too verbose
// const logger = inject<RenderLogger | undefined>(RENDER_LOGGER_KEY, undefined)

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

// Render logger disabled - too verbose
// if (logger) {
//   onMounted(() => {
//     logger.logStep(`TextInput mounted - fieldKey: ${String(fieldContext.fieldKey)}`, {...})
//   })
//   watch(fieldValue, (newValue, oldValue) => {
//     logger.logStep(`TextInput - Value changed for ${String(fieldContext.fieldKey)}`, {...})
//   })
// }

// LEARNING: Handle value changes with field context
// WHY: Field context manages form state and validation
// PATTERN: Delegate to field context for state management
const handleChange = (value: string) => {
  fieldContext.setValue(value)
}

// LEARNING: Handle focus events
// WHY: Track focus state for UI feedback
// PATTERN: Delegate to field context
const handleFocus = () => {
  fieldContext.setFocus(true)
}

// LEARNING: Handle blur events with auto-save
// WHY: Auto-save on blur provides good UX
// PATTERN: Validate and save on blur if valid
const handleBlur = async () => {
  fieldContext.setFocus(false)
  
  // Validate field
  const isValid = await fieldContext.validate()
  
  // Auto-save if valid
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

<style scoped>
/* LEARNING: Responsive text input field styling */
/* WHY: Fields should fit content and wrap appropriately on different screen sizes */
/* PATTERN: Use CSS to make fields responsive and fit content */
.text-input-field {
  width: 100%;
  min-width: 0; /* Allow field to shrink below default min-width */
}

/* LEARNING: On mobile, make fields stack and take full width */
/* WHY: Better UX on small screens */
@media (max-width: 600px) {
  .text-input-field {
    width: 100%;
  }
}

/* LEARNING: Readonly text display styling */
/* WHY: Plain text looks better than disabled input for readonly fields */
/* PATTERN: Use text styling that matches input appearance */
.readonly-text {
  display: inline-block;
  width: 100%;
  padding: 8px 12px;
  min-height: 40px; /* Match input height */
  line-height: 24px;
  color: rgba(var(--v-theme-on-surface), 0.87);
  font-size: 16px;
}

.readonly-text-empty {
  color: rgba(var(--v-theme-on-surface), 0.38); /* Match placeholder color */
  font-style: italic;
}
</style>

