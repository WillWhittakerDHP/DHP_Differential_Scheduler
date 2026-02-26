/**
 * PATTERN: Create/duplicate modal state and handlers for Instances tab.
 * WHY: Keeps InstancesTab.vue under vue-architecture limits (script size, function count).
 */
import { ref } from 'vue'
import type { GlobalEntityId } from '@shared/types/primitiveBrands'
import { toGlobalEntityId } from '@/utils/globalEntity'
import type { Ref } from 'vue'
import type { GlobalEntityKey } from '@/constants/entities'
import type { GlobalEntity } from '@/types/entities'

export interface UseInstancesTabCreateModalReturn {
  createModalOpen: Ref<boolean>
  createModalBlockShapeId: Ref<GlobalEntityId>
  createModalSourceEntity: Ref<GlobalEntity<'blockInstance'> | undefined>
  handleCreateClick: (blockShapeId: string) => void
  handleDuplicateClick: (sourceEntity: GlobalEntity<GlobalEntityKey>) => void
  handleInstanceCreated: (_entity: GlobalEntity<'blockInstance'>) => void
}

export function useInstancesTabCreateModal(): UseInstancesTabCreateModalReturn {
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
