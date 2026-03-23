<!--
  WHY: Provides data table interface for managing users with inline editing
  PATTERN: VDataTable with custom editable cells and CRUD operations
-->
<script setup lang="ts">
import { computed, shallowReactive } from 'vue'
import type { Ref } from 'vue'
import type { UserRequest, UserResponse } from '@/types/user'
import { useUsersTableModel } from '@/composables/admin/tables/useUsersTableModel'
import { ensureItemsArray } from '@/composables/admin/tables/useTableModelHelpers'
import type { UsersTableDataGridContext } from '@/types/admin/tables/usersTableDataGrid'
import UserCreateForm from './UserCreateForm.vue'
import UsersTableDataGrid from './UsersTableDataGrid.vue'

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

const headers = [
  { title: 'First Name', key: 'firstName', sortable: true },
  { title: 'Last Name', key: 'lastName', sortable: true },
  { title: 'Email', key: 'email', sortable: true },
  { title: 'Phone', key: 'phone', sortable: true },
  { title: 'Role', key: 'userRole', sortable: true },
  { title: 'Login ID', key: 'loginId', sortable: true },
  { title: 'Actions', key: 'actions', sortable: false },
]

const tableItems = computed(() => ensureItemsArray<UserResponse>(users.value))

const gridContext = shallowReactive<UsersTableDataGridContext>({
  headers,
  tableItems,
  editingId,
  editedData,
  isLoading,
  formatNullValue,
  startEdit,
  cancelEdit,
  saveEdit,
  openDeleteDialog,
})
</script>

<template>
  <div class="users-table">
    <div class="d-flex justify-space-between align-center mb-4">
      <h3 class="text-headline-small">Users</h3>
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
    
    <UserCreateForm
      v-if="isCreating"
      :new-user="(newUser as unknown as Ref<Partial<UserRequest>>)"
      @cancel="cancelCreate"
      @save="saveCreate"
    />

    <!-- Empty state -->
    <VAlert
      v-if="!isLoading && !usersError && tableItems.length === 0"
      type="info"
      variant="tonal"
      class="mb-4"
    >
      No users found. Click "Create User" to add one.
    </VAlert>
    
    <UsersTableDataGrid v-if="!isLoading && !usersError" :grid="gridContext" />

    <!-- Delete Confirmation Dialog -->
    <VDialog v-model="showDeleteDialog" max-width="500">
      <VCard>
        <VCardTitle class="text-headline-small">Delete User</VCardTitle>
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
