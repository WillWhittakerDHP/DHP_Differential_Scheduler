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
import { toGlobalEntityId, type GlobalEntity } from '@/types/entities'
import type { TernaryBoolean } from '@/types/ternary'
import EntityCard from '@/components/admin/generic/EntityCard.vue'
import { createLogger } from '@/utils/logger'

const logger = createLogger('InstanceBulkEditModal')

interface Props {
  modelValue?: boolean
  blockShapeId: string
  blockShapeName: string
  bulkEditData?: Record<string, number | null | undefined>
  instanceCount: number
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'confirm', bulkEditData: Record<string, number | null | undefined>): void
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  bulkEditData: () => ({})
})
const emit = defineEmits<Emits>()

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
    const base = {
      id: toGlobalEntityId('00000000-0000-0000-0000-000000000000'),
      entityKey: 'blockInstance' as const,
      name: '',
      blockShapeRef: props.blockShapeId ?? '',
      baseSqFt: editData.baseSqFt ?? 0,
      active: true,
      composite: false,
      orderIndex: 0,
      icon: '',
      allowMultiple: false,
      requiresUnitNumber: false,
      differential: undefined as TernaryBoolean | undefined,
      isMultiFamily: false,
      requiresAgent: false
    }
    if (!props.blockShapeId) {
      return base satisfies GlobalEntity<'blockInstance'>
    }
    return { ...base, blockShapeRef: props.blockShapeId } satisfies GlobalEntity<'blockInstance'>
  } catch (error) {
    logger.error('Error creating templateEntity', { error })
    return {
      id: toGlobalEntityId('00000000-0000-0000-0000-000000000000'),
      entityKey: 'blockInstance',
      name: '',
      blockShapeRef: props.blockShapeId || '',
      baseSqFt: 0,
      active: true,
      composite: false,
      orderIndex: 0,
      icon: '',
      allowMultiple: false,
      requiresUnitNumber: false,
      differential: undefined,
      isMultiFamily: false,
      requiresAgent: false
    } satisfies GlobalEntity<'blockInstance'>
  }
})

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
  
  // WHY: Functional approach avoids mutations, aligns with workspace rules
  // PATTERN: Filter entries and convert back to object
  return Object.fromEntries(
    Object.entries(metadata).filter(([_, fieldMeta]) => fieldMeta.bulkEdit === true)
  )
})

function updateModelValue(value: boolean) {
  emit('update:modelValue', value)
}

function handleEntityCardSaved() {
}

function handleApply() {
  if (!entityCardRef.value?.form) {
    return
  }
  
  const formValues = entityCardRef.value.form.values
  
  // WHY: Use filteredMetadata as source of truth for which fields to extract
  // PATTERN: Use reduce instead of forEach + property assignment - functional approach
  const bulkEditData: Record<string, number | null | undefined> = Object.keys(filteredMetadata.value).reduce((acc, field) => {
    const value = (formValues as Record<string, unknown>)[field]
    if (value !== null && value !== undefined && value !== '') {
      const numericValue = Number(value)
      if (!isNaN(numericValue)) {
        acc[field] = numericValue
      }
    }
    return acc
  }, {} as Record<string, number | null | undefined>)
  
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
