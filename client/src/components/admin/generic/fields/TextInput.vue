<template>
  <BaseInput
    v-if="resolvedFieldContext"
    :field-key="String(resolvedFieldContext.state.fieldKey)"
    :display-config="resolvedFieldContext.state.displayConfig"
    :error="resolvedFieldContext.state.error?.value"
    :show-label="false"
    :is-disabled="resolvedFieldContext.state.isDisabled.value"
  >
    <!-- WHY: Readonly inputs look disabled/confusing - plain text is clearer -->
    <!-- PATTERN: Use computed to reactively track readOnly state for v-if -->
    <span
      v-if="isReadOnly"
      class="readonly-text"
      :class="{ 'readonly-text-empty': !fieldValue || fieldValue === '' }"
    >
      {{ fieldValue || resolvedFieldContext?.state.displayConfig.placeholder || '' }}
    </span>
    
    <!-- WHY: Long text is better displayed in multi-line textarea -->
    <!-- PATTERN: Check content length and newlines to determine if textarea is needed -->
    <AppTextarea
      v-else-if="shouldUseTextarea && resolvedFieldContext"
      :id="`field-${String(resolvedFieldContext.state.fieldKey)}`"
      :name="String(resolvedFieldContext.state.fieldKey)"
      :model-value="fieldValue"
      :label="resolvedFieldContext.state.displayConfig.label"
      :placeholder="resolvedFieldContext.state.displayConfig.placeholder"
      :disabled="resolvedFieldContext.state.displayConfig.disabled"
      :readonly="resolvedFieldContext.state.displayConfig.readOnly"
      :error="!!resolvedFieldContext.state.error?.value"
      :error-messages="resolvedFieldContext.state.error?.value"
      :autocomplete="AUTCOMPLETE_OFF"
      :auto-grow="true"
      :rows="1"
      :autofocus="entityCardSaveContext?.isNew && resolvedFieldContext.state.fieldKey === 'name'"
      class="text-input-field"
      @update:model-value="handleChange"
      @focus="handleFocus"
      @blur="handleBlur"
      @keydown="handleKeydown"
    />
    <AppTextField
      v-else-if="resolvedFieldContext"
      :id="`field-${String(resolvedFieldContext.state.fieldKey)}`"
      :name="String(resolvedFieldContext.state.fieldKey)"
      :model-value="fieldValue"
      :label="resolvedFieldContext.state.displayConfig.label"
      :placeholder="resolvedFieldContext.state.displayConfig.placeholder"
      :disabled="resolvedFieldContext.state.displayConfig.disabled"
      :readonly="resolvedFieldContext.state.displayConfig.readOnly"
      :error="!!resolvedFieldContext.state.error?.value"
      :error-messages="resolvedFieldContext.state.error?.value"
      :autocomplete="AUTCOMPLETE_OFF"
      :autofocus="entityCardSaveContext?.isNew && resolvedFieldContext.state.fieldKey === 'name'"
      class="text-input-field"
      @update:model-value="handleChange"
      @focus="handleFocus"
      @blur="handleBlur"
      @keydown="handleKeydown"
    />
  </BaseInput>
</template>

<script setup lang="ts">
/**
 * PATTERN: Wrapper component pattern - wraps Vuexy App components with field contex...
 */
import { computed, inject, toRef } from 'vue'
import { useDisplay } from 'vuetify'
import { AUTCOMPLETE_OFF } from '@/utils/autocomplete'
import BaseInput from './BaseInput.vue'
import AppTextField from '@/@core/components/app-form-elements/AppTextField.vue'
import AppTextarea from '@/@core/components/app-form-elements/AppTextarea.vue'
import { useFieldValue } from '@/composables/useFieldValue'
import type { ValidAdminValue } from '@/constants/primitives'
import { ENTITY_CARD_SAVE_KEY, ENTITY_CARD_DISABLE_AUTOSAVE_KEY, type EntityCardSaveContext } from '../entityCardConstants'
import { useFieldInputHandlers } from '@/composables/admin/useFieldInputHandlers'

import type { FieldInputProps } from './fieldTypes'

const props = withDefaults(defineProps<FieldInputProps>(), {
  showLabel: true
})

// WHY: Vue 3 best practice - destructuring props breaks reactivity, use toRef instead
const fieldContextRef = toRef(props, 'fieldContext')

const resolvedFieldContext = computed(() => {
  const context = fieldContextRef.value
  if (!context) return undefined
  return context
})

const entityCardSaveContext = inject<EntityCardSaveContext | undefined>(ENTITY_CARD_SAVE_KEY, undefined)

const disableAutoSave = inject<boolean | undefined>(ENTITY_CARD_DISABLE_AUTOSAVE_KEY, false)

// FIX: Handle Vue's prop unwrapping - context.value may be unwrapped to the actual value
const fieldValue = computed(() => {
  const context = resolvedFieldContext.value
  if (!context) {
    return '' as ValidAdminValue
  }
  
  // WHY: useFieldValue is designed to handle Vue's Ref unwrapping when fieldContext is passed as prop
  // PATTERN: Use useFieldValue composable which properly handles both Ref and unwrapped cases
  // NOTE: This is the correct way to access field values - it handles all edge cases
  const val = useFieldValue(context).value
  return val as ValidAdminValue
})

const isReadOnly = computed(() => {
  // PATTERN: Access resolvedFieldContext.value, then nested properties, to establish reactivity dependency
  const context = resolvedFieldContext.value
  if (!context) return false
  const displayConfig = context.state.displayConfig
  const readOnly = displayConfig.readOnly
  return readOnly === true
})

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
  const context = resolvedFieldContext.value
  if (!context) return
  context.actions.setValue(value)
}

// FIX: Use shared field input handlers from composable (includes keyboard guard)
const handlers = computed(() => {
  const context = resolvedFieldContext.value
  if (!context) {
    return {
      handleFocus: () => {},
      handleBlur: () => {},
      handleKeydown: (_event: KeyboardEvent) => {}
    }
  }
  return useFieldInputHandlers({
    fieldContext: resolvedFieldContext.value,
    disableAutoSave,
    entityCardSaveContext,
    fieldType: 'text'
  })
})

const handleFocus = () => handlers.value.handleFocus()
const handleBlur = () => handlers.value.handleBlur()
const handleKeydown = (event: KeyboardEvent) => handlers.value.handleKeydown(event)
</script>

<style scoped>
.text-input-field {
  width: 100%;
  min-width: 200px; /* Minimum width to match typical name field width */
}

:deep(.title-row-field) .text-input-field {
  width: auto;
  min-width: 150px;
  max-width: 100%;
}

@media (max-width: 600px) {
  .text-input-field {
    width: 100%;
    min-width: 0; /* Allow shrinking on mobile */
  }
}

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

:deep(.title-row-field) .readonly-text {
  width: auto;
  min-width: 150px;
  max-width: 100%;
}

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
