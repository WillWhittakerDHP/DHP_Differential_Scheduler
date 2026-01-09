<template>
  <div :class="className" :style="style">
    <!-- Content area -->
    <div class="nested-collection-content">
      <!-- Available slot placeholders -->
      <div v-if="availableSlots.length > 0" class="available-slots">
        <div
          v-for="slot in availableSlots"
          :key="slot.relationshipId"
          class="slot-placeholder"
          @click="handleAddSlot(slot)"
        >
          <div class="slot-name">{{ slot.displayName }}</div>
          <div class="slot-description">{{ slot.description }}</div>
          <div class="slot-action">Click to add</div>
        </div>
      </div>
      
      <!-- Actual entities -->
      <div v-if="filteredChildEntities.length > 0" class="child-entities">
        <VChip
          v-for="child in filteredChildEntities"
          :key="child.id"
          class="child-entity-chip"
          @click="handleEditEntity(child)"
        >
          {{ getDisplayName(child) }}
        </VChip>
      </div>
      
      <!-- Empty state -->
      <div
        v-else-if="availableSlots.length === 0"
        class="empty-state"
      >
        No {{ childEntityKey }} entities found
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * LEARNING: NestedCollection component renders child entities within a parent instance
 * 
 * WHY: Displays filtered child collections (e.g., partInstances within blockInstance)
 *      Shows available slots for adding new entities
 *      Provides add/remove functionality
 * 
 * PATTERN: Filters child entities by parent relationship
 *          Calculates available slots based on parent type's valid options
 *          Uses GenericCollection for entity rendering (when available)
 * 
 * COMPARISON: React uses GenericCollection. Vue will use same pattern once GenericCollection is ported
 */

import { computed } from 'vue'
import { VChip } from 'vuetify/components'
import type { GlobalEntityKey } from '../../../../constants/entities'
import type { GlobalEntity } from '../../../../types/entities'
import { useAdmin } from '@/composables/useAdmin'
import { createLogger } from '@/utils/logger'
import { getEntityFieldValue } from '@/utils/entities/entityFieldAccess'
import { isDevModeEnabled } from '@/utils/env/devMode'

interface Props {
  childEntityKey: GlobalEntityKey
  parentEntity: GlobalEntity<GlobalEntityKey>
  getChildParentId: (child: GlobalEntity<GlobalEntityKey>) => string
  getParentId: (parent: GlobalEntity<GlobalEntityKey>) => string
  defaultExpanded?: boolean
  className?: string
  style?: Record<string, string | number>
}

const props = withDefaults(defineProps<Props>(), {
  defaultExpanded: false,
  className: '',
  style: () => ({})
})

/**
 * LEARNING: Emit events for parent communication
 * WHY: Allows parent component to handle add slot actions (e.g., open dialog)
 * PATTERN: defineEmits with TypeScript interface
 */
interface Emits {
  (e: 'add-slot', slot: { relationshipId: string; relationshipType: string; displayName: string }): void
  (e: 'edit-entity', entity: GlobalEntity<GlobalEntityKey>): void
}

const emit = defineEmits<Emits>()

// LEARNING: Use admin composable to get entities
// WHY: Need to filter child entities from all available entities
// PATTERN: Use admin store getEntitiesByKey
const adminComp = useAdmin()
const logger = createLogger('NestedCollection')

// LEARNING: Get all child entities
// WHY: Need all entities to filter by parent relationship
// PATTERN: Get entities by childEntityKey
const allChildEntities = computed(() => {
  return adminComp.getEntitiesByKey(props.childEntityKey)
})

// LEARNING: Filter child entities by parent relationship
// WHY: Only show child entities that belong to this parent
// PATTERN: Filter using getChildParentId and getParentId functions
const filteredChildEntities = computed(() => {
  const parentId = props.getParentId(props.parentEntity)
  
  return allChildEntities.value.filter(child => {
    const childParentId = props.getChildParentId(child)
    return childParentId === parentId
  })
})

// LEARNING: Calculate available slots for nested collections
// WHY: Shows which types can still be added (e.g., partShapes not yet used)
// PATTERN: Only calculate for partInstance children, check blockShape.validConstituents
const availableSlots = computed(() => {
  // Only calculate for specific entity types that support this
  if (props.childEntityKey !== 'partInstance') {
    return []
  }

  try {
    // Get parent's block type to access validConstituents
    const blockShapeRef = getEntityFieldValue(props.parentEntity, 'blockShapeRef')
    if (!blockShapeRef) {
      return []
    }

    const blockShape = adminComp.getEntity('blockShape', String(blockShapeRef))
    if (!blockShape) {
      return []
    }

    // Get valid constituents from blockShape
    const validConstituents = getEntityFieldValue(blockShape, 'validConstituents')
    if (!Array.isArray(validConstituents) || validConstituents.length === 0) {
      return []
    }

    // Get current child types to exclude them from available options
    const currentChildTypes = filteredChildEntities.value.map(child => {
      const partShapeRef = getEntityFieldValue(child, 'partShapeRef')
      return typeof partShapeRef === 'string' ? partShapeRef : undefined
    }).filter((ref): ref is string => Boolean(ref))

    // Return valid options that aren't already used
    const availablePartTypes = validConstituents.filter((partShapeId: string) => 
      !currentChildTypes.includes(partShapeId)
    )

    // Convert to slot format
    return availablePartTypes.map((partShapeId: string) => {
      const partShape = adminComp.getEntity('partShape', partShapeId)
      const partShapeName = partShape ? (partShape.name || partShapeId) : partShapeId
      
      return {
        relationshipId: partShapeId,
        displayName: partShapeName,
        description: `Add a ${partShapeName} profile`,
        relationshipType: 'partShapeRef'
      }
    })
  } catch (error) {
    logger.warn('Error calculating available slots', error)
    return []
  }
})

