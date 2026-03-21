<!--
  WHY: Single unified editor for rendering configuration in admin_primitive_metadata
        Renamed from AdminInputMetadataEditor to align with entity data pattern
  PATTERN: Rendering-only editor - only shows rendering configuration fields
-->
<template>
  <div class="admin-primitive-metadata-editor">
    <div class="mb-4">
      <h3 class="text-headline-small mb-2">Field Rendering Configuration</h3>
      <p class="text-body-medium text-medium-emphasis">
        Configure field visibility, layout, and rendering for {{ entityTypeLabel }}.
        <span v-if="entityKey === 'blockShape' || entityKey === 'partShape'">
          Changes apply globally to all {{ entityTypeLabel }} entities.
        </span>
      </p>
    </div>

    <!-- Note: error is always null from useEntityMetadata (synchronous metadata) -->

    <div v-if="isLoading" class="text-center pa-4">
      <VProgressCircular indeterminate color="primary" />
      <p class="mt-4 text-body-medium">Loading field metadata...</p>
    </div>

    <div v-else-if="draggableFieldKeys.length === 0" class="text-center pa-4">
      <p class="text-body-medium text-medium-emphasis">
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
                <span class="text-body-large font-weight-medium">
                  {{ getFieldMetadata(fieldKey)?.label || fieldKey }}
                </span>
                <span class="text-body-small text-medium-emphasis">
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
                {{ fieldVisibilityLabel(fieldKey) }}
              </VChip>
            </div>
          </VExpansionPanelTitle>
          <VExpansionPanelText v-if="fieldKey">
            <div class="d-flex flex-column gap-4 pt-2">
              <!-- Rendering fields (editable) -->
              <div class="d-flex flex-column gap-2">
                <p class="text-body-small font-weight-medium">Rendering Configuration</p>
                
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
import { computed, ref, reactive, type ComponentPublicInstance } from 'vue'
import type { FieldMetadataEntry } from '@/constants/fieldMetadata'
import { useEntityMetadata } from '@/composables/admin/useEntityMetadata'
import { usePrimitiveMetadataSave } from '@/composables/admin/usePrimitiveMetadataSave'
import { useAdminMetadataMutations } from '@/composables/admin/useAdminMetadataMutations'
import { useMetadataEditorEntity } from '@/composables/admin/useMetadataEditorEntity'
import { metadataFieldUpdates } from '@/utils/admin/metadataFieldUpdates'
import { inputConfigEditor } from '@/utils/admin/inputConfigEditor'
import { useMetadataFieldOrdering } from '@/composables/admin/useMetadataFieldOrdering'
import { getEntityTypeLabel } from '@/utils/admin/entityDisplayText'
import type { EntityMetadataType } from '@/constants/fieldMetadata'
import { getEntityTypeForMetadata } from '@/utils/entities/entityTypeMapping'
import { createLogger } from '@/utils/logger'
import { FIELD_RENDER_AS } from '@/constants/fieldMetadata'
import {
  ADMIN_METADATA_VISIBILITY_OPTIONS,
  ADMIN_METADATA_LAYOUT_OPTIONS,
  ADMIN_METADATA_COLOR_OPTIONS,
  ADMIN_METADATA_SELECT_MODE_OPTIONS,
} from '@/constants/adminPrimitiveMetadataOptions'
import { useMetadataFieldDrag } from '@/composables/admin/useMetadataFieldDrag'
import type { MetadataEditorPropsBase } from '@/types/metadataEditorProps'

const logger = createLogger('AdminPrimitiveMetadataEditor')

/** Same shape as shared base (P3 type-similarity). */
type Props = MetadataEditorPropsBase

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

const { computeRenderAs, updateFieldRendering } = metadataFieldUpdates({
  getEffectiveFieldMetadata,
  pendingChanges,
})

const { getInputConfigData, updateInputConfigField } = inputConfigEditor({
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

function fieldVisibilityLabel(fieldKey: string): string {
  return hasMetadataEntry(fieldKey) ? (getEffectiveFieldMetadata(fieldKey)?.visibility ?? 'Not Configured') : 'Not Configured'
}

const { handleSave } = usePrimitiveMetadataSave({
  getEntityType: () => entityType.value,
  getEntityId: () => entityId.value,
  getPendingChanges: () => pendingChanges,
  getFieldMetadata,
  getEffectiveFieldMetadata,
  computeRenderAs,
  clearPendingState,
  saveFieldMetadata,
  getBlockShapeRef: () => props.blockShapeRef,
  onSaved: () => emit('saved'),
  logger,
})

const visibilityOptions = ADMIN_METADATA_VISIBILITY_OPTIONS
const layoutOptions = ADMIN_METADATA_LAYOUT_OPTIONS
const colorOptions = ADMIN_METADATA_COLOR_OPTIONS
const selectModeOptions = ADMIN_METADATA_SELECT_MODE_OPTIONS

const expansionPanelsRef = ref<ComponentPublicInstance | HTMLElement | null>(null)
useMetadataFieldDrag({
  expansionPanelsRef,
  draggableFieldKeys,
  handleDragEnd,
  logger,
})

defineExpose({
  save: handleSave,
  isSaving,
})
</script>
