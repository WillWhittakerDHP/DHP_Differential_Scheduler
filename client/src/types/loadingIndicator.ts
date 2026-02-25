import type { Ref } from 'vue'

export interface UseLoadingIndicatorReturn {
  bufferValue: Ref<number>
  progressValue: Ref<number>
  isFallbackState: Ref<boolean>
  showProgress: Ref<boolean>
  fallbackHandle: () => void
  resolveHandle: () => void
}

export type LoadingIndicatorInstance = Pick<UseLoadingIndicatorReturn, 'fallbackHandle' | 'resolveHandle'>
