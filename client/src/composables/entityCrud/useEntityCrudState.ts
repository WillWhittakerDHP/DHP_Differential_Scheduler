import { computed, type ComputedRef } from 'vue'
import { useQueryClient } from '@tanstack/vue-query'

type UseEntityCrudStateReturn = {
  isLoading: ComputedRef<boolean>
  error: ComputedRef<unknown | undefined>
  refetch: () => Promise<void>
}

/**
 * State module: provides shared loading/error and refetch helpers.
 * WHY: Keeps state concerns separate from mutation orchestration.
 * PATTERN: Thin wrapper around Vue Query client.
 */
export function useEntityCrudState(): UseEntityCrudStateReturn {
  const queryClient = useQueryClient()

  // Keep these stable for now (legacy callers expect these to exist, but they don't drive UI yet).
  const isLoading = computed((): boolean => false)
  const error = computed((): unknown | undefined => undefined)

  const refetch = async (): Promise<void> => {
    await queryClient.refetchQueries({ queryKey: ['globalData'] })
  }

  return {
    isLoading,
    error,
    refetch,
  }
}
