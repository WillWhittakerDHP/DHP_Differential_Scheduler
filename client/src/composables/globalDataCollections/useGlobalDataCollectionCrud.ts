import type { GlobalData } from '@/utils/transformers/fetchToGlobalTransformer'
import type { GlobalDataCollectionCrudComposableReturn, GlobalDataCollectionCrudConfig } from '@/types/dataCollections/globalDataCollectionTypes'
import { useDataCollectionActions } from '@/composables/dataCollections/useDataCollectionActions'
import { useGlobalDataCollectionQuery } from './useGlobalDataCollectionQuery'

/**
 * PATTERN: Facade composable for GlobalData-backed collections
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

  const { create, update, patch, remove } = useDataCollectionActions<
    CollectionItem,
    CreatePayload,
    UpdatePayload,
    GlobalData
  >(config, ['globalData'] as const, true)

  return {
    create,
    update,
    patch,
    remove,
    fetchAll,
    fetchById,
  }
}


