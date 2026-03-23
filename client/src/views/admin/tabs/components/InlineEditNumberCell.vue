<!--
  WHY: Flat number cell for data tables (component-health: template-directive-depth).
-->
<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  isEditing: boolean
  raw: number | null | undefined
  formatNull: (value: unknown) => string
  modelValue: number | null | undefined
}>()

const emit = defineEmits<{
  'update:modelValue': [value: number | null | undefined]
}>()

const shown = computed((): string => props.formatNull(props.raw))

function onFieldInput(value: string | number | null): void {
  if (value === '' || value === null) {
    emit('update:modelValue', null)
    return
  }
  const n = typeof value === 'number' ? value : Number(value)
  emit('update:modelValue', Number.isNaN(n) ? null : n)
}
</script>

<template>
  <span v-if="!isEditing">{{ shown }}</span>
  <VTextField
    v-else
    :model-value="modelValue == null ? '' : String(modelValue)"
    type="number"
    density="compact"
    hide-details
    @update:model-value="onFieldInput"
  />
</template>
