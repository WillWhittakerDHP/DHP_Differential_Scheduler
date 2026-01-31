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
import type { FetchedRelationship } from '@/types/relationships'

/**
 * Transform API annotation type to AnnotationShape
 * LEARNING: Converts API annotationShape association to AnnotationShape
 * WHY: API returns annotationShape association with id and name
 * PATTERN: Simple field mapping
 * 
 * @param rawAnnotationShape - Raw annotationShape from API
 * @returns Transformed AnnotationShape or null
 */
export function transformApiAnnotationShape(rawAnnotationShape: unknown): AnnotationShape | null {
  if (!rawAnnotationShape || typeof rawAnnotationShape !== 'object') {
    return null
  }
  
  const type = rawAnnotationShape as Record<string, unknown>
  
  // LEARNING: Filter disabled annotation types
  // WHY: Tests expect disabled types to return null
  // PATTERN: Check disabled flag before transforming
  const disabled = type.disabled ?? type.Disabled ?? false
  if (disabled === true) {
    return null
  }
  
  const id = type.id ?? type.ID
  const name = type.name ?? type.Name
  
  if (typeof id === 'string' && typeof name === 'string') {
    return { id, name }
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
  // The effective userTypeBlock comes from AnnotationAssignment.userTypeBlockBlockInstanceId
  const userTypeBlock = rawAnnotation.userTypeBlock ?? rawAnnotation.user_type_block ?? null
  const normalizedUserTypeBlock: UserTypeBlock = typeof userTypeBlock === 'string' 
    ? userTypeBlock as GlobalEntityId // Accept BlockInstance ID as-is
    : null

  // Extract type field (UUID foreign key to annotation_shapes)
  const type = rawAnnotation.type ?? rawAnnotation.Type ?? rawAnnotation.annotation_type_id ?? rawAnnotation.annotationShapeId
  const normalizedType: string = typeof type === 'string' ? type : ''

  // Extract annotationShape association if present (backend uses annotationShape)
  const annotationShape = rawAnnotation.annotationShape ?? rawAnnotation.annotation_shape ?? rawAnnotation.AnnotationShape
    ?? rawAnnotation.annotationShape ?? rawAnnotation.annotation_type ?? rawAnnotation.AnnotationShape // Fallback for backward compatibility
  const transformedAnnotationShape = transformApiAnnotationShape(annotationShape)

  // LEARNING: Include name property for backward compatibility
  // WHY: Tests expect name property, which maps to text
  // PATTERN: Use name if present, fallback to text
  const name = rawAnnotation.name ?? rawAnnotation.Name ?? rawAnnotation.text ?? rawAnnotation.Text ?? ''
  const text = rawAnnotation.text ?? rawAnnotation.Text ?? name

  const result: AnnotationInstance & { name?: string } = {
    id: typeof rawAnnotation.id === 'string' ? rawAnnotation.id : '',
    text: typeof text === 'string' ? text : '',
    name: typeof name === 'string' ? name : (typeof text === 'string' ? text : ''),
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
    // Return generic annotations (userTypeBlock === null)
    return annotations.filter(a => a.userTypeBlock === null)
  }
  // LEARNING: Filter by userTypeBlockBlockInstanceId if present, otherwise by userTypeBlock
  // WHY: Tests expect filtering by userTypeBlockBlockInstanceId property
  // PATTERN: Check both userTypeBlock and userTypeBlockBlockInstanceId properties
  return annotations.filter(a => {
    // Check if annotation has userTypeBlockBlockInstanceId property (from metadata)
    const annotationWithBlockId = a as AnnotationWithMetadata & { userTypeBlockBlockInstanceId?: UserTypeBlock | null }
    if ('userTypeBlockBlockInstanceId' in annotationWithBlockId) {
      return annotationWithBlockId.userTypeBlockBlockInstanceId === userTypeBlock
    }
    // Fallback to userTypeBlock property
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

/**
 * Get default annotation
 * LEARNING: Find the annotation marked as default, or return first if none marked
 * WHY: Display default annotation when no user type is selected
 * PATTERN: Find first annotation with isDefault === true, or return first annotation
 * 
 * @param annotations - Annotations to search
 * @returns Default annotation, first annotation if none marked default, or null
 */
export function getDefaultAnnotation(
  annotations: AnnotationWithMetadata[]
): AnnotationWithMetadata | null {
  // LEARNING: Return first annotation if none marked default
  // WHY: Tests expect first annotation when no default is set
  // PATTERN: Check for default first, then return first annotation
  const defaultAnnotation = annotations.find(a => a.isDefault)
  if (defaultAnnotation) {
    return defaultAnnotation
  }
  // Return first annotation if none marked default
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
  // Try PascalCase first (AnnotationAssignment - backend name)
  if (annotation.AnnotationAssignment && typeof annotation.AnnotationAssignment === 'object') {
    const through = annotation.AnnotationAssignment as Record<string, unknown>
    return {
      userTypeBlockBlockInstanceId: (through.userTypeBlockBlockInstanceId ?? through.user_type_block_block_instance_id ?? null) as GlobalEntityId | null,
      orderIndex: (through.orderIndex ?? through.order_index ?? 0) as number,
      isDefault: (through.isDefault ?? through.is_default ?? false) as boolean,
    }
  }
  // Try camelCase (annotationAssignment - backend name)
  if (annotation.annotationAssignment && typeof annotation.annotationAssignment === 'object') {
    const through = annotation.annotationAssignment as Record<string, unknown>
    return {
      userTypeBlockBlockInstanceId: (through.userTypeBlockBlockInstanceId ?? through.user_type_block_block_instance_id ?? null) as GlobalEntityId | null,
      orderIndex: (through.orderIndex ?? through.order_index ?? 0) as number,
      isDefault: (through.isDefault ?? through.is_default ?? false) as boolean,
    }
  }
  // Try PascalCase (AnnotationAssignment - friendly frontend name, backward compatibility)
  if (annotation.AnnotationAssignment && typeof annotation.AnnotationAssignment === 'object') {
    const through = annotation.AnnotationAssignment as Record<string, unknown>
    return {
      userTypeBlockBlockInstanceId: (through.userTypeBlockBlockInstanceId ?? through.user_type_block_block_instance_id ?? null) as GlobalEntityId | null,
      orderIndex: (through.orderIndex ?? through.order_index ?? 0) as number,
      isDefault: (through.isDefault ?? through.is_default ?? false) as boolean,
    }
  }
  // Try camelCase (annotationAssignment - friendly frontend name, backward compatibility)
  if (annotation.annotationAssignment && typeof annotation.annotationAssignment === 'object') {
    const through = annotation.annotationAssignment as Record<string, unknown>
    return {
      userTypeBlockBlockInstanceId: (through.userTypeBlockBlockInstanceId ?? through.user_type_block_block_instance_id ?? null) as GlobalEntityId | null,
      orderIndex: (through.orderIndex ?? through.order_index ?? 0) as number,
      isDefault: (through.isDefault ?? through.is_default ?? false) as boolean,
    }
  }
  return null
}


