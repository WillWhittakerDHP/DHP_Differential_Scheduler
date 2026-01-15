<!--
  LEARNING: Appointments Data Table Component
  WHY: Provides data table interface for managing appointments with inline editing
  PATTERN: VDataTable with custom editable cells, tooltips, and tab navigation
  
  Features:
  - Interactive tooltips on property/user cells showing detailed info
  - Click-to-navigate to Properties/Users tabs
  - New status workflow with 8 statuses
  - Scheduled By column tracking who engaged the scheduler
-->
<script setup lang="ts">
import { APPOINTMENT_STATUSES } from '@/types/appointment'
import { useAppointmentsTableModel } from '@/composables/admin/tables/useAppointmentsTableModel'
import { getStatusColor, getRoleColor } from '@/composables/admin/tables/useAppointmentHelpers'
import type { PropertyResponse } from '@/types/property'
import type { UserResponse } from '@/types/user'

/**
 * LEARNING: Component emits for parent communication
 * WHY: Allows navigation to other sub-tabs when clicking on linked data
 * PATTERN: defineEmits for type-safe event handling in Vue 3
 */
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

/**
 * LEARNING: Table headers configuration (updated)
 * WHY: Defines columns displayed in VDataTable
 * PATTERN: Array of header objects with title and key
 * 
 * Changes from original:
 * - Removed 'ID' column (not needed for user display)
 * - Removed 'Quote Mode' column (replaced by 'quoted' status)
 * - Added 'Scheduled By' column
 */
const headers = [
  { title: 'Property', key: 'propertyVersionId', sortable: true },
  { title: 'Property Type', key: 'propertyTypes', sortable: false },
  { title: 'Client', key: 'clientId', sortable: true },
  { title: 'Agent', key: 'agentId', sortable: true },
  { title: 'Scheduled By', key: 'scheduledById', sortable: true },
  { title: 'Date', key: 'selectedDate', sortable: true },
  { title: 'Status', key: 'status', sortable: true },
  { title: 'Actions', key: 'actions', sortable: false },
]

/**
 * LEARNING: Navigate to Properties tab
 * WHY: Simple event handler - acceptable to keep in component
 * PATTERN: Simple wrapper that emits event
 */
const navigateToProperties = (): void => {
  emit('navigate-to-tab', 'properties')
}

/**
 * LEARNING: Navigate to Users tab
 * WHY: Simple event handler - acceptable to keep in component
 * PATTERN: Simple wrapper that emits event
 */
const navigateToUsers = (): void => {
  emit('navigate-to-tab', 'users')
}

// Helper functions moved to useAppointmentHelpers composable
</script>

