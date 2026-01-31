/**
 * useSharedMutationHandlers Utility
 * 
 * LEARNING: Shared mutation handlers for common Vue Query patterns
 * WHY: Eliminates duplication of common mutation handler patterns across composables
 * PATTERN: Utility functions that return handlers for common mutation operations
 */

import type { QueryClient } from '@tanstack/vue-query'
import type { GlobalData } from '@/utils/transformers/fetchToGlobalTransformer'

/**
 * LEARNING: Shared onSuccess handler for refetching globalData
 * WHY: Many mutations need to refetch globalData after success
 * PATTERN: Reusable handler function
 */
export function createRefetchGlobalDataHandler(queryClient: QueryClient) {
  return async (): Promise<void> => {
    await queryClient.refetchQueries({ queryKey: ['globalData'] })
  }
}

/**
 * LEARNING: Shared onSuccess handler for refetching multiple queries
 * WHY: Some mutations need to refetch multiple queries after success
 * PATTERN: Reusable handler function that accepts query keys
 */
export function createRefetchQueriesHandler(
  queryClient: QueryClient,
  queryKeys: readonly (readonly unknown[])[]
) {
  return async (): Promise<void> => {
    await Promise.all(
      queryKeys.map(queryKey => queryClient.refetchQueries({ queryKey: queryKey as unknown[] }))
    )
  }
}

/**
 * LEARNING: Shared onMutate handler for canceling queries
 * WHY: Many mutations need to cancel queries before optimistic updates
 * PATTERN: Reusable handler function that accepts query keys
 */
export async function cancelQueriesBeforeMutate(
  queryClient: QueryClient,
  queryKeys: readonly (readonly unknown[])[]
): Promise<void> {
  await Promise.all(
    queryKeys.map(queryKey => queryClient.cancelQueries({ queryKey: queryKey as unknown[] }))
  )
}

/**
 * LEARNING: Shared onError handler for restoring previous data
 * WHY: Many mutations need to restore previous cache state on error
 * PATTERN: Reusable handler function
 */
export function createRestorePreviousDataHandler(
  queryClient: QueryClient,
  queryKeys: readonly (readonly unknown[])[]
) {
  return (
    context: { [key: string]: unknown } | undefined,
    previousDataKeys: string[]
  ): void => {
    if (!context) return
    
    queryKeys.forEach((queryKey, index) => {
      const previousDataKey = previousDataKeys[index]
      const previousData = context[previousDataKey]
      if (previousData !== undefined) {
        queryClient.setQueryData(queryKey as unknown[], previousData)
      }
    })
  }
}

/**
 * LEARNING: Context type for mutations that restore previous data
 * WHY: Standardizes context structure for error handlers
 * PATTERN: Generic context type with previous data properties
 */
export interface MutationContextWithPreviousData {
  previousGlobalData?: GlobalData
  [key: string]: unknown
}
