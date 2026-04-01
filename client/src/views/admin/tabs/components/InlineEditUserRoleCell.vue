<!--
  WHY: Flat role select cell (component-health: template-directive-depth).
-->
<script setup lang="ts">
import type { UserRequest } from '@/types/user'

defineProps<{
  isEditing: boolean
  displayRole: string
  modelValue: UserRequest['userRole'] | undefined
}>()

const emit = defineEmits<{
  'update:modelValue': [value: UserRequest['userRole'] | undefined]
}>()

const ROLE_ITEMS = [
  'client',
  'agent',
  'transaction_manager',
  'owner',
  'inspector',
  'admin',
] as const satisfies readonly UserRequest['userRole'][]
</script>

<template>
  <span v-if="!isEditing">{{ displayRole }}</span>
  <VSelect
    v-else
    :model-value="modelValue"
    :items="[...ROLE_ITEMS]"
    density="compact"
    hide-details
    @update:model-value="emit('update:modelValue', $event)"
  />
</template>
