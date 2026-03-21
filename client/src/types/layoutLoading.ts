import type { Ref } from 'vue'
import type { LoadingIndicatorInstance } from '@/types/loadingIndicator'

export interface UseLayoutLoadingOptions {
  refLoadingIndicator: Ref<LoadingIndicatorInstance | null>
}

export interface UseLayoutLoadingReturn {
  isFallbackStateActive: Ref<boolean>
}
