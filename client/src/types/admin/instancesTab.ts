import type { ComputedRef, Ref } from 'vue'
import type { GlobalEntity } from '@/types/entities'
import type { GlobalEntityId } from '@shared/types/primitiveBrands'
import type { InstancesTabContext } from '@/types/admin/adminInjectionKeys'

export interface UseInstancesTabReturn {
  instancesTabContext: InstancesTabContext
  activeTab: Ref<string>
  sortedBlockShapes: ComputedRef<GlobalEntity<'blockShape'>[]>
  blockInstancesCountByShape: ComputedRef<Map<string, number>>
  bulkEditMode: Ref<Map<string, boolean>>
  getBulkEditData: (blockShapeId: string) => Record<string, unknown>
  handleBulkEditConfirm: (blockShapeId: string, data: Record<string, unknown>) => void
  handleTabClick: (tabValue: string) => void
  createModalOpen: Ref<boolean>
  setCreateModalOpen: (value: boolean) => void
  createModalBlockShapeId: Ref<GlobalEntityId>
  createModalSourceEntity: Ref<GlobalEntity<'blockInstance'> | undefined>
  handleInstanceCreated: (entity: GlobalEntity<'blockInstance'>) => void
  splitOrchestratorAtomicEnabled: ComputedRef<boolean>
  orchestratorAtomicSubTab: Ref<'orchestrator' | 'atomic'>
  hasOrchestratorForShape: (shapeId: string) => boolean
}
