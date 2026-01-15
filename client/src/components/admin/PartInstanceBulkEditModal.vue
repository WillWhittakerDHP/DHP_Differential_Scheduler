<template>
  <VDialog
    :model-value="modelValue"
    @update:model-value="updateModelValue"
    max-width="800"
    :persistent="false"
  >
    <VCard>
      <VCardTitle class="d-flex align-center justify-space-between pa-6">
        <span class="text-h5">Bulk Edit: Part Instances</span>
        <VBtn
          icon
          variant="text"
          @click="updateModelValue(false)"
        >
          <VIcon icon="tabler-x" />
        </VBtn>
      </VCardTitle>

      <VCardText class="pa-6">
        <p class="mb-4 text-body-2">
          Apply the same values to all PartInstances for this BlockInstance. Leave fields empty to skip them.
        </p>

        <!-- LEARNING: EntityCard with only bulkEdit fields visible -->
        <!-- WHY: Uses EntityCard for consistency, but filters metadata to show only bulkEdit fields -->
        <!-- PATTERN: Filter metadata to only include fields where bulkEdit: true in PartShape metadata -->
        <!-- NOTE: Hide EntityCard's action buttons with CSS, use modal's Apply button instead -->
        <div class="bulk-edit-entity-card">
          <!--
            LEARNING: EntityCard for bulk edit form
            WHY: Uses EntityCard for consistency, but prevents actual saves
            PATTERN: Set isNew=false and intercept saved event to prevent API calls
            NOTE: Field blur auto-save is disabled by intercepting saved event
            NOTE: Pass filtered metadata that only includes fields with bulkEdit: true
          -->
          <EntityCard
            ref="entityCardRef"
            entity-key="partInstance"
            :entity="templateEntity"
            :expanded="true"
            :field-metadata="filteredMetadata"
            :is-new="false"
            :disable-auto-save="true"
            :use-expansion-panel="false"
            @saved="handleEntityCardSaved"
          />
        </div>
      </VCardText>

      <VCardActions class="pa-6">
        <VSpacer />
        <VBtn
          color="secondary"
          variant="tonal"
          @click="updateModelValue(false)"
        >
          Cancel
        </VBtn>
        <VBtn
          color="primary"
          variant="elevated"
          @click="handleApply"
        >
          Apply to All ({{ instanceCount }})
        </VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { GlobalEntity } from '@/types/entities'
import EntityCard from '@/components/admin/generic/EntityCard.vue'
import { useAdminConfig } from '@/composables/useAdminConfig'
import type { GlobalFieldKey } from '@/constants/primitives'
import type { PartInstanceBulkEditData } from '@/composables/admin/usePartInstanceBulkEdit'
import { useEntityMetadata } from '@/composables/admin/useEntityMetadata'
import { useGlobal } from '@/composables/useGlobal'
import { useEntityCrud } from '@/composables/useEntity'

interface Props {
  modelValue?: boolean
  blockInstanceId: string
  bulkEditData?: PartInstanceBulkEditData | null
  instanceCount: number
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'confirm', bulkEditData: PartInstanceBulkEditData): void
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  bulkEditData: () => ({
    baseTime: null,
    rateOverBaseTime: null,
    baseFee: null,
    rateOverBaseFee: null
  })
})
const emit = defineEmits<Emits>()

const adminConfig = useAdminConfig()
const entityCardRef = ref<InstanceType<typeof EntityCard> | null>(null)
const { globalData } = useGlobal()
const { entities: partInstances } = useEntityCrud('partInstance')

/**
 * LEARNING: Get PartInstance metadata
 * WHY: Need PartInstance metadata to filter based on PartShape bulkEdit flags
 * PATTERN: Use metadata keys exclusively
 */
const { fieldMetadata: partInstanceMetadata } = useEntityMetadata('partInstance', computed(() => null))

/**
 * LEARNING: Get PartShape from first PartInstance for this BlockInstance
 * WHY: Bulk edit uses PartShape.fieldMetadata to determine bulk edit enabled fields
 * PATTERN: Get first PartInstance, then get its PartShape
 */
const partShapeForBulkEdit = computed(() => {
  // Get PartInstances for this BlockInstance via relationships.activeConstituents
  const relationships = globalData.value?.relationships?.activeConstituents ?? []
  const constituentIds = new Set(
    relationships
      .filter(rel => String(rel.parent.id) === String(props.blockInstanceId))
      .flatMap(rel => rel.children.map(child => String(child.id)))
  )

  const instances = partInstances.value.filter(pi => constituentIds.has(String(pi.id)))
  
  if (instances.length === 0) return null
  
  // Get PartShape from first PartInstance
  const firstInstance = instances[0]
  if (!firstInstance.partShapeRef) return null
  
  return (globalData.value?.entities?.partShape?.find(
    ps => String(ps.id) === String(firstInstance.partShapeRef)
  ) as import('@/types/entities').PartShapeEntity | undefined) || null
})

