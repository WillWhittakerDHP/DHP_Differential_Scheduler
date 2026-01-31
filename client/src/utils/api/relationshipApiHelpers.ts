/**
 * Relationship API Helpers
 * 
 * LEARNING: Shared utilities for relationship API operations
 * WHY: Eliminates duplication of error handling and API call patterns
 * PATTERN: Pure utility functions for relationship operations
 */

import type { AxiosError } from 'axios'
import apiClient from '@/utils/api'
import type { GlobalEntityId } from '@/types/entities'

/**
 * LEARNING: Handle 409 Conflict as success (idempotent operation)
 * WHY: If relationship already exists, desired state is already achieved
 * PATTERN: Treat duplicate creation as success, re-throw other errors
 */
export async function createRelationshipWithConflictHandling(
  endpoint: string,
  parentId: GlobalEntityId,
  childId: GlobalEntityId,
  orderIndex: number
): Promise<{ data: { parent_id: GlobalEntityId; child_id: GlobalEntityId } }> {
  try {
    return await apiClient.post(endpoint, {
      parent_id: parentId,
      child_id: childId,
      order_index: orderIndex,
    })
  } catch (error: unknown) {
    // LEARNING: Handle 409 Conflict as success (idempotent operation)
    // WHY: If relationship already exists, desired state is already achieved
    // PATTERN: Treat duplicate creation as success
    const axiosError = error as AxiosError<{ error?: string; parent_id?: string; child_id?: string }>
    if (axiosError?.response?.status === 409) {
      // Return successfully - relationship already exists, which is the desired state
      return { data: { parent_id: parentId, child_id: childId } }
    }
    // Re-throw other errors
    throw error
  }
}

/**
 * LEARNING: Create multiple relationships with conflict handling
 * WHY: Batch creation of relationships with proper error handling
 * PATTERN: Map componentIds to promises, await all
 */
export async function createMultipleRelationships(
  endpoint: string,
  parentId: GlobalEntityId,
  componentIds: GlobalEntityId[]
): Promise<void> {
  // LEARNING: Use map to create promises immutably instead of forEach with mutations
  // WHY: Functional approach avoids mutations, aligns with workspace rules
  // PATTERN: Map componentIds to promises, then await all
  const promises = componentIds.map(async (componentId, index) => {
    return createRelationshipWithConflictHandling(endpoint, parentId, componentId, index)
  })
  await Promise.all(promises)
}
