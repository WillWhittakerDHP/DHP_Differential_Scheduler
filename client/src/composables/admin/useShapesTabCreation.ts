/**
 * PATTERN: Creation state and handlers for Shapes tab (BlockShape, PartShape, AnnotationShape, EventShape).
 * WHY: Keeps ShapesTab.vue under vue-architecture limits (script size, function count).
 */
import { reactive, toRefs, type Ref } from 'vue'
import type { GlobalEntity } from '@/types/entities'
import type { GlobalEntityKey } from '@/constants/entities'
import { getDefaultEntityValues } from '@/utils/entityDefaults'
import type { UseShapesTabCreationParams } from '@/types/admin/shapesTabCreation'
import { prependExpandedShapeId, removeExpandedShapeId } from '@/utils/admin/shapesTabExpandedPlaceholders'


/** Grouped return for composable-health (oversized-return repair). */
export interface UseShapesTabCreationReturn {
  state: {
    isCreatingBlockShape: Ref<boolean>
    isCreatingPartShape: Ref<boolean>
    isCreatingAnnotationShape: Ref<boolean>
    isCreatingEventShape: Ref<boolean>
    newBlockShapeInitialValues: Ref<GlobalEntity<'blockShape'> | null>
    newPartShapeInitialValues: Ref<GlobalEntity<'partShape'> | null>
    newAnnotationShapeName: Ref<string>
    newEventShapeName: Ref<string>
    isCreatingAnnotationShapeLoading: Ref<boolean>
    isCreatingEventShapeLoading: Ref<boolean>
  }
  actions: {
    createBlockShape: () => void
    handleBlockShapeCreated: (_entity?: GlobalEntity<GlobalEntityKey>) => void
    handleBlockShapeCancelled: () => void
    createPartShape: () => void
    startCreatingAnnotationShape: () => void
    handlePartShapeCreated: (_entity?: GlobalEntity<GlobalEntityKey>) => void
    handlePartShapeCancelled: () => void
    handleAnnotationShapeCreate: () => Promise<void>
    handleAnnotationShapeCancelled: () => void
    startCreatingEventShape: () => void
    handleEventShapeCreate: () => Promise<void>
    handleEventShapeCancelled: () => void
  }
}

export function useShapesTabCreation(params: UseShapesTabCreationParams): UseShapesTabCreationReturn {
  const {
    expandedShapes,
    success,
    createAnnotationShapeMutation,
    createEventShapeMutation,
    logger,
  } = params

  const ui = reactive({
    isCreatingBlockShape: false,
    isCreatingPartShape: false,
    isCreatingAnnotationShape: false,
    isCreatingEventShape: false,
    newBlockShapeInitialValues: null as GlobalEntity<'blockShape'> | null,
    newPartShapeInitialValues: null as GlobalEntity<'partShape'> | null,
    newAnnotationShapeName: '',
    newEventShapeName: '',
    isCreatingAnnotationShapeLoading: false,
    isCreatingEventShapeLoading: false,
  })

  const createBlockShape = (): void => {
    const defaults = getDefaultEntityValues('blockShape')
    ui.newBlockShapeInitialValues = {
      ...defaults,
      id: `new-${Date.now()}` as string,
    } as GlobalEntity<'blockShape'>
    ui.isCreatingBlockShape = true
    prependExpandedShapeId(expandedShapes, 'new-blockShape')
  }

  const handleBlockShapeCreated = (_entity?: GlobalEntity<GlobalEntityKey>): void => {
    ui.isCreatingBlockShape = false
    ui.newBlockShapeInitialValues = null
    removeExpandedShapeId(expandedShapes, 'new-blockShape')
  }

  const handleBlockShapeCancelled = (): void => {
    ui.isCreatingBlockShape = false
    ui.newBlockShapeInitialValues = null
    removeExpandedShapeId(expandedShapes, 'new-blockShape')
  }

  const createPartShape = (): void => {
    const defaults = getDefaultEntityValues('partShape')
    ui.newPartShapeInitialValues = {
      ...defaults,
      id: `new-${Date.now()}` as string,
    } as GlobalEntity<'partShape'>
    ui.isCreatingPartShape = true
    prependExpandedShapeId(expandedShapes, 'new-partShape')
  }

  const startCreatingAnnotationShape = (): void => {
    ui.newAnnotationShapeName = ''
    ui.isCreatingAnnotationShape = true
    prependExpandedShapeId(expandedShapes, 'new-annotationShape')
  }

  const handlePartShapeCreated = (_entity?: GlobalEntity<GlobalEntityKey>): void => {
    ui.isCreatingPartShape = false
    ui.newPartShapeInitialValues = null
    removeExpandedShapeId(expandedShapes, 'new-partShape')
  }

  const handlePartShapeCancelled = (): void => {
    ui.isCreatingPartShape = false
    ui.newPartShapeInitialValues = null
    removeExpandedShapeId(expandedShapes, 'new-partShape')
  }

  const handleAnnotationShapeCreate = async (): Promise<void> => {
    if (!ui.newAnnotationShapeName.trim()) return
    ui.isCreatingAnnotationShapeLoading = true
    try {
      await createAnnotationShapeMutation({
        name: ui.newAnnotationShapeName.trim(),
        orderIndex: 0,
        active: true,
        entityKey: 'annotationShape' as const,
      })
      success('Annotation shape created successfully')
      ui.isCreatingAnnotationShape = false
      ui.newAnnotationShapeName = ''
      removeExpandedShapeId(expandedShapes, 'new-annotationShape')
    } catch (_error) {
      logger.error('Failed to create annotation shape', { error: _error })
    } finally {
      ui.isCreatingAnnotationShapeLoading = false
    }
  }

  const handleAnnotationShapeCancelled = (): void => {
    ui.isCreatingAnnotationShape = false
    ui.newAnnotationShapeName = ''
    removeExpandedShapeId(expandedShapes, 'new-annotationShape')
  }

  const startCreatingEventShape = (): void => {
    ui.newEventShapeName = ''
    ui.isCreatingEventShape = true
    prependExpandedShapeId(expandedShapes, 'new-eventShape')
  }

  const handleEventShapeCreate = async (): Promise<void> => {
    if (!ui.newEventShapeName.trim()) return
    ui.isCreatingEventShapeLoading = true
    try {
      await createEventShapeMutation({
        name: ui.newEventShapeName.trim(),
        orderIndex: 0,
        active: true,
        entityKey: 'eventShape' as const,
      })
      success('Event shape created successfully')
      ui.isCreatingEventShape = false
      ui.newEventShapeName = ''
      removeExpandedShapeId(expandedShapes, 'new-eventShape')
    } catch (error) {
      logger.error('Failed to create event shape', { error, name: ui.newEventShapeName })
    } finally {
      ui.isCreatingEventShapeLoading = false
    }
  }

  const handleEventShapeCancelled = (): void => {
    ui.isCreatingEventShape = false
    ui.newEventShapeName = ''
    removeExpandedShapeId(expandedShapes, 'new-eventShape')
  }

  return {
    state: toRefs(ui),
    actions: {
      createBlockShape,
      handleBlockShapeCreated,
      handleBlockShapeCancelled,
      createPartShape,
      startCreatingAnnotationShape,
      handlePartShapeCreated,
      handlePartShapeCancelled,
      handleAnnotationShapeCreate,
      handleAnnotationShapeCancelled,
      startCreatingEventShape,
      handleEventShapeCreate,
      handleEventShapeCancelled,
    },
  }
}
