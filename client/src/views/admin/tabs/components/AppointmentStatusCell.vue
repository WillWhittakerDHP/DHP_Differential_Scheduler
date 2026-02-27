<script setup lang="ts">
import { computed } from 'vue'
import { getValidNextStatuses } from '@/types/appointment'
import type { AppointmentResponse } from '@/types/appointment'
import type { AppointmentStatus } from '@/types/appointmentStatus'

const props = defineProps<{
  item: AppointmentResponse | null
  editingId: string | null
  editedStatus?: string | null
  getStatusColor: (status: string) => string
}>()

const emit = defineEmits<{
  (e: 'update:editedStatus', value: string): void
}>()

const statusItems = computed(() => {
  if (!props.item) return []
  return [props.item.status, ...getValidNextStatuses(props.item.status)]
})

const modelValue = computed<AppointmentStatus | null>({
  get: () => (props.editedStatus ?? null) as AppointmentStatus | null,
  set: (v: AppointmentStatus | null) => emit('update:editedStatus', (v ?? '') as string),
})
</script>

<template>
  <template v-if="item">
    <VChip
      v-if="editingId !== item.id"
      :color="getStatusColor(item.status ?? '')"
      size="small"
      variant="tonal"
    >
      {{ item.status }}
    </VChip>
    <VSelect
      v-else
      v-model="modelValue"
      :items="statusItems"
      density="compact"
      hide-details
    />
  </template>
</template>
