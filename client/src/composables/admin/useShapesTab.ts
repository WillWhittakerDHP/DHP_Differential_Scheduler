/**
 * WHY: Keeps ShapesTab.vue thin; orchestration (state, modals, creation, deletion, drag, tab labels, entity config) in composable.
 */
import { ref, computed } from 'vue'
import { useEntityCrud } from '@/composables/entityCrud/useEntityCrud'
import { useEntityFiltering } from '@/composables/admin/useEntityFiltering'
import { useShapeDisplayNames } from '@/composables/admin/useShapeDisplayNames'
import { useDragAndDrop } from '@/composables/admin/useDragAndDrop'
import { useEntityDragHandlers } from '@/composables/admin/useEntityDragHandlers'
import { useExpansionState } from '@/composables/admin/useExpansionState'
import { useEntityTabState } from '@/composables/admin/useEntityTabState'
import { useShapesTabModals } from '@/composables/admin/useShapesTabModals'
import { useShapesTabCreation } from '@/composables/admin/useShapesTabCreation'
import { useShapesTabDeletion } from '@/utils/admin/shapesTabDeletion'
import { toGlobalEntityId } from '@/utils/globalEntity'
import type { GlobalEntity } from '@/types/entities'
import {
  PART_INSTANCE_GLOBAL_CONFIG_ID,
  ANNOTATION_SHAPE_GLOBAL_CONFIG_ID,
} from '@/utils/entities/entityTypeMapping'
import { useNotification } from '@/composables/useNotification'
import { createLogger } from '@/utils/logger'
import type { UseShapesTabReturn } from '@/types/admin/shapesTab'

const logger = createLogger('ShapesTab')

