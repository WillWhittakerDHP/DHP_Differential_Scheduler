<!--
  LEARNING: PartInstances Nested Section Component (Refactored)
  WHY: Thin wrapper around EntityCard for PartInstances within a BlockInstance
  PATTERN: Uses config-driven statusButtonFields and EntityCard for all entity rendering
  KEY DIFFERENCE: Shows placeholder cards for valid PartShapes without assigned PartInstances
-->
<script setup lang="ts">
import { computed } from 'vue'
import EntityCard from './generic/EntityCard.vue'
import { usePartInstancesNestedSectionModel } from '@/composables/admin/usePartInstancesNestedSectionModel'
import { useAdminConfig } from '@/composables/useAdminConfig'
import { useEntityCrud } from '@/composables/useEntity'
import { categorizeFieldsBySection, type StatusButtonField } from '@/utils/forms/fieldSectionCategorization'
import type { GlobalEntity } from '@/types/entities'
import type { GlobalFieldKey } from '@/constants/primitives'
import { createLogger } from '@/utils/logger'
import { createEntityFieldPatch } from '@/utils/entities/entityFieldPatch'

/**
 * LEARNING: Component props
 * WHY: Type-safe prop definition for BlockInstance ID
 * PATTERN: defineProps with TypeScript interface
 */
interface Props {
  blockInstanceId: string
}

const props = defineProps<Props>()

/**
 * LEARNING: Config-driven status button fields
 * WHY: Match InstancesTab pattern - status buttons come from config, not hardcoded
 * PATTERN: Extract statusButtonFields from field categorization utility
 */
const adminConfig = useAdminConfig()
const partInstanceConfig = computed(() => adminConfig.getInstanceConfig('partInstance').value)
const logger = createLogger('PartInstancesNestedSection')

type PartInstanceStatusButtonField = Omit<StatusButtonField, 'key'> & { key: GlobalFieldKey<'partInstance'> }

const statusButtonFields = computed((): PartInstanceStatusButtonField[] => {
  const fieldsConfig = partInstanceConfig.value?.fields
  if (!fieldsConfig) return []
  
  const categorized = categorizeFieldsBySection([], fieldsConfig)
  return categorized.statusButtonFields.map((f) => ({
    ...f,
    key: f.key as GlobalFieldKey<'partInstance'>,
  }))
})

/**
 * LEARNING: Entity CRUD for status button toggle
 * WHY: Clicking status buttons should update the database, not just UI
 * PATTERN: Use useEntityCrud to get update mutation
 */
const { update: updatePartInstance } = useEntityCrud('partInstance')

/**
 * LEARNING: Toggle status button on PartInstance
 * WHY: Config-driven approach - same as InstancesTab
 * PATTERN: Update single field via CRUD mutation
 */
const toggleStatusButton = async (
  partInstance: GlobalEntity<'partInstance'>,
  fieldKey: GlobalFieldKey<'partInstance'>
): Promise<void> => {
  const currentValue = partInstance[fieldKey]
  if (typeof currentValue !== 'boolean') {
    logger.error('Status button field must be boolean to toggle', {
      fieldKey: String(fieldKey),
      valueType: typeof currentValue,
      partInstanceId: partInstance.id,
    })
    return
  }

  const newValue = !currentValue
  await updatePartInstance(
    createEntityFieldPatch<GlobalEntity<'partInstance'> & Record<string, unknown>, typeof fieldKey>(fieldKey, newValue),
    partInstance.id
  )
}

const model = usePartInstancesNestedSectionModel(computed(() => props.blockInstanceId))
const {
  validPartShapes,
  existingPartInstances,
  getPartInstanceForShape,
  getPartShapeName,
  blockInstance,
  shouldShowPartInstances,
  bulkEditMode,
  bulkEditData,
  toggleBulkEditMode,
  applyPartInstanceBulkEdit,
  expandedPartInstances,
  isPanelExpanded,
  // Inline creation - now uses EntityCard with isNew
  expandedPlaceholders,
  getNewPartInstanceEntity,
  handleNewPartInstanceSaved,
  handleNewPartInstanceCancelled,
} = model

