/**
 * Business Data Collection Query Composable
 * 
 * LEARNING: Read-only query helpers for BusinessData-backed collections
 * WHY: Separates query concerns from mutation logic
 * PATTERN: Mirrors globalDataCollections/useGlobalDataCollectionQuery.ts
 * 
 * Session 1.4.7: Created as part of data flow consolidation
 */

import { computed, type ComputedRef } from 'vue'
import { useBusiness } from '@/composables/useBusiness'
import { findById } from '@/utils/collections/findById'
import type {
  BusinessDataCollectionByIdQueryResult,
  BusinessDataCollectionQueryResult,
  BusinessDataCollectionSelector,
} from './types'

type BusinessDataCollectionQueryOptions<CollectionItem extends { id: string }> = {
  selectCollection: BusinessDataCollectionSelector<CollectionItem>
} & { readonly __brand?: 'BusinessDataCollectionQueryOptions' }

/**
 * Read-only query helpers for BusinessData-backed collections (appointments/users/properties).
 *
 * LEARNING: These collections are stored on `businessData` (Vue Query cache) and are not fetched per-collection.
 * WHY: Keeping "query" concerns separate makes CRUD composables smaller and easier to reuse.
 */
export function useBusinessDataCollectionQuery<CollectionItem extends { id: string }>(
  options: BusinessDataCollectionQueryOptions<CollectionItem>
): {
  list: ComputedRef<CollectionItem[]>
  fetchAll: BusinessDataCollectionQueryResult<CollectionItem>
  fetchById: (id: string) => BusinessDataCollectionByIdQueryResult<CollectionItem>
} {
  const { businessData, isLoading: businessIsLoading, error: businessError } = useBusiness()

  const list = computed((): CollectionItem[] => {
    const data = businessData.value
    if (!data) return []
    const selected = options.selectCollection(data)
    return selected ? [...selected] : []
  })

  const isLoading = computed((): boolean => businessIsLoading.value)
  const error = computed((): unknown | undefined => businessError.value ?? undefined)

  const fetchAll: BusinessDataCollectionQueryResult<CollectionItem> = {
    data: list,
    isLoading,
    error,
  }

  function fetchById(id: string): BusinessDataCollectionByIdQueryResult<CollectionItem> {
    const item = computed((): CollectionItem | undefined => {
      const data = businessData.value
      if (!data) return undefined
      const selected = options.selectCollection(data)
      return selected ? findById(selected, id) : undefined
    })

    return {
      data: item,
      isLoading,
      error,
    }
  }

  return {
    list,
    fetchAll,
    fetchById,
  }
}

