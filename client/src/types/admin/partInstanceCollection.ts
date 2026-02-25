import type { ComputedRef, Ref } from 'vue'
import type { GlobalEntity } from '@/types/entities'
import type { PartInstanceBulkEditData } from '@/types/admin/partInstanceBulkEdit'

export interface PartInstanceCollectionModel {
  validPartShapes: Ref<GlobalEntity<'partShape'>[]>
  existingPartInstances: Ref<GlobalEntity<'partInstance'>[]>
  getPartInstanceForShape: (partShapeId: string) => GlobalEntity<'partInstance'> | undefined
  getPartShapeName: (partShapeId: string) => string
  blockInstance: ComputedRef<GlobalEntity<'blockInstance'> | undefined>
  shouldShowPartInstances: ComputedRef<boolean>
  optionsFieldKey: ComputedRef<string>
  expandedPlaceholders: Ref<string[]>
  getNewPartInstanceEntity: (partShapeId: string) => GlobalEntity<'partInstance'>
  handleNewPartInstanceSaved: (partShapeId: string, createdEntity: GlobalEntity<'partInstance'>) => Promise<void>
  handleNewPartInstanceCancelled: (partShapeId: string) => void
  bulkEditMode: Ref<boolean>
  bulkEditData: Ref<PartInstanceBulkEditData>
  toggleBulkEditMode: () => void
  applyPartInstanceBulkEdit: () => Promise<void>
  handleBulkEditModalUpdate: (value: boolean) => void
  handleBulkEditConfirm: (data: PartInstanceBulkEditData) => void
  expandedPartInstances: Ref<string[]>
  isPanelExpanded: (partInstanceId: string) => boolean
}
