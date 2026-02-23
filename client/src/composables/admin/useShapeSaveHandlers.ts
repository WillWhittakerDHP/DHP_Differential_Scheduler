/**
 * PATTERN: Composable for shape save handlers
PATTERN: Composable that manages save...
 */
import type { Ref } from 'vue'
import { useEntityCrud } from '@/composables/entityCrud/useEntityCrud'
import { useNotification } from '@/composables/useNotification'
import type { GlobalEntity } from '@/types/entities'
import type { GlobalEntityKey } from '@/constants/entities'
import { createLogger } from '@/utils/logger'

const logger = createLogger('useShapeSaveHandlers')

export interface UseShapeSaveHandlersOptions {
  expandedShapes: Ref<string[]>
  isCreatingBlockShape: Ref<boolean>
  isCreatingPartShape: Ref<boolean>
  isCreatingAnnotationShape: Ref<boolean>
  newBlockShapeInitialValues: Ref<GlobalEntity<'blockShape'> | null>
  newPartShapeInitialValues: Ref<GlobalEntity<'partShape'> | null>
  newAnnotationShapeName: Ref<string>
}

export interface UseShapeSaveHandlersReturn {
  handleBlockShapeCreated: (entity: GlobalEntity<GlobalEntityKey>) => void
  handleBlockShapeCancelled: () => void
  handlePartShapeCreated: (entity: GlobalEntity<GlobalEntityKey>) => void
  handlePartShapeCancelled: () => void
  handleAnnotationShapeCreate: () => Promise<void>
  handleAnnotationShapeCancelled: () => void
  handleExistingShapeSaved: (entity: GlobalEntity<GlobalEntityKey>) => void
}

/**
 * Composable for handling shape save events
 */
export function useShapeSaveHandlers(
  options: UseShapeSaveHandlersOptions
): UseShapeSaveHandlersReturn {
  const {
    expandedShapes,
    isCreatingBlockShape,
    isCreatingPartShape,
    isCreatingAnnotationShape,
    newBlockShapeInitialValues,
    newPartShapeInitialValues,
    newAnnotationShapeName
  } = options

  const annotationShapeCrud = useEntityCrud('annotationShape')
  const { success } = useNotification()

  const handleBlockShapeCreated = (_entity: GlobalEntity<GlobalEntityKey>): void => {
    isCreatingBlockShape.value = false
    newBlockShapeInitialValues.value = null
    expandedShapes.value = expandedShapes.value.filter(id => id !== 'new-blockShape')
  }

  const handleBlockShapeCancelled = (): void => {
    isCreatingBlockShape.value = false
    newBlockShapeInitialValues.value = null
    expandedShapes.value = expandedShapes.value.filter(id => id !== 'new-blockShape')
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
    
    try {
      await annotationShapeCrud.create({
        name: newAnnotationShapeName.value.trim(),
        orderIndex: 0,
        active: true,
        entityKey: 'annotationShape' as const
      })
      success('Annotation shape created successfully')
      isCreatingAnnotationShape.value = false
      newAnnotationShapeName.value = ''
      expandedShapes.value = expandedShapes.value.filter(id => id !== 'new-annotationShape')
    } catch (error) {
      logger.error('Failed to create annotation shape', { error, name: newAnnotationShapeName.value })
    }
  }

  const handleAnnotationShapeCancelled = (): void => {
    isCreatingAnnotationShape.value = false
    newAnnotationShapeName.value = ''
    expandedShapes.value = expandedShapes.value.filter(id => id !== 'new-annotationShape')
  }

  /**
   */
  const handleExistingShapeSaved = (entity: GlobalEntity<GlobalEntityKey>): void => {
    expandedShapes.value = expandedShapes.value.filter(id => id !== entity.id)
  }

  return {
    handleBlockShapeCreated,
    handleBlockShapeCancelled,
    handlePartShapeCreated,
    handlePartShapeCancelled,
    handleAnnotationShapeCreate,
    handleAnnotationShapeCancelled,
    handleExistingShapeSaved
  }
}
