<script setup lang="ts">
/**
 * LEARNING: Entity Card Sub Panels Component
 * WHY: Renders expansion panels for Parts, Relationships, and Annotations with truncated summaries
 * PATTERN: Config-driven sub panels with computed summary badges showing truncated lists + counts
 * 
 * Panel Title Format: "Parts: PartName1, PartName2 +X more" or "Parts" if empty
 */
import { computed, ref, watch, nextTick } from 'vue'
import FieldRenderer from './fields/FieldRenderer.vue'
import PartsCollection from './collections/PartsCollection.vue'
import RelationshipCollection from './collections/RelationshipCollection.vue'
import type { GlobalEntity } from '@/types/entities'
import type { GlobalEntityKey } from '@/constants/entities'
import type { GlobalFieldKey } from '@/constants/primitives'
import type { FormContext } from 'vee-validate'
import { useEntityCrud } from '@/composables/useEntity'
import type { FieldContextType } from '@/composables/useFieldContext'
import type { FieldMetadataEntry } from '@/types/entityMetadata'
import { getFieldComponent } from '@/utils/forms/fieldComponentDispatcher'

interface SubPanelFields {
  parts: Array<GlobalFieldKey<GlobalEntityKey>>
  relationships: Array<GlobalFieldKey<GlobalEntityKey>>
  annotations: Array<GlobalFieldKey<GlobalEntityKey>>
  events: Array<GlobalFieldKey<GlobalEntityKey>>
}

interface Props {
  entityKey: GlobalEntityKey
  entityId: string
  entity: GlobalEntity<GlobalEntityKey>
  form: FormContext
  subPanelFields: SubPanelFields
  getFieldContext: (
    fieldKey: GlobalFieldKey<GlobalEntityKey>
  ) => FieldContextType<GlobalEntityKey, GlobalFieldKey<GlobalEntityKey>> | undefined
  /**
   * LEARNING: Optional pre-fetched field metadata
   * WHY: Avoids duplicate metadata fetches when parent component already has metadata
   * PATTERN: Pass metadata from EntityCard to avoid re-fetching in FieldRenderer
   */
  fieldMetadata?: Record<string, FieldMetadataEntry>
}

const props = defineProps<Props>()

/**
 * LEARNING: Access entity stores to look up names by ID
 * WHY: Form values contain entity IDs, we need to resolve them to display names
 * PATTERN: Use useEntityCrud to access entities computed from global data
 */
const { entities: blockInstances } = useEntityCrud('blockInstance')
const { entities: partInstances } = useEntityCrud('partInstance')
const { entities: blockShapes } = useEntityCrud('blockShape')

const blockShapeName = computed((): string => {
  if (props.entityKey !== 'blockInstance') return ''
  const entity = props.entity as GlobalEntity<'blockInstance'>
  const blockShape = blockShapes.value.find(bs => String(bs.id) === String(entity.blockShapeRef))
  return blockShape?.name || 'Block'
})

/**
 * LEARNING: Maximum items to show before truncating
 * WHY: Keep panel titles concise while still providing useful preview
 * PATTERN: Configurable constant for truncation threshold
 */
const MAX_DISPLAY_ITEMS = 2

/**
 * LEARNING: Helper to format truncated list with count
 * WHY: Provides consistent "Item1, Item2 +X more" format across all panels
 * PATTERN: Pure function that handles empty, partial, and full lists
 */
function formatTruncatedList(items: string[], maxDisplay: number = MAX_DISPLAY_ITEMS): string {
  if (items.length === 0) return ''
  
  const displayItems = items.slice(0, maxDisplay)
  const remaining = items.length - maxDisplay
  
  if (remaining <= 0) {
    return displayItems.join(', ')
  }
  
  return `${displayItems.join(', ')} +${remaining} more`
}

function getEntityNames(ids: unknown[], entityType: 'blockInstance' | 'partInstance'): string[] {
  if (!Array.isArray(ids)) return []
  
  const entities = entityType === 'blockInstance' ? blockInstances.value : partInstances.value
  
  return ids
    .map(id => {
      const entity = entities.find(e => e.id === id)
      return entity?.name || null
    })
    .filter((name): name is string => name !== null)
}

/**
 * LEARNING: Computed summary for Parts panel
 * WHY: Shows preview of part instances attached to this entity
 * PATTERN: Extract IDs from form values, resolve to names, format as truncated list
 */
