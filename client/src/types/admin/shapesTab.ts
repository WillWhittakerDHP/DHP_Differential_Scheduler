/**
 * WHY: Single source of truth for Shapes tab API; compose from sub-composable return types
 * to avoid duplication (duplication-audit, COMPOSABLE_AUTHORING_PLAYBOOK).
 */
import type { ComputedRef, Ref } from 'vue'
import type { GlobalEntity } from '@/types/entities'
import type { GlobalEntityKey } from '@/constants/entities'
import type { UseShapesTabModalsReturn } from '@/composables/admin/useShapesTabModals'
import type { UseShapesTabCreationReturn } from '@/composables/admin/useShapesTabCreation'

/** Flatten creation state + actions for UseShapesTabReturn (no duplicate key list). */
type UseShapesTabCreationFlat = UseShapesTabCreationReturn['state'] & UseShapesTabCreationReturn['actions']

export interface UseShapesTabReturn
  extends UseShapesTabModalsReturn,
    UseShapesTabCreationFlat {
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
  annotationInstanceConfigEntity: ComputedRef<GlobalEntity<'annotationInstance'>>
  eventInstanceConfigEntity: ComputedRef<GlobalEntity<'eventInstance'>>
  annotationShapeFieldsEntity: ComputedRef<GlobalEntity<'annotationShape'>>
  eventShapeFieldsEntity: ComputedRef<GlobalEntity<'eventShape'>>
}
