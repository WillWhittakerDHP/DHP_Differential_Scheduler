<!--
  LEARNING: Admin Primitive Metadata Editor
  WHY: Single unified editor for rendering configuration in admin_primitive_metadata
        Renamed from AdminInputMetadataEditor to align with entity data pattern
  PATTERN: Rendering-only editor - only shows rendering configuration fields
-->
<template>
  <div class="admin-primitive-metadata-editor">
    <div class="mb-4">
      <h3 class="text-h6 mb-2">Field Rendering Configuration</h3>
      <p class="text-body-2 text-medium-emphasis">
        Configure field visibility, layout, and rendering for {{ entityTypeLabel }}.
        <span v-if="entityKey === 'blockShape' || entityKey === 'partShape'">
          Changes apply globally to all {{ entityTypeLabel }} entities.
        </span>
      </p>
    </div>

    <!-- Note: error is always null from useEntityMetadata (synchronous metadata) -->

    <div v-if="isLoading" class="text-center pa-4">
      <VProgressCircular indeterminate color="primary" />
      <p class="mt-4 text-body-2">Loading field metadata...</p>
    </div>

    <div v-else-if="draggableFieldKeys.length === 0" class="text-center pa-4">
      <p class="text-body-2 text-medium-emphasis">
        No field metadata found. Fields must be configured in the database.
      </p>
    </div>

    <div v-else class="d-flex flex-column gap-3">
      <VExpansionPanels 
        ref="expansionPanelsRef"
        variant="accordion" 
        class="mb-4"
      >
        <VExpansionPanel
          v-for="(fieldKey, index) in draggableFieldKeys"
          :key="fieldKey || `field-${index}`"
          :data-field-key="fieldKey"
          class="draggable-field-panel"
        >
          <VExpansionPanelTitle v-if="fieldKey">
            <div class="d-flex align-center justify-space-between w-100 pr-4">
              <div class="d-flex flex-column">
                <span class="text-body-1 font-weight-medium">
                  {{ getFieldMetadata(fieldKey)?.label || fieldKey }}
                </span>
                <span class="text-caption text-medium-emphasis">
                  {{ getFieldMetadata(fieldKey)?.dataType }} • 
                  {{ getFieldMetadata(fieldKey)?.isRequired ? 'Required' : 'Optional' }}
                </span>
              </div>
              <VChip
                :color="getEffectiveFieldMetadata(fieldKey)?.statusButtonColor || 'default'"
                size="small"
                variant="flat"
                v-if="getEffectiveFieldMetadata(fieldKey)?.renderAs === 'statusButton'"
              >
                Status Button
              </VChip>
              <VChip
                size="small"
                variant="outlined"
                v-else
              >
                {{ hasMetadataEntry(fieldKey) ? (getEffectiveFieldMetadata(fieldKey)?.visibility ?? 'Not Configured') : 'Not Configured' }}
              </VChip>
            </div>
          </VExpansionPanelTitle>
          <VExpansionPanelText v-if="fieldKey">
            <div class="d-flex flex-column gap-4 pt-2">
              <!-- Rendering fields (editable) -->
              <div class="d-flex flex-column gap-2">
                <p class="text-caption font-weight-medium">Rendering Configuration</p>
                
                <!-- Visibility -->
                <VSelect
                  :model-value="getEffectiveFieldMetadata(fieldKey)?.visibility ?? undefined"
                  :items="visibilityOptions"
                  label="Visibility"
                  density="compact"
                  variant="outlined"
                  placeholder="Not Configured"
                  @update:model-value="(value) => updateFieldRendering(fieldKey, { visibility: value })"
                />
                
                <!-- Layout (only for expandedDirect) -->
                <VSelect
                  v-if="getEffectiveFieldMetadata(fieldKey)?.visibility === 'expandedDirect'"
                  :model-value="getEffectiveFieldMetadata(fieldKey)?.layout ?? undefined"
                  :items="layoutOptions"
                  label="Layout"
                  density="compact"
                  variant="outlined"
                  placeholder="Not Configured"
                  @update:model-value="(value) => updateFieldRendering(fieldKey, { layout: value })"
                />
                
                <!-- Status Button Color (only for booleans and ternary) -->
                <VSelect
                  v-if="getEffectiveFieldMetadata(fieldKey)?.dataType === 'boolean' || getEffectiveFieldMetadata(fieldKey)?.dataType === 'ternary'"
                  :model-value="getEffectiveFieldMetadata(fieldKey)?.statusButtonColor ?? undefined"
                  :items="colorOptions"
                  label="Status Button Color"
                  density="compact"
                  variant="outlined"
                  placeholder="Not Configured"
                  @update:model-value="(value) => updateFieldRendering(fieldKey, { statusButtonColor: value })"
                />
                
                <!-- Input Config (for select/multiselect/reference/relationshipCollection) -->
                <template v-if="hasSelectRenderAs(fieldKey)">
                  <!-- Select Mode (for relationship/property selects) -->
                  <VSelect
                    :model-value="getInputConfigData(fieldKey).selectMode"
                    :items="selectModeOptions"
                    label="Select Mode"
                    density="compact"
                    variant="outlined"
                    placeholder="Select mode"
                    hint="How the select field behaves (single selection, multiple selection, required, or nested)"
                    persistent-hint
                    @update:model-value="(value) => updateInputConfigField(fieldKey, 'selectMode', value)"
                  />
                </template>

                <!-- Bulk Edit -->
                <VCheckbox
                  :model-value="getEffectiveFieldMetadata(fieldKey)?.bulkEdit ?? false"
                  label="Enable Bulk Edit"
                  density="compact"
                  @update:model-value="(value) => updateFieldRendering(fieldKey, { bulkEdit: Boolean(value) })"
                />
              </div>
            </div>
          </VExpansionPanelText>
        </VExpansionPanel>
      </VExpansionPanels>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, reactive, onMounted, onBeforeUnmount, nextTick, type ComponentPublicInstance } from 'vue'
