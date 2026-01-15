<!--
  LEARNING: PartsCollection component renders part instances for a block instance
  WHY: Specialized component for activeParts field - displays part instances only
  PATTERN: Direct rendering of EntityCard without wrapper component, matching InstancesTab pattern
-->
<template>
  <div v-if="shouldShowPartInstances && blockInstance && parentEntity" class="part-instances-list">
    <!--
      LEARNING: Bulk Edit Modal
      WHY: Modal for bulk editing PartInstances
      PATTERN: Modal component with EntityCard inside, always rendered but controlled by modelValue
    -->
    <PartInstanceBulkEditModal
      :model-value="isBulkEditModalOpen"
      :block-instance-id="parentEntity.id"
      :bulk-edit-data="hasBulkEditData ? bulkEditData : undefined"
      :instance-count="existingPartInstances.length"
      @update:model-value="handleBulkEditModalUpdate"
      @confirm="handleBulkEditConfirm"
    />
    
    <!--
      LEARNING: Render PartInstances for each valid PartShape
      WHY: Shows all valid PartShapes with EntityCard for both existing and new PartInstances
      PATTERN: Loop through validPartShapes, use EntityCard with appropriate props
      FIX: VExpansionPanels must be OUTSIDE v-for to avoid group context issues
    -->
    <VExpansionPanels
      v-model="expandedPartInstances"
      multiple
    >
      <template
        v-for="partShape in validPartShapes"
        :key="String(partShape.id)"
      >
        <!-- Existing PartInstance -->
        <EntityCard
          v-if="getPartInstanceForShape(String(partShape.id))"
          :key="String(getPartInstanceForShape(String(partShape.id))!.id)"
          entity-key="partInstance"
          :entity="getPartInstanceForShape(String(partShape.id))!"
          :expanded="isPanelExpanded(String(getPartInstanceForShape(String(partShape.id))!.id))"
          @delete="handleDeletePartInstance"
        />
      </template>
    </VExpansionPanels>

    <!-- Placeholder cards for new PartInstances -->
    <VExpansionPanels
      v-model="expandedPlaceholders"
      multiple
    >
      <template
        v-for="partShape in validPartShapes"
        :key="`placeholder-${String(partShape.id)}`"
      >
        <VExpansionPanel
          v-if="!getPartInstanceForShape(String(partShape.id))"
          :value="String(partShape.id)"
          class="add-part-instance-card"
        >
          <template #title>
            <div class="d-flex align-center gap-2 flex-grow-1">
              <VIcon icon="tabler-plus" size="small" class="text-primary" />
              <span>{{ getPartShapeName(String(partShape.id)) }}</span>
              <span class="text-caption text-medium-emphasis ml-2">Click to create part instance</span>
            </div>
          </template>
          
          <template #text>
            <!-- LEARNING: EntityCard with isNew=true for creation -->
            <!-- WHY: Same component handles both create and edit - config drives fields -->
            <!-- PATTERN: Pass temporary entity with new-{id} prefix, EntityCard handles the rest -->
            <!-- FIX: Pass created entity from saved event to handler to avoid timing issues -->
            <EntityCard
              entity-key="partInstance"
              :entity="getNewPartInstanceEntity(String(partShape.id))"
              :expanded="true"
              :is-new="true"
              :use-expansion-panel="false"
              @saved="(entity) => handleNewPartInstanceSaved(String(partShape.id), entity as import('@/types/entities').PartInstanceEntity)"
              @cancelled="handleNewPartInstanceCancelled(String(partShape.id))"
            />
          </template>
        </VExpansionPanel>
      </template>
    </VExpansionPanels>
    
    <!--
      LEARNING: Empty state when no valid PartShapes exist
      WHY: Provides feedback when BlockShape has no validParts configured
      PATTERN: Conditional rendering with v-if
    -->
    <VAlert
      v-if="validPartShapes.length === 0"
      type="info"
      variant="tonal"
      class="mt-2"
    >
      No valid PartShapes configured for this BlockShape. Configure validParts on the BlockShape to add PartInstances.
    </VAlert>
  </div>
</template>

<script setup lang="ts">
/**
 * LEARNING: PartsCollection component - specialized for part instances only
 * 
 * WHY: Renders part instances within a block instance (activeParts field)
 *      Uses EntityCard directly, matching the pattern used by InstancesTab for BlockInstances
 * 
 * PATTERN: Direct rendering of EntityCard component, exposes bulk edit state to parent
 */

