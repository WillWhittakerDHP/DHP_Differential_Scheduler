<!--
  WHY: Flat role select cell (component-health: template-directive-depth).
-->
<script setup lang="ts">
import type { UserRequest } from '@/types/user'
import { USER_ROLE_VALUES } from '@/constants/attendeeRoles'

defineProps<{
  isEditing: boolean
  displayRole: string
  modelValue: UserRequest['userRole'] | undefined
}>()

const emit = defineEmits<{
  'update:modelValue': [value: UserRequest['userRole'] | undefined]
}>()

const ROLE_ITEMS: UserRequest['userRole'][] = [...USER_ROLE_VALUES]
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
