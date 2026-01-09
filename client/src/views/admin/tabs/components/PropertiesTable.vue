<!--
  LEARNING: Properties Data Table Component
  WHY: Provides data table interface for managing properties with inline editing
  PATTERN: VDataTable with custom editable cells and CRUD operations
-->
<script setup lang="ts">
import { usePropertiesTableModel } from '@/composables/admin/tables/usePropertiesTableModel'

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

/**
 * LEARNING: Table headers configuration
 * WHY: Defines columns displayed in VDataTable
 * PATTERN: Array of header objects with title and key
 */
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
      <h3 class="text-h6">Properties</h3>
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
    <VCard v-if="isCreating" class="mb-4">
      <VCardTitle>Create New Property</VCardTitle>
      <VCardText>
        <VRow>
          <VCol cols="12" md="6">
            <VTextField
              v-model="newProperty.address"
              label="Address *"
              required
            />
          </VCol>
          <VCol cols="12" md="6">
            <VTextField
              v-model="newProperty.unit"
              label="Unit"
            />
          </VCol>
          <VCol cols="12" md="4">
            <VTextField
              v-model="newProperty.city"
              label="City *"
              required
            />
          </VCol>
          <VCol cols="12" md="4">
            <VTextField
              v-model="newProperty.state"
              label="State *"
              required
            />
          </VCol>
          <VCol cols="12" md="4">
            <VTextField
              v-model="newProperty.zipCode"
              label="Zip Code *"
              required
            />
          </VCol>
          <VCol cols="12" md="6">
            <VTextField
              v-model.number="newProperty.squareFootage"
              type="number"
              label="Square Footage"
            />
          </VCol>
          <VCol cols="12" md="6">
            <VTextField
              v-model="newProperty.mlsNumber"
              label="MLS Number"
            />
          </VCol>
          <VCol cols="12" md="4">
            <VTextField
              v-model.number="newProperty.bedrooms"
              type="number"
              label="Bedrooms"
            />
          </VCol>
          <VCol cols="12" md="4">
            <VTextField
              v-model.number="newProperty.bathrooms"
              type="number"
              label="Bathrooms"
            />
          </VCol>
          <VCol cols="12" md="4">
            <VSelect
              v-model="newProperty.foundationAccess"
              :items="['basement', 'crawlspace', 'slab']"
              label="Foundation Access"
              clearable
            />
          </VCol>
          <VCol cols="12" md="6">
            <VTextField
              v-model.number="newProperty.additionalUnits"
              type="number"
              label="Additional Units"
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
        <VCardTitle class="text-h6">Delete Property</VCardTitle>
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

