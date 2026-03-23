<!--
  WHY: Flat foundation access select cell (component-health: template-directive-depth).
-->
<script setup lang="ts">
import { computed } from 'vue'
import type { PropertyRequest } from '@/types/property'

const props = defineProps<{
  isEditing: boolean
  raw: PropertyRequest['foundationAccess']
  formatNull: (value: unknown) => string
  /** Partial edit row can omit keys until touched — same pattern as InlineEditNumberCell. */
  modelValue?: PropertyRequest['foundationAccess'] | null
}>()

const emit = defineEmits<{
  'update:modelValue': [value: PropertyRequest['foundationAccess'] | null]
}>()

const shown = computed((): string => props.formatNull(props.raw))
</script>

<template>
  <span v-if="!isEditing">{{ shown }}</span>
  <VSelect
    v-else
    :model-value="modelValue ?? null"
    :items="['basement', 'crawlspace', 'slab']"
    density="compact"
    hide-details
    clearable
    @update:model-value="emit('update:modelValue', $event)"
  />
</template>
