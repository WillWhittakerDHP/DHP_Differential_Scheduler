<template>
  <VDialog
    :model-value="modelValue"
    @update:model-value="updateModelValue"
    max-width="800"
  >
    <VCard>
      <VCardTitle class="d-flex align-center justify-space-between pa-6">
        <span class="text-h5">Bulk Edit: {{ blockShapeName }}</span>
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
          Apply the same values to all BlockInstances for this BlockShape. Leave fields empty to skip them.
        </p>

        <!-- LEARNING: EntityCard with only bulkEdit fields visible -->
        <!-- WHY: Uses EntityCard for consistency, but filters metadata to show only bulkEdit fields -->
        <!-- PATTERN: Filter metadata to only include fields where bulkEdit: true -->
        <!-- NOTE: Hide EntityCard's action buttons with CSS, use modal's Apply button instead -->
        <div class="bulk-edit-entity-card">
          <!--
            LEARNING: EntityCard for bulk edit form
            WHY: Uses EntityCard for consistency, but prevents actual saves
            PATTERN: Set isNew=false and intercept saved event to prevent API calls
            NOTE: Field blur auto-save is disabled by using a non-existent entity ID
            NOTE: Pass filtered metadata that only includes fields with bulkEdit: true
          -->
          <EntityCard
            ref="entityCardRef"
            entity-key="blockInstance"
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

interface Props {
  modelValue?: boolean
  blockShapeId: string
  blockShapeName: string
  bulkEditData?: { baseSqFt?: number }
  instanceCount: number
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'confirm', bulkEditData: { baseSqFt?: number }): void
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  bulkEditData: () => ({})
})
const emit = defineEmits<Emits>()

const adminConfig = useAdminConfig()
const entityCardRef = ref<InstanceType<typeof EntityCard> | null>(null)

/**
 * LEARNING: Template entity for bulk edit form
 * WHY: EntityCard needs an entity object, but we don't want to save it
 * PATTERN: Use a placeholder UUID that will fail gracefully when field blur tries to save
 * NOTE: Field blur will try to save, but since this ID doesn't exist, it will fail safely
 * NOTE: Defined early so it can be used by useEntityMetadata below
 */
const templateEntity = computed<GlobalEntity<'blockInstance'>>(() => {
  try {
    const editData = props.bulkEditData || {}
    // Guard against missing blockShapeId
    if (!props.blockShapeId) {
      console.warn('[InstanceBulkEditModal] blockShapeId not available yet')
      // Return a minimal entity that will be replaced when blockShapeId is available
      return {
        id: '00000000-0000-0000-0000-000000000000',
        entityKey: 'blockInstance',
        name: '',
        blockShapeRef: '',
        baseSqFt: editData.baseSqFt,
        active: true,
        composite: false,
        orderIndex: 0,
        icon: null,
        allowMultiple: false,
        requiresUnitNumber: false,
        differential: false
      } as unknown as GlobalEntity<'blockInstance'>
    }
    
    // FIX: Type conversion needed because object literal doesn't match all required properties
    const entity = {
      id: '00000000-0000-0000-0000-000000000000', // Placeholder UUID that doesn't exist
      entityKey: 'blockInstance',
      name: '',
      blockShapeRef: props.blockShapeId,
      baseSqFt: editData.baseSqFt,
      active: true,
      composite: false,
      orderIndex: 0,
      icon: null,
      allowMultiple: false,
      requiresUnitNumber: false,
      differential: false
    } as unknown as GlobalEntity<'blockInstance'>
    
    return entity
  } catch (error) {
    console.error('[InstanceBulkEditModal] Error creating templateEntity:', error)
    // Return a safe fallback
    return {
      id: '00000000-0000-0000-0000-000000000000',
      entityKey: 'blockInstance',
      name: '',
      blockShapeRef: props.blockShapeId || '',
      baseSqFt: undefined,
      active: true,
      composite: false,
      orderIndex: 0,
      icon: null,
      allowMultiple: false,
      requiresUnitNumber: false,
      differential: false
    } as unknown as GlobalEntity<'blockInstance'>
  }
})

/**
 * LEARNING: Get metadata and filter to only include bulkEdit fields
 * WHY: Metadata is the single source of truth - filter at metadata level
 * PATTERN: Only include fields where bulkEdit: true in metadata
 */
import { useEntityMetadata } from '@/composables/admin/useEntityMetadata'
import type { FieldMetadataEntry } from '@/types/entityMetadata'
const { fieldMetadata: blockInstanceMetadata } = useEntityMetadata('blockInstance', templateEntity)

/**
 * LEARNING: Filter metadata to only include fields with bulkEdit: true
 * WHY: Bulk edit modals should only show fields enabled for bulk edit
 * PATTERN: Filter metadata before passing to EntityCard
 */
const filteredMetadata = computed<Record<string, FieldMetadataEntry>>(() => {
  const metadata = blockInstanceMetadata.value
  if (!metadata || Object.keys(metadata).length === 0) {
    return {}
  }
  
  const filtered: Record<string, FieldMetadataEntry> = {}
  Object.entries(metadata).forEach(([fieldKey, fieldMeta]) => {
    if (fieldMeta.bulkEdit === true) {
      filtered[fieldKey] = fieldMeta
    }
  })
  
  return filtered
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
 * PATTERN: Access EntityCard's exposed form instance to get current values
 */
function handleApply() {
  if (!entityCardRef.value?.form) {
    return
  }
  
  const formValues = entityCardRef.value.form.values
  const bulkEditData: { baseSqFt?: number } = {}
  
  // LEARNING: Type assertion for form values
  // WHY: form.values is typed as Record<string, unknown>, but we know it contains blockInstance fields including baseSqFt
  // PATTERN: Assert type to access baseSqFt property safely
  const blockInstanceFormValues = formValues as Record<string, unknown> & { baseSqFt?: number | string | null }
  
  // Extract baseSqFt if it has a value
  if (blockInstanceFormValues.baseSqFt !== null && blockInstanceFormValues.baseSqFt !== undefined && blockInstanceFormValues.baseSqFt !== '') {
    bulkEditData.baseSqFt = Number(blockInstanceFormValues.baseSqFt)
  }
  
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
