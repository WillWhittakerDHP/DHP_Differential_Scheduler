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
 * LEARNING: Function not exported - unused in codebase
 * WHY: This function is not currently used, kept for potential future use
 * NOTE: If needed in future, uncomment export
 * 
 * @param currentAnnotation - The annotation being validated
 * @param allAnnotations - All annotations for the block instance
 * @returns true if user type is already used by another annotation
 * 
 * NOTE: null userTypeBlock (generic) can have multiple instances, so this returns false for null
 */
function hasDuplicateUserTypeBlock(
  currentAnnotation: AnnotationWithMetadata,
  allAnnotations: AnnotationWithMetadata[]
): boolean {
  if (!currentAnnotation.userTypeBlock) return false // null userTypeBlock (generic) can have multiple
  
  const otherAnnotations = allAnnotations.filter(a => a.id !== currentAnnotation.id)
  return otherAnnotations.some(a => a.userTypeBlock === currentAnnotation.userTypeBlock)
}

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

function formatAnnotationForDisplay(annotation: AnnotationWithMetadata): string {
  return annotation.text
}

/**
 * LEARNING: Filter annotations by user type
 * WHY: Show only relevant annotations based on selected user type
 * PATTERN: Filter array by userTypeBlock property
 * 
 * LEARNING: Function not exported - unused in codebase
 * WHY: This function is not currently used, kept for potential future use
 * NOTE: If needed in future, uncomment export
 * 
 * @param annotations - Annotations to filter
 * @param userTypeBlock - User type to filter by (null for generic)
 * @returns Filtered annotations
 */
function getAnnotationsForUserTypeBlock(
  annotations: AnnotationWithMetadata[],
  userTypeBlock: UserTypeBlock | null
): AnnotationWithMetadata[] {
  if (userTypeBlock === null) {
    return annotations.filter(a => a.userTypeBlock === null)
  }
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
 * LEARNING: Function not exported - deprecated and unused
 * WHY: Deprecated in favor of getStateControlBlockInstanceOptions
 * NOTE: If needed in future, use getStateControlBlockInstanceOptions instead
 * 
 * @deprecated Use getStateControlBlockInstanceOptions from @/utils/blockInstanceUtils instead
 */
function getUserTypeBlockOptionsFromGlobalData(globalData: GlobalData): Array<{ title: string; value: UserTypeBlock }> {
  return getStateControlBlockInstanceOptions(globalData) as Array<{ title: string; value: UserTypeBlock }>
}