import type { FieldMetadataEntry } from '@/types/entityMetadata'
import { useQueryClient } from '@tanstack/vue-query'
import { useEntityMetadata } from '@/composables/admin/useEntityMetadata'
import { useAdminMetadataMutations } from '@/composables/admin/useAdminMetadataMutations'
import { useMetadataEditorEntity } from '@/composables/admin/useMetadataEditorEntity'
import { useMetadataFieldUpdates } from '@/composables/admin/useMetadataFieldUpdates'
import { useInputConfigEditor } from '@/composables/admin/useInputConfigEditor'
import { useMetadataFieldOrdering } from '@/composables/admin/useMetadataFieldOrdering'
import { getEntityTypeLabel } from '@/utils/admin/entityDisplayText'
import { dragAndDrop } from '@formkit/drag-and-drop/vue'
import { animations } from '@formkit/drag-and-drop'
import { getPanelsElement } from '@/composables/admin/useDragAndDropHelpers'
import type { GlobalEntity } from '@/types/entities'
import type { GlobalEntityKey } from '@/constants/entities'
import type { EntityMetadataType } from '@/types/entityMetadata'
import { getEntityTypeForMetadata } from '@/utils/entities/entityTypeMapping'
import { createLogger } from '@/utils/logger'
import { FIELD_RENDER_AS, FIELD_LAYOUT } from '@/constants/fieldMetadata'

const logger = createLogger('AdminPrimitiveMetadataEditor')

interface Props {
  entityKey: GlobalEntityKey
  entity: GlobalEntity<GlobalEntityKey>
  blockShapeRef?: string  // Optional - BlockShape ID for BlockShape-specific instance metadata
}

