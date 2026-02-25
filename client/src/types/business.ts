import type { ComputedRef } from 'vue'
import type { BusinessData } from '@/utils/transformers/fetchToBusinessTransformer'

export interface UseBusinessReturn {
  businessData: ComputedRef<BusinessData | undefined>
  isLoading: ComputedRef<boolean>
  error: ComputedRef<Error | null>
  refetch: () => Promise<void>
}