// LEARNING: Get display name for child entity
// WHY: For partInstances, show partShape name instead of partInstance name for cleaner display
// PATTERN: Check entity type and return appropriate display name
const getDisplayName = (child: GlobalEntity<GlobalEntityKey>): string => {
  // LEARNING: For partInstances, display partShape name instead of partInstance name
  // WHY: User wants to see partShape name in nested collection, but keep full name in modal for copying
  // PATTERN: Get partShape from partInstance's partShapeRef and return partShape name
  if (props.childEntityKey === 'partInstance' && child.entityKey === 'partInstance') {
    const partShapeRef = getEntityFieldValue(child, 'partShapeRef')
    if (!partShapeRef) return child.name || child.id

    const partShape = adminComp.getEntity('partShape', String(partShapeRef))
    if (partShape?.name) {
      return partShape.name
    }
  }
  
  // Default: return entity name or ID
  return child.name || child.id
}

// LEARNING: Handle editing an entity
// WHY: Opens edit dialog when user clicks on an entity in the nested collection
// PATTERN: Emit event with entity data, parent component handles dialog opening
const handleEditEntity = (entity: GlobalEntity<GlobalEntityKey>) => {
  emit('edit-entity', entity)
}

// LEARNING: Handle adding a new slot
// WHY: Emits event to parent component to open add modal with pre-populated type
// PATTERN: Emit event with slot data, parent component handles dialog opening
const handleAddSlot = (slot: { relationshipId: string; relationshipType: string; displayName: string }) => {
  if (isDevModeEnabled()) {
    logger.debug('Add slot clicked', {
      slot,
      childEntityKey: props.childEntityKey,
      parentEntity: props.parentEntity
    })
  }
  // LEARNING: Emit event to parent component
  // WHY: Parent component (NestedCollectionField) will handle opening the dialog
  // PATTERN: Emit event with slot data containing relationshipId and relationshipType
  emit('add-slot', {
    relationshipId: slot.relationshipId,
    relationshipType: slot.relationshipType,
    displayName: slot.displayName
  })
}
</script>

<style scoped>
.nested-collection-content {
  padding-left: 16px;
  border-left: 2px solid rgba(var(--v-theme-outline), 0.2);
}

.available-slots {
  margin-bottom: 16px;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 8px;
}

.slot-placeholder {
  padding: 12px;
  background-color: rgba(var(--v-theme-surface-variant), 0.3);
  border: 2px dashed rgba(var(--v-theme-outline), 0.4);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.slot-placeholder:hover {
  background-color: rgba(var(--v-theme-surface-variant), 0.5);
  border-color: rgba(var(--v-theme-outline), 0.6);
}

.slot-name {
  font-weight: 600;
  color: rgba(var(--v-theme-on-surface), 0.87);
  margin-bottom: 4px;
}

.slot-description {
  font-size: 12px;
  color: rgba(var(--v-theme-on-surface), 0.6);
  margin-bottom: 4px;
}

.slot-action {
  font-size: 11px;
  color: rgba(var(--v-theme-on-surface), 0.7);
  font-style: italic;
}

.child-entities {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 8px;
}

/* LEARNING: Style child entity chips to match Vuetify chip styling from SelectInputs */
/* WHY: Ensures consistent appearance with other chips/buttons in the admin interface */
/* PATTERN: Match SelectInputs chip styling pattern (lines 1485-1494) */
.child-entity-chip {
  background-color: rgba(var(--v-theme-surface-variant), 0.5) !important;
  border: 1px solid rgba(var(--v-theme-outline), 0.3) !important;
  border-radius: 4px !important;
  padding: 2px 8px !important;
  margin: 2px !important;
  font-size: 12px !important;
  height: auto !important;
  min-height: 24px !important;
  cursor: pointer !important;
  transition: all 0.2s !important;
}

.child-entity-chip:hover {
  background-color: rgba(var(--v-theme-surface-variant), 0.7) !important;
  border-color: rgba(var(--v-theme-outline), 0.5) !important;
}

.empty-state {
  padding: 20px;
  text-align: center;
  background-color: rgba(var(--v-theme-surface-variant), 0.3);
  border: 2px dashed rgba(var(--v-theme-outline), 0.4);
  border-radius: 6px;
  color: rgba(var(--v-theme-on-surface), 0.6);
  font-size: 14px;
}
</style>

