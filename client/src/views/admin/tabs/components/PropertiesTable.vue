<!--
  LEARNING: Properties Data Table Component
  WHY: Provides data table interface for managing properties with inline editing
  PATTERN: VDataTable with custom editable cells and CRUD operations
-->
<script setup lang="ts">
import type { Ref } from 'vue'
import type { PropertyRequest } from '@/types/property'
import { usePropertiesTableModel } from '@/composables/admin/tables/usePropertiesTableModel'
import PropertyCreateForm from './PropertyCreateForm.vue'

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
      v-if="!isLoading && !propertiesError && properties.length === 0"
      type="info"
      variant="tonal"
      class="mb-4"
    >
      No properties found. Click "Create Property" to add one.
    </VAlert>
    
    <!-- Data table -->
    <VDataTable
      v-if="!isLoading && !propertiesError"
      :headers="headers"
      :items="properties"
      :loading="isLoading"
      item-value="id"
      class="elevation-1"
    >
      <template #item.address="{ item }">
        <template v-if="item">
          <span v-if="editingId !== item.id">
            {{ item.address }}
          </span>
          <VTextField
            v-else
            v-model="editedData.address"
            density="compact"
            hide-details
          />
        </template>
      </template>
      
      <template #item.unit="{ item }">
        <template v-if="item">
          <span v-if="editingId !== item.id">
            {{ formatNullValue(item.unit) }}
          </span>
          <VTextField
            v-else
            v-model="editedData.unit"
            density="compact"
            hide-details
          />
        </template>
      </template>
      
      <template #item.city="{ item }">
        <template v-if="item">
          <span v-if="editingId !== item.id">
            {{ item.city }}
          </span>
          <VTextField
            v-else
            v-model="editedData.city"
            density="compact"
            hide-details
          />
        </template>
      </template>
      
      <template #item.state="{ item }">
        <template v-if="item">
          <span v-if="editingId !== item.id">
            {{ item.state }}
          </span>
          <VTextField
            v-else
            v-model="editedData.state"
            density="compact"
            hide-details
          />
        </template>
      </template>
      
      <template #item.zipCode="{ item }">
        <template v-if="item">
          <span v-if="editingId !== item.id">
            {{ item.zipCode }}
          </span>
          <VTextField
            v-else
            v-model="editedData.zipCode"
            density="compact"
            hide-details
          />
        </template>
      </template>
      
      <template #item.mlsNumber="{ item }">
        <template v-if="item">
          <span v-if="editingId !== item.id">
            {{ formatNullValue(item.mlsNumber) }}
          </span>
          <VTextField
            v-else
            v-model="editedData.mlsNumber"
            density="compact"
            hide-details
          />
        </template>
      </template>
      
      <template #item.squareFootage="{ item }">
        <template v-if="item">
          <span v-if="editingId !== item.id">
            {{ formatNullValue(item.squareFootage) }}
          </span>
          <VTextField
            v-else
            v-model.number="editedData.squareFootage"
            type="number"
            density="compact"
            hide-details
          />
        </template>
      </template>
      
      <template #item.bedrooms="{ item }">
        <template v-if="item">
          <span v-if="editingId !== item.id">
            {{ formatNullValue(item.bedrooms) }}
          </span>
          <VTextField
            v-else
            v-model.number="editedData.bedrooms"
            type="number"
            density="compact"
            hide-details
          />
        </template>
      </template>
      
      <template #item.bathrooms="{ item }">
        <template v-if="item">
          <span v-if="editingId !== item.id">
            {{ formatNullValue(item.bathrooms) }}
          </span>
          <VTextField
            v-else
            v-model.number="editedData.bathrooms"
            type="number"
            density="compact"
            hide-details
          />
        </template>
      </template>
      
      <template #item.foundationAccess="{ item }">
        <template v-if="item">
          <span v-if="editingId !== item.id">
            {{ formatNullValue(item.foundationAccess) }}
          </span>
          <VSelect
            v-else
            v-model="editedData.foundationAccess"
            :items="['basement', 'crawlspace', 'slab']"
            density="compact"
            hide-details
            clearable
          />
        </template>
      </template>
      
      <template #item.additionalUnits="{ item }">
        <template v-if="item">
          <span v-if="editingId !== item.id">
            {{ formatNullValue(item.additionalUnits) }}
          </span>
          <VTextField
            v-else
            v-model.number="editedData.additionalUnits"
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

