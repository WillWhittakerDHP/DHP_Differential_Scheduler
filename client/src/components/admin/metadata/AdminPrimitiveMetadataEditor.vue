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
        <span v-if="mode === 'global'">
          Configure field visibility, layout, and rendering for {{ entityTypeLabel }}.
          <span v-if="entityKey === 'blockShape' || entityKey === 'partShape'">
            Changes apply globally to all {{ entityTypeLabel }} entities.
          </span>
        </span>
        <span v-else>
          Configure instance-specific overrides for this {{ entityTypeLabel }}.
          Fields without overrides inherit from the associated shape's global configuration.
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
                  <span v-if="mode === 'instanceOverride' && !hasOverride(fieldKey)" class="ml-2">
                    (inherited)
                  </span>
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
                
                <!-- Instance Override Toggle (only in instanceOverride mode) -->
                <VCheckbox
                  v-if="mode === 'instanceOverride'"
                  :model-value="hasOverride(fieldKey)"
                  label="Override inherited configuration"
                  density="compact"
                  @update:model-value="(value) => toggleOverride(fieldKey, value ?? false)"
                />

                <!-- Visibility -->
                <VSelect
                  :model-value="getEffectiveFieldMetadata(fieldKey)?.visibility ?? undefined"
                  :items="visibilityOptions"
                  label="Visibility"
                  density="compact"
                  variant="outlined"
                  placeholder="Not Configured"
                  :disabled="mode === 'instanceOverride' && !hasOverride(fieldKey)"
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
                  :disabled="mode === 'instanceOverride' && !hasOverride(fieldKey)"
                  @update:model-value="(value) => updateFieldRendering(fieldKey, { layout: value })"
                />
                
                <!-- Panel (only for expandedPanel) -->
                <VSelect
                  v-if="getEffectiveFieldMetadata(fieldKey)?.visibility === 'expandedPanel'"
                  :model-value="getEffectiveFieldMetadata(fieldKey)?.panel ?? undefined"
                  :items="panelOptions"
                  label="Panel"
                  density="compact"
                  variant="outlined"
                  placeholder="Not Configured"
                  :disabled="mode === 'instanceOverride' && !hasOverride(fieldKey)"
                  @update:model-value="(value) => updateFieldRendering(fieldKey, { panel: value })"
                />
                
                <!-- Status Button Color (only for booleans) -->
                <VSelect
                  v-if="getEffectiveFieldMetadata(fieldKey)?.dataType === 'boolean'"
                  :model-value="getEffectiveFieldMetadata(fieldKey)?.statusButtonColor ?? undefined"
                  :items="colorOptions"
                  label="Status Button Color"
                  density="compact"
                  variant="outlined"
                  placeholder="Not Configured"
                  :disabled="mode === 'instanceOverride' && !hasOverride(fieldKey)"
                  @update:model-value="(value) => updateFieldRendering(fieldKey, { statusButtonColor: value })"
                />
                
                <!-- Input Config (for select/multiselect/reference/partsCollection) -->
                <template v-if="['select', 'multiselect', 'reference', 'partsCollection'].includes(getEffectiveFieldMetadata(fieldKey)?.renderAs ?? '')">
                  <!-- Options-based selects (like bookingMode) -->
                  <VTextarea
                    v-if="getInputConfigData(fieldKey).options !== null && getInputConfigData(fieldKey).targetMode === null"
                    :model-value="getInputConfigData(fieldKey).options ? JSON.stringify(getInputConfigData(fieldKey).options, null, 2) : ''"
                    label="Options (JSON Array)"
                    density="compact"
                    variant="outlined"
                    placeholder='["option1", "option2", "option3"]'
                    :disabled="mode === 'instanceOverride' && !hasOverride(fieldKey)"
                    hint="Array of option values"
                    persistent-hint
                    rows="3"
                    @update:model-value="(value) => {
                      try {
                        const parsed = value ? JSON.parse(value) : null
                        updateInputConfigField(fieldKey, 'options', parsed)
                      } catch (e) {
                        // Invalid JSON - don't update
                      }
                    }"
                  />
                  
                  <!-- Select Mode (for relationship/property selects) -->
                  <VSelect
                    v-else
                    :model-value="getInputConfigData(fieldKey).selectMode"
                    :items="selectModeOptions"
                    label="Select Mode"
                    density="compact"
                    variant="outlined"
                    placeholder="Select mode"
                    :disabled="mode === 'instanceOverride' && !hasOverride(fieldKey)"
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
                  :disabled="mode === 'instanceOverride' && !hasOverride(fieldKey)"
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
import { computed, ref, reactive, onMounted, onBeforeUnmount, nextTick, watch, type ComponentPublicInstance } from 'vue'
import { useQueryClient } from '@tanstack/vue-query'
import { useEntityMetadata } from '@/composables/admin/useEntityMetadata'
import { useAdminMetadataMutations } from '@/composables/admin/useAdminMetadataMutations'
import { getEntityTypeLabel } from '@/utils/admin/entityDisplayText'
import { dragAndDrop } from '@formkit/drag-and-drop/vue'
import { animations } from '@formkit/drag-and-drop'
import { getPanelsElement } from '@/composables/admin/useDragAndDropHelpers'
import type { GlobalEntity } from '@/types/entities'
import type { GlobalEntityKey } from '@/constants/entities'
import type { GlobalFieldKey } from '@/constants/primitives'
import type { EntityMetadataType } from '@/types/entityMetadata'
import { 
  getEntityTypeForMetadata, 
  getMetadataEntityId,
  BLOCK_SHAPE_GLOBAL_CONFIG_ID,
  PART_SHAPE_GLOBAL_CONFIG_ID,
  PART_INSTANCE_GLOBAL_CONFIG_ID,
  BLOCK_INSTANCE_GLOBAL_CONFIG_ID
} from '@/utils/entities/entityTypeMapping'
import { createLogger } from '@/utils/logger'

