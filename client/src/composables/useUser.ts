/**
 * useUser Composable
 * 
 * LEARNING: Vue composable for user CRUD operations
 * WHY: Provides reactive user mutations with error handling
 * PATTERN: Vue Query useMutation for data mutations
 * 
 * Session 1.4.7: Refactored to use BusinessData cache
 * ARCHITECTURAL DECISION: Business entities use ['businessData'] cache key
 * - Keeps business data changes from invalidating static configuration data
 * - Uses optimistic updates + refetchQueries for cache consistency
 * - Mirrors globalData architecture for consistency
 */

import { computed, type ComputedRef } from 'vue'
import { getUserByIdEndpoint, getUserEndpoint } from '@/utils/api'
import type { UserRequest, UserResponse } from '@/types/user'
import type { BusinessData } from '@/utils/transformers/fetchToBusinessTransformer'
import { useBusinessDataCollectionCrud } from '@/composables/businessDataCollections'
import { useBusiness } from './useBusiness'
import type { UseMutationReturnType } from '@tanstack/vue-query'

type UpdateByIdPayload = {
  id: string
  data: Partial<UserRequest>
}

/**
 * useUser composable
 * 
 * LEARNING: Provides user CRUD operations from BusinessData cache
 * WHY: Centralizes user API logic with reactive state management
 * PATTERN: Uses useBusinessDataCollectionCrud for standardized CRUD operations
 * 
 * Session 1.4.7: Refactored to use BusinessData cache with optimistic + refetchQueries pattern
 */
type UseUserReturn = {
  create: UseMutationReturnType<UserResponse, unknown, UserRequest, unknown>
  update: UseMutationReturnType<UserResponse, unknown, UpdateByIdPayload, unknown>
  patch: UseMutationReturnType<UserResponse, unknown, UpdateByIdPayload, unknown>
  remove: UseMutationReturnType<void, unknown, string, unknown>
  fetchAll: {
    data: ComputedRef<UserResponse[]>
    isLoading: ComputedRef<boolean>
    error: ComputedRef<unknown | undefined>
  }
  fetchById: (id: string) => {
    data: ComputedRef<UserResponse | undefined>
    isLoading: ComputedRef<boolean>
    error: ComputedRef<unknown | undefined>
  }
}

export function useUser(): UseUserReturn {
  const { isLoading, error } = useBusiness()
  
  const { create, update, patch, remove, fetchAll: baseFetchAll, fetchById } = useBusinessDataCollectionCrud<
    UserResponse,
    UserRequest,
    Partial<UserRequest>
  >({
    collectionName: 'users',
    selectCollection: (data: BusinessData) => data.users,
    updateCollection: (data: BusinessData, updated: readonly UserResponse[]) => ({
      ...data,
      users: [...updated],
    }),
    endpoints: {
      listEndpoint: getUserEndpoint,
      byIdEndpoint: getUserByIdEndpoint,
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

