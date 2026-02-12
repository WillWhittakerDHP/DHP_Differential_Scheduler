/**
 * Annotation Transformers
 * 
 * LEARNING: Common utilities for annotation transformation
 * WHY: DRY principle - shared logic for all annotation operations
 * PATTERN: Utility functions for annotation transformation, filtering, and sorting
 */

import type { AnnotationInstance, AnnotationWithMetadata, AnnotationShape } from '@/types/annotations'
import type { UserTypeBlock } from '@/types/userTypes'
import type { GlobalEntityId } from '@/types/entities'

/**
 * Transform API annotation type to AnnotationShape
 * LEARNING: Converts API annotationShape association to AnnotationShape
 * WHY: API returns annotationShape association with id and name
 * PATTERN: Simple field mapping
 * 
 * LEARNING: Function used internally - not exported as it's not part of public API
 * WHY: This function is only used within this file (by transformApiAnnotation)
 * 
 * @param rawAnnotationShape - Raw annotationShape from API
 * @returns Transformed AnnotationShape or null
 */
function transformApiAnnotationShape(rawAnnotationShape: unknown): AnnotationShape | null {
  if (!rawAnnotationShape || typeof rawAnnotationShape !== 'object') {
    return null
  }
  
  const type = rawAnnotationShape as Record<string, unknown>
  
  // PATTERN: Check disabled flag before transforming
  const disabled = type.disabled ?? type.Disabled ?? false
  if (disabled === true) {
    return null
  }
  
  const id = type.id ?? type.ID
  const name = type.name ?? type.Name
  
  if (typeof id === 'string' && typeof name === 'string') {
    // PATTERN: Include all BaseGlobalEntity properties when transforming API response
    return { 
      id, 
      name,
      entityKey: 'annotationShape' as const,
      orderIndex: 0,
      active: true
    }
  }
  
  return null
}

/**
 * Transform API annotation to AnnotationInstance type
 * LEARNING: Converts snake_case API response to camelCase frontend format
 * WHY: Backend uses snake_case (user_type_block_block_instance_id), frontend uses camelCase (userTypeBlock)
 * PATTERN: Simple field name mapping and type normalization
 * 
 * NOTE: The userTypeBlock field on AnnotationInstance entity is deprecated. The effective userTypeBlock
 * comes from AnnotationAssignment.userTypeBlockBlockInstanceId (see transformAnnotationsWithMetadata)
 * 
 * @param rawAnnotation - Raw annotation from API
 * @returns Transformed AnnotationInstance
 * NOTE: Renamed from Annotation to AnnotationInstance (2026-01-30)
 */
export function transformApiAnnotation(rawAnnotation: Record<string, unknown>): AnnotationInstance {
  // Note: userTypeBlock on AnnotationInstance entity is deprecated, but we keep it for backward compatibility
  const userTypeBlock = rawAnnotation.userTypeBlock ?? null
  const normalizedUserTypeBlock: UserTypeBlock = typeof userTypeBlock === 'string'
    ? userTypeBlock as GlobalEntityId
    : null

  const type = rawAnnotation.type ?? rawAnnotation.annotationShapeId
  const normalizedType: string = typeof type === 'string' ? type : ''

  const annotationShape = rawAnnotation.annotationShape
  const transformedAnnotationShape = transformApiAnnotationShape(annotationShape)

  const nameRaw = rawAnnotation.name
  const textRaw = rawAnnotation.text
  const name = (nameRaw !== undefined && nameRaw !== null && nameRaw !== '') ? nameRaw : ((textRaw !== undefined && textRaw !== null && textRaw !== '') ? textRaw : '')

  // PATTERN: Include all BaseGlobalEntity properties when transforming API response
  const result: AnnotationInstance = {
    id: typeof rawAnnotation.id === 'string' ? rawAnnotation.id : '',
    entityKey: 'annotationInstance' as const,
    orderIndex: 0,
    active: true,
    name: typeof name === 'string' ? name : '',
    type: normalizedType,
    userTypeBlock: normalizedUserTypeBlock,
    annotationShape: transformedAnnotationShape ?? undefined,
  }
  
  return result
}


/**
 * Filter annotations by user type
 * LEARNING: Filter annotations based on user type
 * WHY: Show only relevant annotations for selected user type
 * PATTERN: Simple filter by userTypeBlock property
 * 
 * @param annotations - Annotations to filter
 * @param userTypeBlock - User type to filter by (null for generic)
 * @returns Filtered annotations
 */
export function filterAnnotationsByUserTypeBlock(
  annotations: AnnotationWithMetadata[],
  userTypeBlock: UserTypeBlock | null
): AnnotationWithMetadata[] {
  if (userTypeBlock === null) {
    return annotations.filter(a => a.userTypeBlock === null)
  }
  // PATTERN: Check both userTypeBlock and userTypeBlockBlockInstanceId properties
  return annotations.filter(a => {
    const annotationWithBlockId = a as AnnotationWithMetadata & { userTypeBlockBlockInstanceId?: UserTypeBlock | null }
    if ('userTypeBlockBlockInstanceId' in annotationWithBlockId) {
      return annotationWithBlockId.userTypeBlockBlockInstanceId === userTypeBlock
    }
    return a.userTypeBlock === userTypeBlock
  })
}

/**
 * Sort annotations by orderIndex
 * LEARNING: Sort annotations by their order index
 * WHY: Display annotations in correct order
 * PATTERN: Simple numeric sort
 * 
 * @param annotations - Annotations to sort
 * @returns Sorted annotations
 */
export function sortAnnotationsByOrderIndex(
  annotations: AnnotationWithMetadata[]
): AnnotationWithMetadata[] {
  return [...annotations].sort((a, b) => a.orderIndex - b.orderIndex)
}

export function getDefaultAnnotation(
  annotations: AnnotationWithMetadata[]
): AnnotationWithMetadata | null {
  // PATTERN: Check for default first, then return first annotation
  const defaultAnnotation = annotations.find(a => a.isDefault)
  if (defaultAnnotation) {
    return defaultAnnotation
  }
  return annotations.length > 0 ? annotations[0] : null
}

/**
 * Helper to extract through-table attributes from annotation object
 * LEARNING: Sequelize through-table attributes may be in different formats
 * WHY: Through-table data structure depends on Sequelize version and configuration
 * PATTERN: Try multiple possible property names and formats
 * NOTE: Backend uses annotation_assignments, frontend uses friendly "AnnotationAssignment" terminology
 * 
 * @param annotation - Annotation object with potential through-table data
 * @returns Through-table attributes or null
 */
export function getThroughAttributes(annotation: Record<string, unknown>): {
  userTypeBlockBlockInstanceId: GlobalEntityId | null
  orderIndex: number
  isDefault: boolean
} | null {
  const through = annotation.annotationAssignment ?? annotation.AnnotationAssignment
  if (through && typeof through === 'object') {
    const t = through as Record<string, unknown>
    return {
      userTypeBlockBlockInstanceId: (t.userTypeBlockBlockInstanceId ?? null) as GlobalEntityId | null,
      orderIndex: (t.orderIndex ?? 0) as number,
      isDefault: (t.isDefault ?? false) as boolean,
    }
  }
  return null
}


