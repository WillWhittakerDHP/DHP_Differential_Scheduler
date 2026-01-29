/**
 * useAnnotationMetadata Composable
 * 
 * LEARNING: Computes annotation metadata options and validation
 * WHY: Extracts metadata computation logic from AnnotationsField component
 * PATTERN: Composable that provides computed options and validation helpers
 * 
 * Features:
 * - Annotation type options
 * - User type options
 * - Duplicate user type validation
 * - Sorting logic
 * - Available annotations filtering
 */

import { computed } from 'vue'
import { useGlobal } from '@/composables/useGlobal'
import { useAnnotationTypes } from '@/composables/useAnnotationTypes'
import { getStateControlBlockInstanceOptions } from '@/utils/blockInstanceUtils'
import { hasDuplicateUserTypeBlock, getAvailableUserTypeBlocksForAnnotation } from '@/utils/annotationUtils'
import type { Annotation, AnnotationType, AnnotationWithMetadata } from '@/types/annotations'
import type { AnnotationAssignmentResponse, BlockInstanceAnnotationResponse } from '@/types/annotations'

/**
 * useAnnotationMetadata composable
 * LEARNING: Provides annotation metadata computation and validation
 * WHY: Centralizes metadata logic for reuse across components
 * PATTERN: Composable that returns computed properties and validation functions
 */
