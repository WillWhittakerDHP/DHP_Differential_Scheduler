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
import { FIELD_VISIBILITY, FIELD_RENDER_AS, FIELD_LAYOUT } from '@/constants/fieldMetadata'

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


// LEARNING: Use composable for metadata editor entity lookup
// WHY: Extracts entity construction logic for global configs
// PATTERN: Composable handles sentinel UUIDs and blockShapeRef inclusion
const metadataEditorEntity = useMetadataEditorEntity(
  props.entityKey,
  props.entity,
  props.blockShapeRef
)

// Get entity type and ID for metadata lookup
const entityType = computed<EntityMetadataType | null>(() => {
  return getEntityTypeForMetadata(props.entityKey)
})

// LEARNING: Extract entityId from metadataEditorEntity
// WHY: Save logic needs entityId, which is already computed in metadataEditorEntity
// PATTERN: Extract id from entity computed ref
const entityId = computed<string | null>(() => {
  return metadataEditorEntity.value?.id ?? null
})

// LEARNING: Use useEntityMetadata to get merged metadata (primitives + relationships) for display
// WHY: Should display all metadata for visibility, matches EntityCard pattern
// PATTERN: Use useEntityMetadata which calls getMetadata() that hydrates metadata
// NOTE: Dehydration happens in mutations before save to ensure only primitives are saved
const { fieldMetadata, isLoading } = useEntityMetadata(
  props.entityKey,
  metadataEditorEntity
)

// Mutations composables for saving/deleting (both primitive and relationship)
// LEARNING: Editor displays merged metadata (primitives + relationships), so needs both mutations
// LEARNING: Use unified mutations (no routing logic needed)
// WHY: Backend determines metadataType by checking RELATIONSHIP_KEYS - matches entity pattern
// PATTERN: Single mutation accepts all fieldKeys, backend routes based on type
const { saveFieldMetadata, deleteFieldMetadata, isSaving } = useAdminMetadataMutations()

// LEARNING: Query client for manual refetch control
// WHY: Need to await refetch before clearing pendingChanges to prevent UI flash
// PATTERN: Use queryClient to manually refetch after mutations complete
const queryClient = useQueryClient()

// LEARNING: Track pending changes for field metadata
// WHY: Allows UI to show changes before saving
// PATTERN: Reactive object to track pending updates
const pendingChanges = reactive<Record<string, Partial<FieldMetadataEntry>>>({})

// LEARNING: Clear pending changes
// WHY: Reset state after successful save
// PATTERN: Clear all reactive state
function clearPendingState(): void {
  Object.keys(pendingChanges).forEach(key => delete pendingChanges[key])
}

// LEARNING: Use config-driven entity type label
// WHY: Eliminates entityKey branching (if/else chain) - single source of truth
// PATTERN: Use shared utility function instead of hardcoded if statements
// Entity type label for display
const entityTypeLabel = computed(() => {
  return getEntityTypeLabel(props.entityKey)
})

// LEARNING: Get field metadata entry
// WHY: Simple accessor for field metadata
// PATTERN: Direct access to fieldMetadata computed
function getFieldMetadata(fieldKey: string) {
  return fieldMetadata.value[fieldKey]
}

// LEARNING: Get effective field metadata (existing + pending changes)
// WHY: Merges existing metadata with pending changes for immediate UI feedback
// PATTERN: Merge existing with pending, return existing if no pending
function getEffectiveFieldMetadata(fieldKey: string) {
  const existing = getFieldMetadata(fieldKey)
  const pending = pendingChanges[fieldKey]
  
  if (!pending) {
    return existing
  }
  
  // Merge existing with pending changes
  if (!existing) {
    // If no existing metadata, return pending as-is (but we need to provide defaults)
    return pending as import('@/types/entityMetadata').FieldMetadataEntry | undefined
  }
  
  return {
    ...existing,
    ...pending,
  } as import('@/types/entityMetadata').FieldMetadataEntry | undefined
}

// LEARNING: Metadata field updates with validation
// WHY: Encapsulates field rendering update logic with renderAs computation and validation
// PATTERN: Use composable for updating field metadata with automatic renderAs computation
const { computeRenderAs, updateFieldRendering } = useMetadataFieldUpdates({
  getEffectiveFieldMetadata,
  pendingChanges,
})

// LEARNING: Input config editor
// WHY: Handles parsing and updating inputConfig for select/multiselect/reference fields
// PATTERN: Use composable for managing inputConfig editing
const { getInputConfigData, updateInputConfigField } = useInputConfigEditor({
  getEffectiveFieldMetadata,
  updateFieldRendering,
})

// LEARNING: Check if renderAs is a select-related type
// WHY: Type guard for checking if field uses inputConfig (select/multiselect/reference/relationshipCollection)
// PATTERN: Helper function to check renderAs value against select-related constants
function hasSelectRenderAs(fieldKey: string): boolean {
  const renderAs = getEffectiveFieldMetadata(fieldKey)?.renderAs
  if (!renderAs) return false
  return renderAs === FIELD_RENDER_AS.SELECT ||
         renderAs === FIELD_RENDER_AS.MULTISELECT ||
         renderAs === FIELD_RENDER_AS.REFERENCE ||
         renderAs === FIELD_RENDER_AS.PARTS_COLLECTION
}

