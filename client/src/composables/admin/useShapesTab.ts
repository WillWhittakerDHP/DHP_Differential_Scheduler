/**
 * WHY: Keeps ShapesTab.vue thin; orchestration (state, modals, creation, deletion, drag, tab labels, entity config) in composable.
 */
import { ref, computed, type ComponentPublicInstance } from 'vue'
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
  ANNOTATION_INSTANCE_GLOBAL_CONFIG_ID,
  EVENT_SHAPE_GLOBAL_CONFIG_ID,
  EVENT_INSTANCE_GLOBAL_CONFIG_ID,
} from '@/utils/entities/entityTypeMapping'
import { useNotification } from '@/composables/useNotification'
import { createLogger } from '@/utils/logger'
import type { UseShapesTabReturn } from '@/types/admin/shapesTab'

const logger = createLogger('ShapesTab')

export function useShapesTab(): UseShapesTabReturn {
  const { filteredEntities: filteredPartShapes } = useEntityFiltering('partShape')
  const { filteredEntities: filteredBlockShapes } = useEntityFiltering('blockShape')
  const { filteredEntities: filteredAnnotationShapes } = useEntityFiltering('annotationShape')
  const { filteredEntities: safeEventShapes } = useEntityFiltering('eventShape')
  useShapeDisplayNames()
  const { patchOrderIndex: patchPartShapeOrderIndex } = useEntityCrud('partShape')
  const { patchOrderIndex: patchBlockShapeOrderIndex } = useEntityCrud('blockShape')
  const {
    isLoading: isLoadingAnnotationShapes,
    create: createAnnotationShapeMutation,
    patchOrderIndex: patchAnnotationShapeOrderIndex,
  } = useEntityCrud('annotationShape')
  const {
    isLoading: isLoadingEventShapes,
    create: createEventShapeMutation,
    patchOrderIndex: patchEventShapeOrderIndex,
  } = useEntityCrud('eventShape')
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

  const partShapesContainer = ref<HTMLElement | undefined>(undefined)
  const blockShapesContainer = ref<HTMLElement | undefined>(undefined)
  const annotationShapesContainer = ref<HTMLElement | undefined>(undefined)
  const eventShapesContainer = ref<HTMLElement | undefined>(undefined)
  const partShapesPanelsContainer = ref<ComponentPublicInstance | HTMLElement | undefined>(undefined)
  const blockShapesPanelsContainer = ref<ComponentPublicInstance | HTMLElement | undefined>(undefined)
  const annotationShapesPanelsContainer = ref<ComponentPublicInstance | HTMLElement | undefined>(undefined)
  const eventShapesPanelsContainer = ref<ComponentPublicInstance | HTMLElement | undefined>(undefined)
  const partShapesList = ref<GlobalEntity<'partShape'>[]>([])
  const blockShapesList = ref<GlobalEntity<'blockShape'>[]>([])
  const annotationShapesList = ref<GlobalEntity<'annotationShape'>[]>([])
  const eventShapesList = ref<GlobalEntity<'eventShape'>[]>([])
  const partShapeIds = ref<string[]>([])
  const blockShapeIds = ref<string[]>([])
  const annotationShapeIds = ref<string[]>([])
  const eventShapeIds = ref<string[]>([])

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
    dragHandle: '.shape-list-drag-handle',
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
    dragHandle: '.shape-list-drag-handle',
  })

  const annotationShapesDragHandlers = useEntityDragHandlers({
    entityIds: annotationShapeIds,
    entityList: annotationShapesList,
    filteredEntities: filteredAnnotationShapes,
    patchOrderIndex: patchAnnotationShapeOrderIndex,
  })
  const eventShapesDragHandlers = useEntityDragHandlers({
    entityIds: eventShapeIds,
    entityList: eventShapesList,
    filteredEntities: safeEventShapes,
    patchOrderIndex: patchEventShapeOrderIndex,
  })
  useEntityTabState({ filteredEntities: filteredAnnotationShapes, dragHandlers: annotationShapesDragHandlers })
  useEntityTabState({ filteredEntities: safeEventShapes, dragHandlers: eventShapesDragHandlers })
  useDragAndDrop({
    containerRef: annotationShapesContainer,
    panelsContainerRef: annotationShapesPanelsContainer,
    entityIds: annotationShapeIds,
    entityList: annotationShapesList,
    filteredEntities: filteredAnnotationShapes,
    dragEndHandler: annotationShapesDragHandlers.handleDragEnd,
    group: 'annotationShapes',
    draggableClass: 'draggable-annotation-shape',
    dragHandle: '.shape-list-drag-handle',
  })
  useDragAndDrop({
    containerRef: eventShapesContainer,
    panelsContainerRef: eventShapesPanelsContainer,
    entityIds: eventShapeIds,
    entityList: eventShapesList,
    filteredEntities: safeEventShapes,
    dragEndHandler: eventShapesDragHandlers.handleDragEnd,
    group: 'eventShapes',
    draggableClass: 'draggable-event-shape',
    dragHandle: '.shape-list-drag-handle',
  })
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
  const annotationInstanceConfigEntity = computed((): GlobalEntity<'annotationInstance'> => ({
    id: toGlobalEntityId(ANNOTATION_INSTANCE_GLOBAL_CONFIG_ID),
    entityKey: 'annotationInstance',
  } as GlobalEntity<'annotationInstance'>))
  const eventInstanceConfigEntity = computed((): GlobalEntity<'eventInstance'> => ({
    id: toGlobalEntityId(EVENT_INSTANCE_GLOBAL_CONFIG_ID),
    entityKey: 'eventInstance',
  } as GlobalEntity<'eventInstance'>))
  const annotationShapeFieldsEntity = computed((): GlobalEntity<'annotationShape'> => ({
    id: toGlobalEntityId(ANNOTATION_SHAPE_GLOBAL_CONFIG_ID),
    name: 'Annotation Shape Fields (Global)',
    entityKey: 'annotationShape',
    orderIndex: 0,
    active: true,
  }))
  const eventShapeFieldsEntity = computed((): GlobalEntity<'eventShape'> => ({
    id: toGlobalEntityId(EVENT_SHAPE_GLOBAL_CONFIG_ID),
    name: 'Event Shape Fields (Global)',
    entityKey: 'eventShape',
    orderIndex: 0,
    active: true,
    placementKind: 'primary',
    anchorEdge: null,
  }))

  return {
    activeTab,
    blockShapesContainer,
    partShapesContainer,
    annotationShapesContainer,
    eventShapesContainer,
    partShapesPanelsContainer,
    blockShapesPanelsContainer,
    annotationShapesPanelsContainer,
    eventShapesPanelsContainer,
    blockShapesList,
    partShapesList,
    annotationShapesList,
    eventShapesList,
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
    annotationInstanceConfigEntity,
    eventInstanceConfigEntity,
    annotationShapeFieldsEntity,
    eventShapeFieldsEntity,
  } as UseShapesTabReturn
}