/**
 * LEARNING: Handle delete PartInstance event
 * WHY: EntityCard already handled the deletion - this is just for parent awareness
 * PATTERN: No-op handler - card handles all deletion logic, Vue Query will automatically refetch
 */
const handleDeletePartInstance = (_id: string) => {
  // EntityCard already handled the deletion
  // Vue Query will automatically refetch and update the UI
}

/**
 * LEARNING: Expose bulk edit state and functions to parent
 * WHY: Parent component (DynamicFormInputs) needs to render bulk edit button in panel title
 * PATTERN: defineExpose to expose reactive state and functions
 */
defineExpose({
  bulkEditMode,
  toggleBulkEditMode
})
</script>

<template>
  <div v-if="shouldShowPartInstances && blockInstance" class="part-instances-nested-section">
    
    <!--
      LEARNING: Parts Panel Header with Bulk Edit Toggle
      WHY: Provides consistent bulk edit access like the main tabs
      PATTERN: Header row with count and action buttons
    -->
    <div class="d-flex align-center justify-space-between mb-3">
      <span class="text-body-2 text-medium-emphasis">
        {{ existingPartInstances.length }} of {{ validPartShapes.length }} parts assigned
      </span>
      <VBtn
        v-if="existingPartInstances.length > 0"
        :variant="bulkEditMode ? 'flat' : 'outlined'"
        :color="bulkEditMode ? 'success' : undefined"
        size="small"
        prepend-icon="tabler-edit"
        @click="toggleBulkEditMode"
      >
        {{ bulkEditMode ? 'Exit Bulk Edit' : 'Bulk Edit' }}
      </VBtn>
    </div>
    
    <!--
      LEARNING: Bulk Edit Panel
      WHY: Unique feature for applying changes to multiple PartInstances at once
      PATTERN: Conditional rendering with v-if, VCard with form fields
      NOTE: This is legitimately unique to this section - not appropriate for EntityCard
    -->
    <VCard
      v-if="bulkEditMode"
      variant="outlined"
      color="success"
      class="mb-4"
    >
      <VCardTitle class="text-subtitle-1">
        Bulk Edit: Part Instances
      </VCardTitle>
      <VCardText>
        <div class="d-flex flex-column gap-3">
          <VTextField
            v-model.number="bulkEditData.baseTime"
            label="Base Time"
            type="number"
            hint="Leave empty to skip this field"
            persistent-hint
          />
          <VTextField
            v-model.number="bulkEditData.rateOverBaseTime"
            label="Rate Over Base Time"
            type="number"
            hint="Leave empty to skip this field"
            persistent-hint
          />
          <VTextField
            v-model.number="bulkEditData.baseFee"
            label="Base Fee"
            type="number"
            hint="Leave empty to skip this field"
            persistent-hint
          />
          <VTextField
            v-model.number="bulkEditData.rateOverBaseFee"
            label="Rate Over Base Fee"
            type="number"
            hint="Leave empty to skip this field"
            persistent-hint
          />
          <div class="d-flex justify-end gap-2">
            <VBtn
              variant="outlined"
              @click="toggleBulkEditMode"
            >
              Cancel
            </VBtn>
            <VBtn
              color="primary"
              @click="applyPartInstanceBulkEdit"
            >
              Apply to All ({{ existingPartInstances.length }})
            </VBtn>
          </div>
        </div>
      </VCardText>
    </VCard>
    
    <!--
      LEARNING: Render PartInstances for each valid PartShape
      WHY: Shows all valid PartShapes with EntityCard for both existing and new PartInstances
      PATTERN: Loop through validPartShapes, use EntityCard with appropriate props
    -->
    <div class="part-instances-list">
      <template
        v-for="partShape in validPartShapes"
        :key="String(partShape.id)"
      >
        <div class="part-instance-item mb-2">
          <!--
            LEARNING: Render VExpansionPanels for existing PartInstance
            WHY: Uses config-driven status buttons in panel title, EntityCard in content
            PATTERN: Same pattern as InstancesTab - config drives appearance
          -->
          <template v-if="getPartInstanceForShape(String(partShape.id))">
            <VExpansionPanels
              v-model="expandedPartInstances"
              multiple
            >
              <VExpansionPanel
                :value="String(getPartInstanceForShape(String(partShape.id))!.id)"
              >
                <template #title>
                  <div class="d-flex align-center gap-2 flex-grow-1">
                    <!-- Static name in title -->
                    <span>{{ getPartInstanceForShape(String(partShape.id))!.name || `PartInstance ${getPartInstanceForShape(String(partShape.id))!.id}` }}</span>
                    
                    <!-- Config-driven status button fields (same pattern as InstancesTab) -->
                    <div class="d-flex align-center gap-1 flex-wrap ml-auto">
                      <VChip
                        v-for="statusField in statusButtonFields"
                        :key="statusField.key"
                        :color="statusField.color"
                        :variant="Boolean(getPartInstanceForShape(String(partShape.id))?.[statusField.key]) ? 'flat' : 'outlined'"
                        size="small"
                        style="cursor: pointer"
                        role="switch"
                        :aria-checked="String(Boolean(getPartInstanceForShape(String(partShape.id))?.[statusField.key]))"
                        :aria-label="`Toggle ${statusField.label}`"
                        @click.stop="toggleStatusButton(getPartInstanceForShape(String(partShape.id))!, statusField.key)"
                      >
                        {{ statusField.label }}
                      </VChip>
                    </div>
                  </div>
                </template>
                
                <template #text>
                  <!-- LEARNING: EntityCard handles all form rendering via config -->
                  <!-- WHY: Consistent with other entity types - no hardcoded fields -->
                  <EntityCard
                    entity-key="partInstance"
                    :entity="getPartInstanceForShape(String(partShape.id))!"
                    :expanded="isPanelExpanded(String(getPartInstanceForShape(String(partShape.id))!.id))"
                    :hide-title-field="true"
                    @delete="handleDeletePartInstance"
                  />
                </template>
              </VExpansionPanel>
            </VExpansionPanels>
          </template>
        
          <!--
            LEARNING: Render inline EntityCard for new PartInstance (placeholder)
            WHY: Uses EntityCard with isNew=true instead of hardcoded form fields
            PATTERN: Create temporary entity, pass to EntityCard - same component for create and edit
          -->
          <VExpansionPanels
            v-else
            v-model="expandedPlaceholders"
            multiple
          >
            <VExpansionPanel
              :value="String(partShape.id)"
              class="add-part-instance-card"
            >
              <template #title>
                <div class="d-flex align-center gap-2 flex-grow-1">
                  <VIcon icon="tabler-plus" size="small" class="text-primary" />
                  <span>{{ getPartShapeName(String(partShape.id)) }}</span>
                  <span class="text-caption text-medium-emphasis ml-2">Click to add</span>
                </div>
              </template>
              
              <template #text>
                <!-- LEARNING: EntityCard with isNew=true for creation -->
                <!-- WHY: Same component handles both create and edit - config drives fields -->
                <!-- PATTERN: Pass temporary entity with new-{id} prefix, EntityCard handles the rest -->
                <EntityCard
                  entity-key="partInstance"
                  :entity="getNewPartInstanceEntity(String(partShape.id))"
                  :expanded="true"
                  :is-new="true"
                  :hide-title-field="false"
                  @saved="handleNewPartInstanceSaved(String(partShape.id))"
                  @cancelled="handleNewPartInstanceCancelled(String(partShape.id))"
                />
              </template>
            </VExpansionPanel>
          </VExpansionPanels>
        </div>
      </template>
      
      <!--
        LEARNING: Empty state when no valid PartShapes exist
        WHY: Provides feedback when BlockShape has no validConstituents configured
        PATTERN: Conditional rendering with v-if
      -->
      <VAlert
        v-if="validPartShapes.length === 0"
        type="info"
        variant="tonal"
        class="mt-2"
      >
        No valid PartShapes configured for this BlockShape. Configure validConstituents on the BlockShape to add PartInstances.
      </VAlert>
    </div>
  </div>
</template>

<style scoped>
.part-instances-nested-section {
  margin-top: 1rem;
  margin-bottom: 1rem;
}

.part-instances-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.part-instance-item {
  width: 100%;
}

.add-part-instance-card {
  opacity: 0.85;
  transition: opacity 0.2s;
  border-style: dashed !important;
}

.add-part-instance-card:hover {
  opacity: 1;
}
</style>