const partsSummary = computed((): string => {
  if (props.entityKey !== 'blockInstance') return ''
  
  const partAssignments = props.form.values.partAssignments
  if (!Array.isArray(partAssignments) || partAssignments.length === 0) return ''
  
  const names = getEntityNames(partAssignments, 'partInstance')
  return formatTruncatedList(names)
})

  /**
   * LEARNING: Check if a field is relationshipCollection based on metadata
   * WHY: Need to determine if field should render RelationshipCollection directly (for bulk edit access) or FieldRenderer
   * PATTERN: Use getFieldComponent() as single source of truth for component type determination
   */
function isRelationshipCollectionField(fieldKey: GlobalFieldKey<GlobalEntityKey>): boolean {
  if (!props.fieldMetadata) return false
  
  const fieldMeta = props.fieldMetadata[String(fieldKey)]
  if (!fieldMeta) return false
  
  // LEARNING: Use getFieldComponent() as single source of truth
  // PATTERN: Check component type from dispatcher instead of duplicating logic
  const componentType = getFieldComponent(props.entityKey, fieldKey, fieldMeta)
  return componentType.type === 'relationshipCollection'
}

// PATTERN: Type as array to match Vue 3 behavior, access first element when needed
const partsCollectionRef = ref<(InstanceType<typeof RelationshipCollection> | null)[] | InstanceType<typeof RelationshipCollection> | null>(null)

const expandedPanels = ref<string[]>([])

const getRelationshipCollectionInstance = (): InstanceType<typeof RelationshipCollection> | null => {
  const refValue = partsCollectionRef.value
  if (!refValue) return null
  if (Array.isArray(refValue)) {
    return refValue[0] ?? null
  }
  return refValue
}

// LEARNING: bulkEditMode is exposed as a Ref<boolean>
const partsBulkEditMode = computed(() => {
  const instance = getRelationshipCollectionInstance()
  // PATTERN: Check if bulkEditMode exists and has a value property (is a Ref)
  if (instance?.bulkEditMode && typeof instance.bulkEditMode === 'object' && 'value' in instance.bulkEditMode) {
    return (instance.bulkEditMode as { value: boolean }).value
  }
  return false
})

const togglePartsBulkEditMode = () => {
  // FIX: Expand panel first if not expanded, then toggle bulk edit mode
  // PATTERN: Ensure panel is expanded, wait for nextTick for component to mount, then toggle
  if (!expandedPanels.value.includes('parts')) {
    expandedPanels.value.push('parts')
    nextTick(() => {
      const instance = getRelationshipCollectionInstance()
      if (instance && typeof instance.toggleBulkEditMode === 'function') {
        instance.toggleBulkEditMode()
      }
    })
  } else {
    const instance = getRelationshipCollectionInstance()
    if (instance && typeof instance.toggleBulkEditMode === 'function') {
      instance.toggleBulkEditMode()
    }
  }
}

watch(partsBulkEditMode, (isEnabled) => {
  if (isEnabled && !expandedPanels.value.includes('parts')) {
    expandedPanels.value.push('parts')
  }
})

/**
 * LEARNING: Computed summary for Relationships panel
 * WHY: Shows preview of relationship types (not instance names)
 * PATTERN: Show relationship type labels like "Booking Cascades, {BlockShape} Components"
 */
const relationshipsSummary = computed((): string => {
  const formValues = props.form.values
  const relationshipTypes: string[] = []
  
  if (props.entityKey === 'blockInstance') {
    const cascades = Array.isArray(formValues.bookingCascades) ? formValues.bookingCascades : []
    const components = Array.isArray(formValues.instanceComponents) ? formValues.instanceComponents : []
    const dependentInstances = Array.isArray(formValues.dependentInstances) ? formValues.dependentInstances : []
    
    if (cascades.length > 0) {
      relationshipTypes.push('Booking Cascades')
    }
    if (components.length > 0) {
      relationshipTypes.push(`${blockShapeName.value} Components`)
    }
    if (dependentInstances.length > 0) {
      relationshipTypes.push(`Dependent ${blockShapeName.value} Instances`)
    }
  } else if (props.entityKey === 'blockShape') {
    const cascades = Array.isArray(formValues.validCascades) ? formValues.validCascades : []
    const parts = Array.isArray(formValues.validParts) ? formValues.validParts : []
    
    if (cascades.length > 0) {
      relationshipTypes.push('Valid Cascades')
    }
    if (parts.length > 0) {
      relationshipTypes.push('Valid Parts')
    }
  }
  
  return formatTruncatedList(relationshipTypes)
})


</script>

