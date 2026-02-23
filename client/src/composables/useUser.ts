/**
 * WHY: useUser Composable

LEARNING: Vue composable for user CRUD operations

S...
 */
import { computed, type ComputedRef } from 'vue'
import { getUserByIdEndpoint, getUserEndpoint } from '@/utils/api'
import type { UserRequest, UserResponse } from '@/types/user'
import type { BusinessData } from '@/utils/transformers/fetchToBusinessTransformer'
import { useBusinessDataCollectionCrud } from '@/composables/businessDataCollections/useBusinessDataCollectionCrud'
import { useBusiness } from './useBusiness'
import type { UseMutationReturnType } from '@tanstack/vue-query'

type UpdateByIdPayload = {
  id: string
  data: Partial<UserRequest>
}

/**
 * WHY: useUser composable

WHY: Centralizes user API logic with reactive state ...
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

