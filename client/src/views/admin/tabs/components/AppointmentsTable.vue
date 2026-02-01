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
import { ref } from 'vue'
import type { AppointmentResponse, AttendeeResponse } from '@/types/appointment'
import { APPOINTMENT_STATUSES } from '@/types/appointment'
import { useAppointmentsTableModel } from '@/composables/admin/tables/useAppointmentsTableModel'
import { getStatusColor, getRoleColor } from '@/composables/admin/tables/useAppointmentHelpers'

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
 * LEARNING: Helper functions to extract client/agent from attendees array
 * WHY: Replaces deprecated clientId/agentId properties with attendees-based lookup
 * PATTERN: Extract attendee by role, return user ID or undefined
 */
const getClientIdFromAttendees = (appointment: AppointmentResponse): string | undefined => {
  const clientAttendee = appointment.attendees?.find(a => 
    a.userTypeBlockInstance?.name === 'Client' || a.user?.userRole === 'client'
  )
  return clientAttendee?.userId
}

const getAgentIdFromAttendees = (appointment: AppointmentResponse): string | undefined => {
  const agentAttendee = appointment.attendees?.find(a => 
    a.userTypeBlockInstance?.name === 'Agent' || a.user?.userRole === 'agent'
  )
  return agentAttendee?.userId
}

const getClientAttendee = (appointment: AppointmentResponse): AttendeeResponse | undefined => {
  return appointment.attendees?.find(a => 
    a.userTypeBlockInstance?.name === 'Client' || a.user?.userRole === 'client'
  )
}

const getAgentAttendee = (appointment: AppointmentResponse): AttendeeResponse | undefined => {
  return appointment.attendees?.find(a => 
    a.userTypeBlockInstance?.name === 'Agent' || a.user?.userRole === 'agent'
  )
}

/**
 * LEARNING: Local state for form fields (clientId/agentId)
 * WHY: Form uses simple clientId/agentId for UX, converts to attendees on save
 * PATTERN: Track form state separately, convert to attendees in save handlers
 */
const formClientId = ref<string | null>(null)
const formAgentId = ref<string | null>(null)
const editingClientId = ref<string | null>(null)
const editingAgentId = ref<string | null>(null)

/**
 * LEARNING: Override save handlers to convert clientId/agentId to attendees
 * WHY: Form uses clientId/agentId for simplicity, but API expects attendees array
 * PATTERN: Wrap original save handlers, convert form data before calling API
 */
const handleSaveCreate = async () => {
  // Convert clientId/agentId to attendees array
  const attendees: Array<{ userId: string; role?: 'client' | 'agent'; shouldReceiveInvitation?: boolean }> = []
  
  if (formClientId.value) {
    attendees.push({
      userId: formClientId.value,
      role: 'client',
      shouldReceiveInvitation: true
    })
  }
  
  if (formAgentId.value) {
    attendees.push({
      userId: formAgentId.value,
      role: 'agent',
      shouldReceiveInvitation: true
    })
  }
  
  // Update newAppointment with attendees
  if (attendees.length > 0) {
    (newAppointment.value as any).attendees = attendees
  }
  
  // Clear form state
  formClientId.value = null
  formAgentId.value = null
  
  await saveCreate()
}

const handleSaveEdit = async () => {
  // Convert editingClientId/editingAgentId to attendees array
  const attendees: Array<{ userId: string; role?: 'client' | 'agent'; shouldReceiveInvitation?: boolean }> = []
  
  if (editingClientId.value) {
    attendees.push({
      userId: editingClientId.value,
      role: 'client',
      shouldReceiveInvitation: true
    })
  }
  
  if (editingAgentId.value) {
    attendees.push({
      userId: editingAgentId.value,
      role: 'agent',
      shouldReceiveInvitation: true
    })
  }
  
  // Update editedData with attendees
  if (attendees.length > 0) {
    (editedData.value as any).attendees = attendees
  }
  
  // Clear editing state
  editingClientId.value = null
  editingAgentId.value = null
  
  await saveEdit()
}

const handleStartEdit = (item: AppointmentResponse) => {
  startEdit(item)
  // Extract client/agent IDs from attendees for editing
  editingClientId.value = getClientIdFromAttendees(item) || null
  editingAgentId.value = getAgentIdFromAttendees(item) || null
}

