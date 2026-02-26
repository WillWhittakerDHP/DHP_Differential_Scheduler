/**
 * WHY: Business Data Collection CRUD Composable

LEARNING: Facade composable fo...
 */
import type { BusinessData } from '@/utils/transformers/fetchToBusinessTransformer'
import type { BusinessDataCollectionCrudComposableReturn, BusinessDataCollectionCrudConfig } from '@/types/dataCollections/businessDataCollectionTypes'
import { BUSINESS_DATA_QUERY_KEY } from '@/composables/useBusiness'
import { useDataCollectionActions } from '@/composables/dataCollections/useDataCollectionActions'
import { useBusinessDataCollectionQuery } from './useBusinessDataCollectionQuery'

/**
 * PATTERN: Facade composable for BusinessData-backed collections
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

  const { create, update, patch, remove } = useDataCollectionActions<
    CollectionItem,
    CreatePayload,
    UpdatePayload,
    BusinessData
  >(config, BUSINESS_DATA_QUERY_KEY, true)

  return {
    create,
    update,
    patch,
    remove,
    fetchAll,
    fetchById,
  }
}

