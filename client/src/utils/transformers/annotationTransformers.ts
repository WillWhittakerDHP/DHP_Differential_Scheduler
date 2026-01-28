/**
 * Annotation Transformers
 * 
 * LEARNING: Common utilities for annotation transformation
 * WHY: DRY principle - shared logic for all annotation operations
 * PATTERN: Utility functions for annotation transformation, filtering, and sorting
 */

import type { Annotation, AnnotationWithMetadata, AnnotationType } from '@/types/annotations'
import type { UserTypeBlock } from '@/types/userTypes'
import type { GlobalEntityId } from '@/types/entities'

/**
 * ActiveAnnotation relationship type (from API)
 * LEARNING: Structure of ActiveAnnotation through-table data
 * WHY: Type-safe transformation of API response
 * NOTE: Backend uses active_annotations table, frontend uses friendly "AnnotationAssignment" terminology
 */
type ActiveAnnotationRelationship = {
  id: string
  blockInstanceId: string
  annotationId: string
  userTypeBlockBlockInstanceId: GlobalEntityId | null // BlockInstance ID for user type, or null for generic
  orderIndex: number
  isDefault: boolean
}

/**
 * Transform API annotation type to AnnotationType
 * LEARNING: Converts API annotationType association to AnnotationType
 * WHY: API returns annotationType association with id and name
 * PATTERN: Simple field mapping
 * 
 * @param rawAnnotationType - Raw annotationType from API
 * @returns Transformed AnnotationType or null
 */
