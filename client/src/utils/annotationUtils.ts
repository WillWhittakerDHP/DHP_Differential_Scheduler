/**
 * Annotation Utilities
 * 
 * LEARNING: Helper functions for annotation validation, filtering, and formatting
 * WHY: Reusable utilities for annotation operations across components
 * PATTERN: Utility functions that work with Annotation types and USER_TYPES constant
 */

import type { AnnotationWithMetadata, AnnotationMetadata } from '@/types/annotations'
import type { UserTypeBlock } from '@/types/userTypes'
import type { GlobalData } from '@/utils/transformers/fetchToGlobalTransformer'
import { getStateControlBlockInstanceOptions } from '@/utils/blockInstanceUtils'

/**
 * LEARNING: Check if a user type is already used by another annotation
 * WHY: Only one annotation per user type is allowed per block instance (enforced by unique constraint)
 * PATTERN: Check if any other annotation (excluding current) has the same userTypeBlock
 * 
 * @param currentAnnotation - The annotation being validated
 * @param allAnnotations - All annotations for the block instance
 * @returns true if user type is already used by another annotation
 * 
 * NOTE: null userTypeBlock (generic) can have multiple instances, so this returns false for null
 */
export function hasDuplicateUserTypeBlock(
  currentAnnotation: AnnotationWithMetadata,
  allAnnotations: AnnotationWithMetadata[]
): boolean {
  if (!currentAnnotation.userTypeBlock) return false // null userTypeBlock (generic) can have multiple
  
  const otherAnnotations = allAnnotations.filter(a => a.id !== currentAnnotation.id)
  return otherAnnotations.some(a => a.userTypeBlock === currentAnnotation.userTypeBlock)
}

/**
 * LEARNING: Get available user types for an annotation (filter out already-used types)
 * WHY: Prevents selecting user types that are already in use
 * PATTERN: Return user type options with disabled state for unavailable types
 * 
 * @param currentAnnotation - The annotation being edited
 * @param allAnnotations - All annotations for the block instance
 * @param userTypeBlockOptions - Available user type options
 * @returns User type options with disabled state set for unavailable types
 */
export function getAvailableUserTypeBlocksForAnnotation(
  currentAnnotation: AnnotationWithMetadata,
  allAnnotations: AnnotationWithMetadata[],
  userTypeBlockOptions: Array<{ title: string; value: UserTypeBlock }>
): Array<{ title: string; value: UserTypeBlock; disabled?: boolean }> {
  const otherAnnotations = allAnnotations.filter(a => a.id !== currentAnnotation.id)
  const usedUserTypeBlocks = new Set(otherAnnotations.map(a => a.userTypeBlock).filter(Boolean))
  
  return userTypeBlockOptions.map(option => ({
    ...option,
    disabled: option.value !== null && usedUserTypeBlocks.has(option.value) && currentAnnotation.userTypeBlock !== option.value
  }))
}

/**
 * LEARNING: Format annotation for display
 * WHY: Consistent formatting of annotations across UI
 * PATTERN: Simple text extraction with optional metadata display
 * 
 * @param annotation - Annotation to format
 * @returns Formatted string for display
 */
export function formatAnnotationForDisplay(annotation: AnnotationWithMetadata): string {
  return annotation.text
}

/**
 * LEARNING: Filter annotations by user type
 * WHY: Show only relevant annotations based on selected user type
 * PATTERN: Filter array by userTypeBlock property
 * 
 * @param annotations - Annotations to filter
 * @param userTypeBlock - User type to filter by (null for generic)
 * @returns Filtered annotations
 */
export function getAnnotationsForUserTypeBlock(
  annotations: AnnotationWithMetadata[],
  userTypeBlock: UserTypeBlock | null
): AnnotationWithMetadata[] {
  if (userTypeBlock === null) {
    // Return generic annotations (userTypeBlock === null)
    return annotations.filter(a => a.userTypeBlock === null)
  }
  // Return annotations matching the user type
  return annotations.filter(a => a.userTypeBlock === userTypeBlock)
}

/**
 * LEARNING: Validate annotation metadata
 * WHY: Ensure metadata values are valid before saving
 * PATTERN: Check orderIndex >= 0, isDefault is boolean, userTypeBlock is valid BlockInstance ID or null
 * 
 * @param metadata - Metadata to validate
 * @returns true if metadata is valid
 */
export function validateAnnotationMetadata(metadata: AnnotationMetadata): boolean {
  return (
    typeof metadata.orderIndex === 'number' &&
    metadata.orderIndex >= 0 &&
    typeof metadata.isDefault === 'boolean' &&
    (metadata.userTypeBlock === null || typeof metadata.userTypeBlock === 'string') // userTypeBlock is BlockInstance ID (GlobalEntityId) or null
  )
}

/**
 * LEARNING: User type options derived from GlobalData
 * WHY: User types are fetched dynamically from BlockInstances using property-based filtering
 * PATTERN: Function that accepts GlobalData and returns options array
 * 
 * NOTE: Uses property-based filtering (isStateControl: true) instead of hardcoded names
 * 
 * @deprecated Use getStateControlBlockInstanceOptions from @/utils/blockInstanceUtils instead
 */
export function getUserTypeBlockOptionsFromGlobalData(globalData: GlobalData): Array<{ title: string; value: UserTypeBlock }> {
  return getStateControlBlockInstanceOptions(globalData) as Array<{ title: string; value: UserTypeBlock }>
}

