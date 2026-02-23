/**
 * WHY: Business Data Collection CRUD Composable

LEARNING: Facade composable fo...
 */
import type { BusinessDataCollectionCrudComposableReturn, BusinessDataCollectionCrudConfig } from './types'
import { useBusinessDataCollectionQuery } from './useBusinessDataCollectionQuery'
import { useBusinessDataCollectionActions } from './useBusinessDataCollectionActions'

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

