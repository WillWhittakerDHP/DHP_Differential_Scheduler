<template>
  <BulkEditModal
    :model-value="modelValue"
    :content="bulkEditContent"
    :labels="bulkEditLabels"
    @update:model-value="updateModelValue"
    @confirm="handleConfirm"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { toGlobalEntityId } from '@/utils/globalEntity'
import type { GlobalEntity } from '@/types/entities'
import type { TernaryBoolean } from '@/types/ternary'
import { createLogger } from '@/utils/logger'
import { asEmptyObject, asEmptyString } from '@/utils/safeDefaults'
import { useEntityMetadata } from '@/composables/admin/useEntityMetadata'
import { buildBulkEditDataFromForm } from '@/utils/admin/instanceBulkEdit'
import BulkEditModal from '@/components/admin/BulkEditModal.vue'

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
      bookingMode: undefined as TernaryBoolean | undefined,
      agentPermissions: undefined as TernaryBoolean | undefined,
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
      bookingMode: undefined,
      agentPermissions: undefined,
      isMultiFamily: false,
      requiresAgent: false
    } satisfies GlobalEntity<'blockInstance'>
  }
})

const { fieldMetadata: blockInstanceMetadata } = useEntityMetadata('blockInstance', templateEntity)

const filteredMetadata = computed(() => {
  const metadata = blockInstanceMetadata.value
  if (!metadata || Object.keys(metadata).length === 0) return {}
  return Object.fromEntries(
    Object.entries(metadata).filter(([_, fieldMeta]) => fieldMeta.bulkEdit === true)
  )
})

const bulkEditContent = computed(() => ({
  entityKey: 'blockInstance' as const,
  entity: templateEntity.value,
  fieldMetadata: filteredMetadata.value,
}))

const bulkEditLabels = computed(() => ({
  title: `Bulk Edit: ${props.blockShapeName}`,
  description:
    'Apply the same values to all BlockInstances for this BlockShape. Leave fields empty to skip them.',
  instanceCount: props.instanceCount,
}))

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