const handleCancelEdit = () => {
  cancelEdit()
  editingClientId.value = null
  editingAgentId.value = null
}

const handleStartCreate = () => {
  startCreate()
  formClientId.value = null
  formAgentId.value = null
}

const handleCancelCreate = () => {
  cancelCreate()
  formClientId.value = null
  formAgentId.value = null
}

/**
 * LEARNING: Table headers configuration (updated)
 * WHY: Defines columns displayed in VDataTable
 * PATTERN: Array of header objects with title and key
 * 
 * Changes from original:
 * - Removed 'ID' column (not needed for user display)
 * - Removed 'Quote Mode' column (replaced by 'quoted' status)
 * - Added 'Scheduled By' column
 * - Client/Agent columns use computed values from attendees array
 */
const headers = [
  { title: 'Property', key: 'propertyVersionId', sortable: true },
  { title: 'Property Type', key: 'propertyTypes', sortable: false },
  { title: 'Client', key: 'client', sortable: false }, // Using computed slot, not sortable
  { title: 'Agent', key: 'agent', sortable: false }, // Using computed slot, not sortable
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

</script>

<template>
  <div class="appointments-table">
    <div class="d-flex justify-space-between align-center mb-4">
      <h3 class="text-h6">Appointments</h3>
        <VBtn
          color="primary"
          prepend-icon="tabler-plus"
          @click="handleStartCreate"
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
              v-model="formClientId"
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
              v-model="formAgentId"
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
        <VBtn variant="text" @click="handleCancelCreate">Cancel</VBtn>
        <VBtn color="primary" @click="handleSaveCreate">Save</VBtn>
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
        UPDATED: Extracts client from attendees array instead of deprecated clientId property
      -->
      <template #item.client="{ item }">
        <template v-if="item">
          <span v-if="editingId !== item.id">
            <VTooltip location="top">
              <template #activator="{ props: tooltipProps }">
                <span
                  v-bind="tooltipProps"
                  class="clickable-cell"
                  @click="navigateToUsers"
                >
                  {{ getClientAttendee(item)?.user ? `${getClientAttendee(item)?.user?.firstName} ${getClientAttendee(item)?.user?.lastName}` : '—' }}
                </span>
              </template>
              <!-- Client Tooltip Content -->
              <div class="tooltip-content">
                <template v-if="getClientAttendee(item)?.user">
                  <div class="tooltip-title">Client Details</div>
                  <div>
                    <strong>Name:</strong> 
                    {{ getClientAttendee(item)?.user?.firstName }} 
                    {{ getClientAttendee(item)?.user?.lastName }}
                  </div>
                  <div><strong>Email:</strong> {{ getClientAttendee(item)?.user?.email }}</div>
                  <div v-if="getClientAttendee(item)?.user?.phone">
                    <strong>Phone:</strong> {{ getClientAttendee(item)?.user?.phone }}
                  </div>
                  <div><strong>Role:</strong> {{ getClientAttendee(item)?.user?.userRole }}</div>
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
            v-model="editingClientId"
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
                <template v-if="getAgentAttendee(item)?.user">
                  <div class="tooltip-title">Agent Details</div>
                  <div>
                    <strong>Name:</strong> 
                    {{ getAgentAttendee(item)?.user?.firstName }} 
                    {{ getAgentAttendee(item)?.user?.lastName }}
                  </div>
                  <div><strong>Email:</strong> {{ getAgentAttendee(item)?.user?.email }}</div>
                  <div v-if="getAgentAttendee(item)?.user?.phone">
                    <strong>Phone:</strong> {{ getAgentAttendee(item)?.user?.phone }}
                  </div>
                  <div><strong>Role:</strong> {{ getAgentAttendee(item)?.user?.userRole }}</div>
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
            v-model="editingAgentId"
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
              @click="handleSaveEdit"
            >
              Save
            </VBtn>
            <VBtn
              prepend-icon="tabler-x"
              size="small"
              color="error"
              variant="text"
              @click="handleCancelEdit"
            >
              Cancel
            </VBtn>
          </div>
          <div v-else class="d-flex gap-2">
            <VBtn
              prepend-icon="tabler-pencil"
              size="small"
              variant="text"
              @click="handleStartEdit(item)"
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

.clickable-chip {
  cursor: pointer;
}

.clickable-chip:hover {
  filter: brightness(1.1);
}
</style>
