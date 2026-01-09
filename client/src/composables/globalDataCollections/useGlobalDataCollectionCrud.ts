import type { GlobalDataCollectionCrudComposableReturn, GlobalDataCollectionCrudConfig } from './types'
import { useGlobalDataCollectionQuery } from './useGlobalDataCollectionQuery'
import { useGlobalDataCollectionActions } from './useGlobalDataCollectionActions'

/**
 * Facade composable for GlobalData-backed collections.
 *
 * PATTERN: query/state/actions separation
 * - query: `useGlobalDataCollectionQuery` (read from globalData cache)
 * - actions: `useGlobalDataCollectionActions` (mutations that refetch ['globalData'])
 */
export function useGlobalDataCollectionCrud<
  CollectionItem extends { id: string },
  CreatePayload,
  UpdatePayload
>(
  config: GlobalDataCollectionCrudConfig<CollectionItem>
): Omit<GlobalDataCollectionCrudComposableReturn<CollectionItem, CreatePayload, UpdatePayload>, 'extras'> {
  const { fetchAll, fetchById } = useGlobalDataCollectionQuery<CollectionItem>({
    selectCollection: config.selectCollection,
  })

  const { create, update, patch, remove } = useGlobalDataCollectionActions<
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


