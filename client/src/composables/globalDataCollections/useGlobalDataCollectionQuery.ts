import { computed, type ComputedRef } from 'vue'
import { useGlobal } from '@/composables/useGlobal'
import { findById } from '@/utils/collections/findById'
import type {
  GlobalDataCollectionByIdQueryResult,
  GlobalDataCollectionQueryResult,
  GlobalDataCollectionSelector,
} from './types'

type GlobalDataCollectionQueryOptions<CollectionItem extends { id: string }> = {
  selectCollection: GlobalDataCollectionSelector<CollectionItem>
} & { readonly __brand?: 'GlobalDataCollectionQueryOptions' }

/**
 * Read-only query helpers for GlobalData-backed collections (appointments/users/properties/annotations).
 *
 * LEARNING: These collections are stored on `globalData` (Vue Query cache) and are not fetched per-collection.
 * WHY: Keeping "query" concerns separate makes CRUD composables smaller and easier to reuse.
 */
export function useGlobalDataCollectionQuery<CollectionItem extends { id: string }>(
  options: GlobalDataCollectionQueryOptions<CollectionItem>
): {
  list: ComputedRef<CollectionItem[]>
  fetchAll: GlobalDataCollectionQueryResult<CollectionItem>
  fetchById: (id: string) => GlobalDataCollectionByIdQueryResult<CollectionItem>
} {
  const { globalData } = useGlobal()

  const list = computed((): CollectionItem[] => {
    const data = globalData.value
    if (!data) return []
    const selected = options.selectCollection(data)
    return selected ? [...selected] : []
  })

  const isLoading = computed((): boolean => false)
  const error = computed((): unknown | undefined => undefined)

  const fetchAll: GlobalDataCollectionQueryResult<CollectionItem> = {
    data: list,
    isLoading,
    error,
  }

  function fetchById(id: string): GlobalDataCollectionByIdQueryResult<CollectionItem> {
    const item = computed((): CollectionItem | undefined => {
      const data = globalData.value
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


