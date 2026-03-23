import type { ComputedRef } from 'vue'

export interface UseEntityCrudStateReturnBase {
  isLoading: ComputedRef<boolean>
  error: ComputedRef<unknown | undefined>
  refetch: () => Promise<void>
}
