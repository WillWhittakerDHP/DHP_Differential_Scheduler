import type { ComputedRef, Ref } from 'vue'
import type { GlobalEntity } from '@/types/entities'
import type { GlobalEntityKey } from '@/constants/entities'

export interface UseShapesTabReturn {
  activeTab: Ref<string>
  blockShapesContainer: Ref<HTMLElement | null>
  partShapesContainer: Ref<HTMLElement | null>
  annotationShapesContainer: Ref<HTMLElement | null>
  partShapesPanelsContainer: Ref<HTMLElement | null>
  blockShapesPanelsContainer: Ref<HTMLElement | null>
  annotationShapesPanelsContainer: Ref<HTMLElement | null>
  blockShapesList: Ref<GlobalEntity<'blockShape'>[]>
  partShapesList: Ref<GlobalEntity<'partShape'>[]>
  expandedShapes: Ref<string[]>
  isPanelExpanded: (id: string) => boolean
  blockShapesTabLabel: ComputedRef<string>
  partShapesTabLabel: ComputedRef<string>
  annotationShapesTabLabel: ComputedRef<string>
  eventShapesTabLabel: ComputedRef<string>
  blockShapeMetadataModalOpen: Ref<boolean>
  partShapeMetadataModalOpen: Ref<boolean>
  partInstanceMetadataModalOpen: Ref<boolean>
  annotationShapeMetadataModalOpen: Ref<boolean>
  eventShapeMetadataModalOpen: Ref<boolean>
  toggleBlockShapeMetadataModal: () => void
  togglePartShapeMetadataModal: () => void
  togglePartInstanceMetadataModal: () => void
  handlePartInstanceMetadataSaved: () => void
  toggleAnnotationShapeMetadataModal: () => void
  toggleEventShapeMetadataModal: () => void
  isCreatingPartShape: Ref<boolean>
  isCreatingAnnotationShape: Ref<boolean>
  isCreatingEventShape: Ref<boolean>
  newPartShapeInitialValues: Ref<GlobalEntity<'partShape'> | null>
  newAnnotationShapeName: Ref<string>
  newEventShapeName: Ref<string>
  isCreatingAnnotationShapeLoading: Ref<boolean>
  isCreatingEventShapeLoading: Ref<boolean>
  createPartShape: () => void
  startCreatingAnnotationShape: () => void
  handlePartShapeCreated: (entity?: GlobalEntity<GlobalEntityKey>) => void
  handlePartShapeCancelled: () => void
  handleAnnotationShapeCreate: () => void
  handleAnnotationShapeCancelled: () => void
  startCreatingEventShape: () => void
  handleEventShapeCreate: () => void
  handleEventShapeCancelled: () => void
  handleDeletePartShape: (id: string) => void
  handleDeleteBlockShape: (id: string) => void
  handleDeleteAnnotationShape: (id: string) => void
  handleDeleteEventShape: (id: string) => void
  handleExistingShapeSaved: (entity: GlobalEntity<GlobalEntityKey>) => void
  filteredAnnotationShapes: ComputedRef<GlobalEntity<'annotationShape'>[]>
  safeEventShapes: ComputedRef<GlobalEntity<'eventShape'>[]>
  isLoadingAnnotationShapes: Ref<boolean>
  isLoadingEventShapes: Ref<boolean>
  partInstanceConfigEntity: ComputedRef<GlobalEntity<'partInstance'>>
  annotationShapeFieldsEntity: ComputedRef<GlobalEntity<'annotationShape'>>
  eventShapeFieldsEntity: ComputedRef<GlobalEntity<'eventShape'>>
}
