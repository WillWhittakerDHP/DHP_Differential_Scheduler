<!--
  LEARNING: PartsCollection component - wrapper around RelationshipCollection for parts
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
 * LEARNING: PartsCollection component - wrapper for parts collection
 * 
 * WHY: Wraps RelationshipCollection with parts-specific features (bulk edit modal)
 *      Maintains backward compatibility while using generic collection pattern
 * 
 * PATTERN: Thin wrapper component that adds collection-specific features
 */

import { computed, ref, type Ref } from 'vue'
import RelationshipCollection from './RelationshipCollection.vue'
import PartInstanceBulkEditModal from '../../PartInstanceBulkEditModal.vue'
import type { GlobalFieldKey } from '@/constants/primitives'
import type { FieldContextType } from '@/composables/useFieldContext'
import type { GlobalEntityKey } from '@/constants/entities'
import type { GlobalEntity } from '@/types/entities'
import { usePartInstanceBulkEdit } from '@/composables/admin/usePartInstanceBulkEdit'
import { useRelationshipCollection } from '@/composables/admin/useRelationshipCollection'

interface Props {
  fieldContext: FieldContextType<GlobalEntityKey, GlobalFieldKey<GlobalEntityKey>>
}

const props = defineProps<Props>()

const generatePartInstanceName = (
  blockInstanceName: string,
  partShapeName: string,
  _blockInstanceId: string,
  _partShapeId: string,
  existingChildren: GlobalEntity<GlobalEntityKey>[]
): string => {
  // PATTERN: Only check partShapeRef since blockInstance is already known from the relationship parent
  const matchingPartInstances = existingChildren.filter((child) => {
    const partInstance = child as import('@/types/entities').PartInstanceEntity
    return partInstance.partShapeRef === _partShapeId
  })
  
  const baseName = `${blockInstanceName}-${partShapeName}`
  
  if (matchingPartInstances.length === 0) {
    return baseName
  }
  
  const baseNameExists = matchingPartInstances.some(
    (pi) => (pi as import('@/types/entities').PartInstanceEntity).name === baseName
  )
  if (!baseNameExists) {
    return baseName
  }
  
  let number = 1
  while (matchingPartInstances.some(
    (pi) => (pi as import('@/types/entities').PartInstanceEntity).name === `${baseName}-${number}`
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
        return (model.existingChildren.value || []) as GlobalEntity<'partInstance'>[]
      })
    })
    
    return {
      bulkEditMode: bulkEdit.bulkEditMode as Ref<boolean>,
      bulkEditData: bulkEdit.bulkEditData as Ref<Record<string, unknown>>,
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
