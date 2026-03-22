<!--
  WHY: Provides parts-specific bulk edit functionality while using generic RelationshipCollection
  PATTERN: Thin wrapper that adds parts-specific features (bulk edit modal) to generic component
-->
<template>
  <RelationshipCollection
    :field-context="fieldContext"
    collection-type="parts"
    :bulk-edit-modal-component="PartInstanceBulkEditModal"
    :name-generator="generatePartInstanceName"
    ref="relationshipCollectionRef"
  />
</template>

<script setup lang="ts">
/**
 * 
 *      Maintains backward compatibility while using generic collection pattern
 * 
 */
import type { UseSelectConfigOptions } from '@/types/admin/selectConfig'
import { computed, ref } from 'vue'
import RelationshipCollection from './RelationshipCollection.vue'
import PartInstanceBulkEditModal from '../../PartInstanceBulkEditModal.vue'
import type { GlobalEntityKey } from '@/constants/entities'
import type { GlobalEntity, PartInstanceEntity } from '@/types/entities'
import { usePartInstanceBulkEdit } from '@/composables/admin/usePartInstanceBulkEdit'
import { useRelationshipCollection } from '@/composables/admin/useRelationshipCollection'

const props = defineProps<UseSelectConfigOptions>()

const generatePartInstanceName = (
  blockInstanceName: string,
  partShapeName: string,
  _blockInstanceId: string,
  _partShapeId: string,
  existingChildren: GlobalEntity<GlobalEntityKey>[]
): string => {
  // PATTERN: Only check partShapeRef since blockInstance is already known from the relationship parent
  const matchingPartInstances = existingChildren.filter((child) => {
    const partInstance = child as PartInstanceEntity
    return partInstance.partShapeRef === _partShapeId
  })
  
  const baseName = `${blockInstanceName}-${partShapeName}`
  
  if (matchingPartInstances.length === 0) {
    return baseName
  }
  
  const baseNameExists = matchingPartInstances.some(
    (pi) => (pi as PartInstanceEntity).name === baseName
  )
  if (!baseNameExists) {
    return baseName
  }
  
  let number = 1
  while (matchingPartInstances.some(
    (pi) => (pi as PartInstanceEntity).name === `${baseName}-${number}`
  )) {
    number++
  }
  
  return `${baseName}-${number}`
}

useRelationshipCollection({
  fieldContext: props.fieldContext,
  nameGenerator: generatePartInstanceName,
  enableBulkEdit: true,
  bulkEditComposable: (model) => {
    const bulkEdit = usePartInstanceBulkEdit({
      existingPartInstances: computed(() => {
        const raw = model.existingChildren.value
return (raw !== undefined && raw !== null && Array.isArray(raw) ? raw : []) as GlobalEntity<'partInstance'>[]
      })
    })
    
    return {
      bulkEditMode: bulkEdit.bulkEditMode,
      bulkEditData: bulkEdit.bulkEditData,
      toggleBulkEditMode: bulkEdit.toggleBulkEditMode,
      applyBulkEdit: bulkEdit.applyPartInstanceBulkEdit,
      handleBulkEditModalUpdate: bulkEdit.handleBulkEditModalUpdate,
      handleBulkEditConfirm: bulkEdit.handleBulkEditConfirm as (data: Record<string, unknown>) => void
    }
  }
})

const relationshipCollectionRef = ref<InstanceType<typeof RelationshipCollection> | null>(null)

const bulkEditMode = computed(() => relationshipCollectionRef.value?.bulkEditMode)
const toggleBulkEditMode = () => {
  relationshipCollectionRef.value?.toggleBulkEditMode?.()
}

defineExpose({
  bulkEditMode,
  toggleBulkEditMode
})
</script>
