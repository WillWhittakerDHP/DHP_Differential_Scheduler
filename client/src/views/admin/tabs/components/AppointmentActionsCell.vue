<script setup lang="ts">
import { APPOINTMENTS_TABLE_UI } from '@/constants/appointmentsTableConstants'
import type { AppointmentResponse } from '@/types/appointment'

defineProps<{
  item: AppointmentResponse | null
  editingId: string | null
}>()

const emit = defineEmits<{
  save: []
  cancel: []
  openConfirm: [item: AppointmentResponse]
  startEdit: [item: AppointmentResponse]
  delete: [id: string]
}>()
</script>

<template>
  <template v-if="item">
    <div v-if="editingId === item.id" class="d-flex gap-2">
      <VBtn prepend-icon="tabler-check" size="small" color="success" variant="text" @click="emit('save')">
        {{ APPOINTMENTS_TABLE_UI.SAVE }}
      </VBtn>
      <VBtn prepend-icon="tabler-x" size="small" color="error" variant="text" @click="emit('cancel')">
        {{ APPOINTMENTS_TABLE_UI.CANCEL }}
      </VBtn>
    </div>
    <div v-else class="d-flex gap-2">
      <VTooltip v-if="item.status === 'submitted'" location="top">
        <template #activator="{ props: confirmTooltipProps }">
          <VBtn
            v-bind="confirmTooltipProps"
            prepend-icon="tabler-check-circle"
            size="small"
            variant="text"
            color="success"
            @click="emit('openConfirm', item)"
          >
            {{ APPOINTMENTS_TABLE_UI.CONFIRM }}
          </VBtn>
        </template>
        {{ APPOINTMENTS_TABLE_UI.CONFIRM_TOOLTIP }}
      </VTooltip>
      <VBtn prepend-icon="tabler-pencil" size="small" variant="text" @click="emit('startEdit', item)">
        {{ APPOINTMENTS_TABLE_UI.EDIT }}
      </VBtn>
      <VTooltip location="top">
        <template #activator="{ props: overrideTooltipProps }">
          <VBtn
            v-bind="overrideTooltipProps"
            prepend-icon="tabler-shield-check"
            size="small"
            variant="text"
            color="warning"
            disabled
          >
            {{ APPOINTMENTS_TABLE_UI.OVERRIDE_CONSTRAINTS }}
          </VBtn>
        </template>
        {{ APPOINTMENTS_TABLE_UI.OVERRIDE_TOOLTIP }}
      </VTooltip>
      <VBtn prepend-icon="tabler-trash" size="small" color="error" variant="text" @click="emit('delete', item.id)">
        {{ APPOINTMENTS_TABLE_UI.DELETE }}
      </VBtn>
    </div>
  </template>
</template>