import { computed, ref, watchEffect } from 'vue'
import type { ComponentPublicInstance } from 'vue'
import EntityCard from '../EntityCard.vue'
import PartInstanceBulkEditModal from '../../PartInstanceBulkEditModal.vue'
import { usePartInstanceCollection } from '@/composables/admin/usePartInstanceCollection'
import { useEntityMetadata } from '@/composables/admin/useEntityMetadata'
import type { GlobalEntity } from '@/types/entities'
import type { GlobalFieldKey } from '@/constants/primitives'
import { useGlobal } from '@/composables/useGlobal'
import type { FieldContextType } from '@/composables/useFieldContext'
import { usePartsCollectionField } from '@/composables/admin/usePartsCollectionField'
import type { GlobalEntityKey } from '@/constants/entities'
import { usePartInstanceMetadataPreload } from '@/composables/admin/usePartInstanceMetadataPreload'
import { usePartInstanceDeletion } from '@/composables/admin/usePartInstanceDeletion'
import { usePartInstanceExpansion } from '@/composables/admin/usePartInstanceExpansion'
import type { FieldMetadataEntry } from '@/types/entityMetadata'

interface Props {
  fieldContext: FieldContextType<GlobalEntityKey, GlobalFieldKey<GlobalEntityKey>>
}

const props = defineProps<Props>()

// Use composable for partsCollection field logic
const partsCollectionField = usePartsCollectionField(props.fieldContext)

// Extract parent entity and optionsFieldKey from composable
const { parentEntity, optionsFieldKey } = partsCollectionField

const { globalData } = useGlobal()

const model = usePartInstanceCollection(
  computed(() => {
    const parent = parentEntity.value
    if (!parent) return ''
    return parent.id
  }),
  optionsFieldKey
)
const {
  validPartShapes,
  existingPartInstances,
  getPartInstanceForShape,
  getPartShapeName,
  blockInstance,
  shouldShowPartInstances,
  bulkEditMode: bulkEditModeRef,
  bulkEditData,
  toggleBulkEditMode,
  applyPartInstanceBulkEdit,
  handleBulkEditModalUpdate,
  handleBulkEditConfirm,
  expandedPartInstances,
  isPanelExpanded,
  // Inline creation - now uses EntityCard with isNew
  expandedPlaceholders,
  getNewPartInstanceEntity,
  handleNewPartInstanceSaved,
  handleNewPartInstanceCancelled,
} = model

// FIX: Computed property to check if bulkEditData has values, avoiding type narrowing issues
const hasBulkEditData = computed(() => Object.keys(bulkEditData.value).length > 0)

// LEARNING: Get PartShape ID for bulk edit (from first partInstance)
// WHY: For bulk edit across multiple part instances, we use the partShape from the first partInstance
// PATTERN: Computed property that finds partShape ID from first existing partInstance
// LEARNING: Fetch field metadata for bulk edit using unified system
// WHY: Need to check which fields have bulkEdit: true
// PATTERN: Use useEntityMetadata with PartShape entity
const partShapeForBulkEdit = computed(() => {
  const partInstance = existingPartInstances.value[0]
  if (!partInstance?.partShapeRef) return null
  return globalData.value?.entities?.partShape?.find(
    ps => String(ps.id) === String(partInstance.partShapeRef)
  ) as import('@/types/entities').PartShapeEntity | undefined || null
})

const { fieldMetadata: bulkEditFieldMetadata } = useEntityMetadata(
  'partShape',
  partShapeForBulkEdit
)

/**
 * LEARNING: Store EntityCard refs for accessing exposed properties
 * WHY: Need to access EntityCard's form instance and readiness state (for other purposes, not field rendering)
 * PATTERN: Map of partInstance ID to EntityCard component instance, similar to InstancesTab
 * NOTE: EntityCard handles all field rendering declaratively based on metadata
 */
/**
 * LEARNING: EntityCard is now self-contained
 * WHY: EntityCard wraps itself in VExpansionPanel and renders its own titleRow fields
 * PATTERN: No need for refs or titleRowRenderMap - EntityCard handles everything internally
 */


/**
 * LEARNING: Computed wrapper for bulk edit modal state
 * WHY: Ensures reactivity when bulkEditMode changes
 * PATTERN: Computed property that reads from ref
 */
const isBulkEditModalOpen = computed(() => bulkEditModeRef.value)


/**
 * LEARNING: Use part instance deletion composable
 * WHY: Deletion handler moved to composable
 */
const { handleDeletePartInstance } = usePartInstanceDeletion()

/**
 * LEARNING: Use part instance expansion composable
 * WHY: Expansion toggle logic moved to composable
 */
const { togglePartInstanceExpansion } = usePartInstanceExpansion({ expandedPartInstances })

/**
 * LEARNING: Expose bulk edit state and functions to parent
 * WHY: Parent component (EntityCardSubPanels) needs to render bulk edit button in panel title
 * PATTERN: defineExpose to expose reactive state and functions
 */
defineExpose({
  bulkEditMode: bulkEditModeRef,
  toggleBulkEditMode
})
</script>

<style scoped>
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
