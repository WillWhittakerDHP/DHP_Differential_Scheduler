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

/**
 * LEARNING: Shared handler function types for annotation assignments
 * WHY: Eliminates duplication between useAnnotationAssignmentsActions and useAnnotationAssignmentsOrchestration
 * PATTERN: Extract common handler types to shared types file
 */
export interface AnnotationAssignmentHandlers {
  handleAddAnnotations?: (annotationIds: string[], annotationsWithMetadata?: Array<{ id: string }>) => Promise<void>
  handleAddSelectedAnnotations?: (
    annotationsWithMetadata?: Array<{ id: string; userTypeBlock: string | null }>
  ) => Promise<void>
  handleCreateAnnotation?: (
    annotationsWithMetadata?: Array<{ id: string; userTypeBlock: string | null }>
  ) => Promise<void>
  handleUpdateAnnotationType?: (annotationId: string, type: string) => Promise<void>
  handleUpdateMetadata?: (
    annotationId: string,
    orderIndex: number,
    userTypeBlock: string | null,
    annotationsWithMetadata?: Array<{ id: string; userTypeBlock: string | null }>
  ) => Promise<void>
  handleRemoveAnnotation?: (
    annotationId: string,
    annotationText: string,
    confirmRemove?: () => boolean
  ) => Promise<void>
}

