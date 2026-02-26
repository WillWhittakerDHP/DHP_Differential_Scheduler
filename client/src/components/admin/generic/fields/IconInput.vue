<template>
  <BaseInput
    :field-key="String(fieldContext.state.fieldKey)"
    :display-config="fieldContext.state.displayConfig"
    :error="fieldContext.state.error?.value"
    :show-label="false"
    :is-disabled="fieldContext.state.isDisabled.value"
  >
    <!-- LEARNING: When readonly, display as icon with text for better UX -->
    <!-- WHY: Readonly inputs look disabled/confusing - icon display is clearer -->
    <!-- PATTERN: Conditional rendering based on readOnly state -->
    <div
      v-if="fieldContext.state.displayConfig.readOnly"
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
      <span>{{ iconValue || fieldContext.state.displayConfig.placeholder || 'No icon selected' }}</span>
    </div>
    
    <!-- LEARNING: Editable icon input with preview and picker button -->
    <!-- WHY: Users need to see selected icon and easily open picker -->
    <!-- PATTERN: Input field with icon preview and button to open dialog -->
    <div
      v-else
      class="icon-input-wrapper"
    >
      <VTextField
        :id="`field-${String(fieldContext.state.fieldKey)}`"
        :name="String(fieldContext.state.fieldKey)"
        :model-value="displayValue"
        :label="fieldContext.state.displayConfig.label"
        :placeholder="fieldContext.state.displayConfig.placeholder"
        :disabled="fieldContext.state.displayConfig.disabled"
        :error="!!fieldContext.state.error?.value"
        :error-messages="fieldContext.state.error?.value"
        :autocomplete="AUTCOMPLETE_OFF"
        class="icon-input-field"
        readonly
        @click="openPicker"
        @focus="handleFocus"
        @blur="handleBlur"
        @keydown="handleKeydown"
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
            :disabled="fieldContext.state.displayConfig.disabled"
            @click.stop="openPicker"
          >
            <Icon icon="tabler-color-picker" width="20" height="20" />
          </VBtn>
        </template>
      </VTextField>
      
      <!-- Hidden input for actual form value -->
      <input
        type="hidden"
        :name="String(fieldContext.state.fieldKey)"
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
 * WHY: PATTERN: Wrapper component pattern - wraps input with icon picker dialog...
 */
import { ref, computed, inject } from 'vue'
import { Icon } from '@iconify/vue'
import { AUTCOMPLETE_OFF } from '@/utils/autocomplete'
import BaseInput from './BaseInput.vue'
import IconPicker from './IconPicker.vue'
import { useFieldValue } from '@/composables/useFieldValue'
import { useFieldInputHandlers } from '@/composables/admin/useFieldInputHandlers'
import { ENTITY_CARD_SAVE_KEY, ENTITY_CARD_DISABLE_AUTOSAVE_KEY, type EntityCardSaveContext } from '../entityCardConstants'

const entityCardSaveContext = inject<EntityCardSaveContext | undefined>(ENTITY_CARD_SAVE_KEY)
const disableAutoSave = inject<boolean | undefined>(ENTITY_CARD_DISABLE_AUTOSAVE_KEY, false)

import type { FieldInputProps } from './fieldTypes'

const props = withDefaults(defineProps<FieldInputProps>(), {
  showLabel: true
})

const { fieldContext } = props

// LEARNING: Use unified field value composable
const fieldValue = useFieldValue(fieldContext)

const iconValue = computed((): string => {
  const value = fieldValue.value
  return typeof value === 'string' ? value : ''
})

const displayValue = computed(() => {
  if (!iconValue.value) return ''
  return iconValue.value.replace('tabler-', '')
})

// LEARNING: Dialog visibility state
// PATTERN: ref for boolean dialog state
const showPicker = ref(false)

const openPicker = () => {
  if (!fieldContext.state.displayConfig.disabled) {
    showPicker.value = true
  }
}

const handleIconSelect = (icon: string) => {
  fieldContext.actions.setValue(icon)
  showPicker.value = false
  
  // PATTERN: Match TextInput/NumberInput behavior - new entities use handleSave, not field-level save
  if (entityCardSaveContext?.isNew) {
    return
  }
  
  fieldContext.actions.validate().then((isValid) => {
    if (isValid) {
      fieldContext.actions.save().catch(() => {
      })
    }
  })
}

// FIX: Use shared field input handlers for consistent focus, blur, and keyboard containment
const { handleFocus, handleBlur, handleKeydown } = useFieldInputHandlers({
  fieldContext,
  disableAutoSave,
  entityCardSaveContext: entityCardSaveContext ?? null,
  fieldType: 'icon'
})
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

