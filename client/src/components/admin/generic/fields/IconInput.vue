<template>
  <BaseInput
    :field-key="String(fieldContext.fieldKey)"
    :display-config="fieldContext.displayConfig"
    :error="fieldContext.error?.value"
    :show-label="false"
    :is-disabled="fieldContext.isDisabled.value"
  >
    <!-- LEARNING: When readonly, display as icon with text for better UX -->
    <!-- WHY: Readonly inputs look disabled/confusing - icon display is clearer -->
    <!-- PATTERN: Conditional rendering based on readOnly state -->
    <div
      v-if="fieldContext.displayConfig.readOnly"
      class="readonly-icon-display"
      :class="{ 'readonly-icon-empty': !iconValue || iconValue === '' }"
    >
      <Icon
        v-if="iconValue"
        :icon="iconValue"
        width="24"
        height="24"
        class="mr-2"
      />
      <span>{{ iconValue || fieldContext.displayConfig.placeholder || 'No icon selected' }}</span>
    </div>
    
    <!-- LEARNING: Editable icon input with preview and picker button -->
    <!-- WHY: Users need to see selected icon and easily open picker -->
    <!-- PATTERN: Input field with icon preview and button to open dialog -->
    <div
      v-else
      class="icon-input-wrapper"
    >
      <VTextField
        :id="`field-${String(fieldContext.fieldKey)}`"
        :name="String(fieldContext.fieldKey)"
        :model-value="displayValue"
        :label="fieldContext.displayConfig.label"
        :placeholder="fieldContext.displayConfig.placeholder"
        :disabled="fieldContext.displayConfig.disabled"
        :error="!!fieldContext.error?.value"
        :error-messages="fieldContext.error?.value"
        :autocomplete="AUTCOMPLETE_OFF"
        class="icon-input-field"
        readonly
        @click="openPicker"
        @focus="handleFocus"
      >
        <!-- Icon Preview -->
        <template #prepend-inner>
          <Icon
            v-if="iconValue"
            :icon="iconValue"
            width="20"
            height="20"
            class="icon-preview"
          />
          <Icon
            v-else
            icon="tabler-photo"
            width="20"
            height="20"
            class="icon-preview icon-preview-placeholder"
          />
        </template>
        
        <!-- Picker Button -->
        <template #append-inner>
          <VBtn
            icon
            variant="text"
            size="small"
            :disabled="fieldContext.displayConfig.disabled"
            @click.stop="openPicker"
          >
            <Icon icon="tabler-color-picker" width="20" height="20" />
          </VBtn>
        </template>
      </VTextField>
      
      <!-- Hidden input for actual form value -->
      <input
        type="hidden"
        :name="String(fieldContext.fieldKey)"
        :value="iconValue || ''"
      />
    </div>
    
    <!-- Icon Picker Dialog -->
    <IconPicker
      v-model="showPicker"
      :current-icon="iconValue"
      @select="handleIconSelect"
    />
  </BaseInput>
</template>

<script setup lang="ts">
/**
 * LEARNING: IconInput renders icon selection input with visual preview
 * 
 * WHY: Icon fields need visual selection, not just text input
 * 
 * PATTERN: Wrapper component pattern - wraps input with icon picker dialog
 * 
 * COMPARISON: Similar to DateInput pattern - readonly input with picker dialog
 */

import { ref, computed, inject } from 'vue'
import { Icon } from '@iconify/vue'
import { AUTCOMPLETE_OFF } from '../../../../utils/autocomplete'
import BaseInput from './BaseInput.vue'
import IconPicker from './IconPicker.vue'
import type { GlobalEntityKey } from '../../../../constants/entities'
import type { GlobalFieldKey } from '../../../../constants/primitives'
import type { FieldContextType } from '../../../../composables/useFieldContext'
import { useFieldValue } from '../../../../composables/useFieldValue'
import { ENTITY_CARD_SAVE_KEY, type EntityCardSaveContext } from '../entityCardConstants'

const entityCardSaveContext = inject<EntityCardSaveContext | undefined>(ENTITY_CARD_SAVE_KEY)

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

const iconValue = computed((): string => {
  const value = fieldValue.value
  return typeof value === 'string' ? value : ''
})

// LEARNING: Display value shows icon name without prefix for better UX
// WHY: Users see cleaner text (e.g., "home" instead of "tabler-home")
// PATTERN: Computed property transforms value for display
const displayValue = computed(() => {
  if (!iconValue.value) return ''
  return iconValue.value.replace('tabler-', '')
})

// LEARNING: Dialog visibility state
// WHY: Controls when icon picker dialog is shown
// PATTERN: ref for boolean dialog state
const showPicker = ref(false)

// LEARNING: Open icon picker dialog
// WHY: Users click input or button to select icon
// PATTERN: Set dialog visibility to true
const openPicker = () => {
  if (!fieldContext.displayConfig.disabled) {
    showPicker.value = true
  }
}

// LEARNING: Handle icon selection from picker
// WHY: Update field value when user selects icon
// PATTERN: Set value via field context and close dialog
const handleIconSelect = (icon: string) => {
  fieldContext.setValue(icon)
  showPicker.value = false
  
  // LEARNING: Skip auto-save for new entities
  // WHY: New entities haven't been created yet - icon selection should wait for explicit form save
  // PATTERN: Match TextInput/NumberInput behavior - new entities use handleSave, not field-level save
  if (entityCardSaveContext?.isNew) {
    return
  }
  
  // Trigger validation and save
  fieldContext.validate().then((isValid) => {
    if (isValid) {
      fieldContext.save().catch(() => {
        // Auto-save failed
      })
    }
  })
}

// LEARNING: Handle focus events
// WHY: Track focus state for UI feedback
// PATTERN: Delegate to field context
const handleFocus = () => {
  fieldContext.setFocus(true)
}
</script>

<style scoped>
.icon-input-wrapper {
  width: 100%;
  position: relative;
}

.icon-input-field {
  width: 100%;
  cursor: pointer;
}

.icon-input-field :deep(.v-field__input) {
  cursor: pointer;
}

/* LEARNING: Hide the actual text input value, show only icon visually */
/* WHY: Users should see icon, not the string value */
/* PATTERN: Use CSS to hide input text while keeping it for form submission */
.icon-input-field :deep(input) {
  color: transparent;
  caret-color: transparent;
}

.icon-input-field :deep(input::placeholder) {
  color: rgba(var(--v-theme-on-surface), 0.38);
}

.icon-preview {
  color: rgba(var(--v-theme-on-surface), 0.7);
  margin-right: 8px;
}

.icon-preview-placeholder {
  opacity: 0.5;
}

.readonly-icon-display {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  min-height: 40px;
  line-height: 24px;
  color: rgba(var(--v-theme-on-surface), 0.87);
  font-size: 16px;
}

.readonly-icon-empty {
  color: rgba(var(--v-theme-on-surface), 0.38);
  font-style: italic;
}
</style>