// LEARNING: Metadata field ordering
// WHY: Handles sorting by displayOrder and drag-and-drop reordering
// PATTERN: Use composable for managing field ordering
const { draggableFieldKeys, handleDragEnd } = useMetadataFieldOrdering({
  fieldMetadata,
  getFieldMetadata,
  updateFieldRendering,
})

// Check if field has metadata entry (exists in database)
function hasMetadataEntry(fieldKey: string): boolean {
  return !!fieldMetadata.value[fieldKey]
}


// Save all changes
async function handleSave() {
  if (!entityType.value || !entityId.value) {
    logger.error('Cannot save: invalid entityType or entityId')
    return
  }

  try {
    // LEARNING: Debug logging to trace save flow
    // WHY: Help diagnose why saves aren't persisting
    logger.debug('Starting save:', {
      entityType: entityType.value,
      entityId: entityId.value,
      blockShapeRef: props.blockShapeRef || null,
      pendingChangesCount: Object.keys(pendingChanges).length,
      pendingChanges: Object.keys(pendingChanges),
      pendingDeletesCount: pendingDeletes.value.size
    })
    
    // Save pending changes
    // LEARNING: Use unified mutation - backend routes based on fieldKey type
    // WHY: Matches entity pattern - mutations accept all fields, backend routes based on type
    // PATTERN: Single mutation call, no routing logic needed
    for (const [fieldKey, updates] of Object.entries(pendingChanges)) {
      const existingMeta = getFieldMetadata(fieldKey)
      
      // LEARNING: Ensure renderAs is computed before saving
      // WHY: renderAs should always be computed from dataType and inputConfig
      // PATTERN: Compute renderAs if missing or if dataType/inputConfig changed
      const effectiveMeta = getEffectiveFieldMetadata(fieldKey)
      const finalUpdates = { ...updates }
      
      // Ensure renderAs is computed if missing
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


    // LEARNING: Refetch metadata cache before clearing pendingChanges
    // WHY: Prevents UI flash - pendingChanges maintain display until fresh data arrives
    // PATTERN: Mutations already invalidate cache, just refetch and await completion before clearing pending state
    // NOTE: Mutations invalidate cache in onSuccess, so we just need to refetch here
    try {
      await queryClient.refetchQueries({ queryKey: ['adminMetadata'] })
      logger.debug('Metadata cache refetched successfully')
    } catch (refetchError) {
      logger.error('Error refetching metadata cache:', refetchError)
      // Still clear pending state even if refetch fails to prevent UI from being stuck
    }

    // Clear pending changes AFTER refetch completes (or fails)
    clearPendingState()

    // Emit saved event
    emit('saved')
  } catch (error) {
    logger.error('Error saving metadata:', error)
    throw error
  }
}

// Options for form fields
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

// LEARNING: Status button color options ordered by ROY G BIV (Rainbow Order)
// WHY: Makes it easier to identify colors - explicit color names instead of semantic names
// PATTERN: ROY G BIV order: Red, Orange, Yellow, Green, Blue, Indigo, Violet, plus Grey and Brown

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

// LEARNING: Select Mode options for inputConfig
// WHY: Allow admins to configure how select fields behave (single/multiple/required/nested)
// PATTERN: Simple dropdown options
const selectModeOptions = [
  { title: 'Single', value: 'Single' },
  { title: 'Multiple', value: 'Multiple' },
  { title: 'Required', value: 'Required' },
  { title: 'Nested', value: 'Nested' },
] as const

// LEARNING: Input config editing functions are provided by useInputConfigEditor composable
// WHY: Encapsulates inputConfig parsing and updating logic
// PATTERN: Use composable-provided functions

// LEARNING: Template ref for expansion panels container
// WHY: Need DOM reference to initialize drag-and-drop
const expansionPanelsRef = ref<ComponentPublicInstance | HTMLElement | null>(null)

// LEARNING: Drag end handler is provided by useMetadataFieldOrdering composable
// WHY: Encapsulates display order update logic
// PATTERN: Use composable-provided handler

// LEARNING: Initialize drag-and-drop on expansion panels
// WHY: Enable drag-and-drop reordering of fields
// PATTERN: Set up drag-and-drop after component mounts, cleanup on unmount
let dragInstance: ReturnType<typeof dragAndDrop> | null = null

onMounted(() => {
  nextTick(() => {
    if (!expansionPanelsRef.value) return
    
    // Get the actual DOM element from VExpansionPanels component
    const panelsElement = getPanelsElement(expansionPanelsRef.value, null)
    if (!panelsElement) return
    
    try {
      dragInstance = dragAndDrop({
        parent: panelsElement,
        values: draggableFieldKeys,
        draggable: (el) => {
          // Make all expansion panels draggable by checking for draggable-field-panel class
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
  // Cleanup drag-and-drop instance
  if (dragInstance) {
    // @formkit/drag-and-drop handles cleanup automatically, but we can clear the ref
    dragInstance = null
  }
})

// Expose save functionality to parent component
defineExpose({
  save: handleSave,
  isSaving,
})
</script>
