<template>
  <BulkEditModal
    :model-value="modelValue"
    entity-key="partInstance"
    :entity="templateEntity"
    :field-metadata="filteredMetadata"
    title="Bulk Edit: Part Instances"
    description="Apply the same values to all PartInstances for this BlockInstance. Leave fields empty to skip them."
    :instance-count="instanceCount"
    :persistent="false"
    @update:model-value="updateModelValue"
    @confirm="handleConfirm"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { toGlobalEntityId } from '@/utils/globalEntity'
import type { GlobalEntity } from '@/types/entities'
import { createLogger } from '@/utils/logger'
import { asEmptyString } from '@/utils/safeDefaults'
import type { PartInstanceBulkEditData } from '@/types/admin/partInstanceBulkEdit'
import { usePartInstanceBulkEdit } from '@/composables/admin/usePartInstanceBulkEdit'
import { useEntityMetadata } from '@/composables/admin/useEntityMetadata'
import { useGlobal } from '@/composables/useGlobal'
import { useEntityCrud } from '@/composables/entityCrud/useEntityCrud'
import BulkEditModal from '@/components/admin/BulkEditModal.vue'

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

const { fieldMetadata: partInstanceMetadata } = useEntityMetadata('partInstance', templateEntity)

const filteredMetadata = computed(() => {
  const metadata = partInstanceMetadata.value
  if (!metadata || Object.keys(metadata).length === 0) return {}
  return Object.fromEntries(
    Object.entries(metadata).filter(([_, fieldMeta]) => fieldMeta.bulkEdit === true)
  )
})

function updateModelValue(value: boolean) {
  emit('update:modelValue', value)
}

function handleConfirm(formValues: Record<string, unknown>) {
  const bulkEditData = buildBulkEditDataFromForm(
    Object.keys(filteredMetadata.value),
    formValues
  )
  emit('confirm', bulkEditData)
}
</script>
