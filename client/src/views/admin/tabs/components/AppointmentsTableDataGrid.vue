<!--
  WHY: VDataTable + cell slots extracted to reduce AppointmentsTable imports (component-coupling) and template size.
-->
<script setup lang="ts">
import { computed } from 'vue'
import { useDataGridVTableProps } from '@/composables/admin/tables/useDataGridVTableProps'
import type { AppointmentStatus, AppointmentResponse } from '@/types/appointment'
import { getClientAttendee, getAgentAttendee } from '@/utils/admin/appointmentAttendees'
import { APPOINTMENTS_TABLE_HEADERS } from '@/constants/appointmentsTableConstants.js'
import AppointmentUserTooltipContent from './AppointmentUserTooltipContent.vue'
import AppointmentPropertyTooltipContent from './AppointmentPropertyTooltipContent.vue'
import AppointmentStatusCell from './AppointmentStatusCell.vue'
import AppointmentActionsCell from './AppointmentActionsCell.vue'
import type { AppointmentsTableDataGridContext } from '@/types/admin/tables/appointmentsTableDataGrid'

const props = defineProps<{
  grid: AppointmentsTableDataGridContext
}>()

const g = props.grid
const { tableItems, isLoading } = useDataGridVTableProps(g)
const editingId = g.editingId
const editedData = g.editedData
const editingClientId = g.editingClientId
const editingAgentId = g.editingAgentId
const properties = computed(() => g.properties.value)
const users = computed(() => g.users.value)

const isItem = (item: unknown): item is AppointmentResponse =>
  item !== null && typeof item === 'object' && 'id' in item
</script>

<template>
  <VDataTable
    :headers="APPOINTMENTS_TABLE_HEADERS"
    :items="tableItems"
    :loading="isLoading"
    item-value="id"
    class="elevation-1"
    :items-per-page="25"
  >
    <template #item.propertyVersionId="{ item }">
      <template v-if="isItem(item)">
        <span v-if="editingId !== item.id">
          <VTooltip location="top">
            <template #activator="{ props: tooltipProps }">
              <span v-bind="tooltipProps" class="clickable-cell" @click="g.navigateToProperties">
                {{ g.getDisplayValue(item, 'propertyVersionId') }}
              </span>
            </template>
            <AppointmentPropertyTooltipContent :property="g.getPropertyById(item.propertyVersionId)" />
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
      <template v-if="isItem(item)">
        <span>{{ g.getPropertyTypeNames(item.propertyVersionId) }}</span>
      </template>
    </template>

    <template #item.client="{ item }">
      <template v-if="isItem(item)">
        <span v-if="editingId !== item.id">
          <VTooltip location="top">
            <template #activator="{ props: tooltipProps }">
              <span v-bind="tooltipProps" class="clickable-cell" @click="g.navigateToUsers">
                {{
                  getClientAttendee(item)?.user
                    ? `${getClientAttendee(item)?.user?.firstName} ${getClientAttendee(item)?.user?.lastName}`
                    : '—'
                }}
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
      <template v-if="isItem(item)">
        <span v-if="editingId !== item.id">
          <VTooltip location="top">
            <template #activator="{ props: tooltipProps }">
              <span v-bind="tooltipProps" class="clickable-cell" @click="g.navigateToUsers">
                {{ g.getDisplayValue(item, 'agent') }}
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
      <template v-if="isItem(item)">
        <span v-if="editingId !== item.id">
          <VTooltip location="top">
            <template #activator="{ props: tooltipProps }">
              <VChip
                v-if="g.getUserById(item.scheduledById)"
                v-bind="tooltipProps"
                :color="g.getRoleColor(g.getUserById(item.scheduledById)?.userRole)"
                size="small"
                variant="tonal"
                class="clickable-chip"
                @click="g.navigateToUsers"
              >
                {{ g.getDisplayValue(item, 'scheduledById') }}
              </VChip>
              <span v-else v-bind="tooltipProps" class="text-disabled">—</span>
            </template>
            <AppointmentUserTooltipContent :user="g.getUserById(item.scheduledById)" />
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
      <template v-if="isItem(item)">
        <span v-if="editingId !== item.id">{{ g.getDisplayValue(item, 'selectedDate') }}</span>
        <VTextField v-else v-model="editedData.selectedDate" type="date" density="compact" hide-details />
      </template>
    </template>

    <template #item.status="{ item }">
      <AppointmentStatusCell
        :item="item"
        :editing-id="editingId"
        :edited-status="editedData.status"
        :get-status-color="g.getStatusColor"
        @update:edited-status="(v: string) => (editedData.status = v as AppointmentStatus)"
      />
    </template>

    <template #item.submittedAt="{ item }">
      <template v-if="isItem(item)">
        <span class="text-body-small">{{ g.formatTimestamp(item.submittedAt) }}</span>
      </template>
    </template>

    <template #item.confirmedAt="{ item }">
      <template v-if="isItem(item)">
        <span class="text-body-small">{{ g.formatTimestamp(item.confirmedAt) }}</span>
      </template>
    </template>

    <template #item.actions="{ item }">
      <AppointmentActionsCell
        :item="item"
        :editing-id="editingId"
        @save="g.handleSaveEdit"
        @cancel="g.handleCancelEdit"
        @open-confirm="g.handleOpenConfirmDialog"
        @start-edit="g.handleStartEdit"
        @mark-cancelled="(id: string) => g.markCancelled(id)"
        @delete="g.openDeleteDialog"
      />
    </template>
  </VDataTable>
</template>

<style scoped>
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

.clickable-chip {
  cursor: pointer;
}

.clickable-chip:hover {
  filter: brightness(1.1);
}
</style>
