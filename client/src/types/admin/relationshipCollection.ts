import type { ComputedRef, Ref } from 'vue'
import type { GlobalEntity } from '@/types/entities'
import type { GlobalEntityKey } from '@/constants/entities'
import type { FieldContextType } from '@/composables/fieldContext/types'
import type { GlobalFieldKey } from '@/constants/primitives'
import type { UseRelationshipCollectionDataReturnBase } from '@/types/admin/relationshipCollectionData'

export type NameGenerator = (
  parentName: string,
  shapeName: string,
  parentId: string,
  shapeId: string,
  existingChildren: GlobalEntity<GlobalEntityKey>[]
) => string

export interface RelationshipCollectionModel extends UseRelationshipCollectionDataReturnBase {
  parentEntity: ComputedRef<GlobalEntity<GlobalEntityKey> | undefined>
  shouldShow: ComputedRef<boolean>
  optionsFieldKey: ComputedRef<string>
  expandedPlaceholders: Ref<string[]>
  getNewChildEntity: (shapeId: string) => GlobalEntity<GlobalEntityKey>
  handleNewChildSaved: (shapeId: string, createdEntity: GlobalEntity<GlobalEntityKey>) => Promise<void>
  handleNewChildCancelled: (shapeId: string) => void
  handleDeleteChildById: (id: string) => Promise<void>
  handleDeleteChild: (entity: GlobalEntity<GlobalEntityKey>) => Promise<void>
  expandedChildren: Ref<string[]>
  isPanelExpanded: (childId: string) => boolean
  bulkEditMode?: Ref<boolean>
  bulkEditData?: Ref<Record<string, unknown>>
  toggleBulkEditMode?: () => void
  applyBulkEdit?: () => Promise<void>
  handleBulkEditModalUpdate?: (value: boolean) => void
  handleBulkEditConfirm?: (data: Record<string, unknown>) => void
}

export interface UseRelationshipCollectionOptions {
  fieldContext: FieldContextType<GlobalEntityKey, GlobalFieldKey<GlobalEntityKey>>
  nameGenerator?: NameGenerator
  enableBulkEdit?: boolean
  bulkEditComposable?: (collectionModel: RelationshipCollectionModel) => {
    bulkEditMode: Ref<boolean>
    bulkEditData: Ref<Record<string, unknown>>
    toggleBulkEditMode: () => void
    applyBulkEdit: () => Promise<void>
    handleBulkEditModalUpdate: (value: boolean) => void
    handleBulkEditConfirm: (data: Record<string, unknown>) => void
  }
}
