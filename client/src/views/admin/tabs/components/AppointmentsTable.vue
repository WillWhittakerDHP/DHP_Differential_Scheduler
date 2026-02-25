<!--
  LEARNING: Appointments Data Table Component
  WHY: Data table for managing appointments with inline editing; uses useAppointmentAttendees, constants, create form.
  PATTERN: VDataTable with custom cell slots; create/edit convert client/agent IDs to attendees via composable.
-->
<script setup lang="ts">
import { getValidNextStatuses } from '@/types/appointment'
import { useAppointmentsTableModel } from '@/composables/admin/tables/useAppointmentsTableModel'
import { useAppointmentsTableHandlers } from '@/composables/admin/tables/useAppointmentsTableHandlers'
import { getClientAttendee, getAgentAttendee } from '@/utils/admin/appointmentAttendees'
import { getStatusColor, getRoleColor } from '@/utils/admin/appointmentHelpers'
import { APPOINTMENTS_TABLE_HEADERS, APPOINTMENTS_TABLE_UI } from '@/constants/appointmentsTableConstants.js'
import AppointmentsCreateForm from './AppointmentsCreateForm.vue'

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
  properties,
  users,
  getDisplayValue,
  getPropertyById,
  getUserById,
  getPropertyTypeNames,
} = useAppointmentsTableModel()

const handlers = useAppointmentsTableHandlers({
  newAppointment,
  editedData,
  saveCreate,
  saveEdit,
  startEdit,
  cancelEdit,
  startCreate,
  cancelCreate,
  emit,
})
const {
  formClientId,
  formAgentId,
  editingClientId,
  editingAgentId,
  confirmingAppointment,
  showConfirmDialog,
  handleOpenConfirmDialog,
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
  formatTimestamp,
} = handlers
</script>