export function useShapesTab(): UseShapesTabReturn {
  const { filteredEntities: filteredPartShapes } = useEntityFiltering('partShape')
  const { filteredEntities: filteredBlockShapes } = useEntityFiltering('blockShape')
  useShapeDisplayNames()
  const { patchOrderIndex: patchPartShapeOrderIndex } = useEntityCrud('partShape')
  const { patchOrderIndex: patchBlockShapeOrderIndex } = useEntityCrud('blockShape')
  const annotationShapesComposable = useEntityCrud('annotationShape')
  const annotationShapes = annotationShapesComposable.entities
  const isLoadingAnnotationShapes = annotationShapesComposable.isLoading
  const createAnnotationShapeMutation = annotationShapesComposable.create
  const eventShapesComposable = useEntityCrud('eventShape')
  const eventShapes = eventShapesComposable.entities
  const isLoadingEventShapes = eventShapesComposable.isLoading
  const createEventShapeMutation = eventShapesComposable.create
  const activeTab = ref('blockShapes')
  const expansionStateComposable = useExpansionState()
  const { expandedEntities: expandedShapes, isPanelExpanded } = expansionStateComposable
  const { success } = useNotification()

  const modals = useShapesTabModals()
  const creation = useShapesTabCreation({
    expandedShapes,
    success,
    createAnnotationShapeMutation,
    createEventShapeMutation,
    logger,
  })

  const deletion = useShapesTabDeletion({ expandedShapes })
  const {
    handleDeletePartShape,
    handleDeleteBlockShape,
    handleDeleteAnnotationShape,
    handleDeleteEventShape,
    handleExistingShapeSaved,
  } = deletion

  const partShapesContainer = ref<HTMLElement | null>(null)
  const blockShapesContainer = ref<HTMLElement | null>(null)
  const annotationShapesContainer = ref<HTMLElement | null>(null)
  void annotationShapesContainer.value
  const partShapesPanelsContainer = ref<HTMLElement | null>(null)
  const blockShapesPanelsContainer = ref<HTMLElement | null>(null)
  const annotationShapesPanelsContainer = ref<HTMLElement | null>(null)
  void annotationShapesPanelsContainer.value
  const partShapesList = ref<GlobalEntity<'partShape'>[]>([])
  const blockShapesList = ref<GlobalEntity<'blockShape'>[]>([])
  const partShapeIds = ref<string[]>([])
  const blockShapeIds = ref<string[]>([])

  const partShapesDragHandlers = useEntityDragHandlers({
    entityIds: partShapeIds,
    entityList: partShapesList,
    filteredEntities: filteredPartShapes,
    patchOrderIndex: patchPartShapeOrderIndex,
  })
  const blockShapesDragHandlers = useEntityDragHandlers({
    entityIds: blockShapeIds,
    entityList: blockShapesList,
    filteredEntities: filteredBlockShapes,
    patchOrderIndex: patchBlockShapeOrderIndex,
  })
  useEntityTabState({ filteredEntities: filteredPartShapes, dragHandlers: partShapesDragHandlers })
  useEntityTabState({ filteredEntities: filteredBlockShapes, dragHandlers: blockShapesDragHandlers })
  useDragAndDrop({
    containerRef: partShapesContainer,
    panelsContainerRef: partShapesPanelsContainer,
    entityIds: partShapeIds,
    entityList: partShapesList,
    filteredEntities: filteredPartShapes,
    dragEndHandler: partShapesDragHandlers.handleDragEnd,
    group: 'partShapes',
    draggableClass: 'draggable-part-shape',
  })
  useDragAndDrop({
    containerRef: blockShapesContainer,
    panelsContainerRef: blockShapesPanelsContainer,
    entityIds: blockShapeIds,
    entityList: blockShapesList,
    filteredEntities: filteredBlockShapes,
    dragEndHandler: blockShapesDragHandlers.handleDragEnd,
    group: 'blockShapes',
    draggableClass: 'draggable-block-shape',
  })

  const filteredAnnotationShapes = computed(() =>
    Array.isArray(annotationShapes.value) ? [...annotationShapes.value] : []
  )
  const safeEventShapes = computed(() =>
    Array.isArray(eventShapes.value) ? eventShapes.value : []
  )
  const blockShapesTabLabel = computed(() => `🧱 Block (${filteredBlockShapes.value.length})`)
  const partShapesTabLabel = computed(() => `🧩 Part (${filteredPartShapes.value.length})`)
  const annotationShapesTabLabel = computed(
    () => `🏷️ Annotations (${filteredAnnotationShapes.value.length})`
  )
  const eventShapesTabLabel = computed(() => `📅 Events (${safeEventShapes.value.length})`)

  const partInstanceConfigEntity = computed((): GlobalEntity<'partInstance'> => ({
    id: PART_INSTANCE_GLOBAL_CONFIG_ID,
    entityKey: 'partInstance',
  } as GlobalEntity<'partInstance'>))
  const annotationShapeFieldsEntity = computed((): GlobalEntity<'annotationShape'> => ({
    id: toGlobalEntityId(ANNOTATION_SHAPE_GLOBAL_CONFIG_ID),
    name: 'Annotation Shape Fields (Global)',
    entityKey: 'annotationShape',
    orderIndex: 0,
    active: true,
  }))
  const eventShapeFieldsEntity = computed((): GlobalEntity<'eventShape'> => ({
    id: toGlobalEntityId('00000000-0000-0000-0000-000000000010'),
    name: 'Event Shape Fields (Global)',
    entityKey: 'eventShape',
    orderIndex: 0,
    active: true,
    isTernary: false,
    ternaryDefault: null,
    differentialRole: 'none',
    includeRescheduleLink: true,
    includeCancelLink: true,
  }))

  return {
    activeTab,
    blockShapesContainer,
    partShapesContainer,
    annotationShapesContainer,
    partShapesPanelsContainer,
    blockShapesPanelsContainer,
    annotationShapesPanelsContainer,
    blockShapesList,
    partShapesList,
    expandedShapes,
    isPanelExpanded,
    blockShapesTabLabel,
    partShapesTabLabel,
    annotationShapesTabLabel,
    eventShapesTabLabel,
    ...modals,
    ...creation.state,
    ...creation.actions,
    handleDeletePartShape,
    handleDeleteBlockShape,
    handleDeleteAnnotationShape,
    handleDeleteEventShape,
    handleExistingShapeSaved,
    filteredAnnotationShapes,
    safeEventShapes,
    isLoadingAnnotationShapes,
    isLoadingEventShapes,
    partInstanceConfigEntity,
    annotationShapeFieldsEntity,
    eventShapeFieldsEntity,
  } as UseShapesTabReturn
}
