/**
 * Annotation Utilities
 * 
 * LEARNING: Helper functions for annotation validation, filtering, and formatting
 * WHY: Reusable utilities for annotation operations across components
 * PATTERN: Utility functions that work with Annotation types and USER_TYPES constant
 */

import type { AnnotationWithMetadata, AnnotationMetadata } from '@/types/annotations'
import type { UserTypeBlock } from '@/types/userTypes'


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


