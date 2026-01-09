import type { AnnotationWithMetadata } from '@/types/annotations'

export interface CreateAssignmentData {
  annotationId: string
  orderIndex: number
  isDefault: boolean
  userTypeBlockBlockInstanceId: string | null
}

export interface UpdateAssignmentData {
  annotationId: string
  orderIndex?: number
  isDefault?: boolean
  userTypeBlockBlockInstanceId?: string | null
}

/**
 * Options for handler functions
 * LEARNING: Optional dependencies for handler functions
 * WHY: Handlers need access to annotations composable, dialog state, and metadata for validation
 * PATTERN: Optional parameters for handler dependencies
 */
export interface UseAnnotationAssignmentsOptions {
  /**
   * Annotations composable for creating/updating annotation entities
   */
  annotationsComposable?: {
    create: { mutateAsync: (data: { text: string; type: string; userTypeBlock?: string | null }) => Promise<{ id: string }> }
    patch: { mutateAsync: (data: { id: string; data: { type: string } }) => Promise<void> }
  }
  /**
   * Dialog state composable for resetting dialog state
   */
  dialogState?: {
    resetQuickAdd: () => void
    closeDialog: () => void
    selectedAnnotationIds: { value: string[] }
    selectedUserTypeBlock: { value: string | null }
    newAnnotationText: { value: string }
    newAnnotationType: { value: string | null }
    newAnnotationUserTypeBlock: { value: string | null }
  }
  /**
   * Metadata composable for validation
   */
  metadata?: {
    checkDuplicateUserTypeBlock: (
      annotation: AnnotationWithMetadata & { blockInstanceNames?: string[] },
      allAnnotations: Array<AnnotationWithMetadata & { blockInstanceNames?: string[] }>
    ) => boolean
  }
}


