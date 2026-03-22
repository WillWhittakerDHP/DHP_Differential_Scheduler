import type { ComputedRef, Ref } from 'vue'
import type { GlobalEntity } from '@/types/entities'
import type { PartInstanceBulkEditData } from '@/types/admin/partInstanceBulkEdit'

/** Grouped return for composable-health (oversized-return repair). No direct component consumers. */
export interface PartInstanceCollectionModel {
  data: {
    validPartShapes: Ref<GlobalEntity<'partShape'>[]>
    existingPartInstances: Ref<GlobalEntity<'partInstance'>[]>
    getPartInstanceForShape: (partShapeId: string) => GlobalEntity<'partInstance'> | undefined
    getPartShapeName: (partShapeId: string) => string
    blockInstance: ComputedRef<GlobalEntity<'blockInstance'> | undefined>
    shouldShowPartInstances: ComputedRef<boolean>
    optionsFieldKey: ComputedRef<string>
  }
  state: {
    expandedPlaceholders: Ref<string[]>
    bulkEditMode: Ref<boolean>
    bulkEditData: Ref<PartInstanceBulkEditData>
    expandedPartInstances: Ref<string[]>
  }
  actions: {
    getNewPartInstanceEntity: (partShapeId: string) => GlobalEntity<'partInstance'>
    handleNewPartInstanceSaved: (partShapeId: string, createdEntity: GlobalEntity<'partInstance'>) => Promise<void>
    handleNewPartInstanceCancelled: (partShapeId: string) => void
    toggleBulkEditMode: () => void
    applyPartInstanceBulkEdit: () => Promise<void>
    handleBulkEditModalUpdate: (value: boolean) => void
    handleBulkEditConfirm: (data: PartInstanceBulkEditData) => void
    isPanelExpanded: (partInstanceId: string) => boolean
  }
}
