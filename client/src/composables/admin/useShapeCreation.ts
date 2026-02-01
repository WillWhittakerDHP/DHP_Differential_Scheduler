/**
 * Composable for shape creation logic
 * WHY: Extracts creation logic from ShapesTab
 * PATTERN: Composable that manages creation state and handlers
 */

import { ref, type Ref } from 'vue'
import { getDefaultEntityValues } from '@/utils/entityDefaults'
import type { GlobalEntity } from '@/types/entities'

export interface UseShapeCreationReturn {
  isCreatingBlockShape: Ref<boolean>
  isCreatingPartShape: Ref<boolean>
  isCreatingAnnotationShape: Ref<boolean>
  newBlockShapeInitialValues: Ref<GlobalEntity<'blockShape'> | null>
  newPartShapeInitialValues: Ref<GlobalEntity<'partShape'> | null>
  newAnnotationShapeName: Ref<string>
  createBlockShape: () => void
  createPartShape: () => void
  createAnnotationShape: () => void
}

export interface UseShapeCreationOptions {
  expandedShapes: Ref<string[]>
}

/**
 * Composable for managing shape creation
 * WHY: Centralizes shape creation state and handlers
 * PATTERN: Returns reactive state and creation functions
 */
export function useShapeCreation(
  options: UseShapeCreationOptions
): UseShapeCreationReturn {
  const { expandedShapes } = options

  /**
   * LEARNING: Inline creation state for all shape types
   * WHY: Instead of dialogs, show inline EntityCards for creating new entities
   * PATTERN: Boolean flags and initial values for each entity type
   */
  const isCreatingBlockShape = ref(false)
  const isCreatingPartShape = ref(false)
  const isCreatingAnnotationShape = ref(false)
  const newBlockShapeInitialValues = ref<GlobalEntity<'blockShape'> | null>(null)
  const newPartShapeInitialValues = ref<GlobalEntity<'partShape'> | null>(null)
  const newAnnotationShapeName = ref('')

  const createBlockShape = (): void => {
    const defaults = getDefaultEntityValues('blockShape')
    newBlockShapeInitialValues.value = {
      ...defaults,
      id: `new-${Date.now()}` as string,
    } as GlobalEntity<'blockShape'>
    isCreatingBlockShape.value = true
    expandedShapes.value = ['new-blockShape', ...expandedShapes.value]
  }

  const createPartShape = (): void => {
    const defaults = getDefaultEntityValues('partShape')
    newPartShapeInitialValues.value = {
      ...defaults,
      id: `new-${Date.now()}` as string,
    } as GlobalEntity<'partShape'>
    isCreatingPartShape.value = true
    expandedShapes.value = ['new-partShape', ...expandedShapes.value]
  }

  const createAnnotationShape = (): void => {
    newAnnotationShapeName.value = ''
    isCreatingAnnotationShape.value = true
    expandedShapes.value = ['new-annotationShape', ...expandedShapes.value]
  }

  return {
    isCreatingBlockShape,
    isCreatingPartShape,
    isCreatingAnnotationShape,
    newBlockShapeInitialValues,
    newPartShapeInitialValues,
    newAnnotationShapeName,
    createBlockShape,
    createPartShape,
    createAnnotationShape
  }
}
