/**
 * Business Data Collection Actions Composable
 * 
 * LEARNING: Mutation factory for BusinessData-backed collections
 * WHY: Uses optimistic updates + refetchQueries for cache consistency
 * PATTERN: Mirrors globalDataCollections/useGlobalDataCollectionActions.ts
 * 
 * Session 1.4.7: Created as part of data flow consolidation
 * ARCHITECTURAL DECISION: Optimistic + refetchQueries pattern
 * - Optimistic: Update cache immediately for instant UI feedback
 * - RefetchQueries: Ensure cache consistency with server
 */

import type { UseMutationReturnType } from '@tanstack/vue-query'
import type { BusinessData } from '@/utils/transformers/fetchToBusinessTransformer'
import { BUSINESS_DATA_QUERY_KEY } from '@/composables/useBusiness'
import { useDataCollectionActions } from '@/composables/dataCollections/useDataCollectionActions'
import type { BusinessDataCollectionCrudConfig, UpdateByIdPayload } from './types'

/**
 * Mutation factory for BusinessData-backed collections.
 *
 * LEARNING: These mutations refresh `['businessData']` because all consumers read from that cache.
 * WHY: Keeps cache invalidation consistent and centralizes optimistic "append-on-create" behavior.
 * PATTERN: Optimistic update followed by refetch for consistency
 * FIX: Use shared generic composable for collection actions
 */
export function useBusinessDataCollectionActions<
  CollectionItem extends { id: string },
  CreatePayload,
  UpdatePayload
>(
  config: BusinessDataCollectionCrudConfig<CollectionItem>
): {
  create: UseMutationReturnType<CollectionItem, unknown, CreatePayload, unknown>
  update: UseMutationReturnType<CollectionItem, unknown, UpdateByIdPayload<UpdatePayload>, unknown>
  patch: UseMutationReturnType<CollectionItem, unknown, UpdateByIdPayload<UpdatePayload>, unknown>
  remove: UseMutationReturnType<void, unknown, string, unknown>
} {
  return useDataCollectionActions<CollectionItem, CreatePayload, UpdatePayload, BusinessData>(
    config,
    BUSINESS_DATA_QUERY_KEY,
    true // Enable optimistic updates
  )
}

