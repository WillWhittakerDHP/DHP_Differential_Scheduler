<!--
  WHY: Data table for managing appointments with inline editing; uses useAppointmentAttendees, constants, create form.
  PATTERN: VDataTable with custom cell slots; create/edit convert client/agent IDs to attendees via composable.
-->
<script setup lang="ts">
import { computed, shallowReactive } from 'vue'
import { ensureItemsArray } from '@/composables/admin/tables/useTableModelHelpers'
import type { AppointmentResponse } from '@/types/appointment'
import { useAppointmentsTableModel } from '@/composables/admin/tables/useAppointmentsTableModel'
import { useAppointmentsTableHandlers } from '@/composables/admin/tables/useAppointmentsTableHandlers'
import { getStatusColor, getRoleColor } from '@/utils/admin/appointmentHelpers'
import { APPOINTMENTS_TABLE_UI } from '@/constants/appointmentsTableConstants.js'
import AppointmentsCreateForm from './AppointmentsCreateForm.vue'
import AppointmentTableDialogs from './AppointmentTableDialogs.vue'
import AppointmentsTableDataGrid from './AppointmentsTableDataGrid.vue'
import type { AppointmentsTableDataGridContext } from '@/types/admin/tables/appointmentsTableDataGrid'

const emit = defineEmits<{
  (e: 'navigate-to-tab', tab: 'properties' | 'users'): void
}>()

const {
  items: appointments,
  isLoading,
  error: appointmentsError,
  editingId,
  editedData,
  isCreating,
  newItem: newAppointment,
  showDeleteDialog,
  openDeleteDialog,
  cancelDelete,
  confirmDelete,
  startEdit,
  cancelEdit,
  saveEdit,
  startCreate,
  cancelCreate,
  saveCreate,
  lookups,
  confirmAppointment,
  markCancelled,
} = useAppointmentsTableModel()
const { properties, users, getDisplayValue, getPropertyById, getUserById, getPropertyTypeNames } = lookups

const handlers = useAppointmentsTableHandlers({
  newAppointment,
  editedData,
  saveCreate,
  saveEdit,
  startEdit,
  cancelEdit,
  startCreate,
  cancelCreate,
  confirmAppointment,
  emit,
})
const { formBuyerId, formAgentId, editingBuyerId, editingAgentId, confirmingAppointment, showConfirmDialog } = handlers.state

const scheduledByDisplay = computed(() =>
  confirmingAppointment.value ? getDisplayValue(confirmingAppointment.value, 'scheduledById') : undefined
)

const tableItems = computed(() => ensureItemsArray<AppointmentResponse>(appointments.value))

const {
  handleOpenConfirmDialog,
  handleConfirmAppointment,
  handleCancelConfirm,
  handleSaveCreate,
  handleSaveEdit,
  handleStartEdit,
  handleCancelEdit,
  handleStartCreate,
  handleCancelCreate,
  applyCreatePatch,
  navigateToProperties,
  navigateToUsers,
  setFormBuyerId,
  setFormAgentId,
} = handlers.actions
const { formatTimestamp } = handlers

const gridContext = shallowReactive<AppointmentsTableDataGridContext>({
  tableItems,
  isLoading,
  editingId,
  editedData,
  editingBuyerId,
  editingAgentId,
  properties,
  users,
  getDisplayValue,
  getPropertyById,
  getUserById,
  getPropertyTypeNames,
  getStatusColor,
  getRoleColor,
  formatTimestamp,
  navigateToProperties,
  navigateToUsers,
  handleSaveEdit,
  handleCancelEdit,
  handleOpenConfirmDialog,
  handleStartEdit,
  markCancelled,
  openDeleteDialog,
})
</script>

<template>
  <div class="appointments-table">
    <div class="d-flex justify-space-between align-center mb-4">
      <h3 class="text-headline-small">{{ APPOINTMENTS_TABLE_UI.TITLE }}</h3>
      <VBtn
        color="primary"
        prepend-icon="tabler-plus"
        :disabled="isCreating"
        @click="handleStartCreate"
      >
        {{ APPOINTMENTS_TABLE_UI.CREATE_BUTTON }}
      </VBtn>
    </div>

    <VAlert v-if="appointmentsError" type="error" variant="tonal" class="mb-4">
      {{ APPOINTMENTS_TABLE_UI.ERROR_PREFIX }} {{ appointmentsError }}
    </VAlert>

    <AppointmentsCreateForm
      v-if="isCreating"
      :new-appointment="newAppointment"
      :form-buyer-id="formBuyerId"
      :form-agent-id="formAgentId"
      :properties="properties"
      :users="users"
      @update:patch="applyCreatePatch"
      @update:form-buyer-id="setFormBuyerId"
      @update:form-agent-id="setFormAgentId"
      @save="handleSaveCreate"
      @cancel="handleCancelCreate"
    />

    <VAlert
      v-if="!isLoading && !appointmentsError && appointments.length === 0"
      type="info"
      variant="tonal"
      class="mb-4"
    >
      {{ APPOINTMENTS_TABLE_UI.EMPTY_MESSAGE }}
    </VAlert>

    <AppointmentsTableDataGrid v-if="!appointmentsError" :grid="gridContext" />

    <AppointmentTableDialogs
      :show-delete-dialog="showDeleteDialog"
      :show-confirm-dialog="showConfirmDialog"
      :confirming-appointment="confirmingAppointment"
      :scheduled-by-display="scheduledByDisplay"
      @cancel-delete="cancelDelete"
      @confirm-delete="confirmDelete"
      @cancel-confirm="handleCancelConfirm"
      @confirm-appointment="handleConfirmAppointment"
    />
  </div>
</template>

<style scoped>
.appointments-table {
  padding: 1rem 0;
}

.tooltip-content {
  padding: 8px;
  min-width: 200px;
}

.tooltip-title {
  font-weight: bold;
  margin-bottom: 8px;
  padding-bottom: 4px;
  border-bottom: 1px solid rgba(var(--v-theme-on-surface), 0.3);
}

.tooltip-content div {
  margin-bottom: 4px;
}

.tooltip-hint {
  margin-top: 8px;
  font-size: 0.85em;
  opacity: 0.7;
  font-style: italic;
}

.tooltip-name {
  font-size: 1.1em;
  font-weight: bold;
  margin-bottom: 4px;
}

.tooltip-role {
  font-size: 0.9em;
  text-transform: capitalize;
  opacity: 0.85;
  margin-bottom: 8px;
  padding-bottom: 4px;
  border-bottom: 1px solid rgba(var(--v-theme-on-surface), 0.3);
}

.tooltip-details {
  font-size: 0.95em;
}

.tooltip-details div {
  margin-bottom: 4px;
}

</style>
