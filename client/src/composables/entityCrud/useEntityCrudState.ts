import { computed } from 'vue'
import { useQueryClient } from '@tanstack/vue-query'
import type { UseEntityCrudStateReturn } from '@/types/entityCrud/entityCrudState'

export type { UseEntityCrudStateReturn, UseEntityCrudStateReturnBase } from '@/types/entityCrud/entityCrudState'

/**
 * WHY: State module: provides shared loading/error and refetch helpers
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
