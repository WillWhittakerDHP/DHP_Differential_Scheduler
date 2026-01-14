/**
 * Business Data Collection CRUD Composable
 * 
 * LEARNING: Facade composable for BusinessData-backed collections
 * WHY: Provides unified CRUD operations for business entities
 * PATTERN: Mirrors globalDataCollections/useGlobalDataCollectionCrud.ts
 * 
 * Session 1.4.7: Created as part of data flow consolidation
 */

import type { BusinessDataCollectionCrudComposableReturn, BusinessDataCollectionCrudConfig } from './types'
import { useBusinessDataCollectionQuery } from './useBusinessDataCollectionQuery'
import { useBusinessDataCollectionActions } from './useBusinessDataCollectionActions'

/**
 * Facade composable for BusinessData-backed collections.
 *
 * PATTERN: query/state/actions separation
 * - query: `useBusinessDataCollectionQuery` (read from businessData cache)
 * - actions: `useBusinessDataCollectionActions` (mutations that refetch ['businessData'])
 */
export function useBusinessDataCollectionCrud<
  CollectionItem extends { id: string },
  CreatePayload,
  UpdatePayload
>(
  config: BusinessDataCollectionCrudConfig<CollectionItem>
): Omit<BusinessDataCollectionCrudComposableReturn<CollectionItem, CreatePayload, UpdatePayload>, 'extras'> {
  const { fetchAll, fetchById } = useBusinessDataCollectionQuery<CollectionItem>({
    selectCollection: config.selectCollection,
  })

  const { create, update, patch, remove } = useBusinessDataCollectionActions<
    CollectionItem,
    CreatePayload,
    UpdatePayload
  >(config)

  return {
    create,
    update,
    patch,
    remove,
    fetchAll,
    fetchById,
  }
}

