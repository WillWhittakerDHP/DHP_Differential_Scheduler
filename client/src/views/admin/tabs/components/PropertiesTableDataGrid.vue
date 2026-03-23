<!--
  WHY: VDataTable + cell slots extracted from PropertiesTable (component-health: template size / directive depth).
-->
<script setup lang="ts">
import { useDataGridVTableProps } from '@/composables/admin/tables/useDataGridVTableProps'
import type { PropertyResponse } from '@/types/property'
import type { PropertiesTableDataGridContext } from '@/types/admin/tables/propertiesTableDataGrid'
import InlineEditFoundationCell from './InlineEditFoundationCell.vue'
import InlineEditNumberCell from './InlineEditNumberCell.vue'
import InlineEditTextCell from './InlineEditTextCell.vue'
import TableInlineActionsCell from './TableInlineActionsCell.vue'

const props = defineProps<{
  grid: PropertiesTableDataGridContext
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

function editPropertyRow(item: PropertyResponse): void {
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
    <template #item.address="{ item }">
      <InlineEditTextCell
        v-if="item"
        :is-editing="editingId === item.id"
        :display-text="item.address"
        :model-value="editedData.address"
        @update:model-value="editedData.address = $event"
      />
    </template>
    <template #item.unit="{ item }">
      <InlineEditTextCell
        v-if="item"
        :is-editing="editingId === item.id"
        :raw="item.unit"
        :format-null="formatNullValue"
        :model-value="editedData.unit"
        @update:model-value="editedData.unit = $event"
      />
    </template>
    <template #item.city="{ item }">
      <InlineEditTextCell
        v-if="item"
        :is-editing="editingId === item.id"
        :display-text="item.city"
        :model-value="editedData.city"
        @update:model-value="editedData.city = $event"
      />
    </template>
    <template #item.state="{ item }">
      <InlineEditTextCell
        v-if="item"
        :is-editing="editingId === item.id"
        :display-text="item.state"
        :model-value="editedData.state"
        @update:model-value="editedData.state = $event"
      />
    </template>
    <template #item.zipCode="{ item }">
      <InlineEditTextCell
        v-if="item"
        :is-editing="editingId === item.id"
        :display-text="item.zipCode"
        :model-value="editedData.zipCode"
        @update:model-value="editedData.zipCode = $event"
      />
    </template>
    <template #item.mlsNumber="{ item }">
      <InlineEditTextCell
        v-if="item"
        :is-editing="editingId === item.id"
        :raw="item.mlsNumber"
        :format-null="formatNullValue"
        :model-value="editedData.mlsNumber"
        @update:model-value="editedData.mlsNumber = $event"
      />
    </template>
    <template #item.squareFootage="{ item }">
      <InlineEditNumberCell
        v-if="item"
        :is-editing="editingId === item.id"
        :raw="item.squareFootage"
        :format-null="formatNullValue"
        :model-value="editedData.squareFootage"
        @update:model-value="editedData.squareFootage = $event"
      />
    </template>
    <template #item.bedrooms="{ item }">
      <InlineEditNumberCell
        v-if="item"
        :is-editing="editingId === item.id"
        :raw="item.bedrooms"
        :format-null="formatNullValue"
        :model-value="editedData.bedrooms"
        @update:model-value="editedData.bedrooms = $event"
      />
    </template>
    <template #item.bathrooms="{ item }">
      <InlineEditNumberCell
        v-if="item"
        :is-editing="editingId === item.id"
        :raw="item.bathrooms"
        :format-null="formatNullValue"
        :model-value="editedData.bathrooms"
        @update:model-value="editedData.bathrooms = $event"
      />
    </template>
    <template #item.foundationAccess="{ item }">
      <InlineEditFoundationCell
        v-if="item"
        :is-editing="editingId === item.id"
        :raw="item.foundationAccess"
        :format-null="formatNullValue"
        :model-value="editedData.foundationAccess"
        @update:model-value="editedData.foundationAccess = $event"
      />
    </template>
    <template #item.additionalUnits="{ item }">
      <InlineEditNumberCell
        v-if="item"
        :is-editing="editingId === item.id"
        :raw="item.additionalUnits"
        :format-null="formatNullValue"
        :model-value="editedData.additionalUnits"
        @update:model-value="editedData.additionalUnits = $event"
      />
    </template>
    <template #item.actions="{ item }">
      <TableInlineActionsCell
        v-if="item"
        :is-editing="editingId === item.id"
        @save="saveEdit"
        @cancel="cancelEdit"
        @edit="editPropertyRow(item)"
        @delete="openDeleteDialog(item.id)"
      />
    </template>
  </VDataTable>
</template>
