import type { UseMutationReturnType } from '@tanstack/vue-query'
import type { GlobalData } from '@/utils/transformers/fetchToGlobalTransformer'
import { useDataCollectionActions } from '@/composables/dataCollections/useDataCollectionActions'
import type { GlobalDataCollectionCrudConfig, UpdateByIdPayload } from './types'

/**
 * Mutation factory for GlobalData-backed collections.
 *
 * LEARNING: These mutations refresh `['globalData']` because all consumers read from that cache.
 * FIX: Use shared generic composable for collection actions
 */
export function useGlobalDataCollectionActions<
  CollectionItem extends { id: string },
  CreatePayload,
  UpdatePayload
>(
  config: GlobalDataCollectionCrudConfig<CollectionItem>
): {
  create: UseMutationReturnType<CollectionItem, unknown, CreatePayload, unknown>
  update: UseMutationReturnType<CollectionItem, unknown, UpdateByIdPayload<UpdatePayload>, unknown>
  patch: UseMutationReturnType<CollectionItem, unknown, UpdateByIdPayload<UpdatePayload>, unknown>
  remove: UseMutationReturnType<void, unknown, string, unknown>
} {
  return useDataCollectionActions<CollectionItem, CreatePayload, UpdatePayload, GlobalData>(
    config,
    ['globalData'] as const,
    true // Enable optimistic updates
  )
}


