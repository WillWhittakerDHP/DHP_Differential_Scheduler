/**
 * PATTERN: Creation state and handlers for Shapes tab (PartShape, AnnotationShape, EventShape).
 * WHY: Keeps ShapesTab.vue under vue-architecture limits (script size, function count).
 */
import { ref } from 'vue'
import type { GlobalEntity } from '@/types/entities'
import type { GlobalEntityKey } from '@/constants/entities'
import { getDefaultEntityValues } from '@/utils/entityDefaults'
import type { Ref } from 'vue'
import type { UseShapesTabCreationParams } from '@/types/admin/shapesTabCreation'


/** Grouped return for composable-health (oversized-return repair). */
export interface UseShapesTabCreationReturn {
  state: {
    isCreatingPartShape: Ref<boolean>
    isCreatingBlockShape: Ref<boolean>
    isCreatingAnnotationShape: Ref<boolean>
    isCreatingEventShape: Ref<boolean>
    newPartShapeInitialValues: Ref<GlobalEntity<'partShape'> | null>
    newBlockShapeInitialValues: Ref<GlobalEntity<'blockShape'> | null>
    newAnnotationShapeName: Ref<string>
    newEventShapeName: Ref<string>
    isCreatingAnnotationShapeLoading: Ref<boolean>
    isCreatingEventShapeLoading: Ref<boolean>
  }
  actions: {
    createPartShape: () => void
    createBlockShape: () => void
    startCreatingAnnotationShape: () => void
    handlePartShapeCreated: (_entity?: GlobalEntity<GlobalEntityKey>) => void
    handleBlockShapeCreated: (_entity?: GlobalEntity<GlobalEntityKey>) => void
    handlePartShapeCancelled: () => void
    handleBlockShapeCancelled: () => void
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

  const isCreatingPartShape = ref(false)
  const isCreatingBlockShape = ref(false)
  const isCreatingAnnotationShape = ref(false)
  const isCreatingEventShape = ref(false)
  const newPartShapeInitialValues = ref<GlobalEntity<'partShape'> | null>(null)
  const newBlockShapeInitialValues = ref<GlobalEntity<'blockShape'> | null>(null)
  const newAnnotationShapeName = ref('')
  const newEventShapeName = ref('')
  const isCreatingAnnotationShapeLoading = ref(false)
  const isCreatingEventShapeLoading = ref(false)

  const createPartShape = (): void => {
    const defaults = getDefaultEntityValues('partShape')
    newPartShapeInitialValues.value = {
      ...defaults,
      id: `new-${Date.now()}` as string,
    } as GlobalEntity<'partShape'>
    isCreatingPartShape.value = true
    expandedShapes.value = ['new-partShape', ...expandedShapes.value]
  }

  const createBlockShape = (): void => {
    const defaults = getDefaultEntityValues('blockShape')
    newBlockShapeInitialValues.value = {
      ...defaults,
      id: `new-${Date.now()}` as string,
    } as GlobalEntity<'blockShape'>
    isCreatingBlockShape.value = true
    expandedShapes.value = ['new-blockShape', ...expandedShapes.value]
  }

  const startCreatingAnnotationShape = (): void => {
    newAnnotationShapeName.value = ''
    isCreatingAnnotationShape.value = true
    expandedShapes.value = ['new-annotationShape', ...expandedShapes.value]
  }

  const handlePartShapeCreated = (_entity?: GlobalEntity<GlobalEntityKey>): void => {
    isCreatingPartShape.value = false
    newPartShapeInitialValues.value = null
    expandedShapes.value = expandedShapes.value.filter(id => id !== 'new-partShape')
  }

  const handleBlockShapeCreated = (_entity?: GlobalEntity<GlobalEntityKey>): void => {
    isCreatingBlockShape.value = false
    newBlockShapeInitialValues.value = null
    expandedShapes.value = expandedShapes.value.filter(id => id !== 'new-blockShape')
  }

  const handlePartShapeCancelled = (): void => {
    isCreatingPartShape.value = false
    newPartShapeInitialValues.value = null
    expandedShapes.value = expandedShapes.value.filter(id => id !== 'new-partShape')
  }

  const handleBlockShapeCancelled = (): void => {
    isCreatingBlockShape.value = false
    newBlockShapeInitialValues.value = null
    expandedShapes.value = expandedShapes.value.filter(id => id !== 'new-blockShape')
  }

  const handleAnnotationShapeCreate = async (): Promise<void> => {
    if (!newAnnotationShapeName.value.trim()) return
    isCreatingAnnotationShapeLoading.value = true
    try {
      await createAnnotationShapeMutation({
        name: newAnnotationShapeName.value.trim(),
        orderIndex: 0,
        active: true,
        entityKey: 'annotationShape' as const,
      })
      success('Annotation shape created successfully')
      isCreatingAnnotationShape.value = false
      newAnnotationShapeName.value = ''
      expandedShapes.value = expandedShapes.value.filter(id => id !== 'new-annotationShape')
    } catch (_error) {
      logger.error('Failed to create annotation shape', { error: _error })
    } finally {
      isCreatingAnnotationShapeLoading.value = false
    }
  }

  const handleAnnotationShapeCancelled = (): void => {
    isCreatingAnnotationShape.value = false
    newAnnotationShapeName.value = ''
    expandedShapes.value = expandedShapes.value.filter(id => id !== 'new-annotationShape')
  }

  const startCreatingEventShape = (): void => {
    newEventShapeName.value = ''
    isCreatingEventShape.value = true
    expandedShapes.value = ['new-eventShape', ...expandedShapes.value]
  }

  const handleEventShapeCreate = async (): Promise<void> => {
    if (!newEventShapeName.value.trim()) return
    isCreatingEventShapeLoading.value = true
    try {
      await createEventShapeMutation({
        name: newEventShapeName.value.trim(),
        orderIndex: 0,
        active: true,
        entityKey: 'eventShape' as const,
      })
      success('Event shape created successfully')
      isCreatingEventShape.value = false
      newEventShapeName.value = ''
      expandedShapes.value = expandedShapes.value.filter(id => id !== 'new-eventShape')
    } catch (error) {
      logger.error('Failed to create event shape', { error, name: newEventShapeName.value })
    } finally {
      isCreatingEventShapeLoading.value = false
    }
  }

  const handleEventShapeCancelled = (): void => {
    isCreatingEventShape.value = false
    newEventShapeName.value = ''
    expandedShapes.value = expandedShapes.value.filter(id => id !== 'new-eventShape')
  }

  return {
    state: {
      isCreatingPartShape,
      isCreatingBlockShape,
      isCreatingAnnotationShape,
      isCreatingEventShape,
      newPartShapeInitialValues,
      newBlockShapeInitialValues,
      newAnnotationShapeName,
      newEventShapeName,
      isCreatingAnnotationShapeLoading,
      isCreatingEventShapeLoading,
    },
    actions: {
      createPartShape,
      createBlockShape,
      startCreatingAnnotationShape,
      handlePartShapeCreated,
      handleBlockShapeCreated,
      handlePartShapeCancelled,
      handleBlockShapeCancelled,
      handleAnnotationShapeCreate,
      handleAnnotationShapeCancelled,
      startCreatingEventShape,
      handleEventShapeCreate,
      handleEventShapeCancelled,
    },
  }
}
