<!--
  WHY: VDataTable + cell slots extracted from UsersTable (component-health: template size / directive depth).
-->
<script setup lang="ts">
import { useDataGridVTableProps } from '@/composables/admin/tables/useDataGridVTableProps'
import type { UserResponse } from '@/types/user'
import type { UsersTableDataGridContext } from '@/types/admin/tables/usersTableDataGrid'
import InlineEditNumberCell from './InlineEditNumberCell.vue'
import InlineEditTextCell from './InlineEditTextCell.vue'
import InlineEditUserRoleCell from './InlineEditUserRoleCell.vue'
import TableInlineActionsCell from './TableInlineActionsCell.vue'

const props = defineProps<{
  grid: UsersTableDataGridContext
}>()

const g = props.grid
const { tableItems, isLoading } = useDataGridVTableProps(g)
const editingId = g.editingId
const editedData = g.editedData
const formatNullValue = g.formatNullValue
const startEdit = g.startEdit
const saveEdit = g.saveEdit
const cancelEdit = g.cancelEdit
const openDeleteDialog = g.openDeleteDialog

function editUserRow(item: UserResponse): void {
  startEdit(item)
}
</script>

<template>
  <VDataTable
    :headers="g.headers"
    :items="tableItems"
    :loading="isLoading"
    item-value="id"
    class="elevation-1"
  >
    <template #item.firstName="{ item }">
      <InlineEditTextCell
        v-if="item"
        :is-editing="editingId === item.id"
        :display-text="item.firstName"
        :model-value="editedData.firstName"
        @update:model-value="editedData.firstName = $event"
      />
    </template>
    <template #item.lastName="{ item }">
      <InlineEditTextCell
        v-if="item"
        :is-editing="editingId === item.id"
        :display-text="item.lastName"
        :model-value="editedData.lastName"
        @update:model-value="editedData.lastName = $event"
      />
    </template>
    <template #item.email="{ item }">
      <InlineEditTextCell
        v-if="item"
        :is-editing="editingId === item.id"
        :display-text="item.email"
        input-type="email"
        :model-value="editedData.email"
        @update:model-value="editedData.email = $event"
      />
    </template>
    <template #item.phone="{ item }">
      <InlineEditTextCell
        v-if="item"
        :is-editing="editingId === item.id"
        :raw="item.phone"
        :format-null="formatNullValue"
        input-type="tel"
        :model-value="editedData.phone"
        @update:model-value="editedData.phone = $event"
      />
    </template>
    <template #item.userRole="{ item }">
      <InlineEditUserRoleCell
        v-if="item"
        :is-editing="editingId === item.id"
        :display-role="item.userRole"
        :model-value="editedData.userRole"
        @update:model-value="editedData.userRole = $event"
      />
    </template>
    <template #item.loginId="{ item }">
      <InlineEditNumberCell
        v-if="item"
        :is-editing="editingId === item.id"
        :raw="item.loginId"
        :format-null="formatNullValue"
        :model-value="editedData.loginId"
        @update:model-value="editedData.loginId = $event"
      />
    </template>
    <template #item.actions="{ item }">
      <TableInlineActionsCell
        v-if="item"
        :is-editing="editingId === item.id"
        @save="saveEdit"
        @cancel="cancelEdit"
        @edit="editUserRow(item)"
        @delete="openDeleteDialog(item.id)"
      />
    </template>
  </VDataTable>
</template>