// LEARNING: Fetch field metadata for bulk edit using unified system
// WHY: Need to check which fields have bulkEdit: true
// PATTERN: Use useEntityMetadata with PartShape entity
const { fieldMetadata: bulkEditFieldMetadata } = useEntityMetadata(
  'partShape',
  partShapeForBulkEdit
)

/**
 * LEARNING: Filter PartInstance metadata to only include fields with bulkEdit: true
 * WHY: Bulk edit modals should only show fields enabled for bulk edit in PartShape metadata
 * PATTERN: Filter metadata before passing to EntityCard
 */
import type { FieldMetadataEntry } from '@/types/entityMetadata'
const filteredMetadata = computed<Record<string, FieldMetadataEntry>>(() => {
  const partInstanceMeta = partInstanceMetadata.value
  const partShapeMeta = bulkEditFieldMetadata.value
  
  if (!partInstanceMeta || Object.keys(partInstanceMeta).length === 0) {
    return {}
  }
  
  if (!partShapeMeta || Object.keys(partShapeMeta).length === 0) {
    return {}
  }
  
  const filtered: Record<string, FieldMetadataEntry> = {}
  Object.entries(partInstanceMeta).forEach(([fieldKey, fieldMeta]) => {
    // Only include if PartShape metadata has bulkEdit: true for this field
    const partShapeFieldMeta = partShapeMeta[fieldKey]
    if (partShapeFieldMeta?.bulkEdit === true) {
      filtered[fieldKey] = fieldMeta
    }
  })
  
  return filtered
})

/**
 * LEARNING: Create template entity with ONLY id and bulk edit enabled fields
 * WHY: If form only has fields we want, we don't need sanitization workarounds
 * PATTERN: Minimal entity - only id and bulk-editable fields, nothing else
 * FIX: Remove entityKey, name, partShapeRef, orderIndex - these aren't bulk-editable and shouldn't be in form/payload
 */
const templateEntity = computed<GlobalEntity<'partInstance'>>(() => {
  const editData = props.bulkEditData || {}
  const template: Partial<GlobalEntity<'partInstance'>> = {
    id: '00000000-0000-0000-0000-000000000000', // Placeholder UUID
    // LEARNING: Only include id - don't include entityKey, name, partShapeRef, orderIndex
    // WHY: These fields aren't bulk-editable and shouldn't be in the form/payload
  }
  
  // Only include fields that are in filtered metadata (have bulkEdit: true)
  Object.keys(filteredMetadata.value).forEach(field => {
    const value = editData[field as keyof PartInstanceBulkEditData]
    if (value !== undefined) {
      (template as Record<string, unknown>)[field] = value ?? null
    } else {
      (template as Record<string, unknown>)[field] = null
    }
  })
  
  return template as GlobalEntity<'partInstance'>
})

function updateModelValue(value: boolean) {
  emit('update:modelValue', value)
}

/**
 * LEARNING: Handle EntityCard saved event (prevent actual save)
 * WHY: EntityCard will try to save when fields blur, but we don't want to save the template entity
 * PATTERN: Intercept saved event and do nothing - we'll extract values manually in handleApply
 */
function handleEntityCardSaved() {
  // Do nothing - prevent EntityCard from actually saving the template entity
  // We extract form values manually in handleApply instead
}

/**
 * LEARNING: Handle Apply button click
 * WHY: Extract form values from EntityCard and emit as bulk edit data
 * PATTERN: Dynamically read fields with bulkEdit: true from config, extract only those fields
 * FIX: Remove hardcoded field list, use config to determine which fields to extract
 */
function handleApply() {
  if (!entityCardRef.value?.form) {
    return
  }
  
  const formValues = entityCardRef.value.form.values
  
  // Extract only fields that have bulkEdit: true and have values
  const bulkEditData: PartInstanceBulkEditData = {}
  const partShapeMeta = bulkEditFieldMetadata.value
  Object.keys(filteredMetadata.value).forEach(field => {
    // FIX: formValues is a generic form values object, need type assertion for field access
    const value = (formValues as Record<string, unknown>)[field]
    // Only include if value is not null, undefined, or empty string
    if (value !== null && value !== undefined && value !== '') {
      // Convert to number for numeric fields
      const numericValue = Number(value)
      if (!isNaN(numericValue)) {
        (bulkEditData as Record<string, number>)[field] = numericValue
      }
    }
  })
  
  emit('confirm', bulkEditData)
  updateModelValue(false)
}
</script>

<style scoped>
/* LEARNING: Hide EntityCard's action buttons in bulk edit modal */
/* WHY: Modal has its own Apply button, don't need EntityCard's Save button */
/* PATTERN: Use CSS to hide the action buttons section */
.bulk-edit-entity-card :deep(.d-flex.align-center.justify-end.mt-4.pt-4) {
  display: none !important;
}
</style>
