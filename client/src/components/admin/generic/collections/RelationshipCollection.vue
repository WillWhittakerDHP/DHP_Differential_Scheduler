<!--
  LEARNING: RelationshipCollection component - generic collection component for parts, annotations, events
  WHY: Unified component pattern for all relationship collections
  PATTERN: Generic rendering of EntityCard with collectionType prop for customization
-->
<template>
  <div v-if="shouldShow && parentEntity" :class="collectionClass">
    <!--
      LEARNING: Bulk Edit Modal (optional, only for parts)
      WHY: Modal for bulk editing entities - only parts collection supports this currently
      PATTERN: Conditional rendering based on collectionType and bulkEditMode availability
    -->
    <component
      v-if="collectionType === 'parts' && bulkEditModalComponent && bulkEditMode !== undefined"
      :is="bulkEditModalComponent"
      :model-value="isBulkEditModalOpen"
      :block-instance-id="parentEntity.id"
      :bulk-edit-data="hasBulkEditData ? bulkEditData : undefined"
      :instance-count="existingChildren.length"
      @update:model-value="handleBulkEditModalUpdate"
      @confirm="handleBulkEditConfirm"
    />
    
    <!--
      LEARNING: Render existing children for each valid shape
      WHY: Shows all valid shapes with EntityCard for both existing and new children
      PATTERN: Loop through validShapes, use EntityCard with appropriate props
      FIX: VExpansionPanels must be OUTSIDE v-for to avoid group context issues
    -->
    <VExpansionPanels
      v-model="expandedChildren"
      multiple
    >
      <template
        v-for="shape in validShapes"
        :key="String(shape.id)"
      >
        <!-- Existing child entity -->
        <EntityCard
          v-if="getChildForShape(String(shape.id))"
          :key="String(getChildForShape(String(shape.id))!.id)"
          :entity-key="childEntityKey"
          :entity="getChildForShape(String(shape.id))!"
          :expanded="isPanelExpanded(String(getChildForShape(String(shape.id))!.id))"
          @delete="handleDeleteChild"
        />
      </template>
    </VExpansionPanels>

    <!-- Placeholder cards for new children -->
    <VExpansionPanels
      v-model="expandedPlaceholders"
      multiple
    >
      <template
        v-for="shape in validShapes"
        :key="`placeholder-${String(shape.id)}`"
      >
        <VExpansionPanel
          v-if="!getChildForShape(String(shape.id))"
          :value="String(shape.id)"
          :class="placeholderCardClass"
        >
          <template #title>
            <div class="d-flex align-center gap-2 flex-grow-1">
              <VIcon icon="tabler-plus" size="small" class="text-primary" />
              <span>{{ getShapeName(String(shape.id)) }}</span>
              <span class="text-caption text-medium-emphasis ml-2">{{ placeholderText }}</span>
            </div>
          </template>
          
          <template #text>
            <!-- LEARNING: EntityCard with isNew=true for creation -->
            <!-- WHY: Same component handles both create and edit - config drives fields -->
            <!-- PATTERN: Pass temporary entity with new-{id} prefix, EntityCard handles the rest -->
            <EntityCard
              :entity-key="childEntityKey"
              :entity="getNewChildEntity(String(shape.id))"
              :expanded="true"
              :is-new="true"
              :use-expansion-panel="false"
              @saved="(entity) => handleNewChildSaved(String(shape.id), entity as GlobalEntity<GlobalEntityKey>)"
              @cancelled="handleNewChildCancelled(String(shape.id))"
            />
          </template>
        </VExpansionPanel>
      </template>
    </VExpansionPanels>
    
    <!--
      LEARNING: Empty state when no valid shapes exist
      WHY: Provides feedback when parent type has no valid options configured
      PATTERN: Conditional rendering with v-if
    -->
    <VAlert
      v-if="validShapes.length === 0"
      type="info"
      variant="tonal"
      class="mt-2"
    >
      {{ emptyStateMessage }}
    </VAlert>
  </div>
</template>

<script setup lang="ts">
/**
 * LEARNING: RelationshipCollection component - generic for all collection types
 * 
 * WHY: Renders relationship collections (parts, annotations, events) within a parent entity
 *      Uses EntityCard directly, matching the pattern used by InstancesTab
 * 
 * PATTERN: Generic rendering of EntityCard component, exposes bulk edit state to parent (when applicable)
 */

import { computed } from 'vue'
import EntityCard from '../EntityCard.vue'
import { useRelationshipCollection } from '@/composables/admin/useRelationshipCollection'
import type { GlobalFieldKey } from '@/constants/primitives'
import type { FieldContextType } from '@/composables/useFieldContext'
import { useRelationshipCollectionField } from '@/composables/admin/useRelationshipCollectionField'
import type { GlobalEntityKey } from '@/constants/entities'
import type { GlobalEntity } from '@/types/entities'
import { useRelationshipCrud } from '@/composables/useRelationship'
import { useQueryClient } from '@tanstack/vue-query'
import { useNotification } from '@/composables/useNotification'

/**
 * Collection type for customization
 */
export type CollectionType = 'parts' | 'annotations' | 'events'

