import type { QueryClient } from '@tanstack/vue-query'
import type { InvalidateEntityQueriesOptions } from '@/types/entityCrud/sharedMutationHandlers'

export type { InvalidateEntityQueriesOptions, MutationContextWithPreviousData } from '@/types/entityCrud/sharedMutationHandlers'

export function createRefetchGlobalDataHandler(queryClient: QueryClient) {
  return async (): Promise<void> => {
    await queryClient.refetchQueries({ queryKey: ['globalData'] })
  }
}

/**
 * Invalidate entity/relationship queries, optionally refetch globalData and invalidate schedulerAdmin for block entities.
 * WHY: Centralizes the pattern used after field/relationship saves so UI reflects latest state.
 */
export async function invalidateEntityQueries(
  queryClient: QueryClient,
  options: InvalidateEntityQueriesOptions
): Promise<void> {
  const { entityKey, relationshipKey, refetchGlobalData = false } = options
  queryClient.invalidateQueries({ queryKey: [entityKey] })
  if (relationshipKey) {
    queryClient.invalidateQueries({ queryKey: [relationshipKey] })
  }
  if (refetchGlobalData) {
    await queryClient.refetchQueries({ queryKey: ['globalData'] })
  }
  if (entityKey === 'blockInstance' || entityKey === 'blockShape') {
    queryClient.invalidateQueries({ queryKey: ['schedulerAdmin'] })
  }
}

export function createRefetchQueriesHandler(
  queryClient: QueryClient,
  queryKeys: readonly (readonly unknown[])[]
) {
  return async (): Promise<void> => {
    await Promise.all(
      queryKeys.map(queryKey => queryClient.refetchQueries({ queryKey: [...queryKey] }))
    )
  }
}

export async function cancelQueriesBeforeMutate(
  queryClient: QueryClient,
  queryKeys: readonly (readonly unknown[])[]
): Promise<void> {
  await Promise.all(
    queryKeys.map(queryKey => queryClient.cancelQueries({ queryKey: [...queryKey] }))
  )
}

/**
 * WHY: Many mutations need to restore previous cache state on error
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
        queryClient.setQueryData([...queryKey], previousData)
      }
    })
  }
}
