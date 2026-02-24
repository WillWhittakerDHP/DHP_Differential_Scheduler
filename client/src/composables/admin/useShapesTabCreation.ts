/**
 * PATTERN: Creation state and handlers for Shapes tab (PartShape, AnnotationShape, EventShape).
 * WHY: Keeps ShapesTab.vue under vue-architecture limits (script size, function count).
 */
import { ref, type Ref } from 'vue'
import type { GlobalEntity, GlobalEntityKey } from '@/types/entities'
import { getDefaultEntityValues } from '@/utils/entityDefaults'
import type { AppLogger } from '@/utils/logger'

export interface UseShapesTabCreationParams {
  expandedShapes: Ref<string[]>
  success: (message: string) => void
  createAnnotationShapeMutation: (payload: Record<string, unknown>) => Promise<unknown>
  createEventShapeMutation: (payload: Record<string, unknown>) => Promise<unknown>
  logger: AppLogger
}

export function useShapesTabCreation(params: UseShapesTabCreationParams) {
  const {
    expandedShapes,
    success,
    createAnnotationShapeMutation,
    createEventShapeMutation,
    logger,
  } = params

  const isCreatingPartShape = ref(false)
  const isCreatingAnnotationShape = ref(false)
  const isCreatingEventShape = ref(false)
  const newPartShapeInitialValues = ref<GlobalEntity<'partShape'> | null>(null)
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

  const startCreatingAnnotationShape = (): void => {
    newAnnotationShapeName.value = ''
    isCreatingAnnotationShape.value = true
    expandedShapes.value = ['new-annotationShape', ...expandedShapes.value]
  }

  const handlePartShapeCreated = (_entity: GlobalEntity<GlobalEntityKey>): void => {
    isCreatingPartShape.value = false
    newPartShapeInitialValues.value = null
    expandedShapes.value = expandedShapes.value.filter(id => id !== 'new-partShape')
  }

  const handlePartShapeCancelled = (): void => {
    isCreatingPartShape.value = false
    newPartShapeInitialValues.value = null
    expandedShapes.value = expandedShapes.value.filter(id => id !== 'new-partShape')
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
    isCreatingPartShape,
    isCreatingAnnotationShape,
    isCreatingEventShape,
    newPartShapeInitialValues,
    newAnnotationShapeName,
    newEventShapeName,
    isCreatingAnnotationShapeLoading,
    isCreatingEventShapeLoading,
    createPartShape,
    startCreatingAnnotationShape,
    handlePartShapeCreated,
    handlePartShapeCancelled,
    handleAnnotationShapeCreate,
    handleAnnotationShapeCancelled,
    startCreatingEventShape,
    handleEventShapeCreate,
    handleEventShapeCancelled,
  }
}
