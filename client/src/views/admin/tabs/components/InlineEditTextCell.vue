<!--
  WHY: Flat v-if/v-else cell for data tables (component-health: template-directive-depth).
-->
<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    isEditing: boolean
    /** Raw field for view mode when not using formatNull */
    raw?: string | null
    /** Precomputed display string (e.g. city); takes precedence over raw. Null/undefined coalesce to view handling via shown. */
    displayText?: string | null
    formatNull?: (value: unknown) => string
    /** Edit value; null coerced like undefined for VTextField binding. Emits only string | undefined for Partial<> row state. */
    modelValue: string | null | undefined
    inputType?: 'text' | 'email' | 'tel'
  }>(),
  { inputType: 'text' }
)

const emit = defineEmits<{
  'update:modelValue': [value: string | undefined]
}>()

function commitTextInput(v: string): void {
  emit('update:modelValue', v === '' ? undefined : v)
}

const shown = computed((): string => {
  if (props.displayText !== undefined) {
    if (props.displayText === null) return ''
    return props.displayText
  }
  if (props.formatNull) return props.formatNull(props.raw)
  // Explicit empty for missing raw: intentional table empty cell (not API error masking).
  if (props.raw === null || props.raw === undefined) return ''
  return props.raw
})
</script>

<template>
  <span v-if="!isEditing">{{ shown }}</span>
  <VTextField
    v-else
    :model-value="modelValue === null || modelValue === undefined ? '' : modelValue"
    :type="inputType"
    density="compact"
    hide-details
    @update:model-value="commitTextInput"
  />
</template>