<template>
  <VExpansionPanels
    v-model="expandedPanels"
    v-if="subPanelFields.parts.length || subPanelFields.relationships.length || subPanelFields.annotations.length || subPanelFields.events.length"
    multiple
    class="mt-4"
  >
    <!-- LEARNING: Parts Panel with truncated summary and bulk edit button -->
    <!-- WHY: Shows preview of constituent parts in panel title with bulk edit functionality -->
    <!-- PATTERN: "Parts: Name1, Name2 +X more" format with bulk edit button (similar to InstancesTab) -->
    <VExpansionPanel v-if="subPanelFields.parts.length" value="parts">
      <template #title>
        <div class="d-flex align-center justify-space-between flex-grow-1">
          <div>
            <span class="font-weight-medium">Parts</span>
            <span v-if="partsSummary" class="ml-2 text-medium-emphasis text-body-2">
              {{ partsSummary }}
            </span>
          </div>
          <VBtn
            v-if="props.entityKey === 'blockInstance'"
            :variant="partsBulkEditMode ? 'flat' : 'outlined'"
            :color="partsBulkEditMode ? 'success' : undefined"
            size="small"
            prepend-icon="tabler-edit"
            @click.stop="togglePartsBulkEditMode"
          >
            {{ partsBulkEditMode ? 'Exit Bulk Edit' : 'Bulk Edit' }}
          </VBtn>
        </div>
      </template>
      <template #text>
        <div v-for="fieldKey in subPanelFields.parts" :key="fieldKey" class="mb-4">
          <!-- LEARNING: For relationshipCollection fields that need bulk edit access, render RelationshipCollection directly with ref -->
          <!-- WHY: Bulk edit button in panel title needs access to RelationshipCollection's exposed methods -->
          <!-- PATTERN: Check component type from metadata - if relationshipCollection, render RelationshipCollection with ref; otherwise use FieldRenderer -->
          <RelationshipCollection
            v-if="isRelationshipCollectionField(fieldKey)"
            ref="partsCollectionRef"
            :field-context="props.getFieldContext(fieldKey)!"
            collection-type="parts"
          />
          <FieldRenderer
            v-else
            :field-context="props.getFieldContext(fieldKey)!"
            :show-label="true"
            :field-metadata="props.fieldMetadata"
          />
        </div>
      </template>
    </VExpansionPanel>

    <!-- LEARNING: Relationships Panel with truncated summary -->
    <!-- WHY: Shows preview of related entities in panel title -->
    <!-- PATTERN: "Relationships: Name1, Name2 +X more" format -->
    <VExpansionPanel v-if="subPanelFields.relationships.length" value="relationships">
      <template #title>
        <span class="font-weight-medium">Relationships</span>
        <span v-if="relationshipsSummary" class="ml-2 text-medium-emphasis text-body-2">
          {{ relationshipsSummary }}
        </span>
      </template>
      <template #text>
        <div v-for="fieldKey in subPanelFields.relationships" :key="fieldKey" class="mb-4">
          <FieldRenderer
            :field-context="props.getFieldContext(fieldKey)!"
            :show-label="true"
            :field-metadata="props.fieldMetadata"
          />
        </div>
      </template>
    </VExpansionPanel>

    <!-- LEARNING: Annotations Panel - no summary in title -->
    <!-- WHY: User requested no annotation chips/summary in panel titles -->
    <!-- PATTERN: Simple panel with just "Annotations" label -->
    <VExpansionPanel v-if="subPanelFields.annotations.length" value="annotations">
      <template #title>
        <span class="font-weight-medium">Annotations</span>
      </template>
      <template #text>
        <div v-for="fieldKey in subPanelFields.annotations" :key="fieldKey" class="mb-4">
          <FieldRenderer
            :field-context="props.getFieldContext(fieldKey)!"
            :show-label="false"
          />
        </div>
      </template>
    </VExpansionPanel>

    <!-- LEARNING: Events Panel -->
    <!-- WHY: Shows event instances configured for shapes -->
    <!-- PATTERN: Simple panel with "Events" label -->
    <VExpansionPanel v-if="subPanelFields.events.length" value="events">
      <template #title>
        <span class="font-weight-medium">Events</span>
      </template>
      <template #text>
        <div v-for="fieldKey in subPanelFields.events" :key="fieldKey" class="mb-4">
          <FieldRenderer
            :field-context="props.getFieldContext(fieldKey)!"
            :show-label="true"
            :field-metadata="props.fieldMetadata"
          />
        </div>
      </template>
    </VExpansionPanel>

  </VExpansionPanels>
</template>