interface Emits {
  (e: 'saved'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()


// PATTERN: Composable handles sentinel UUIDs and blockShapeRef inclusion
const metadataEditorEntity = useMetadataEditorEntity(
  props.entityKey,
  props.entity,
  props.blockShapeRef
)

const entityType = computed<EntityMetadataType | null>(() => {
  return getEntityTypeForMetadata(props.entityKey)
})

const entityId = computed<string | null>(() => {
  return metadataEditorEntity.value?.id ?? null
})

// WHY: Should display all metadata for visibility, matches EntityCard pattern
const { fieldMetadata, isLoading } = useEntityMetadata(
  props.entityKey,
  metadataEditorEntity
)

// WHY: Backend determines metadataType by checking RELATIONSHIP_KEYS - matches entity pattern
const { saveFieldMetadata, isSaving } = useAdminMetadataMutations()

const queryClient = useQueryClient()

const pendingChanges = reactive<Record<string, Partial<FieldMetadataEntry>>>({})

// WHY: Reset state after successful save
// PATTERN: Clear all reactive state
function clearPendingState(): void {
  Object.keys(pendingChanges).forEach(key => delete pendingChanges[key])
}

// PATTERN: Use shared utility function instead of hardcoded if statements
const entityTypeLabel = computed(() => {
  return getEntityTypeLabel(props.entityKey)
})

function getFieldMetadata(fieldKey: string) {
  return fieldMetadata.value[fieldKey]
}

function getEffectiveFieldMetadata(fieldKey: string) {
  const existing = getFieldMetadata(fieldKey)
  const pending = pendingChanges[fieldKey]
  
  if (!pending) {
    return existing
  }
  
  if (!existing) {
    return pending as FieldMetadataEntry | undefined
  }
  
  return {
    ...existing,
    ...pending,
  } as FieldMetadataEntry | undefined
}

const { computeRenderAs, updateFieldRendering } = useMetadataFieldUpdates({
  getEffectiveFieldMetadata,
  pendingChanges,
})

const { getInputConfigData, updateInputConfigField } = useInputConfigEditor({
  getEffectiveFieldMetadata,
  updateFieldRendering,
})

function hasSelectRenderAs(fieldKey: string): boolean {
  const renderAs = getEffectiveFieldMetadata(fieldKey)?.renderAs
  if (!renderAs) return false
  return renderAs === FIELD_RENDER_AS.SELECT ||
         renderAs === FIELD_RENDER_AS.MULTISELECT ||
         renderAs === FIELD_RENDER_AS.REFERENCE ||
         renderAs === FIELD_RENDER_AS.RELATIONSHIP_COLLECTION
}

const { draggableFieldKeys, handleDragEnd } = useMetadataFieldOrdering({
  fieldMetadata,
  getFieldMetadata,
  updateFieldRendering,
})

function hasMetadataEntry(fieldKey: string): boolean {
  return !!fieldMetadata.value[fieldKey]
}


async function handleSave() {
  if (!entityType.value || !entityId.value) {
    logger.error('Cannot save: invalid entityType or entityId')
    return
  }

  try {
    logger.debug('Starting save:', {
      entityType: entityType.value,
      entityId: entityId.value,
      blockShapeRef: props.blockShapeRef || null,
      pendingChangesCount: Object.keys(pendingChanges).length,
      pendingChanges: Object.keys(pendingChanges),
    })
    
    // WHY: Matches entity pattern - mutations accept all fields, backend routes based on type
    // PATTERN: Single mutation call, no routing logic needed
    for (const [fieldKey, updates] of Object.entries(pendingChanges)) {
      const existingMeta = getFieldMetadata(fieldKey)
      
      // PATTERN: Compute renderAs if missing or if dataType/inputConfig changed
      const effectiveMeta = getEffectiveFieldMetadata(fieldKey)
      const finalUpdates = { ...updates }
      
      if (!finalUpdates.renderAs || updates.inputConfig !== undefined) {
        const dataType = effectiveMeta?.dataType
        const inputConfig = finalUpdates.inputConfig !== undefined ? finalUpdates.inputConfig : effectiveMeta?.inputConfig
        finalUpdates.renderAs = computeRenderAs(dataType, inputConfig, fieldKey)
      }
      
      logger.debug('Saving field:', {
        fieldKey,
        updates: finalUpdates,
        hasExistingMeta: !!existingMeta,
        existingMeta
      })
      
      await saveFieldMetadata({
        entityType: entityType.value,
        entityId: entityId.value,
        fieldKey,
        renderingUpdates: finalUpdates,
        existingMetadata: existingMeta,
        blockShapeRef: props.blockShapeRef || null
      })
    }


    // PATTERN: Mutations already invalidate cache, just refetch and await completion before clearing pending state
    try {
      await queryClient.refetchQueries({ queryKey: ['adminMetadata'] })
      logger.debug('Metadata cache refetched successfully')
    } catch (refetchError) {
      logger.error('Error refetching metadata cache:', refetchError)
    }

    clearPendingState()

    emit('saved')
  } catch (error) {
    logger.error('Error saving metadata:', error)
    throw error
  }
}

const visibilityOptions = [
  { title: 'Not Configured', value: 'notConfigured' },
  { title: 'Title Row', value: 'titleRow' },
  { title: 'Static As Title', value: 'staticAsTitle' },
  { title: 'Expanded Direct', value: 'expandedDirect' },
  { title: 'Expanded Panel', value: 'expandedPanel' },
  { title: 'Hidden', value: 'hidden' },
] as const

const layoutOptions = [
  { title: 'Inline', value: FIELD_LAYOUT.INLINE },
  { title: 'Stacked', value: FIELD_LAYOUT.STACKED },
] as const


const colorOptions = [
  { title: 'Red', value: 'error' },
  { title: 'Orange', value: 'secondary' },
  { title: 'Yellow', value: 'yellow' },
  { title: 'Green', value: 'success' },
  { title: 'Blue', value: 'info' },
  { title: 'Indigo', value: 'primary' },
  { title: 'Violet', value: 'purple' },
  { title: 'Grey', value: 'grey' },
  { title: 'Brown', value: 'brown' },
] as const

const selectModeOptions = [
  { title: 'Single', value: 'Single' },
  { title: 'Multiple', value: 'Multiple' },
  { title: 'Required', value: 'Required' },
  { title: 'Nested', value: 'Nested' },
] as const

// LEARNING: Input config editing functions are provided by useInputConfigEditor composable

const expansionPanelsRef = ref<ComponentPublicInstance | HTMLElement | null>(null)

// LEARNING: Drag end handler is provided by useMetadataFieldOrdering composable

let dragInstance: ReturnType<typeof dragAndDrop> | null = null

onMounted(() => {
  nextTick(() => {
    if (!expansionPanelsRef.value) return
    
    const panelsElement = getPanelsElement(expansionPanelsRef.value, null)
    if (!panelsElement) return
    
    try {
      dragInstance = dragAndDrop({
        parent: panelsElement,
        values: draggableFieldKeys,
        draggable: (el) => {
          return el instanceof HTMLElement && el.classList?.contains('draggable-field-panel')
        },
        plugins: [animations()],
        handleEnd: () => {
          handleDragEnd()
        },
      })
    } catch (error) {
      logger.error('Error setting up drag-and-drop:', error)
    }
  })
})

onBeforeUnmount(() => {
  if (dragInstance) {
    dragInstance = null
  }
})

defineExpose({
  save: handleSave,
  isSaving,
})
</script>
