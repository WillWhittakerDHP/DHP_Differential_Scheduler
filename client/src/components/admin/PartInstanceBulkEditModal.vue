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
import { toGlobalEntityId } from '@/utils/globalEntity'
import type { GlobalEntity } from '@/types/entities'
import EntityCard from '@/components/admin/generic/EntityCard.vue'
import {
  usePartInstanceBulkEdit,
  type PartInstanceBulkEditData,
} from '@/composables/admin/usePartInstanceBulkEdit'
import { useEntityMetadata } from '@/composables/admin/useEntityMetadata'
import { useGlobal } from '@/composables/useGlobal'
import { useEntityCrud } from '@/composables/entityCrud/useEntityCrud'
import { asEmptyString } from '@/utils/safeDefaults'

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

const partAssignments = computed(() => globalData.value?.relationships?.partAssignments ?? null)

const { firstPartInstanceForMetadata, buildBulkEditDataFromForm } = usePartInstanceBulkEdit({
  blockInstanceId: props.blockInstanceId,
  partInstances,
  partAssignments,
  logger,
})

const partShapeRef = computed(() => {
  const firstInstance = firstPartInstanceForMetadata.value
  const raw = firstInstance?.partShapeRef
  return raw !== undefined && raw !== null && raw !== '' ? raw : ''
})

/**
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
      partShapeRef: asEmptyString(partShapeRef.value),
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
      partShapeRef: asEmptyString(partShapeRef.value),
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

import type { FieldMetadataEntry } from '@/constants/fieldMetadata'
const { fieldMetadata: partInstanceMetadata } = useEntityMetadata('partInstance', templateEntity)

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
  const bulkEditData = buildBulkEditDataFromForm(
    Object.keys(filteredMetadata.value),
    entityCardRef.value.form.values as Record<string, unknown>
  )
  emit('confirm', bulkEditData)
  updateModelValue(false)
}
</script>

<style scoped>
.bulk-edit-entity-card :deep(.d-flex.align-center.justify-end.mt-4.pt-4) {
  display: none !important;
}
</style>
