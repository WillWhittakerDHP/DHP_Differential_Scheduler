/**
 * PATTERN: Create/duplicate modal state and handlers for Instances tab.
 * WHY: Keeps InstancesTab.vue under vue-architecture limits (script size, function count).
 */
import { ref } from 'vue'
import type { GlobalEntityId } from '@shared/types/primitiveBrands'
import { toGlobalEntityId } from '@/utils/globalEntity'
import type { GlobalEntityKey } from '@/constants/entities'
import type { GlobalEntity } from '@/types/entities'

export function useInstancesTabCreateModal() {
  const createModalOpen = ref(false)
  const createModalBlockShapeId = ref<GlobalEntityId>(toGlobalEntityId(''))
  const createModalSourceEntity = ref<GlobalEntity<'blockInstance'> | undefined>(undefined)

  const handleCreateClick = (blockShapeId: string): void => {
    createModalBlockShapeId.value = toGlobalEntityId(blockShapeId)
    createModalSourceEntity.value = undefined
    createModalOpen.value = true
  }

  const handleDuplicateClick = (sourceEntity: GlobalEntity<GlobalEntityKey>): void => {
    const blockInstanceEntity = sourceEntity as GlobalEntity<'blockInstance'>
    createModalBlockShapeId.value = toGlobalEntityId(blockInstanceEntity.blockShapeRef)
    createModalSourceEntity.value = blockInstanceEntity
    createModalOpen.value = true
  }

  const handleInstanceCreated = (_entity: GlobalEntity<'blockInstance'>): void => {
    createModalOpen.value = false
  }

  return {
    createModalOpen,
    createModalBlockShapeId,
    createModalSourceEntity,
    handleCreateClick,
    handleDuplicateClick,
    handleInstanceCreated,
  }
}
