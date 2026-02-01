/**
 * useProperty Composable
 * 
 * LEARNING: Vue composable for property CRUD operations
 * WHY: Provides reactive property mutations with error handling
 * PATTERN: Vue Query useMutation for data mutations
 * 
 * Session 1.4.7: Refactored to use BusinessData cache
 * ARCHITECTURAL DECISION: Business entities use ['businessData'] cache key
 * - Keeps business data changes from invalidating static configuration data
 * - Uses optimistic updates + refetchQueries for cache consistency
 * - Mirrors globalData architecture for consistency
 */

import { computed, type ComputedRef } from 'vue'
import { getPropertyByIdEndpoint, getPropertyEndpoint } from '@/utils/api'
import type { PropertyRequest, PropertyResponse } from '@/types/property'
import type { BusinessData } from '@/utils/transformers/fetchToBusinessTransformer'
import { useBusinessDataCollectionCrud } from './businessDataCollections/useBusinessDataCollectionCrud'
import { useBusiness } from './useBusiness'
import type { UseMutationReturnType } from '@tanstack/vue-query'

type UpdateByIdPayload = {
  id: string
  data: Partial<PropertyRequest>
}

/**
 * useProperty composable
 * 
 * LEARNING: Provides property CRUD operations from BusinessData cache
 * WHY: Centralizes property API logic with reactive state management
 * PATTERN: Uses useBusinessDataCollectionCrud for standardized CRUD operations
 * 
 * Session 1.4.7: Refactored to use BusinessData cache with optimistic + refetchQueries pattern
 */
type UsePropertyReturn = {
  create: UseMutationReturnType<PropertyResponse, unknown, PropertyRequest, unknown>
  update: UseMutationReturnType<PropertyResponse, unknown, UpdateByIdPayload, unknown>
  patch: UseMutationReturnType<PropertyResponse, unknown, UpdateByIdPayload, unknown>
  remove: UseMutationReturnType<void, unknown, string, unknown>
  fetchAll: {
    data: ComputedRef<PropertyResponse[]>
    isLoading: ComputedRef<boolean>
    error: ComputedRef<unknown | undefined>
  }
  fetchById: (id: string) => {
    data: ComputedRef<PropertyResponse | undefined>
    isLoading: ComputedRef<boolean>
    error: ComputedRef<unknown | undefined>
  }
}

export function useProperty(): UsePropertyReturn {
  const { isLoading, error } = useBusiness()
  
  const { create, update, patch, remove, fetchAll: baseFetchAll, fetchById } = useBusinessDataCollectionCrud<
    PropertyResponse,
    PropertyRequest,
    Partial<PropertyRequest>
  >({
    collectionName: 'properties',
    selectCollection: (data: BusinessData) => data.properties,
    updateCollection: (data: BusinessData, updated: readonly PropertyResponse[]) => ({
      ...data,
      properties: [...updated],
    }),
    endpoints: {
      listEndpoint: getPropertyEndpoint,
      byIdEndpoint: getPropertyByIdEndpoint,
    },
  })

  const fetchAll = {
    data: baseFetchAll.data,
    isLoading: computed(() => isLoading.value),
    error: computed(() => error.value),
  }

  return {
    create,
    update,
    patch,
    remove,
    fetchAll,
    fetchById,
  }
}

