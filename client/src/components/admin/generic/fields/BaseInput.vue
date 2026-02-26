<template>
  <div class="field-wrapper" :class="{ 'field-error': hasError, 'field-disabled': isDisabled }">
    <!-- Label -->
    <label v-if="showLabel" class="field-label" :for="fieldId">
      {{ displayConfig.label }}
      <span v-if="displayConfig.required" class="field-required">*</span>
    </label>
    
    <!-- Help Text -->
    <div v-if="showHelp && displayConfig.helpText" class="field-help">
      {{ displayConfig.helpText }}
    </div>
    
    <!-- Field Content -->
    <div class="field-content">
      <slot />
    </div>
    
    <!-- Error Message -->
    <div v-if="showError && hasError" class="field-error-message">
      {{ error }}
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * PATTERN: Wrapper component pattern - provides consistent UI structure

          ...
 */
import { computed } from 'vue'
import type { GlobalEntityKey } from '@/constants/entities'
import type { GlobalFieldKey } from '@/constants/primitives'
import type { FieldDisplayConfig } from '@/composables/fieldContext/types'

interface Props {
  fieldKey: string
  displayConfig: FieldDisplayConfig<GlobalEntityKey, GlobalFieldKey<GlobalEntityKey>>
  error?: string
  showLabel?: boolean
  showError?: boolean
  showHelp?: boolean
  isDisabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showLabel: false,
  showError: true,
  showHelp: true,
  isDisabled: false
})

// LEARNING: Computed properties provide reactive derived state
// PATTERN: Use computed for derived state
const hasError = computed(() => !!props.error)
const fieldId = computed(() => `field-${props.fieldKey}`)
</script>

<style scoped>
.field-wrapper {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 16px;
}

.field-label {
  font-size: 14px;
  font-weight: 500;
  color: rgba(var(--v-theme-on-surface), 0.87);
  margin-bottom: 4px;
}

.field-required {
  color: rgb(var(--v-theme-error));
  margin-left: 4px;
}

.field-help {
  font-size: 12px;
  color: rgba(var(--v-theme-on-surface), 0.6);
  margin-bottom: 4px;
}

.field-content {
  display: flex;
  align-items: flex-start;
  gap: 8px;
}

:deep(.title-row-field) .field-wrapper {
  margin-bottom: 0;
}

:deep(.title-row-field) .field-content {
  width: auto;
  min-width: fit-content;
}

.field-right-actions {
  flex-shrink: 0;
}

.field-error-message {
  font-size: 12px;
  color: rgb(var(--v-theme-error));
  margin-top: 4px;
}

.field-wrapper.field-error .field-label {
  color: rgb(var(--v-theme-error));
}

.field-wrapper.field-disabled {
  opacity: 0.6;
  pointer-events: none;
}
</style>