export function useAnnotationMetadata() {
  const { globalData } = useGlobal()
  /**
   * LEARNING: Avoid destructuring `data = []` from vue-query.
   * WHY: `data = []` creates a union like `never[] | Ref<T[] | undefined>`, which breaks `.value` access.
   * PATTERN: Keep the query object, then derive a normalized computed list.
   */
  const annotationTypesQuery = useAnnotationTypes()
  const annotationTypes = computed(() => annotationTypesQuery.data.value ?? [])

  /**
   * User type options derived from GlobalData (dynamic)
   * LEARNING: Computed user type options from globalData using property-based filtering
   * WHY: User types come from state control BlockInstances (isStateControl: true), not hardcoded
   * PATTERN: Computed property that reads from globalData and filters by property
   */
  const userTypeBlockOptions = computed(() => {
    if (!globalData.value) return [{ title: 'Generic', value: null }]
    return getStateControlBlockInstanceOptions(globalData.value)
  })

  /**
   * Annotation type options for select
   * LEARNING: Transform annotation types to select options
   * WHY: Select components need {id, name} format
   * PATTERN: Map annotation types to select options
   */
  const annotationTypeOptions = computed(() => {
    return annotationTypes.value.map((type: AnnotationType) => ({
      id: type.id,
      name: type.name,
    }))
  })

  /**
   * Compute annotations with metadata from relationships
   * LEARNING: Merge annotation entities with relationship metadata
   * WHY: Display needs both annotation data and relationship metadata
   * PATTERN: Map relationships to annotations, merge metadata
   */
  const computeAnnotationsWithMetadata = (
    blockInstanceAnnotations: AnnotationAssignmentResponse[],
    allAnnotations: Annotation[],
    annotationTypes: AnnotationType[],
    allBlockInstanceAnnotations: BlockInstanceAnnotationResponse[],
    blockInstanceId: string
  ): Array<AnnotationWithMetadata & { blockInstanceNames?: string[] }> => {
    if (!blockInstanceId || !blockInstanceAnnotations || !Array.isArray(blockInstanceAnnotations)) {
      return []
    }
    
    return blockInstanceAnnotations.map((rel: AnnotationAssignmentResponse) => {
      const annotation = (allAnnotations || []).find((a: Annotation) => a.id === rel.annotationId)
      
      // Find annotation type name
      const annotationType = annotation?.annotationType || 
        annotationTypes.find((at: AnnotationType) => at.id === annotation?.type)
      const typeName = annotationType?.name || ''
      
      // Find all block instances that use this annotation
      const blockInstancesUsingThis = (allBlockInstanceAnnotations || []).filter(
        (bid: BlockInstanceAnnotationResponse) => bid.annotationId === rel.annotationId && bid.blockInstanceId !== blockInstanceId
      )
      const blockInstanceNames = blockInstancesUsingThis.map((bid: BlockInstanceAnnotationResponse) => bid.blockInstanceName).filter(Boolean)
      
      return {
        id: rel.annotationId,
        text: annotation?.text || '',
        type: annotation?.type || '',
        userTypeBlock: rel.userTypeBlockBlockInstanceId || rel.userTypeBlock || null,
        orderIndex: rel.orderIndex,
        isDefault: rel.isDefault,
        blockInstanceNames,
        typeName, // Additional property for display
      } as AnnotationWithMetadata & { blockInstanceNames?: string[]; typeName?: string }
    })
  }

  /**
   * Sort annotations by orderIndex
   * LEARNING: Sort annotations array by orderIndex
   * WHY: Display should respect orderIndex
   * PATTERN: Array sort by orderIndex property
   */
  const sortAnnotations = (
    annotations: Array<AnnotationWithMetadata & { blockInstanceNames?: string[] }>
  ): Array<AnnotationWithMetadata & { blockInstanceNames?: string[] }> => {
    return [...annotations].sort((a, b) => a.orderIndex - b.orderIndex)
  }

  /**
   * Filter available annotations (not already selected)
   * LEARNING: Return annotations that aren't already assigned
   * WHY: Multi-select should only show unassigned annotations
   * PATTERN: Filter out annotations that exist in assigned list
   */
  const getAvailableAnnotations = (
    allAnnotations: Annotation[],
    assignedAnnotationIds: string[]
  ): Annotation[] => {
    if (!allAnnotations || !Array.isArray(allAnnotations)) {
      return []
    }
    const selectedIds = new Set(assignedAnnotationIds)
    return allAnnotations.filter((ann: Annotation) => !selectedIds.has(ann.id))
  }

  /**
   * Compute all annotations with block instance names for dialog
   * LEARNING: Add block instance names to annotations for display
   * WHY: Users need to see which block instances use each annotation
   * PATTERN: Map annotations and add blockInstanceNames from allBlockInstanceAnnotations
   */
  const computeAnnotationsWithBlockInstances = (
    allAnnotations: Annotation[],
    allBlockInstanceAnnotations: BlockInstanceAnnotationResponse[]
  ): Array<Annotation & { displayText: string; blockInstanceNames: string[] }> => {
    if (!allAnnotations || !Array.isArray(allAnnotations)) {
      return []
    }
    
    return allAnnotations.map((ann: Annotation) => {
      // Find all block instances that use this annotation
      const blockInstancesUsingThis = allBlockInstanceAnnotations.filter(
        (bid: BlockInstanceAnnotationResponse) => bid.annotationId === ann.id
      )
      const blockInstanceNames = blockInstancesUsingThis.map((bid: BlockInstanceAnnotationResponse) => bid.blockInstanceName).filter(Boolean)
      
      const displayText = blockInstanceNames.length > 0
        ? `${ann.text} (${blockInstanceNames.join(', ')})`
        : ann.text
      
      return {
        ...ann,
        displayText,
        blockInstanceNames,
      }
    })
  }

  /**
   * Check for duplicate user type
   * LEARNING: Wrapper around hasDuplicateUserTypeBlock utility
   * WHY: Provides consistent interface for validation
   * PATTERN: Delegate to utility function
   */
  const checkDuplicateUserTypeBlock = (
    annotation: AnnotationWithMetadata & { blockInstanceNames?: string[] },
    allAnnotations: Array<AnnotationWithMetadata & { blockInstanceNames?: string[] }>
  ): boolean => {
    return hasDuplicateUserTypeBlock(annotation, allAnnotations)
  }

  /**
   * Get available user types for an annotation
   * LEARNING: Wrapper around getAvailableUserTypeBlocksForAnnotation utility
   * WHY: Provides consistent interface for filtering
   * PATTERN: Delegate to utility function
   */
  const getAvailableUserTypeBlocks = (
    annotation: AnnotationWithMetadata & { blockInstanceNames?: string[] },
    allAnnotations: Array<AnnotationWithMetadata & { blockInstanceNames?: string[] }>
  ) => {
    return getAvailableUserTypeBlocksForAnnotation(annotation, allAnnotations, userTypeBlockOptions.value)
  }

  return {
    // Options
    userTypeBlockOptions,
    annotationTypeOptions,
    
    // Computations
    computeAnnotationsWithMetadata,
    sortAnnotations,
    getAvailableAnnotations,
    computeAnnotationsWithBlockInstances,
    
    // Validation
    checkDuplicateUserTypeBlock,
    getAvailableUserTypeBlocks,
  }
}

