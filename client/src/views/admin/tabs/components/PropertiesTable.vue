<!--
  WHY: Provides data table interface for managing properties with inline editing
  PATTERN: VDataTable with custom editable cells and CRUD operations
-->
<script setup lang="ts">
import { computed, shallowReactive } from 'vue'
import type { Ref } from 'vue'
import type { PropertyRequest, PropertyResponse } from '@/types/property'
import { usePropertiesTableModel } from '@/composables/admin/tables/usePropertiesTableModel'
import { ensureItemsArray } from '@/composables/admin/tables/useTableModelHelpers'
import type { PropertiesTableDataGridContext } from '@/types/admin/tables/propertiesTableDataGrid'
import PropertyCreateForm from './PropertyCreateForm.vue'
import PropertiesTableDataGrid from './PropertiesTableDataGrid.vue'

const {
  items: properties,
  isLoading,
  error: propertiesError,
  editingId,
  editedData,
  isCreating,
  newItem: newProperty,
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
} = usePropertiesTableModel()

const headers = [
  { title: 'Address', key: 'address', sortable: true },
  { title: 'Unit', key: 'unit', sortable: true },
  { title: 'City', key: 'city', sortable: true },
  { title: 'State', key: 'state', sortable: true },
  { title: 'Zip Code', key: 'zipCode', sortable: true },
  { title: 'MLS Number', key: 'mlsNumber', sortable: true },
  { title: 'Square Feet', key: 'squareFootage', sortable: true },
  { title: 'Bedrooms', key: 'bedrooms', sortable: true },
  { title: 'Bathrooms', key: 'bathrooms', sortable: true },
  { title: 'Foundation', key: 'foundationAccess', sortable: true },
  { title: 'Additional Units', key: 'additionalUnits', sortable: true },
  { title: 'Actions', key: 'actions', sortable: false },
]

const tableItems = computed(() => ensureItemsArray<PropertyResponse>(properties.value))

const gridContext = shallowReactive<PropertiesTableDataGridContext>({
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
  <div class="properties-table">
    <div class="d-flex justify-space-between align-center mb-4">
      <h3 class="text-headline-small">Properties</h3>
      <VBtn
        color="primary"
        prepend-icon="tabler-plus"
        @click="startCreate"
        :disabled="isCreating"
      >
        Create Property
      </VBtn>
    </div>
    
    <!-- Loading state -->
    <VAlert
      v-if="isLoading"
      type="info"
      variant="tonal"
      class="mb-4"
    >
      Loading properties...
    </VAlert>
    
    <!-- Error state -->
    <VAlert
      v-if="propertiesError"
      type="error"
      variant="tonal"
      class="mb-4"
    >
      Error loading properties: {{ propertiesError }}
    </VAlert>
    
    <!-- Create form -->
    <PropertyCreateForm
      v-if="isCreating"
      :new-property="(newProperty as unknown as Ref<PropertyRequest | Partial<PropertyRequest>>)"
      @cancel="cancelCreate"
      @save="saveCreate"
    />

    <!-- Empty state -->
    <VAlert
      v-if="!isLoading && !propertiesError && tableItems.length === 0"
      type="info"
      variant="tonal"
      class="mb-4"
    >
      No properties found. Click "Create Property" to add one.
    </VAlert>
    
    <PropertiesTableDataGrid v-if="!isLoading && !propertiesError" :grid="gridContext" />

    <!-- Delete Confirmation Dialog -->
    <VDialog v-model="showDeleteDialog" max-width="500">
      <VCard>
        <VCardTitle class="text-headline-small">Delete Property</VCardTitle>
        <VCardText>
          Are you sure you want to delete this property? This action cannot be undone.
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
.properties-table {
  padding: 1rem 0;
}
</style>