const logger = createLogger('AdminPrimitiveMetadataEditor')

interface Props {
  entityKey: GlobalEntityKey
  entity: GlobalEntity<GlobalEntityKey>
  mode: 'global' | 'instanceOverride'
  blockShapeRef?: string  // Optional - BlockShape ID for BlockShape-specific instance metadata
}

interface Emits {
  (e: 'saved'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()


// Get entity type and ID for metadata lookup
const entityType = computed<EntityMetadataType | null>(() => {
  return getEntityTypeForMetadata(props.entityKey)
})

// LEARNING: When mode is 'global', use sentinel UUID regardless of entity passed
// WHY: Global mode should show/edit global config, not instance-specific config
// PATTERN: Override entityId to use sentinel UUID when mode is 'global'
const entityId = computed<string | null>(() => {
  if (!entityType.value) return null
  
  // When mode is 'global', always use sentinel UUID
  if (props.mode === 'global') {
    if (entityType.value === 'blockShape') {
      return BLOCK_SHAPE_GLOBAL_CONFIG_ID
    }
    if (entityType.value === 'partShape') {
      return PART_SHAPE_GLOBAL_CONFIG_ID
    }
    if (entityType.value === 'blockInstance') {
      return BLOCK_INSTANCE_GLOBAL_CONFIG_ID
    }
    if (entityType.value === 'partInstance') {
      return PART_INSTANCE_GLOBAL_CONFIG_ID
    }
  }
  
  // For instanceOverride mode, use the actual entity ID
  return getMetadataEntityId(props.entityKey, props.entity)
})

// LEARNING: Use useEntityMetadata to get merged metadata (primitives + relationships) for display
// WHY: Should display all metadata for visibility, matches EntityCard pattern
// PATTERN: Use useEntityMetadata which calls getMetadata() that hydrates metadata
// NOTE: Dehydration happens in mutations before save to ensure only primitives are saved
const { fieldMetadata, isLoading } = useEntityMetadata(
  props.entityKey,
  computed(() => {
    // Create entity for metadata fetch that uses sentinel UUID in global mode
    if (props.mode === 'global' && entityId.value) {
      // LEARNING: Include blockShapeRef in entity for BlockShape-specific instance metadata
      // WHY: getMetadata() extracts blockShapeRef from entity to look up BlockShape-specific metadata
      // PATTERN: Include blockShapeRef when provided, even in global mode
      const baseEntity = {
        id: entityId.value,
        entityKey: props.entityKey,
        name: ''
      } as GlobalEntity<typeof props.entityKey>
      
      // For blockInstance with blockShapeRef, include it in the entity
      if (props.entityKey === 'blockInstance' && props.blockShapeRef) {
        (baseEntity as GlobalEntity<'blockInstance'>).blockShapeRef = props.blockShapeRef
      }
      
      return baseEntity
    }
    return props.entity
  })
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

// Track pending changes (for instance override mode)
const pendingOverrides = ref<Set<string>>(new Set())
const pendingDeletes = ref<Set<string>>(new Set())
const pendingChanges = reactive<Record<string, Partial<import('@/types/entityMetadata').FieldMetadataEntry>>>({})

// LEARNING: Get all possible field keys from metadata ONLY
// WHY: Metadata is the single source of truth - no fallback to formFieldConfig
// PATTERN: Use metadata keys exclusively
const allPossibleFieldKeys = computed<GlobalFieldKey<GlobalEntityKey>[]>(() => {
  if (!fieldMetadata.value || Object.keys(fieldMetadata.value).length === 0) {
    return []
  }
  return Object.keys(fieldMetadata.value) as GlobalFieldKey<GlobalEntityKey>[]
})

// LEARNING: Available fields sorted by displayOrder for drag-and-drop
// WHY: Fields should be displayed in their configured order, allowing drag-and-drop reordering
// PATTERN: Sort by displayOrder, then alphabetically for fields without order
const availableFieldsSorted = computed(() => {
  const metadataKeys = Object.keys(fieldMetadata.value || {})
  const allKeys = new Set([...allPossibleFieldKeys.value, ...metadataKeys])
  const fields = Array.from(allKeys)
  
  // Sort by displayOrder first, then alphabetically
  return fields.sort((a, b) => {
    const metaA = getFieldMetadata(a)
    const metaB = getFieldMetadata(b)
    const orderA = metaA?.displayOrder ?? 999
    const orderB = metaB?.displayOrder ?? 999
    
    if (orderA !== orderB) {
      return orderA - orderB
    }
    
    // If same order, sort alphabetically
    return a.localeCompare(b)
  })
})

// LEARNING: Reactive array for drag-and-drop reordering
// WHY: Need mutable array that can be reordered during drag operations
// PATTERN: Ref array that syncs with computed sorted fields
const draggableFieldKeys = ref<string[]>([])

// LEARNING: Sync draggableFieldKeys with availableFieldsSorted
// WHY: Keep drag-and-drop array in sync with computed sorted fields
// PATTERN: Watch computed and update ref array
watch(availableFieldsSorted, (newFields) => {
  draggableFieldKeys.value = [...newFields]
}, { immediate: true })

// LEARNING: Use config-driven entity type label
// WHY: Eliminates entityKey branching (if/else chain) - single source of truth
// PATTERN: Use shared utility function instead of hardcoded if statements
// Entity type label for display
const entityTypeLabel = computed(() => {
  return getEntityTypeLabel(props.entityKey)
})

// Get field metadata entry
// Returns metadata if it exists, or undefined if field doesn't have metadata yet
function getFieldMetadata(fieldKey: string) {
  return fieldMetadata.value[fieldKey]
}

// Get effective field metadata (existing + pending changes)
// This merges the existing metadata with any pending changes to show immediate UI feedback
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

/**
 * LEARNING: Auto-compute renderAs based on dataType and inputConfig
 * WHY: renderAs should be automatically determined, not manually configured
 * PATTERN: Compute renderAs from field characteristics
 */
function computeRenderAs(
  dataType: string | undefined,
  inputConfig: Record<string, unknown> | null | undefined,
  fieldKey: string
): import('@/types/entityMetadata').FieldMetadataEntry['renderAs'] {
  // Special cases first
  if (fieldKey === 'icon') {
    return 'iconSelect'
  }
  
  // If inputConfig exists, determine select type from config
  if (inputConfig) {
    const selectType = inputConfig.selectType as string | undefined
    if (selectType === 'partsCollectionSelect') {
      return 'partsCollection'
    }
    const selectMode = inputConfig.selectMode as string | undefined
    if (selectMode === 'multiple') {
      return 'multiselect'
    }
    // Default to reference for relationship selects
    if (inputConfig.targetMode === 'relationship') {
      return 'reference'
    }
    // Default to select for other selects
    return 'select'
  }
  
  // Base renderAs on dataType
  if (dataType === 'boolean') {
    return 'statusButton'
  }
  if (dataType === 'number') {
    return 'number'
  }
  if (dataType === 'array') {
    return 'reference'
  }
  
  // Default to text for string and other types
  return 'text'
}

/**
 * LEARNING: Get computed renderAs for display
 * WHY: Show auto-computed renderAs value in UI (read-only)
 * PATTERN: Compute from effective metadata
 */
function getComputedRenderAs(fieldKey: string): string {
  const meta = getEffectiveFieldMetadata(fieldKey)
  if (!meta) {
    return 'Not configured'
  }
  
  // Use existing renderAs if present, otherwise compute it
  if (meta.renderAs) {
    return meta.renderAs
  }
  
  return computeRenderAs(meta.dataType, meta.inputConfig, fieldKey)
}

// Check if field has metadata entry (exists in database)
function hasMetadataEntry(fieldKey: string): boolean {
  return !!fieldMetadata.value[fieldKey]
}

// Check if field has an override (instanceOverride mode only)
function hasOverride(fieldKey: string): boolean {
  if (props.mode !== 'instanceOverride') return true // Global mode always has "override"
  if (pendingDeletes.value.has(fieldKey)) return false
  if (pendingOverrides.value.has(fieldKey)) return true
  // Check if override exists in database (would be in metadata if it exists)
  // For now, assume if field exists in metadata for instance, it's an override
  return !!fieldMetadata.value[fieldKey]
}

// Toggle override (instanceOverride mode only)
function toggleOverride(fieldKey: string, enabled: boolean) {
  if (props.mode !== 'instanceOverride') return
  
  if (enabled) {
    pendingDeletes.value.delete(fieldKey)
    pendingOverrides.value.add(fieldKey)
    // Initialize pending change with current effective metadata
    const currentMeta = getFieldMetadata(fieldKey)
    if (currentMeta) {
      pendingChanges[fieldKey] = {
        visibility: currentMeta.visibility,
        layout: currentMeta.layout,
        displayOrder: currentMeta.displayOrder,
        renderAs: currentMeta.renderAs,
        statusButtonColor: currentMeta.statusButtonColor,
        panel: currentMeta.panel,
        bulkEdit: currentMeta.bulkEdit,
      }
    }
  } else {
    pendingOverrides.value.delete(fieldKey)
    delete pendingChanges[fieldKey]
    pendingDeletes.value.add(fieldKey)
  }
}

// Update field rendering configuration
function updateFieldRendering(fieldKey: string, updates: Partial<import('@/types/entityMetadata').FieldMetadataEntry>) {
  if (props.mode === 'instanceOverride' && !hasOverride(fieldKey)) {
    // Enable override first
    toggleOverride(fieldKey, true)
  }
  
  // LEARNING: Auto-compute renderAs when dataType or inputConfig changes
  // WHY: renderAs should always be computed, not manually set
  // PATTERN: Compute renderAs if dataType or inputConfig is being updated
  const effectiveMeta = getEffectiveFieldMetadata(fieldKey)
  const newDataType = updates.dataType ?? effectiveMeta?.dataType
  const newInputConfig = updates.inputConfig !== undefined ? updates.inputConfig : effectiveMeta?.inputConfig
  
  // Auto-compute renderAs if dataType or inputConfig changed
  if (updates.dataType !== undefined || updates.inputConfig !== undefined) {
    updates.renderAs = computeRenderAs(newDataType, newInputConfig, fieldKey)
  }
  
  // LEARNING: Validate panel based on visibility
  // WHY: Panel must be 'none' for titleRow and expandedDirect, required for expandedPanel
  // PATTERN: Normalize panel value when visibility changes
  if (updates.visibility !== undefined) {
    const newVisibility = updates.visibility
    if (newVisibility === 'titleRow' || newVisibility === 'expandedDirect' || newVisibility === 'staticAsTitle') {
      // Panel must be 'none' for these visibility types
      updates.panel = 'none'
    } else if (newVisibility === 'expandedPanel') {
      // Panel must be set for expandedPanel (default to 'parts' if not set)
      const currentPanel = updates.panel ?? effectiveMeta?.panel
      if (!currentPanel || currentPanel === 'none') {
        updates.panel = 'parts'
      }
    }
  }
  
  pendingChanges[fieldKey] = { ...pendingChanges[fieldKey], ...updates }
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
      
      // LEARNING: Auto-compute renderAs before saving if not explicitly set
      // WHY: renderAs should always be computed from dataType and inputConfig
      // PATTERN: Compute renderAs if missing or if dataType/inputConfig changed
      const effectiveMeta = getEffectiveFieldMetadata(fieldKey)
      const finalUpdates = { ...updates }
      
      // Ensure renderAs is computed
      if (!finalUpdates.renderAs || updates.dataType !== undefined || updates.inputConfig !== undefined) {
        const dataType = finalUpdates.dataType ?? effectiveMeta?.dataType
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

    // Delete pending deletes (instanceOverride mode only)
    // LEARNING: Use unified mutation - backend routes based on fieldKey type
    // WHY: Matches entity pattern - mutations accept all fields, backend routes based on type
    // PATTERN: Single mutation call, no routing logic needed
    if (props.mode === 'instanceOverride') {
      for (const fieldKey of pendingDeletes.value) {
        await deleteFieldMetadata({
          entityType: entityType.value,
          entityId: entityId.value,
          fieldKey,
          blockShapeRef: props.blockShapeRef || null
        })
      }
    }

    // LEARNING: Await refetch before clearing pendingChanges
    // WHY: Prevents UI flash - pendingChanges maintain display until fresh data arrives
    // PATTERN: Manually refetch and await completion before clearing pending state
    await queryClient.refetchQueries({ queryKey: ['adminMetadata'] })

    // Clear pending changes AFTER refetch completes
    Object.keys(pendingChanges).forEach(key => delete pendingChanges[key])
    pendingOverrides.value.clear()
    pendingDeletes.value.clear()

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
  { title: 'Inline', value: 'inline' },
  { title: 'Stacked', value: 'stacked' },
] as const

const panelOptions = [
  { title: 'Parts', value: 'parts' },
  { title: 'Relationships', value: 'relationships' },
  { title: 'Annotations', value: 'annotations' },
  { title: 'None', value: 'none' },
] as const

const renderAsOptions = [
  { title: 'Text', value: 'text' },
  { title: 'Number', value: 'number' },
  { title: 'Select', value: 'select' },
  { title: 'Multiselect', value: 'multiselect' },
  { title: 'Reference', value: 'reference' },
  { title: 'Status Button', value: 'statusButton' },
  { title: 'Icon Select', value: 'iconSelect' },
  { title: 'Parts Collection', value: 'partsCollection' },
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

/**
 * LEARNING: Parse inputConfig into form-friendly structure
 * WHY: Extract individual fields from inputConfig object for form editing
 * PATTERN: Read from inputConfig, provide defaults for missing fields
 */
function getInputConfigData(fieldKey: string) {
  const meta = getEffectiveFieldMetadata(fieldKey)
  const inputConfig = meta?.inputConfig as Record<string, unknown> | null | undefined
  
  if (!inputConfig || typeof inputConfig !== 'object') {
    return {
      targetMode: null as string | null,
      selectMode: null as string | null,
      targetKey: null as string | null,
      candidateChildKey: null as string | null,
      groupByKey: null as string | null,
      placeholder: null as string | null,
      options: null as unknown[] | null,
    }
  }
  
  // Handle FormFieldConfig structure (new format)
  let config = inputConfig
  if ('relationshipSelect' in inputConfig && inputConfig.relationshipSelect) {
    config = inputConfig.relationshipSelect as Record<string, unknown>
  } else if ('typeSelect' in inputConfig && inputConfig.typeSelect) {
    config = inputConfig.typeSelect as Record<string, unknown>
  }
  
  return {
    targetMode: (config.targetMode as string) || null,
    selectMode: (config.selectMode as string) || null,
    targetKey: (config.targetKey as string) || null,
    candidateChildKey: (config.candidateChildKey as string) || null,
    groupByKey: (config.groupByKey as string) || null,
    placeholder: (config.placeholder as string) || null,
    options: (inputConfig.options as unknown[]) || null, // Options array (for options-based selects)
  }
}

/**
 * LEARNING: Update a specific field in inputConfig
 * WHY: Helper function to update individual inputConfig fields without replacing the entire object
 * PATTERN: Read current inputConfig, update specific field, reconstruct object
 */
function updateInputConfigField(fieldKey: string, fieldName: keyof ReturnType<typeof getInputConfigData>, value: unknown) {
  const currentData = getInputConfigData(fieldKey)
  const updatedData = { ...currentData, [fieldName]: value }
  const newConfig = buildInputConfig(fieldKey, updatedData)
  updateFieldRendering(fieldKey, { inputConfig: newConfig })
}

/**
 * LEARNING: Construct inputConfig object from form values
 * WHY: Build inputConfig object when form fields change
 * PATTERN: Construct object based on targetMode and field values
 */
function buildInputConfig(fieldKey: string, formData: ReturnType<typeof getInputConfigData>): Record<string, unknown> | null {
  // Handle options-based selects (like bookingMode)
  if (formData.options !== null) {
    return {
      options: formData.options
    }
  }
  
  // Handle empty/not configured
  if (!formData.targetMode || !formData.selectMode) {
    return null
  }
  
  const baseConfig: Record<string, unknown> = {
    targetMode: formData.targetMode,
    selectMode: formData.selectMode,
  }
  
  if (formData.targetMode === 'relationship') {
    if (formData.targetKey) {
      baseConfig.targetKey = formData.targetKey
    }
    if (formData.candidateChildKey) {
      baseConfig.candidateChildKey = formData.candidateChildKey
    }
    if (formData.groupByKey) {
      baseConfig.groupByKey = formData.groupByKey
    }
    if (formData.placeholder) {
      baseConfig.placeholder = formData.placeholder
    }
    
    // For partsCollection, ensure optionsFieldKey is set
    const renderAs = getEffectiveFieldMetadata(fieldKey)?.renderAs
    if (renderAs === 'partsCollection') {
      baseConfig.optionsFieldKey = 'validParts'
    }
  } else if (formData.targetMode === 'property') {
    if (formData.targetKey) {
      baseConfig.targetKey = formData.targetKey
    }
    if (formData.placeholder) {
      baseConfig.placeholder = formData.placeholder
    }
  }
  
  return baseConfig
}

// LEARNING: Template ref for expansion panels container
// WHY: Need DOM reference to initialize drag-and-drop
const expansionPanelsRef = ref<ComponentPublicInstance | HTMLElement | null>(null)

// LEARNING: Handle drag end to update displayOrder values
// WHY: When fields are reordered, update displayOrder based on new position
// PATTERN: Normalize displayOrder to sequential values (0, 1, 2, ...)
const handleDragEnd = () => {
  // Update displayOrder for each field based on its new position
  draggableFieldKeys.value.forEach((fieldKey, index) => {
    const currentMeta = getEffectiveFieldMetadata(fieldKey)
    const currentOrder = currentMeta?.displayOrder ?? 999
    
    // Only update if order changed
    if (currentOrder !== index) {
      updateFieldRendering(fieldKey, { displayOrder: index })
    }
  })
}

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
