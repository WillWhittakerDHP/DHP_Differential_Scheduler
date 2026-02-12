/**
 * Relationship API Helpers
 * 
 * LEARNING: Shared utilities for relationship API operations
 * WHY: Eliminates duplication of error handling and API call patterns
 * PATTERN: Pure utility functions for relationship operations
 */

import type { AxiosError } from 'axios'
import apiClient from '@/utils/api'
import { createLogger } from '@/utils/logger'
import type { GlobalEntityId } from '@/types/entities'

const logger = createLogger('relationshipApiHelpers')

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
      orderIndex: orderIndex,
    })
  } catch (error: unknown) {
    const axiosError = error as AxiosError<{ error?: string; parent_id?: string; child_id?: string }>
    if (axiosError?.response?.status === 409) {
      return { data: { parent_id: parentId, child_id: childId } }
    }
    logger.error('createRelationshipWithConflictHandling failed', { error, endpoint, parentId, childId })
    throw error
  }
}

export async function createMultipleRelationships(
  endpoint: string,
  parentId: GlobalEntityId,
  componentIds: GlobalEntityId[]
): Promise<void> {
  // WHY: Functional approach avoids mutations, aligns with workspace rules
  // PATTERN: Map componentIds to promises, then await all
  const promises = componentIds.map(async (componentId, index) => {
    return createRelationshipWithConflictHandling(endpoint, parentId, componentId, index)
  })
  await Promise.all(promises)
}
