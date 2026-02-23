<!--
  LEARNING: Users Data Table Component
  WHY: Provides data table interface for managing users with inline editing
  PATTERN: VDataTable with custom editable cells and CRUD operations
-->
<script setup lang="ts">
import { useUsersTableModel } from '@/composables/admin/tables/useUsersTableModel'

const {
  items: users,
  isLoading,
  error: usersError,
  editingId,
  editedData,
  isCreating,
  newItem: newUser,
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
  formatNullValue,
} = useUsersTableModel()

/**
 */
const headers = [
  { title: 'First Name', key: 'firstName', sortable: true },
  { title: 'Last Name', key: 'lastName', sortable: true },
  { title: 'Email', key: 'email', sortable: true },
  { title: 'Phone', key: 'phone', sortable: true },
  { title: 'Role', key: 'userRole', sortable: true },
  { title: 'Login ID', key: 'loginId', sortable: true },
  { title: 'Actions', key: 'actions', sortable: false },
]
</script>

<template>
  <div class="users-table">
    <div class="d-flex justify-space-between align-center mb-4">
      <h3 class="text-h6">Users</h3>
      <VBtn
        color="primary"
        prepend-icon="tabler-plus"
        @click="startCreate"
        :disabled="isCreating"
      >
        Create User
      </VBtn>
    </div>
    
    <!-- Loading state -->
    <VAlert
      v-if="isLoading"
      type="info"
      variant="tonal"
      class="mb-4"
    >
      Loading users...
    </VAlert>
    
    <!-- Error state -->
    <VAlert
      v-if="usersError"
      type="error"
      variant="tonal"
      class="mb-4"
    >
      Error loading users: {{ usersError }}
    </VAlert>
    
    <!-- Create form -->
    <VCard v-if="isCreating" class="mb-4">
      <VCardTitle>Create New User</VCardTitle>
      <VCardText>
        <VRow>
          <VCol cols="12" md="6">
            <VTextField
              v-model="newUser.firstName"
              label="First Name *"
              required
            />
          </VCol>
          <VCol cols="12" md="6">
            <VTextField
              v-model="newUser.lastName"
              label="Last Name *"
              required
            />
          </VCol>
          <VCol cols="12" md="6">
            <VTextField
              v-model="newUser.email"
              type="email"
              label="Email *"
              required
            />
          </VCol>
          <VCol cols="12" md="6">
            <VTextField
              v-model="newUser.phone"
              type="tel"
              label="Phone"
            />
          </VCol>
          <VCol cols="12" md="6">
            <VSelect
              v-model="newUser.userRole"
              :items="['client', 'agent', 'transaction_manager', 'seller', 'inspector']"
              label="Role"
            />
          </VCol>
          <VCol cols="12" md="6">
            <VTextField
              v-model.number="newUser.loginId"
              type="number"
              label="Login ID"
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
      v-if="!isLoading && !usersError && users.length === 0"
      type="info"
      variant="tonal"
      class="mb-4"
    >
      No users found. Click "Create User" to add one.
    </VAlert>
    
    <!-- Data table -->
    <VDataTable
      v-if="!isLoading && !usersError"
      :headers="headers"
      :items="users"
      :loading="isLoading"
      item-value="id"
      class="elevation-1"
    >
      <template #item.firstName="{ item }">
        <template v-if="item">
          <span v-if="editingId !== item.id">
            {{ item.firstName }}
          </span>
          <VTextField
            v-else
            v-model="editedData.firstName"
            density="compact"
            hide-details
          />
        </template>
      </template>
      
      <template #item.lastName="{ item }">
        <template v-if="item">
          <span v-if="editingId !== item.id">
            {{ item.lastName }}
          </span>
          <VTextField
            v-else
            v-model="editedData.lastName"
            density="compact"
            hide-details
          />
        </template>
      </template>
      
      <template #item.email="{ item }">
        <template v-if="item">
          <span v-if="editingId !== item.id">
            {{ item.email }}
          </span>
          <VTextField
            v-else
            v-model="editedData.email"
            type="email"
            density="compact"
            hide-details
          />
        </template>
      </template>
      
      <template #item.phone="{ item }">
        <template v-if="item">
          <span v-if="editingId !== item.id">
            {{ formatNullValue(item.phone) }}
          </span>
          <VTextField
            v-else
            v-model="editedData.phone"
            type="tel"
            density="compact"
            hide-details
          />
        </template>
      </template>
      
      <template #item.userRole="{ item }">
        <template v-if="item">
          <span v-if="editingId !== item.id">
            {{ item.userRole }}
          </span>
          <VSelect
            v-else
            v-model="editedData.userRole"
            :items="['client', 'agent', 'transaction_manager', 'seller', 'inspector']"
            density="compact"
            hide-details
          />
        </template>
      </template>
      
      <template #item.loginId="{ item }">
        <template v-if="item">
          <span v-if="editingId !== item.id">
            {{ formatNullValue(item.loginId) }}
          </span>
          <VTextField
            v-else
            v-model.number="editedData.loginId"
            type="number"
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
        <VCardTitle class="text-h6">Delete User</VCardTitle>
        <VCardText>
          Are you sure you want to delete this user? This action cannot be undone.
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
.users-table {
  padding: 1rem 0;
}
</style>

