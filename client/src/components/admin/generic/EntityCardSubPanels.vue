<script setup lang="ts">
/**
 * LEARNING: Entity Card Sub Panels Component
 * WHY: Renders expansion panels for Parts, Relationships, and Annotations with truncated summaries
 * PATTERN: Config-driven sub panels with computed summary badges showing truncated lists + counts
 * 
 * Panel Title Format: "Parts: PartName1, PartName2 +X more" or "Parts" if empty
 */
import { computed } from 'vue'
import InputRenderer from './fields/InputRenderer.vue'
import type { GlobalEntity } from '@/types/entities'
import type { GlobalEntityKey } from '@/constants/entities'
import type { GlobalFieldKey } from '@/constants/primitives'
import type { FormContext } from 'vee-validate'
import { useEntityCrud } from '@/composables/useEntity'
import type { FieldContextType } from '@/composables/useFieldContext'

interface SubPanelFields {
  parts: Array<GlobalFieldKey<GlobalEntityKey>>
  relationships: Array<GlobalFieldKey<GlobalEntityKey>>
  annotations: Array<GlobalFieldKey<GlobalEntityKey>>
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

/**
 * LEARNING: Get BlockShape name for relationship labels
 * WHY: Relationship summaries should show "{BlockShape} Components" format
 * PATTERN: Look up BlockShape by ref and return name
 */
const blockShapeName = computed((): string => {
  if (props.entityKey !== 'blockInstance') return ''
  const entity = props.entity as GlobalEntity<'blockInstance'>
  const blockShape = blockShapes.value.find(bs => bs.id === entity.blockShapeRef)
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

/**
 * LEARNING: Get names for entity IDs from the appropriate store
 * WHY: Relationship fields store entity IDs, we need to resolve to names
 * PATTERN: Look up entities by ID and extract name field
 */
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
  // For blockInstance, parts come from activeConstituents (part instances that are components)
  // For other entities, parts might be empty
  if (props.entityKey !== 'blockInstance') return ''
  
  const activeConstituents = props.form.values.activeConstituents
  if (!Array.isArray(activeConstituents) || activeConstituents.length === 0) return ''
  
  // activeConstituents are blockInstance IDs that are components of this instance
  const names = getEntityNames(activeConstituents, 'blockInstance')
  return formatTruncatedList(names)
})

/**
 * LEARNING: Computed summary for Relationships panel
 * WHY: Shows preview of relationship types (not instance names)
 * PATTERN: Show relationship type labels like "Booking Cascades, {BlockShape} Components"
 */
const relationshipsSummary = computed((): string => {
  const formValues = props.form.values
  const relationshipTypes: string[] = []
  
  // Collect relationship type labels based on entity type
  if (props.entityKey === 'blockInstance') {
    const cascades = Array.isArray(formValues.bookingCascades) ? formValues.bookingCascades : []
    const components = Array.isArray(formValues.instanceComponents) ? formValues.instanceComponents : []
    const dependentOptions = Array.isArray(formValues.dependentInstanceOptions) ? formValues.dependentInstanceOptions : []
    
    // Add relationship type labels if they have values
    if (cascades.length > 0) {
      relationshipTypes.push('Booking Cascades')
    }
    if (components.length > 0) {
      relationshipTypes.push(`${blockShapeName.value} Components`)
    }
    if (dependentOptions.length > 0) {
      relationshipTypes.push(`Dependent ${blockShapeName.value} Options`)
    }
  } else if (props.entityKey === 'blockShape') {
    const cascades = Array.isArray(formValues.validCascades) ? formValues.validCascades : []
    const constituents = Array.isArray(formValues.validConstituents) ? formValues.validConstituents : []
    
    if (cascades.length > 0) {
      relationshipTypes.push('Valid Cascades')
    }
    if (constituents.length > 0) {
      relationshipTypes.push('Valid Part Shapes')
    }
  }
  
  return formatTruncatedList(relationshipTypes)
})

// NOTE: Annotation summary removed per user request - no annotation chips in panel title
</script>

<template>
  <VExpansionPanels
    v-if="subPanelFields.parts.length || subPanelFields.relationships.length || subPanelFields.annotations.length"
    multiple
    class="mt-4"
  >
    <!-- LEARNING: Parts Panel with truncated summary -->
    <!-- WHY: Shows preview of constituent parts in panel title -->
    <!-- PATTERN: "Parts: Name1, Name2 +X more" format -->
    <VExpansionPanel v-if="subPanelFields.parts.length" value="parts">
      <template #title>
        <span class="font-weight-medium">Parts</span>
        <span v-if="partsSummary" class="ml-2 text-medium-emphasis text-body-2">
          {{ partsSummary }}
        </span>
      </template>
      <template #text>
        <div v-for="fieldKey in subPanelFields.parts" :key="fieldKey" class="mb-4">
          <InputRenderer
            :field-context="props.getFieldContext(fieldKey)!"
            :show-label="true"
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
          <InputRenderer
            :field-context="props.getFieldContext(fieldKey)!"
            :show-label="true"
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
          <InputRenderer
            :field-context="props.getFieldContext(fieldKey)!"
            :show-label="false"
          />
        </div>
      </template>
    </VExpansionPanel>
  </VExpansionPanels>
</template>