export function transformApiAnnotationType(rawAnnotationType: unknown): AnnotationType | null {
  if (!rawAnnotationType || typeof rawAnnotationType !== 'object') {
    return null
  }
  
  const type = rawAnnotationType as Record<string, unknown>
  
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
 * Transform API annotation to Annotation type
 * LEARNING: Converts snake_case API response to camelCase frontend format
 * WHY: Backend uses snake_case (user_type_block_block_instance_id), frontend uses camelCase (userTypeBlock)
 * PATTERN: Simple field name mapping and type normalization
 * 
 * NOTE: The userTypeBlock field on Annotation entity is deprecated. The effective userTypeBlock
 * comes from AnnotationAssignment.userTypeBlockBlockInstanceId (see transformAnnotationsWithMetadata)
 * 
 * @param rawAnnotation - Raw annotation from API
 * @returns Transformed Annotation
 */
export function transformApiAnnotation(rawAnnotation: Record<string, unknown>): Annotation {
  // Note: userTypeBlock on Annotation entity is deprecated, but we keep it for backward compatibility
  // The effective userTypeBlock comes from AnnotationAssignment.userTypeBlockBlockInstanceId
  const userTypeBlock = rawAnnotation.userTypeBlock ?? rawAnnotation.user_type_block ?? null
  const normalizedUserTypeBlock: UserTypeBlock = typeof userTypeBlock === 'string' 
    ? userTypeBlock as GlobalEntityId // Accept BlockInstance ID as-is
    : null

  // Extract type field (UUID foreign key to annotation_shapes)
  const type = rawAnnotation.type ?? rawAnnotation.Type ?? rawAnnotation.annotation_type_id ?? rawAnnotation.annotationTypeId
  const normalizedType: string = typeof type === 'string' ? type : ''

  // Extract annotationShape association if present (backend uses annotationShape, frontend maps to annotationType)
  const annotationShape = rawAnnotation.annotationShape ?? rawAnnotation.annotation_shape ?? rawAnnotation.AnnotationShape
    ?? rawAnnotation.annotationType ?? rawAnnotation.annotation_type ?? rawAnnotation.AnnotationType // Fallback for backward compatibility
  const transformedAnnotationType = transformApiAnnotationType(annotationShape)

  // LEARNING: Include name property for backward compatibility
  // WHY: Tests expect name property, which maps to text
  // PATTERN: Use name if present, fallback to text
  const name = rawAnnotation.name ?? rawAnnotation.Name ?? rawAnnotation.text ?? rawAnnotation.Text ?? ''
  const text = rawAnnotation.text ?? rawAnnotation.Text ?? name

  const result: Annotation & { name?: string } = {
    id: typeof rawAnnotation.id === 'string' ? rawAnnotation.id : '',
    text: typeof text === 'string' ? text : '',
    name: typeof name === 'string' ? name : (typeof text === 'string' ? text : ''),
    type: normalizedType,
    userTypeBlock: normalizedUserTypeBlock,
    annotationType: transformedAnnotationType ?? undefined,
  }
  
  return result
}

/**
 * Transform annotations with metadata from relationships
 * LEARNING: Merges base annotations with relationship-level metadata
 * WHY: ActiveAnnotation through-table contains per-instance metadata
 * PATTERN: Map relationships to annotations, merge metadata
 * NOTE: Backend uses active_annotations, frontend uses friendly "AnnotationAssignment" terminology
 * 
 * @param annotations - Base annotations (from AnnotationInstance entities)
 * @param relationships - ActiveAnnotation relationships
 * @returns Annotations with merged metadata
 */
export function transformAnnotationsWithMetadata(
  annotations: Annotation[],
  relationships: ActiveAnnotationRelationship[]
): AnnotationWithMetadata[] {
  return relationships.map(rel => {
    const annotation = annotations.find(a => a.id === rel.annotationId)
    if (!annotation) {
      // Skip if annotation not found (shouldn't happen, but handle gracefully)
      return null
    }

    // Effective user type: through-table override (userTypeBlockBlockInstanceId) takes precedence, else Annotation.userTypeBlock
    // userTypeBlockBlockInstanceId is a BlockInstance ID (GlobalEntityId) or null
    const effectiveUserTypeBlock: UserTypeBlock = rel.userTypeBlockBlockInstanceId ?? annotation.userTypeBlock

    return {
      ...annotation,
      userTypeBlock: effectiveUserTypeBlock,
      orderIndex: rel.orderIndex ?? 0,
      isDefault: rel.isDefault ?? false,
    }
  }).filter((a): a is AnnotationWithMetadata => a !== null)
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
 * NOTE: Backend uses active_annotations, frontend uses friendly "AnnotationAssignment" terminology
 * 
 * @param annotation - Annotation object with potential through-table data
 * @returns Through-table attributes or null
 */
export function getThroughAttributes(annotation: Record<string, unknown>): {
  userTypeBlockBlockInstanceId: GlobalEntityId | null
  orderIndex: number
  isDefault: boolean
} | null {
  // Try PascalCase first (ActiveAnnotation - backend name)
  if (annotation.ActiveAnnotation && typeof annotation.ActiveAnnotation === 'object') {
    const through = annotation.ActiveAnnotation as Record<string, unknown>
    return {
      userTypeBlockBlockInstanceId: (through.userTypeBlockBlockInstanceId ?? through.user_type_block_block_instance_id ?? null) as GlobalEntityId | null,
      orderIndex: (through.orderIndex ?? through.order_index ?? 0) as number,
      isDefault: (through.isDefault ?? through.is_default ?? false) as boolean,
    }
  }
  // Try camelCase (activeAnnotation - backend name)
  if (annotation.activeAnnotation && typeof annotation.activeAnnotation === 'object') {
    const through = annotation.activeAnnotation as Record<string, unknown>
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

/**
 * Group annotations by entity ID (similar to transformApiRelationships)
 * LEARNING: Groups active annotations by blockInstanceId and merges with annotation instance data
 * WHY: Creates map of entity ID to annotations for efficient attachment during hydration
 * PATTERN: Similar to relationship grouping - creates entity-to-annotations mapping
 * NOTE: Backend uses active_annotations, frontend uses friendly "assignments" terminology
 * 
 * @param annotations - Base annotations (from AnnotationInstance entities)
 * @param assignments - ActiveAnnotation relationships with includes
 * @returns Map of entity ID to AnnotationWithMetadata array
 */
export function groupAnnotationsByEntity(
  annotations: Annotation[] | Array<Annotation & { blockInstanceId?: string; name?: string }>,
  assignments?: Array<{
    blockInstanceId: string
    annotationId: string
    userTypeBlockBlockInstanceId: GlobalEntityId | null
    orderIndex: number
    isDefault: boolean
    annotation?: Annotation
  }>
): Map<GlobalEntityId, AnnotationWithMetadata[]> {
  // LEARNING: Handle case where assignments is undefined or not provided
  // WHY: Tests may call with just annotations array that have blockInstanceId property
  // PATTERN: If assignments not provided, group by blockInstanceId from annotations
  if (!assignments || assignments.length === 0) {
    // LEARNING: Use reduce instead of forEach to build Map
    // WHY: Functional approach avoids mutations, aligns with workspace rules
    // PATTERN: Reduce array to Map structure
    return annotations
      .filter((annotation): annotation is Annotation & { blockInstanceId: string; name?: string } => {
        const annotationWithBlockId = annotation as Annotation & { blockInstanceId?: string; name?: string }
        return !!annotationWithBlockId.blockInstanceId
      })
      .reduce((acc, annotation) => {
        const annotationWithBlockId = annotation as Annotation & { blockInstanceId: string; name?: string; orderIndex?: number; isDefault?: boolean }
        const existing = acc.get(annotationWithBlockId.blockInstanceId) || []
        const annotationWithMetadata: AnnotationWithMetadata = {
          ...annotation,
          text: annotation.text || annotationWithBlockId.name || '',
          orderIndex: annotationWithBlockId.orderIndex ?? 0,
          isDefault: annotationWithBlockId.isDefault ?? false,
        }
        acc.set(annotationWithBlockId.blockInstanceId, [...existing, annotationWithMetadata])
        return acc
      }, new Map<GlobalEntityId, AnnotationWithMetadata[]>())
  }
  
  // LEARNING: Use reduce instead of forEach to build Map
  // WHY: Functional approach avoids mutations, aligns with workspace rules
  // PATTERN: Reduce assignments array to Map structure
  const unsortedMap = assignments.reduce((acc, assignment) => {
    // Get base annotation (from includes or lookup)
    // assignment.annotation may include annotationType association
    const baseAnnotation = assignment.annotation 
      ? transformApiAnnotation(assignment.annotation as Record<string, unknown>)
      : annotations.find(a => a.id === assignment.annotationId)
    
    if (!baseAnnotation) {
      // Skip if annotation not found
      return acc
    }
    
    // Effective user type: through-table override takes precedence
    const effectiveUserTypeBlock: UserTypeBlock = assignment.userTypeBlockBlockInstanceId ?? baseAnnotation.userTypeBlock
    
    const annotationWithMetadata: AnnotationWithMetadata = {
      ...baseAnnotation,
      userTypeBlock: effectiveUserTypeBlock,
      orderIndex: assignment.orderIndex ?? 0,
      isDefault: assignment.isDefault ?? false,
    }
    
    // Add to map for this blockInstance
    const existing = acc.get(assignment.blockInstanceId) || []
    acc.set(assignment.blockInstanceId, [...existing, annotationWithMetadata])
    return acc
  }, new Map<GlobalEntityId, AnnotationWithMetadata[]>())
  
  // LEARNING: Create new Map with sorted values instead of mutating existing Map
  // WHY: Functional approach avoids mutations, aligns with workspace rules
  // PATTERN: Build new Map from entries with sorted values
  return new Map(
    Array.from(unsortedMap.entries()).map(([entityId, anns]) => [
      entityId,
      sortAnnotationsByOrderIndex(anns)
    ])
  )
}

