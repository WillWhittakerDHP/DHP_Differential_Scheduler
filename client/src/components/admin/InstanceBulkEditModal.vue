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
import { asEmptyObject, asEmptyString } from '@/utils/safeDefaults'

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
 * NOTE: Field blur will try to save, but since this ID doesn't exist, it will fail safely
 * NOTE: Defined early so it can be used by useEntityMetadata below
 */
const templateEntity = computed<GlobalEntity<'blockInstance'>>(() => {
  try {
    const editData = asEmptyObject(props.bulkEditData)
    const base = {
      id: toGlobalEntityId('00000000-0000-0000-0000-000000000000'),
      entityKey: 'blockInstance' as const,
      name: '',
      blockShapeRef: asEmptyString(props.blockShapeId),
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
      blockShapeRef: asEmptyString(props.blockShapeId),
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
import type { FieldMetadataEntry } from '@/constants/fieldMetadata'
const { fieldMetadata: blockInstanceMetadata } = useEntityMetadata('blockInstance', templateEntity)

/**
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
.bulk-edit-entity-card :deep(.d-flex.align-center.justify-end.mt-4.pt-4) {
  display: none !important;
}
</style>
