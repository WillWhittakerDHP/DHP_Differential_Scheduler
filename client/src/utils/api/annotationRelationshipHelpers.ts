/**
 * Annotation Relationship Helpers
 * 
 * LEARNING: Shared utilities for annotation relationship operations
 * WHY: Eliminates duplication of annotation relationship creation/deletion patterns
 * PATTERN: Pure utility functions for annotation operations
 */

import type { UseAnnotationSelectReturn } from '@/composables/admin/useAnnotationSelect'

/**
 * LEARNING: Update annotation relationships based on old and new annotation IDs
 * WHY: Handles creation and deletion of annotation relationships in batch
 * PATTERN: Compare old and new sets, create missing relationships, delete removed ones
 */
export async function updateAnnotationRelationships(
  annotationSelect: UseAnnotationSelectReturn,
  currentAnnotationIds: Set<string>,
  newAnnotationIds: string[]
): Promise<void> {
  const newAnnotationIdsSet = new Set(newAnnotationIds)
  
  // Find annotations to add (in new but not in current)
  const toAdd = newAnnotationIds.filter(id => !currentAnnotationIds.has(id))
  
  // Find annotations to remove (in current but not in new)
  const toRemove = Array.from(currentAnnotationIds).filter(id => !newAnnotationIdsSet.has(id))
  
  // LEARNING: Combine create and delete operations in parallel
  // WHY: Reduces total wait time by running operations concurrently
  // PATTERN: Use Promise.all to run independent operations in parallel
  const promises: Promise<void>[] = [
    // Create relationships for added annotations
    ...toAdd.map(async (annotationId) => {
      try {
        await annotationSelect.createAnnotationRelationship.mutateAsync({
          annotationId,
          orderIndex: 0,
          isDefault: false,
          userTypeBlockBlockInstanceId: null
        })
      } catch (error) {
        // Error creating annotation relationship - log but don't throw
        // Individual failures shouldn't block other operations
      }
    }),
    // Delete relationships for removed annotations
    ...toRemove.map(async (annotationId) => {
      try {
        await annotationSelect.deleteAnnotationRelationship.mutateAsync(annotationId)
      } catch (error) {
        // Error deleting annotation relationship - log but don't throw
        // Individual failures shouldn't block other operations
      }
    })
  ]
  
  await Promise.all(promises)
}
