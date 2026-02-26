<script setup lang="ts">
import { computed } from 'vue'
import { getValidNextStatuses } from '@/types/appointment'
import type { AppointmentResponse } from '@/types/appointment'

const props = defineProps<{
  item: AppointmentResponse | null
  editingId: string | null
  editedStatus?: string
  getStatusColor: (status: string) => string
}>()

const emit = defineEmits<{
  (e: 'update:editedStatus', value: string): void
}>()

const statusItems = computed(() => {
  if (!props.item) return []
  return [props.item.status, ...getValidNextStatuses(props.item.status)]
})
</script>

<template>
  <template v-if="item">
    <VChip
      v-if="editingId !== item.id"
      :color="getStatusColor(item.status)"
      size="small"
      variant="tonal"
    >
      {{ item.status }}
    </VChip>
    <VSelect
      v-else
      :model-value="editedStatus"
      :items="statusItems"
      density="compact"
      hide-details
      @update:model-value="emit('update:editedStatus', $event)"
    />
  </template>
</template>