<template>
  <div class="appointments-table">
    <div class="d-flex justify-space-between align-center mb-4">
      <h3 class="text-h6">Appointments</h3>
      <VBtn
        color="primary"
        prepend-icon="tabler-plus"
        @click="startCreate"
        :disabled="isCreating"
      >
        Create Appointment
      </VBtn>
    </div>
    
    <!-- Loading state -->
    <VAlert
      v-if="isLoading"
      type="info"
      variant="tonal"
      class="mb-4"
    >
      Loading appointments...
    </VAlert>
    
    <!-- Error state -->
    <VAlert
      v-if="appointmentsError"
      type="error"
      variant="tonal"
      class="mb-4"
    >
      Error loading appointments: {{ appointmentsError }}
    </VAlert>
    
    <!-- Create form -->
    <VCard v-if="isCreating" class="mb-4">
      <VCardTitle>Create New Appointment</VCardTitle>
      <VCardText>
        <VRow>
          <VCol cols="12" md="6">
            <VSelect
              v-model="newAppointment.propertyVersionId"
              :items="properties"
              item-title="address"
              item-value="propertyVersionId"
              item-value-alt="id"
              label="Property *"
              :return-object="false"
              required
            >
              <template #item="{ props, item }">
                <VListItem v-bind="props">
                  <VListItemTitle>
                    {{ item.raw.address }}, {{ item.raw.city }}, {{ item.raw.state }}
                  </VListItemTitle>
                </VListItem>
              </template>
            </VSelect>
          </VCol>
          <VCol cols="12" md="6">
            <VSelect
              v-model="newAppointment.clientId"
              :items="users.filter(u => u.userRole === 'client')"
              item-title="firstName"
              item-value="id"
              label="Client"
              :return-object="false"
              clearable
            >
              <template #item="{ props, item }">
                <VListItem v-bind="props">
                  <VListItemTitle>
                    {{ item.raw.firstName }} {{ item.raw.lastName }}
                  </VListItemTitle>
                </VListItem>
              </template>
            </VSelect>
          </VCol>
          <VCol cols="12" md="6">
            <VSelect
              v-model="newAppointment.agentId"
              :items="users.filter(u => u.userRole === 'agent')"
              item-title="firstName"
              item-value="id"
              label="Agent"
              :return-object="false"
              clearable
            >
              <template #item="{ props, item }">
                <VListItem v-bind="props">
                  <VListItemTitle>
                    {{ item.raw.firstName }} {{ item.raw.lastName }}
                  </VListItemTitle>
                </VListItem>
              </template>
            </VSelect>
          </VCol>
          <VCol cols="12" md="6">
            <VSelect
              v-model="newAppointment.scheduledById"
              :items="users"
              item-title="firstName"
              item-value="id"
              label="Scheduled By"
              :return-object="false"
              clearable
            >
              <template #item="{ props, item }">
                <VListItem v-bind="props">
                  <VListItemTitle>
                    {{ item.raw.firstName }} {{ item.raw.lastName }} ({{ item.raw.userRole }})
                  </VListItemTitle>
                </VListItem>
              </template>
            </VSelect>
          </VCol>
          <VCol cols="12" md="6">
            <!--
              LEARNING: Status select with new workflow statuses
              WHY: Supports new 8-status appointment workflow
              TODO: Add status transition validation (e.g., can't go from started directly to confirmed)
            -->
            <VSelect
              v-model="newAppointment.status"
              :items="APPOINTMENT_STATUSES"
              label="Status"
            />
          </VCol>
          <VCol cols="12" md="6">
            <!--
              LEARNING: Quote Mode checkbox kept for business logic
              WHY: isQuoteMode and 'quoted' status serve different purposes
              - isQuoteMode: flags the appointment type (quote vs booking)
              - status: tracks workflow state
            -->
            <VCheckbox
              v-model="newAppointment.isQuoteMode"
              label="Quote Mode"
            />
          </VCol>
          <VCol cols="12" md="6">
            <VTextField
              v-model="newAppointment.selectedDate"
              type="date"
              label="Selected Date"
            />
          </VCol>
        </VRow>
      </VCardText>
      <VCardActions>
        <VSpacer />
        <VBtn variant="text" @click="cancelCreate">Cancel</VBtn>
        <VBtn color="primary" @click="saveCreate">Save</VBtn>
      </VCardActions>
    </VCard>
    
    <!-- Empty state -->
    <VAlert
      v-if="!isLoading && !appointmentsError && appointments.length === 0"
      type="info"
      variant="tonal"
      class="mb-4"
    >
      No appointments found. Click "Create Appointment" to add one.
    </VAlert>
    
    <!-- Data table -->
    <VDataTable
      v-if="!isLoading && !appointmentsError"
      :headers="headers"
      :items="appointments"
      :loading="isLoading"
      item-value="id"
      class="elevation-1"
      :items-per-page="25"
    >
      <!--
        LEARNING: Property cell with tooltip and click-to-navigate
        WHY: Shows property address with hover tooltip for details
        PATTERN: VTooltip with custom content showing full property info
      -->
      <template #item.propertyVersionId="{ item }">
        <template v-if="item">
          <span v-if="editingId !== item.id">
            <VTooltip location="top">
              <template #activator="{ props: tooltipProps }">
                <span
                  v-bind="tooltipProps"
                  class="clickable-cell"
                  @click="navigateToProperties"
                >
                  {{ getDisplayValue(item, 'propertyVersionId') }}
                </span>
              </template>
              <!-- Property Tooltip Content -->
              <div class="tooltip-content">
                <template v-if="getPropertyById(item.propertyVersionId)">
                  <div class="tooltip-title">Property Details</div>
                  <div><strong>Address:</strong> {{ getPropertyById(item.propertyVersionId)?.address }}</div>
                  <div v-if="getPropertyById(item.propertyVersionId)?.unit">
                    <strong>Unit:</strong> {{ getPropertyById(item.propertyVersionId)?.unit }}
                  </div>
                  <div>
                    <strong>Location:</strong> 
                    {{ getPropertyById(item.propertyVersionId)?.city }}, 
                    {{ getPropertyById(item.propertyVersionId)?.state }} 
                    {{ getPropertyById(item.propertyVersionId)?.zipCode }}
                  </div>
                  <div v-if="getPropertyById(item.propertyVersionId)?.squareFootage">
                    <strong>Sq Ft:</strong> {{ getPropertyById(item.propertyVersionId)?.squareFootage?.toLocaleString() }}
                  </div>
                  <div v-if="getPropertyById(item.propertyVersionId)?.bedrooms">
                    <strong>Bedrooms:</strong> {{ getPropertyById(item.propertyVersionId)?.bedrooms }}
                  </div>
                  <div v-if="getPropertyById(item.propertyVersionId)?.bathrooms">
                    <strong>Bathrooms:</strong> {{ getPropertyById(item.propertyVersionId)?.bathrooms }}
                  </div>
                  <div v-if="getPropertyById(item.propertyVersionId)?.foundationAccess">
                    <strong>Foundation:</strong> {{ getPropertyById(item.propertyVersionId)?.foundationAccess }}
                  </div>
                  <div v-if="getPropertyById(item.propertyVersionId)?.mlsNumber">
                    <strong>MLS #:</strong> {{ getPropertyById(item.propertyVersionId)?.mlsNumber }}
                  </div>
                  <div class="tooltip-hint">Click to view in Properties tab</div>
                </template>
                <template v-else>
                  <div>Property not found</div>
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
            <template #item="{ props, item: propItem }">
              <VListItem v-bind="props">
                <VListItemTitle>
                  {{ propItem.raw.address }}, {{ propItem.raw.city }}, {{ propItem.raw.state }}
                </VListItemTitle>
              </VListItem>
            </template>
          </VSelect>
        </template>
      </template>
      
      <!-- Property Type column (derived from PropertyVersion.propertyTypes) -->
      <template #item.propertyTypes="{ item }">
        <template v-if="item">
          <span>{{ getPropertyTypeNames(item.propertyVersionId) }}</span>
        </template>
      </template>
      
      <!--
        LEARNING: Client cell with tooltip and click-to-navigate
        WHY: Shows client name with hover tooltip for contact details
        PATTERN: VTooltip with custom content showing user info
      -->
      <template #item.clientId="{ item }">
        <template v-if="item">
          <span v-if="editingId !== item.id">
            <VTooltip location="top">
              <template #activator="{ props: tooltipProps }">
                <span
                  v-bind="tooltipProps"
                  class="clickable-cell"
                  @click="navigateToUsers"
                >
                  {{ getDisplayValue(item, 'clientId') }}
                </span>
              </template>
              <!-- Client Tooltip Content -->
              <div class="tooltip-content">
                <template v-if="getUserById(item.clientId)">
                  <div class="tooltip-title">Client Details</div>
                  <div>
                    <strong>Name:</strong> 
                    {{ getUserById(item.clientId)?.firstName }} 
                    {{ getUserById(item.clientId)?.lastName }}
                  </div>
                  <div><strong>Email:</strong> {{ getUserById(item.clientId)?.email }}</div>
                  <div v-if="getUserById(item.clientId)?.phone">
                    <strong>Phone:</strong> {{ getUserById(item.clientId)?.phone }}
                  </div>
                  <div><strong>Role:</strong> {{ getUserById(item.clientId)?.userRole }}</div>
                  <div class="tooltip-hint">Click to view in Users tab</div>
                </template>
                <template v-else>
                  <div>No client assigned</div>
                </template>
              </div>
            </VTooltip>
          </span>
          <VSelect
            v-else
            v-model="editedData.clientId"
            :items="users.filter(u => u.userRole === 'client')"
            item-title="firstName"
            item-value="id"
            :return-object="false"
            density="compact"
            hide-details
            clearable
          >
            <template #item="{ props, item: userItem }">
              <VListItem v-bind="props">
                <VListItemTitle>
                  {{ userItem.raw.firstName }} {{ userItem.raw.lastName }}
                </VListItemTitle>
              </VListItem>
            </template>
          </VSelect>
        </template>
      </template>
      
      <!--
        LEARNING: Agent cell with tooltip and click-to-navigate
        WHY: Shows agent name with hover tooltip for contact details
        PATTERN: VTooltip with custom content showing user info
      -->
      <template #item.agentId="{ item }">
        <template v-if="item">
          <span v-if="editingId !== item.id">
            <VTooltip location="top">
              <template #activator="{ props: tooltipProps }">
                <span
                  v-bind="tooltipProps"
                  class="clickable-cell"
                  @click="navigateToUsers"
                >
                  {{ getDisplayValue(item, 'agentId') }}
                </span>
              </template>
              <!-- Agent Tooltip Content -->
              <div class="tooltip-content">
                <template v-if="getUserById(item.agentId)">
                  <div class="tooltip-title">Agent Details</div>
                  <div>
                    <strong>Name:</strong> 
                    {{ getUserById(item.agentId)?.firstName }} 
                    {{ getUserById(item.agentId)?.lastName }}
                  </div>
                  <div><strong>Email:</strong> {{ getUserById(item.agentId)?.email }}</div>
                  <div v-if="getUserById(item.agentId)?.phone">
                    <strong>Phone:</strong> {{ getUserById(item.agentId)?.phone }}
                  </div>
                  <div><strong>Role:</strong> {{ getUserById(item.agentId)?.userRole }}</div>
                  <div class="tooltip-hint">Click to view in Users tab</div>
                </template>
                <template v-else>
                  <div>No agent assigned</div>
                </template>
              </div>
            </VTooltip>
          </span>
          <VSelect
            v-else
            v-model="editedData.agentId"
            :items="users.filter(u => u.userRole === 'agent')"
            item-title="firstName"
            item-value="id"
            :return-object="false"
            density="compact"
            hide-details
            clearable
          >
            <template #item="{ props, item: userItem }">
              <VListItem v-bind="props">
                <VListItemTitle>
                  {{ userItem.raw.firstName }} {{ userItem.raw.lastName }}
                </VListItemTitle>
              </VListItem>
            </template>
          </VSelect>
        </template>
      </template>
      
      <!--
        LEARNING: Scheduled By cell with role chip and name in tooltip
        WHY: Shows user role/type in cell for quick scanning, full name in tooltip
        PATTERN: VChip for role, VTooltip with name as prominent display
      -->
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
              <!-- Scheduled By Tooltip Content - Name Prominent -->
              <div class="tooltip-content">
                <template v-if="getUserById(item.scheduledById)">
                  <div class="tooltip-name">
                    {{ getUserById(item.scheduledById)?.firstName }} 
                    {{ getUserById(item.scheduledById)?.lastName }}
                  </div>
                  <div class="tooltip-role">{{ getUserById(item.scheduledById)?.userRole }}</div>
                  <div class="tooltip-details">
                    <div><strong>Email:</strong> {{ getUserById(item.scheduledById)?.email }}</div>
                    <div v-if="getUserById(item.scheduledById)?.phone">
                      <strong>Phone:</strong> {{ getUserById(item.scheduledById)?.phone }}
                    </div>
                  </div>
                  <div class="tooltip-hint">Click to view in Users tab</div>
                </template>
                <template v-else>
                  <div>Not specified</div>
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
            <template #item="{ props, item: userItem }">
              <VListItem v-bind="props">
                <VListItemTitle>
                  {{ userItem.raw.firstName }} {{ userItem.raw.lastName }} ({{ userItem.raw.userRole }})
                </VListItemTitle>
              </VListItem>
            </template>
          </VSelect>
        </template>
      </template>
      
      <template #item.selectedDate="{ item }">
        <template v-if="item">
          <span v-if="editingId !== item.id">
            {{ getDisplayValue(item, 'selectedDate') }}
          </span>
          <VTextField
            v-else
            v-model="editedData.selectedDate"
            type="date"
            density="compact"
            hide-details
          />
        </template>
      </template>
      
      <!--
        LEARNING: Status cell with new workflow statuses
        WHY: Displays and allows editing of appointment status
        
        TODO: Future enhancements for status workflow:
        - 'held' status: Implement booking fee payment integration to automatically
          set 'held' status when time slots are reserved (booking fee logic)
        - 'submitted' -> 'confirmed': Implement confirmation routine (manual or automated)
        - 'rescheduling' flow: UI/logic for transitioning confirmed appointments to rescheduling
        - 'cancelled' vs 'deleted': Implement business rules for soft delete vs hard delete
      -->
      <template #item.status="{ item }">
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
            v-model="editedData.status"
            :items="APPOINTMENT_STATUSES"
            density="compact"
            hide-details
          />
        </template>
      </template>
      
      <template #item.actions="{ item }">
        <template v-if="item">
          <div v-if="editingId === item.id" class="d-flex gap-2">
            <VBtn
              prepend-icon="tabler-check"
              size="small"
              color="success"
              variant="text"
              @click="saveEdit"
            >
              Save
            </VBtn>
            <VBtn
              prepend-icon="tabler-x"
              size="small"
              color="error"
              variant="text"
              @click="cancelEdit"
            >
              Cancel
            </VBtn>
          </div>
          <div v-else class="d-flex gap-2">
            <VBtn
              prepend-icon="tabler-pencil"
              size="small"
              variant="text"
              @click="startEdit(item)"
            >
              Edit
            </VBtn>
            <VBtn
              prepend-icon="tabler-trash"
              size="small"
              color="error"
              variant="text"
              @click="openDeleteDialog(item.id)"
            >
              Delete
            </VBtn>
          </div>
        </template>
      </template>
    </VDataTable>
    
    <!-- Delete Confirmation Dialog -->
    <VDialog v-model="showDeleteDialog" max-width="500">
      <VCard>
        <VCardTitle class="text-h6">Delete Appointment</VCardTitle>
        <VCardText>
          Are you sure you want to delete this appointment? This action cannot be undone.
        </VCardText>
        <VCardActions>
          <VSpacer />
          <VBtn variant="text" @click="cancelDelete">Cancel</VBtn>
          <VBtn color="error" variant="flat" @click="confirmDelete">Delete</VBtn>
        </VCardActions>
      </VCard>
    </VDialog>
  </div>
</template>

<style scoped>
.appointments-table {
  padding: 1rem 0;
}

/**
 * LEARNING: Clickable cell styling
 * WHY: Indicates to users that cells are interactive
 * PATTERN: Cursor pointer and underline on hover
 */
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

/**
 * LEARNING: Tooltip content styling
 * WHY: Consistent, readable tooltip appearance
 */
.tooltip-content {
  padding: 8px;
  min-width: 200px;
}

.tooltip-title {
  font-weight: bold;
  margin-bottom: 8px;
  padding-bottom: 4px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.3);
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

/**
 * LEARNING: Scheduled By tooltip name-prominent styling
 * WHY: User name is the primary info, role shown in cell
 */
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
  border-bottom: 1px solid rgba(255, 255, 255, 0.3);
}

.tooltip-details {
  font-size: 0.95em;
}

.tooltip-details div {
  margin-bottom: 4px;
}

/**
 * LEARNING: Clickable chip styling
 * WHY: Indicates chips are interactive (click to navigate)
 */
.clickable-chip {
  cursor: pointer;
}

.clickable-chip:hover {
  filter: brightness(1.1);
}
</style>
