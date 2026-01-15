<!--
  LEARNING: Admin Input Metadata Editor
  WHY: Single unified editor for rendering configuration in admin_input_metadata
  PATTERN: Rendering-only editor - only shows rendering configuration fields
-->
<template>
  <div class="admin-input-metadata-editor">
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

    <VAlert
      v-if="error"
      type="error"
      variant="tonal"
      class="mb-4"
    >
      {{ error.message }}
    </VAlert>

    <div v-if="isLoading" class="text-center pa-4">
      <VProgressCircular indeterminate color="primary" />
      <p class="mt-4 text-body-2">Loading field metadata...</p>
    </div>

    <div v-else-if="availableFields.length === 0" class="text-center pa-4">
      <p class="text-body-2 text-medium-emphasis">
        No field metadata found. Fields must be configured in the database.
      </p>
    </div>

    <div v-else class="d-flex flex-column gap-3">
      <VExpansionPanels variant="accordion" class="mb-4">
        <VExpansionPanel
          v-for="(fieldKey, index) in availableFields"
          :key="fieldKey || `field-${index}`"
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
                
                <!-- Display Order -->
                <VTextField
                  :model-value="getEffectiveFieldMetadata(fieldKey)?.displayOrder !== undefined ? String(getEffectiveFieldMetadata(fieldKey)!.displayOrder) : ''"
                  label="Display Order"
                  type="number"
                  density="compact"
                  variant="outlined"
                  placeholder="Not Configured"
                  :disabled="mode === 'instanceOverride' && !hasOverride(fieldKey)"
                  @update:model-value="(value) => updateFieldRendering(fieldKey, { displayOrder: value ? Number(value) : undefined })"
                />
                
                <!-- Render As -->
                <VSelect
                  :model-value="getEffectiveFieldMetadata(fieldKey)?.renderAs ?? undefined"
                  :items="renderAsOptions"
                  label="Render As"
                  density="compact"
                  variant="outlined"
                  placeholder="Not Configured"
                  :disabled="mode === 'instanceOverride' && !hasOverride(fieldKey)"
                  @update:model-value="(value) => updateFieldRendering(fieldKey, { renderAs: value })"
                />
                
                <!-- Status Button Color (only for statusButton) -->
                <VSelect
                  v-if="getEffectiveFieldMetadata(fieldKey)?.renderAs === 'statusButton'"
                  :model-value="getEffectiveFieldMetadata(fieldKey)?.statusButtonColor ?? undefined"
                  :items="colorOptions"
                  label="Status Button Color"
                  density="compact"
                  variant="outlined"
                  placeholder="Not Configured"
                  :disabled="mode === 'instanceOverride' && !hasOverride(fieldKey)"
                  @update:model-value="(value) => updateFieldRendering(fieldKey, { statusButtonColor: value })"
                />

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

    <VCardActions class="pa-0 mt-4">
      <VSpacer />
      <VBtn
        color="primary"
        variant="elevated"
        :loading="isSaving"
        @click="handleSave"
      >
        Save Configuration
      </VBtn>
    </VCardActions>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, reactive } from 'vue'
import { useEntityMetadata } from '@/composables/admin/useEntityMetadata'
import { useAdminInputMetadataMutations } from '@/composables/admin/useAdminInputMetadataMutations'
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
import { useAdminConfig } from '@/composables/useAdminConfig'

interface Props {
  entityKey: GlobalEntityKey
  entity: GlobalEntity<GlobalEntityKey>
  mode: 'global' | 'instanceOverride'
}

interface Emits {
  (e: 'saved'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// Get admin config to access all possible field keys
const adminConfig = useAdminConfig()

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

// LEARNING: Create entity for metadata fetch that uses sentinel UUID in global mode
// WHY: useEntityMetadata needs an entity object, but we want to query sentinel UUID in global mode
// PATTERN: Create minimal entity with sentinel UUID when mode is 'global'
const entityForMetadata = computed(() => {
  if (props.mode === 'global' && entityId.value) {
    // Create a minimal entity with the sentinel UUID
    return {
      id: entityId.value,
      entityKey: props.entityKey,
      name: ''
    } as GlobalEntity<typeof props.entityKey>
  }
  return props.entity
})

// Fetch metadata using unified composable
const { fieldMetadata, isLoading, error, refetch: refetchMetadata } = useEntityMetadata(
  props.entityKey,
  entityForMetadata
)

// Mutations composable for saving/deleting
const { saveFieldRendering, deleteFieldOverride, isSaving } = useAdminInputMetadataMutations()

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

// Available fields: merge all possible fields with fields that have metadata
// This ensures we show ALL fields, even if they don't have metadata entries yet
const availableFields = computed(() => {
  const metadataKeys = Object.keys(fieldMetadata.value || {})
  const allKeys = new Set([...allPossibleFieldKeys.value, ...metadataKeys])
  return Array.from(allKeys).sort()
})

// Entity type label for display
const entityTypeLabel = computed(() => {
  if (props.entityKey === 'blockShape') return 'Block Shapes'
  if (props.entityKey === 'partShape') return 'Part Shapes'
  if (props.entityKey === 'blockInstance') return 'Block Instance'
  if (props.entityKey === 'partInstance') return 'Part Instance'
  return props.entityKey
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
  
  pendingChanges[fieldKey] = { ...pendingChanges[fieldKey], ...updates }
}

// Save all changes
async function handleSave() {
  if (!entityType.value || !entityId.value) {
    console.error('[AdminInputMetadataEditor] Cannot save: invalid entityType or entityId')
    return
  }

  try {
    // Save pending changes
    for (const [fieldKey, updates] of Object.entries(pendingChanges)) {
      const existingMeta = getFieldMetadata(fieldKey)
      await saveFieldRendering(entityType.value, entityId.value, fieldKey, updates, existingMeta)
    }

    // Delete pending deletes (instanceOverride mode only)
    if (props.mode === 'instanceOverride') {
      for (const fieldKey of pendingDeletes.value) {
        await deleteFieldOverride(entityType.value, entityId.value, fieldKey)
      }
    }

    // Clear pending changes
    Object.keys(pendingChanges).forEach(key => delete pendingChanges[key])
    pendingOverrides.value.clear()
    pendingDeletes.value.clear()

    // Refetch metadata to get the latest saved values
    await refetchMetadata()

    emit('saved')
  } catch (err) {
    console.error('[AdminInputMetadataEditor] Error saving configuration:', err)
  }
}

// Options for form fields
const visibilityOptions = [
  { title: 'Always Visible', value: 'alwaysVisible' },
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
] as const

const colorOptions = [
  { title: 'Default', value: 'default' },
  { title: 'Success', value: 'success' },
  { title: 'Primary', value: 'primary' },
  { title: 'Info', value: 'info' },
  { title: 'Warning', value: 'warning' },
  { title: 'Error', value: 'error' },
  { title: 'Secondary', value: 'secondary' },
  { title: 'Purple', value: 'purple' },
] as const
</script>
