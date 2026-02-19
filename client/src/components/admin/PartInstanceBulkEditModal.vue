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
        <!-- PATTERN: Filter metadata to only include fields where bulkEdit: true -->
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
import { createLogger } from '@/utils/logger'
import { toGlobalEntityId, type GlobalEntity } from '@/types/entities'
import EntityCard from '@/components/admin/generic/EntityCard.vue'
import type { PartInstanceBulkEditData } from '@/composables/admin/usePartInstanceBulkEdit'
import { useEntityMetadata } from '@/composables/admin/useEntityMetadata'
import { useGlobal } from '@/composables/useGlobal'
import { useEntityCrud } from '@/composables/useEntity'

const logger = createLogger('PartInstanceBulkEditModal')

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

const entityCardRef = ref<InstanceType<typeof EntityCard> | null>(null)
const { globalData } = useGlobal()
const { entities: partInstances } = useEntityCrud('partInstance')

const firstPartInstanceForMetadata = computed(() => {
  const raw = globalData.value?.relationships?.partAssignments
  if (raw === undefined || raw === null) {
    logger.debug('firstPartInstanceForMetadata: partAssignments missing, using []')
  }
  const relationships = raw !== undefined && raw !== null ? raw : []
  const constituentIds = new Set(
    relationships
      .filter(rel => rel.parent.id === props.blockInstanceId)
      .flatMap(rel => rel.children.map(child => child.id))
  )

  const instances = partInstances.value.filter(pi => constituentIds.has(pi.id))
  
  if (instances.length === 0) return null
  
  return instances[0]
})

const partShapeRef = computed(() => {
  const firstInstance = firstPartInstanceForMetadata.value
  const raw = firstInstance?.partShapeRef
  return raw !== undefined && raw !== null && raw !== '' ? raw : ''
})

/**
 * LEARNING: Template entity for bulk edit form
 * WHY: EntityCard needs an entity object, but we don't want to save it
 * PATTERN: Use a placeholder UUID that will fail gracefully when field blur tries to save
 * NOTE: Field blur will try to save, but since this ID doesn't exist, it will fail safely
 * NOTE: Defined early so it can be used by useEntityMetadata below
 * FIX: Create templateEntity FIRST with partShapeRef (like InstanceBulkEditModal does with blockShapeRef)
 */
const templateEntity = computed<GlobalEntity<'partInstance'>>(() => {
  try {
    const editData = props.bulkEditData !== undefined && props.bulkEditData !== null ? props.bulkEditData : {}
    const base = {
      id: toGlobalEntityId('00000000-0000-0000-0000-000000000000'),
      entityKey: 'partInstance' as const,
      name: '',
      partShapeRef: partShapeRef.value || '',
      orderIndex: 0,
      baseTime: editData.baseTime ?? 0,
      rateOverBaseTime: editData.rateOverBaseTime ?? 0,
      baseFee: editData.baseFee ?? 0,
      rateOverBaseFee: editData.rateOverBaseFee ?? 0,
      active: true,
      zeroOutPart: false
    }
    if (!partShapeRef.value) {
      return base satisfies GlobalEntity<'partInstance'>
    }
    return { ...base, partShapeRef: partShapeRef.value } satisfies GlobalEntity<'partInstance'>
  } catch (error) {
    logger.error('Error creating templateEntity', { error })
    return {
      id: toGlobalEntityId('00000000-0000-0000-0000-000000000000'),
      entityKey: 'partInstance',
      name: '',
      partShapeRef: partShapeRef.value !== undefined && partShapeRef.value !== null && partShapeRef.value !== '' ? partShapeRef.value : '',
      orderIndex: 0,
      baseTime: 0,
      rateOverBaseTime: 0,
      baseFee: 0,
      rateOverBaseFee: 0,
      active: true,
      zeroOutPart: false
    } satisfies GlobalEntity<'partInstance'>
  }
})

import type { FieldMetadataEntry } from '@/types/entityMetadata'
const { fieldMetadata: partInstanceMetadata } = useEntityMetadata('partInstance', templateEntity)

/**
 * LEARNING: Filter metadata to only include fields with bulkEdit: true
 * WHY: Bulk edit modals should only show fields enabled for bulk edit
 * PATTERN: Filter metadata before passing to EntityCard
 */
const filteredMetadata = computed<Record<string, FieldMetadataEntry>>(() => {
  const metadata = partInstanceMetadata.value
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
  
  // WHY: Functional approach - build object without mutations
  // PATTERN: Reduce to transform filteredMetadata keys into bulkEditData object
  const bulkEditData: PartInstanceBulkEditData = Object.keys(filteredMetadata.value).reduce((acc, field) => {
    const value = (formValues as Record<string, unknown>)[field]
    if (value !== null && value !== undefined && value !== '') {
      const numericValue = Number(value)
      if (!isNaN(numericValue)) {
        (acc as Record<string, number>)[field] = numericValue
      }
    }
    return acc
  }, {} as PartInstanceBulkEditData)
  
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