<template>
  <div class="appointments-table">
    <div class="d-flex justify-space-between align-center mb-4">
      <h3 class="text-h6">{{ APPOINTMENTS_TABLE_UI.TITLE }}</h3>
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
              <div class="tooltip-content">
                <template v-if="getPropertyById(item.propertyVersionId)">
                  <div class="tooltip-title">{{ APPOINTMENTS_TABLE_UI.PROPERTY_TOOLTIP_TITLE }}</div>
                  <div><strong>{{ APPOINTMENTS_TABLE_UI.ADDRESS }}:</strong> {{ getPropertyById(item.propertyVersionId)?.address }}</div>
                  <div v-if="getPropertyById(item.propertyVersionId)?.unit">
                    <strong>{{ APPOINTMENTS_TABLE_UI.UNIT }}:</strong> {{ getPropertyById(item.propertyVersionId)?.unit }}
                  </div>
                  <div>
                    <strong>{{ APPOINTMENTS_TABLE_UI.LOCATION }}:</strong>
                    {{ getPropertyById(item.propertyVersionId)?.city }},
                    {{ getPropertyById(item.propertyVersionId)?.state }}
                    {{ getPropertyById(item.propertyVersionId)?.zipCode }}
                  </div>
                  <div v-if="getPropertyById(item.propertyVersionId)?.squareFootage">
                    <strong>{{ APPOINTMENTS_TABLE_UI.SQ_FT }}:</strong> {{ getPropertyById(item.propertyVersionId)?.squareFootage?.toLocaleString() }}
                  </div>
                  <div v-if="getPropertyById(item.propertyVersionId)?.bedrooms">
                    <strong>{{ APPOINTMENTS_TABLE_UI.BEDROOMS }}:</strong> {{ getPropertyById(item.propertyVersionId)?.bedrooms }}
                  </div>
                  <div v-if="getPropertyById(item.propertyVersionId)?.bathrooms">
                    <strong>{{ APPOINTMENTS_TABLE_UI.BATHROOMS }}:</strong> {{ getPropertyById(item.propertyVersionId)?.bathrooms }}
                  </div>
                  <div v-if="getPropertyById(item.propertyVersionId)?.foundationAccess">
                    <strong>{{ APPOINTMENTS_TABLE_UI.FOUNDATION }}:</strong> {{ getPropertyById(item.propertyVersionId)?.foundationAccess }}
                  </div>
                  <div v-if="getPropertyById(item.propertyVersionId)?.mlsNumber">
                    <strong>{{ APPOINTMENTS_TABLE_UI.MLS }}:</strong> {{ getPropertyById(item.propertyVersionId)?.mlsNumber }}
                  </div>
                  <div class="tooltip-hint">{{ APPOINTMENTS_TABLE_UI.CLICK_PROPERTIES_TAB }}</div>
                </template>
                <template v-else>
                  <div>{{ APPOINTMENTS_TABLE_UI.PROPERTY_NOT_FOUND }}</div>
                </template>
              </div>
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
                  {{ propItem.raw.address }}, {{ propItem.raw.city }}, {{ propItem.raw.state }}
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
              <div class="tooltip-content">
                <template v-if="getClientAttendee(item)?.user">
                  <div class="tooltip-title">{{ APPOINTMENTS_TABLE_UI.CLIENT_TOOLTIP_TITLE }}</div>
                  <div>
                    <strong>{{ APPOINTMENTS_TABLE_UI.NAME }}:</strong>
                    {{ getClientAttendee(item)?.user?.firstName }} {{ getClientAttendee(item)?.user?.lastName }}
                  </div>
                  <div><strong>{{ APPOINTMENTS_TABLE_UI.EMAIL }}:</strong> {{ getClientAttendee(item)?.user?.email }}</div>
                  <div v-if="getClientAttendee(item)?.user?.phone">
                    <strong>{{ APPOINTMENTS_TABLE_UI.PHONE }}:</strong> {{ getClientAttendee(item)?.user?.phone }}
                  </div>
                  <div><strong>{{ APPOINTMENTS_TABLE_UI.ROLE }}:</strong> {{ getClientAttendee(item)?.user?.userRole }}</div>
                  <div class="tooltip-hint">{{ APPOINTMENTS_TABLE_UI.CLICK_USERS_TAB }}</div>
                </template>
                <template v-else>
                  <div>{{ APPOINTMENTS_TABLE_UI.NO_CLIENT }}</div>
                </template>
              </div>
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
                <VListItemTitle>{{ userItem.raw.firstName }} {{ userItem.raw.lastName }}</VListItemTitle>
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
              <div class="tooltip-content">
                <template v-if="getAgentAttendee(item)?.user">
                  <div class="tooltip-title">{{ APPOINTMENTS_TABLE_UI.AGENT_TOOLTIP_TITLE }}</div>
                  <div>
                    <strong>{{ APPOINTMENTS_TABLE_UI.NAME }}:</strong>
                    {{ getAgentAttendee(item)?.user?.firstName }} {{ getAgentAttendee(item)?.user?.lastName }}
                  </div>
                  <div><strong>{{ APPOINTMENTS_TABLE_UI.EMAIL }}:</strong> {{ getAgentAttendee(item)?.user?.email }}</div>
                  <div v-if="getAgentAttendee(item)?.user?.phone">
                    <strong>{{ APPOINTMENTS_TABLE_UI.PHONE }}:</strong> {{ getAgentAttendee(item)?.user?.phone }}
                  </div>
                  <div><strong>{{ APPOINTMENTS_TABLE_UI.ROLE }}:</strong> {{ getAgentAttendee(item)?.user?.userRole }}</div>
                  <div class="tooltip-hint">{{ APPOINTMENTS_TABLE_UI.CLICK_USERS_TAB }}</div>
                </template>
                <template v-else>
                  <div>{{ APPOINTMENTS_TABLE_UI.NO_AGENT }}</div>
                </template>
              </div>
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
                <VListItemTitle>{{ userItem.raw.firstName }} {{ userItem.raw.lastName }}</VListItemTitle>
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
              <div class="tooltip-content">
                <template v-if="getUserById(item.scheduledById)">
                  <div class="tooltip-name">
                    {{ getUserById(item.scheduledById)?.firstName }} {{ getUserById(item.scheduledById)?.lastName }}
                  </div>
                  <div class="tooltip-role">{{ getUserById(item.scheduledById)?.userRole }}</div>
                  <div class="tooltip-details">
                    <div><strong>{{ APPOINTMENTS_TABLE_UI.EMAIL }}:</strong> {{ getUserById(item.scheduledById)?.email }}</div>
                    <div v-if="getUserById(item.scheduledById)?.phone">
                      <strong>{{ APPOINTMENTS_TABLE_UI.PHONE }}:</strong> {{ getUserById(item.scheduledById)?.phone }}
                    </div>
                  </div>
                  <div class="tooltip-hint">{{ APPOINTMENTS_TABLE_UI.CLICK_USERS_TAB }}</div>
                </template>
                <template v-else>
                  <div>{{ APPOINTMENTS_TABLE_UI.NOT_SPECIFIED }}</div>
                </template>
              </div>
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
                <VListItemTitle>{{ userItem.raw.firstName }} {{ userItem.raw.lastName }} ({{ userItem.raw.userRole }})</VListItemTitle>
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
        <template v-if="item">
          <VChip v-if="editingId !== item.id" :color="getStatusColor(item.status)" size="small" variant="tonal">
            {{ item.status }}
          </VChip>
          <VSelect
            v-else
            v-model="editedData.status"
            :items="[item.status, ...getValidNextStatuses(item.status)]"
            density="compact"
            hide-details
          />
        </template>
      </template>

      <template #item.submittedAt="{ item }">
        <template v-if="item">
          <span class="text-caption">{{ formatTimestamp(item.submittedAt) }}</span>
        </template>
      </template>

      <template #item.confirmedAt="{ item }">
        <template v-if="item">
          <span class="text-caption">{{ formatTimestamp(item.confirmedAt) }}</span>
        </template>
      </template>

      <template #item.actions="{ item }">
        <template v-if="item">
          <div v-if="editingId === item.id" class="d-flex gap-2">
            <VBtn prepend-icon="tabler-check" size="small" color="success" variant="text" @click="handleSaveEdit">
              {{ APPOINTMENTS_TABLE_UI.SAVE }}
            </VBtn>
            <VBtn prepend-icon="tabler-x" size="small" color="error" variant="text" @click="handleCancelEdit">
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
                  @click="handleOpenConfirmDialog(item)"
                >
                  {{ APPOINTMENTS_TABLE_UI.CONFIRM }}
                </VBtn>
              </template>
              {{ APPOINTMENTS_TABLE_UI.CONFIRM_TOOLTIP }}
            </VTooltip>
            <VBtn prepend-icon="tabler-pencil" size="small" variant="text" @click="handleStartEdit(item)">
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
            <VBtn prepend-icon="tabler-trash" size="small" color="error" variant="text" @click="openDeleteDialog(item.id)">
              {{ APPOINTMENTS_TABLE_UI.DELETE }}
            </VBtn>
          </div>
        </template>
      </template>
    </VDataTable>

    <VDialog v-model="showDeleteDialog" max-width="500">
      <VCard>
        <VCardTitle class="text-h6">{{ APPOINTMENTS_TABLE_UI.DELETE_DIALOG_TITLE }}</VCardTitle>
        <VCardText>
          {{ APPOINTMENTS_TABLE_UI.DELETE_DIALOG_MESSAGE }}
        </VCardText>
        <VCardActions>
          <VSpacer />
          <VBtn variant="text" @click="cancelDelete">{{ APPOINTMENTS_TABLE_UI.DELETE_DIALOG_CANCEL }}</VBtn>
          <VBtn color="error" variant="flat" @click="confirmDelete">{{ APPOINTMENTS_TABLE_UI.DELETE_DIALOG_CONFIRM }}</VBtn>
        </VCardActions>
      </VCard>
    </VDialog>

    <VDialog v-model="showConfirmDialog" max-width="500" persistent>
      <VCard>
        <VCardTitle class="text-h6">{{ APPOINTMENTS_TABLE_UI.CONFIRM }}</VCardTitle>
        <VCardText>
          {{ confirmingAppointment ? confirmingAppointment.selectedDate ?? '—' : '' }}
        </VCardText>
        <VCardActions>
          <VSpacer />
          <VBtn variant="text" @click="handleCancelConfirm">{{ APPOINTMENTS_TABLE_UI.CANCEL }}</VBtn>
          <VBtn color="success" variant="flat" disabled>{{ APPOINTMENTS_TABLE_UI.CONFIRM }}</VBtn>
        </VCardActions>
      </VCard>
    </VDialog>
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
