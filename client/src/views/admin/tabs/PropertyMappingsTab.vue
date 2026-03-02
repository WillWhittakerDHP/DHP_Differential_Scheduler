<!--
  WHY: Admin UI for Bright MLS field and feature mappings
  PATTERN: Two sub-tabs (Field Mappings, Block Mappings) with CRUD tables
-->
<script setup lang="ts">
import { ref, computed, inject, type Ref } from 'vue'
import { usePropertyMappingsTab } from '@/composables/admin/usePropertyMappingsTab'

const adminCurrentTab = inject<Ref<string>>('adminCurrentTab', ref(''))

/** When provided (e.g. when embedded under Controls > Rules), overrides tab-active check so queries run when this section is visible. */
const props = withDefaults(
  defineProps<{ enabledOverride?: boolean }>(),
  { enabledOverride: undefined }
)

const isTabActive = computed(() =>
  props.enabledOverride !== undefined ? props.enabledOverride : adminCurrentTab?.value === 'property-mappings'
)

const currentSubTab = ref<'field' | 'block'>('field')

const {
  fieldMappings,
  fieldMappingsLoading,
  featureMappings,
  featureMappingsLoading,
} = usePropertyMappingsTab(isTabActive)

const showFieldDialog = ref(false)
const showBlockDialog = ref(false)
</script>

<template>
  <div v-if="isTabActive" class="property-mappings-tab">
    <VTabs v-model="currentSubTab" class="mb-4">
      <VTab value="field">Field Mappings</VTab>
      <VTab value="block">Block Mappings</VTab>
    </VTabs>

    <VWindow v-model="currentSubTab">
      <VWindowItem value="field">
        <p class="text-body-medium text-medium-emphasis mb-4">
          Map RESO source fields (e.g. FoundationDetails) to property_details target fields (foundationAccess, additionalUnits).
        </p>
        <VDataTable
          :items="fieldMappings ?? []"
          :headers="[
            { title: 'Source Field', key: 'sourceField', sortable: true },
            { title: 'Target Field', key: 'targetField', sortable: true },
            { title: 'Fallback', key: 'fallbackValue' },
            { title: 'Active', key: 'active', sortable: true },
            { title: 'Actions', key: 'actions', sortable: false }
          ]"
          :loading="fieldMappingsLoading"
          item-value="id"
          class="elevation-1"
        >
          <template #item.actions>
            <VBtn size="small" variant="text" color="error" @click="() => {}">
              Delete
            </VBtn>
          </template>
        </VDataTable>
        <VBtn class="mt-4" color="primary" @click="showFieldDialog = true">
          Add Field Mapping
        </VBtn>
      </VWindowItem>

      <VWindowItem value="block">
        <p class="text-body-medium text-medium-emphasis mb-4">
          Map RESO features (e.g. PoolFeatures, PatioAndPorchFeatures) to block instances for suggested selections.
        </p>
        <VDataTable
          :items="featureMappings ?? []"
          :headers="[
            { title: 'Source Field', key: 'sourceField', sortable: true },
            { title: 'Match Type', key: 'matchType' },
            { title: 'Match Value', key: 'matchValue' },
            { title: 'Block Instance', key: 'blockInstance.name' },
            { title: 'Priority', key: 'priority', sortable: true },
            { title: 'Active', key: 'active', sortable: true },
            { title: 'Actions', key: 'actions', sortable: false }
          ]"
          :loading="featureMappingsLoading"
          item-value="id"
          class="elevation-1"
        >
          <template #item.actions>
            <VBtn size="small" variant="text" color="error" @click="() => {}">
              Delete
            </VBtn>
          </template>
        </VDataTable>
        <VBtn class="mt-4" color="primary" @click="showBlockDialog = true">
          Add Block Mapping
        </VBtn>
      </VWindowItem>
    </VWindow>
  </div>
</template>

<style scoped>
.property-mappings-tab {
  padding: 1rem 0;
}
</style>
