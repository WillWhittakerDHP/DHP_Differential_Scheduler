<!--
  WHY: Data table for managing appointments with inline editing; uses useAppointmentAttendees, constants, create form.
  PATTERN: VDataTable with custom cell slots; create/edit convert client/agent IDs to attendees via composable.
-->
<script setup lang="ts">
import type { AppointmentStatus } from '@/types/appointment'
import { useAppointmentsTableModel } from '@/composables/admin/tables/useAppointmentsTableModel'
import { useAppointmentsTableHandlers } from '@/composables/admin/tables/useAppointmentsTableHandlers'
import { getClientAttendee, getAgentAttendee } from '@/utils/admin/appointmentAttendees'
import { getStatusColor, getRoleColor } from '@/utils/admin/appointmentHelpers'
import { APPOINTMENTS_TABLE_HEADERS, APPOINTMENTS_TABLE_UI } from '@/constants/appointmentsTableConstants.js'
import AppointmentsCreateForm from './AppointmentsCreateForm.vue'
import AppointmentUserTooltipContent from './AppointmentUserTooltipContent.vue'
import AppointmentPropertyTooltipContent from './AppointmentPropertyTooltipContent.vue'
import AppointmentTableDialogs from './AppointmentTableDialogs.vue'
import AppointmentStatusCell from './AppointmentStatusCell.vue'
import AppointmentActionsCell from './AppointmentActionsCell.vue'

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
const { formClientId, formAgentId, editingClientId, editingAgentId, confirmingAppointment, showConfirmDialog } = handlers.state
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
  setFormClientId,
  setFormAgentId,
} = handlers.actions
const { formatTimestamp } = handlers
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

    <VAlert v-if="isLoading" type="info" variant="tonal" class="mb-4">
      {{ APPOINTMENTS_TABLE_UI.LOADING }}
    </VAlert>

    <VAlert v-if="appointmentsError" type="error" variant="tonal" class="mb-4">
      {{ APPOINTMENTS_TABLE_UI.ERROR_PREFIX }} {{ appointmentsError }}
    </VAlert>

    <AppointmentsCreateForm
      v-if="isCreating"
      :new-appointment="newAppointment"
      :form-client-id="formClientId"
      :form-agent-id="formAgentId"
      :properties="properties"
      :users="users"
      @update:patch="applyCreatePatch"
      @update:form-client-id="setFormClientId"
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

    <VDataTable
      v-if="!isLoading && !appointmentsError"
      :headers="APPOINTMENTS_TABLE_HEADERS"
      :items="appointments"
      :loading="isLoading"
      item-value="id"
      class="elevation-1"
      :items-per-page="25"
    >
      <template #item.propertyVersionId="{ item }">
        <template v-if="item">
          <span v-if="editingId !== item.id">
            <VTooltip location="top">
              <template #activator="{ props: tooltipProps }">
                <span v-bind="tooltipProps" class="clickable-cell" @click="navigateToProperties">
                  {{ getDisplayValue(item, 'propertyVersionId') }}
                </span>
              </template>
              <AppointmentPropertyTooltipContent :property="getPropertyById(item.propertyVersionId)" />
            </VTooltip>
          </span>
          <VSelect
            v-else
            v-model="editedData.propertyVersionId"
            :items="properties"
            item-title="address"
            item-value="propertyVersionId"
            item-value-alt="id"
            :return-object="false"
            density="compact"
            hide-details
          >
            <template #item="{ props: itemProps, item: propItem }">
              <VListItem v-bind="itemProps">
                <VListItemTitle>
                  {{ propItem.address }}, {{ propItem.city }}, {{ propItem.state }}
                </VListItemTitle>
              </VListItem>
            </template>
          </VSelect>
        </template>
      </template>

      <template #item.propertyTypes="{ item }">
        <template v-if="item">
          <span>{{ getPropertyTypeNames(item.propertyVersionId) }}</span>
        </template>
      </template>

      <template #item.client="{ item }">
        <template v-if="item">
          <span v-if="editingId !== item.id">
            <VTooltip location="top">
              <template #activator="{ props: tooltipProps }">
                <span v-bind="tooltipProps" class="clickable-cell" @click="navigateToUsers">
                  {{ getClientAttendee(item)?.user ? `${getClientAttendee(item)?.user?.firstName} ${getClientAttendee(item)?.user?.lastName}` : '—' }}
                </span>
              </template>
              <AppointmentUserTooltipContent :user="getClientAttendee(item)?.user ?? null" />
            </VTooltip>
          </span>
          <VSelect
            v-else
            v-model="editingClientId"
            :items="users.filter((u) => u.userRole === 'client')"
            item-title="firstName"
            item-value="id"
            :return-object="false"
            density="compact"
            hide-details
            clearable
          >
            <template #item="{ props: itemProps, item: userItem }">
              <VListItem v-bind="itemProps">
                <VListItemTitle>{{ userItem.firstName }} {{ userItem.lastName }}</VListItemTitle>
              </VListItem>
            </template>
          </VSelect>
        </template>
      </template>

      <template #item.agent="{ item }">
        <template v-if="item">
          <span v-if="editingId !== item.id">
            <VTooltip location="top">
              <template #activator="{ props: tooltipProps }">
                <span v-bind="tooltipProps" class="clickable-cell" @click="navigateToUsers">
                  {{ getDisplayValue(item, 'agent') }}
                </span>
              </template>
              <AppointmentUserTooltipContent :user="getAgentAttendee(item)?.user ?? null" />
            </VTooltip>
          </span>
          <VSelect
            v-else
            v-model="editingAgentId"
            :items="users.filter((u) => u.userRole === 'agent')"
            item-title="firstName"
            item-value="id"
            :return-object="false"
            density="compact"
            hide-details
            clearable
          >
            <template #item="{ props: itemProps, item: userItem }">
              <VListItem v-bind="itemProps">
                <VListItemTitle>{{ userItem.firstName }} {{ userItem.lastName }}</VListItemTitle>
              </VListItem>
            </template>
          </VSelect>
        </template>
      </template>

      <template #item.scheduledById="{ item }">
        <template v-if="item">
          <span v-if="editingId !== item.id">
            <VTooltip location="top">
              <template #activator="{ props: tooltipProps }">
                <VChip
                  v-if="getUserById(item.scheduledById)"
                  v-bind="tooltipProps"
                  :color="getRoleColor(getUserById(item.scheduledById)?.userRole)"
                  size="small"
                  variant="tonal"
                  class="clickable-chip"
                  @click="navigateToUsers"
                >
                  {{ getDisplayValue(item, 'scheduledById') }}
                </VChip>
                <span v-else v-bind="tooltipProps" class="text-disabled">—</span>
              </template>
              <AppointmentUserTooltipContent :user="getUserById(item.scheduledById)" />
            </VTooltip>
          </span>
          <VSelect
            v-else
            v-model="editedData.scheduledById"
            :items="users"
            item-title="firstName"
            item-value="id"
            :return-object="false"
            density="compact"
            hide-details
            clearable
          >
            <template #item="{ props: itemProps, item: userItem }">
              <VListItem v-bind="itemProps">
                <VListItemTitle>{{ userItem.firstName }} {{ userItem.lastName }} ({{ userItem.userRole }})</VListItemTitle>
              </VListItem>
            </template>
          </VSelect>
        </template>
      </template>

      <template #item.selectedDate="{ item }">
        <template v-if="item">
          <span v-if="editingId !== item.id">{{ getDisplayValue(item, 'selectedDate') }}</span>
          <VTextField v-else v-model="editedData.selectedDate" type="date" density="compact" hide-details />
        </template>
      </template>

      <template #item.status="{ item }">
        <AppointmentStatusCell
          :item="item"
          :editing-id="editingId"
          :edited-status="editedData.status"
          :get-status-color="getStatusColor"
          @update:edited-status="(v: string) => (editedData.status = v as AppointmentStatus)"
        />
      </template>

      <template #item.submittedAt="{ item }">
        <template v-if="item">
          <span class="text-body-small">{{ formatTimestamp(item.submittedAt) }}</span>
        </template>
      </template>

      <template #item.confirmedAt="{ item }">
        <template v-if="item">
          <span class="text-body-small">{{ formatTimestamp(item.confirmedAt) }}</span>
        </template>
      </template>

      <template #item.actions="{ item }">
        <AppointmentActionsCell
          :item="item"
          :editing-id="editingId"
          @save="handleSaveEdit"
          @cancel="handleCancelEdit"
          @open-confirm="handleOpenConfirmDialog"
          @start-edit="handleStartEdit"
          @delete="openDeleteDialog"
        />
      </template>
    </VDataTable>

    <AppointmentTableDialogs
      :show-delete-dialog="showDeleteDialog"
      :show-confirm-dialog="showConfirmDialog"
      :confirming-appointment="confirmingAppointment"
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

.clickable-cell {
  cursor: pointer;
  text-decoration: underline;
  text-decoration-style: dotted;
  text-underline-offset: 3px;
}

.clickable-cell:hover {
  text-decoration-style: solid;
  color: rgb(var(--v-theme-primary));
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

.clickable-chip {
  cursor: pointer;
}

.clickable-chip:hover {
  filter: brightness(1.1);
}
</style>
