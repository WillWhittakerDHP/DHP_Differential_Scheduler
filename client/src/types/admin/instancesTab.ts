import type { ComputedRef, Ref } from 'vue'
import type { GlobalEntity } from '@/types/entities'
import type { GlobalEntityId } from '@shared/types/primitiveBrands'
import type { InstancesTabContext } from '@/composables/admin/injectionKeys'

export interface UseInstancesTabReturn {
  instancesTabContext: InstancesTabContext
  activeTab: Ref<string>
  sortedBlockShapes: ComputedRef<GlobalEntity<'blockShape'>[]>
  blockInstancesCountByShape: ComputedRef<Map<string, number>>
  bulkEditMode: Ref<Map<string, boolean>>
  getBulkEditData: (blockShapeId: string) => Record<string, number | null | undefined>
  handleBulkEditConfirm: (blockShapeId: string, data: Record<string, number | null | undefined>) => void
  handleTabClick: (tabValue: string) => void
  shapeEditModalOpen: Ref<Map<string, boolean>>
  createModalOpen: Ref<boolean>
  setCreateModalOpen: (value: boolean) => void
  createModalBlockShapeId: Ref<GlobalEntityId>
  createModalSourceEntity: Ref<GlobalEntity<'blockInstance'> | undefined>
  handleInstanceCreated: (entity: GlobalEntity<'blockInstance'>) => void
  handleExistingBlockShapeSaved: (shapeId: string) => void
  filteredEventInstances: ComputedRef<GlobalEntity<'eventInstance'>[]>
  eventInstanceMetadataModalOpen: Ref<boolean>
  eventInstanceFieldsGlobalEntity: ComputedRef<GlobalEntity<'eventInstance'>>
}
