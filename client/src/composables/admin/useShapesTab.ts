/**
 * WHY: Keeps ShapesTab.vue thin; orchestration (state, creation, deletion, drag, tab labels) in composable.
 */
import { ref, computed, type ComponentPublicInstance, type ComputedRef, type Ref } from 'vue'
import { useEntityCrud } from '@/composables/entityCrud/useEntityCrud'
import { useEntityFiltering } from '@/composables/admin/useEntityFiltering'
import { useShapeDisplayNames } from '@/composables/admin/useShapeDisplayNames'
import { useDragAndDrop } from '@/composables/admin/useDragAndDrop'
import { useEntityDragHandlers } from '@/composables/admin/useEntityDragHandlers'
import { useExpansionState } from '@/composables/admin/useExpansionState'
import { useEntityTabState } from '@/composables/admin/useEntityTabState'
import { useShapesTabCreation } from '@/composables/admin/useShapesTabCreation'
import { useShapesTabDeletion } from '@/utils/admin/shapesTabDeletion'
import type { GlobalEntity } from '@/types/entities'
import { useNotification } from '@/composables/useNotification'
import { createLogger } from '@/utils/logger'
import type {
  InstancesDomainDragContext,
  ShapesDomainSubTab,
  UseShapesTabOptions,
  UseShapesTabReturn,
} from '@/types/admin/shapesTab'

const logger = createLogger('ShapesTab')

function shapeListDragBinding(
  domain: InstancesDomainDragContext | undefined,
  activeTab: Ref<string>,
  subKey: ShapesDomainSubTab,
  standaloneTabValue: string
): { shouldBind: ComputedRef<boolean>; visibilityDeps: ComputedRef<readonly unknown[]> } {
  const shouldBind = computed((): boolean => {
    if (domain) {
      return (
        domain.tier2Tab.value === domain.shapesTier2Value && domain.shapesSubTab.value === subKey
      )
    }
    return activeTab.value === standaloneTabValue
  })
  const visibilityDeps = computed((): readonly unknown[] =>
    domain ? [domain.tier2Tab.value, domain.shapesSubTab.value] : [activeTab.value]
  )
  return { shouldBind, visibilityDeps }
}

export function useShapesTab(options?: UseShapesTabOptions): UseShapesTabReturn {
  const domain = options?.instancesDomainDragContext
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

  const partDragBinding = shapeListDragBinding(domain, activeTab, 'part', 'partShapes')
  const blockDragBinding = shapeListDragBinding(domain, activeTab, 'block', 'blockShapes')
  const annotationDragBinding = shapeListDragBinding(domain, activeTab, 'annotation', 'annotationShapes')
  const eventDragBinding = shapeListDragBinding(domain, activeTab, 'event', 'eventShapes')

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
    shouldBind: partDragBinding.shouldBind,
    visibilityDeps: partDragBinding.visibilityDeps,
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
    shouldBind: blockDragBinding.shouldBind,
    visibilityDeps: blockDragBinding.visibilityDeps,
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
    shouldBind: annotationDragBinding.shouldBind,
    visibilityDeps: annotationDragBinding.visibilityDeps,
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
    shouldBind: eventDragBinding.shouldBind,
    visibilityDeps: eventDragBinding.visibilityDeps,
  })
  const blockShapesTabLabel = computed(() => `🧱 Block (${filteredBlockShapes.value.length})`)
  const partShapesTabLabel = computed(() => `🧩 Part (${filteredPartShapes.value.length})`)
  const annotationShapesTabLabel = computed(
    () => `🏷️ Annotations (${filteredAnnotationShapes.value.length})`
  )
  const eventShapesTabLabel = computed(() => `📅 Events (${safeEventShapes.value.length})`)

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
  } as UseShapesTabReturn
}
