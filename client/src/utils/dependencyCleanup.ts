/**
 * Dependency Cleanup Utility
 * 
 * LEARNING: Automatically cleans up invalid active relationships when valid relationships change
 * WHY: When validCascades/validParts change on a blockShape, invalid bookingCascades/activeParts
 *      relationships may exist that reference removed valid relationships
 * PATTERN: Check dependencyImpact config and clean up affected relationships
 * 
 * ARCHITECTURE: This runs after relationship saves to maintain data integrity
 */

import type { GlobalEntityId } from '@/types/entities'
import type { GlobalEntityKey } from '@/constants/entities'
import type { GlobalRelationshipKey } from '@/constants/relationships'
import { useAdmin } from '@/composables/useAdmin'
import apiClient, { getRelationshipByParentChildEndpoint } from '@/utils/api'
import type { QueryClient } from '@tanstack/vue-query'
// Note: RelationshipFieldType removed - no longer needed

/**
 * Clean up invalid active relationships based on dependencyImpact config
 * 
 * LEARNING: When validCascades changes, remove invalid bookingCascades
 * WHY: If a blockShape's validCascades changes, blockInstances using that blockShape
 *      may have bookingCascades pointing to blockInstances that are no longer valid
 * PATTERN: Read dependencyImpact config → find affected entities → check relationships → remove invalid ones
 * 
 * @param entityKey - Entity type that was changed (e.g., 'blockShape')
 * @param entityId - ID of entity that was changed
 * @param relationshipKey - Relationship that was changed (e.g., 'validCascades')
 * @param newValidChildIds - New valid child IDs (e.g., new validCascades array)
 */
export async function cleanupInvalidActiveRelationships(
  entityKey: GlobalEntityKey,
  entityId: GlobalEntityId,
  validRelationshipKey: GlobalRelationshipKey,
  newValidChildIds: GlobalEntityId[],
  queryClient: QueryClient
): Promise<void> {
  // LEARNING: This function is deprecated - formFieldConfig no longer exists
  // WHY: formFieldConfig has been removed in favor of metadata-only approach
  // PATTERN: dependencyImpact configuration needs to be added to metadata schema
  // TODO: Add dependencyImpact to metadata schema and reimplement this function
  throw new Error(
    `[cleanupInvalidActiveRelationships] DEPRECATED: This function uses formFieldConfig which has been removed. ` +
    `dependencyImpact configuration needs to be added to metadata schema. ` +
    `Relationship cleanup for ${validRelationshipKey} on ${entityKey} is currently disabled.`
  )
  
  /* eslint-disable @typescript-eslint/no-unused-vars */
  // Dead code below - kept for reference when reimplementing with metadata
  const adminComp = useAdmin()
  const config = null as any
  if (!config || !config.dependencyImpact) {
    return // No dependency impact configured
  }
  
  const { affectedEntityKey, affectedField, linkingField } = config.dependencyImpact
  
  // Find all affected entities (e.g., all blockInstances with this blockShapeRef)
  const affectedEntities = adminComp.getEntitiesByKey(affectedEntityKey).filter(
    (entity) => {
      const entityRecord = entity as unknown as Record<string, unknown>
      const linkingValue = entityRecord[linkingField]
      return linkingValue && String(linkingValue) === String(entityId)
    }
  )
  
  if (affectedEntities.length === 0) {
    return
  }
  
  // LEARNING: Use API client directly instead of composable
  // WHY: Composables can only be called during setup, but this function is called from async save method
  // PATTERN: Use API client directly for relationship deletion, queryClient passed as parameter
  const activeRelationshipKey = affectedField as GlobalRelationshipKey
  
  // Create Set for O(1) lookup of valid child IDs (these are blockShape/partShape IDs from validCascades/validParts)
  const validChildIdsSet = new Set(newValidChildIds.map(id => String(id)))
  
    // For each affected entity, check its active relationships and remove invalid ones
    const cleanupPromises = affectedEntities.map(async (affectedEntity) => {
      const entityRecord = affectedEntity as unknown as Record<string, unknown>
      const activeRelationships = entityRecord[affectedField]
    
    if (!Array.isArray(activeRelationships) || activeRelationships.length === 0) {
      return // No relationships to check
    }
    
    // LEARNING: Determine child entity type and typeRef key based on relationship type
    // WHY: validCascades → blockInstance (check blockShapeRef), validParts → partInstance (check partShapeRef)
    // PATTERN: Map relationship key to child entity type
    const childEntityKey = validRelationshipKey === 'validCascades' ? 'blockInstance' as GlobalEntityKey : 'partInstance' as GlobalEntityKey
    const typeRefKey = childEntityKey === 'blockInstance' ? 'blockShapeRef' : 'partShapeRef'
    
    const invalidRelationships: Array<{ parentId: GlobalEntityId; childId: GlobalEntityId }> = []
    
    for (const childId of activeRelationships) {
      const childEntity = adminComp.getEntity(childEntityKey, String(childId))
      if (!childEntity) {
        // Child entity doesn't exist - mark for removal
        invalidRelationships.push({
          parentId: affectedEntity.id,
          childId: String(childId)
        })
        continue
      }
      
      const childRecord = childEntity as unknown as Record<string, unknown>
      const childTypeRef = childRecord[typeRefKey]
      
      // Check if child's typeRef is in the valid child IDs
      if (!childTypeRef || !validChildIdsSet.has(String(childTypeRef))) {
        // Child's typeRef is not in validCascades - mark for removal
        invalidRelationships.push({
          parentId: affectedEntity.id,
          childId: String(childId)
        })
      }
    }
    
    if (invalidRelationships.length > 0) {
      // Remove invalid relationships using API client directly
      await Promise.all(
        invalidRelationships.map(async ({ parentId, childId }) => {
          try {
            const deleteEndpoint = getRelationshipByParentChildEndpoint(
              activeRelationshipKey,
              String(parentId),
              String(childId)
            )
            await apiClient.delete(deleteEndpoint)
            
            // LEARNING: Invalidate queries after deletion
            // WHY: Ensures UI reflects relationship changes
            // PATTERN: Invalidate relationship queries and related entity queries
            queryClient.invalidateQueries({ queryKey: [activeRelationshipKey] })
            queryClient.invalidateQueries({ queryKey: [affectedEntityKey] })
            queryClient.invalidateQueries({ queryKey: ['globalData'] })
          } catch (error) {
            // LEARNING: Handle errors gracefully - relationship might already be deleted
            // WHY: Multiple cleanup calls or concurrent operations might try to delete same relationship
            // PATTERN: Silently continue - relationship might already be deleted
          }
        })
      )
    }
  })
  
  await Promise.all(cleanupPromises)
}