interface Props {
  fieldContext: FieldContextType<GlobalEntityKey, GlobalFieldKey<GlobalEntityKey>>
  collectionType?: CollectionType
  /**
   * Optional bulk edit modal component (only used for parts currently)
   */
  bulkEditModalComponent?: any
  /**
   * Optional name generator function
   */
  nameGenerator?: (
    parentName: string,
    shapeName: string,
    parentId: string,
    shapeId: string,
    existingChildren: GlobalEntity<GlobalEntityKey>[]
  ) => string
}

const props = withDefaults(defineProps<Props>(), {
  collectionType: 'parts'
})

// Use composable for relationshipCollection field logic
const fieldConfig = useRelationshipCollectionField(props.fieldContext)

// Extract parent entity and config from composable
const { parentEntity, childEntityKey, relationshipKey, optionsFieldKey } = fieldConfig

// Determine collection type from fieldKey if not provided
const effectiveCollectionType = computed<CollectionType>(() => {
  if (props.collectionType) return props.collectionType
  const fieldKey = String(props.fieldContext.fieldKey)
  if (fieldKey.includes('annotation')) return 'annotations'
  if (fieldKey.includes('event')) return 'events'
  return 'parts' // default
})

// Use generic collection composable
const collectionModel = useRelationshipCollection({
  fieldContext: props.fieldContext,
  nameGenerator: props.nameGenerator,
  enableBulkEdit: effectiveCollectionType.value === 'parts',
  // TODO: Add bulk edit composable when needed for parts
  // bulkEditComposable: () => usePartInstanceBulkEdit({ ... })
})

const {
  validShapes,
  existingChildren,
  getChildForShape,
  getShapeName,
  parentEntity: parentEntityFromModel,
  shouldShow,
  expandedPlaceholders,
  getNewChildEntity,
  handleNewChildSaved,
  handleNewChildCancelled,
  expandedChildren,
  isPanelExpanded,
  bulkEditMode,
  bulkEditData,
  toggleBulkEditMode,
  handleBulkEditModalUpdate,
  handleBulkEditConfirm
} = collectionModel

// Use parentEntity from field config (more reliable)
const effectiveParentEntity = parentEntity

// Computed properties for UI customization
const collectionClass = computed(() => {
  return `${effectiveCollectionType.value}-collection-list`
})

const placeholderCardClass = computed(() => {
  return `add-${effectiveCollectionType.value.slice(0, -1)}-card` // Remove 's' from end
})

const placeholderText = computed(() => {
  const typeMap: Record<CollectionType, string> = {
    parts: 'Click to create part instance',
    annotations: 'Click to create annotation instance',
    events: 'Click to create event instance'
  }
  return typeMap[effectiveCollectionType.value]
})

const emptyStateMessage = computed(() => {
  const typeMap: Record<CollectionType, string> = {
    parts: 'No valid PartShapes configured for this BlockShape. Configure validParts on the BlockShape to add PartInstances.',
    annotations: 'No valid AnnotationShapes configured for this BlockShape. Configure validAnnotations on the BlockShape to add AnnotationInstances.',
    events: `No valid ${effectiveCollectionType.value === 'events' ? 'EventShapes' : 'Shapes'} configured. Configure valid options to add instances.`
  }
  return typeMap[effectiveCollectionType.value]
})

// Bulk edit state
const hasBulkEditData = computed(() => {
  if (!bulkEditData) return false
  return Object.keys(bulkEditData.value).length > 0
})

const isBulkEditModalOpen = computed(() => {
  return bulkEditMode?.value ?? false
})

// Deletion handler
const queryClient = useQueryClient()
const { error: notifyError } = useNotification()
const relationshipCrud = useRelationshipCrud(relationshipKey.value)
const { relationships, remove: removeRelationship } = relationshipCrud

const handleDeleteChild = async (entity: GlobalEntity<GlobalEntityKey>) => {
  if (!effectiveParentEntity.value) return
  
  try {
    // Find and remove the relationship
    const relationship = relationships.value?.find(
      rel => String(rel.parent_id) === effectiveParentEntity.value!.id && 
             String(rel.child_id) === entity.id
    )
    
    if (relationship) {
      await removeRelationship(relationship.id)
      
      // Invalidate queries to refresh data
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: [props.fieldContext.entityKey] }),
        queryClient.invalidateQueries({ queryKey: [childEntityKey.value] }),
        queryClient.invalidateQueries({ queryKey: [relationshipKey.value] }),
        queryClient.invalidateQueries({ queryKey: ['globalData'] }),
      ])
    }
  } catch (error) {
    notifyError(`Failed to remove ${childEntityKey.value}`)
  }
}

/**
 * LEARNING: Expose bulk edit state and functions to parent (when applicable)
 * WHY: Parent component (EntityCardSubPanels) needs to render bulk edit button in panel title
 * PATTERN: defineExpose to expose reactive state and functions
 */
defineExpose({
  bulkEditMode,
  toggleBulkEditMode
})
</script>

<style scoped>
.parts-collection-list,
.annotations-collection-list,
.events-collection-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.add-part-card,
.add-annotation-card,
.add-event-card {
  opacity: 0.85;
  transition: opacity 0.2s;
  border-style: dashed !important;
}

.add-part-card:hover,
.add-annotation-card:hover,
.add-event-card:hover {
  opacity: 1;
}
</style>
