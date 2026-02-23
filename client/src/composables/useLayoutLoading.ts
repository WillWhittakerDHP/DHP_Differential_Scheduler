/**
 * WHY: Layout Loading Composable

WHY: Moves loading indicator watcher logic ou...
 */
import { ref, watch, type Ref } from 'vue'
import type { LoadingIndicatorInstance } from '@/composables/useLoadingIndicator'

export interface UseLayoutLoadingOptions {
  refLoadingIndicator: Ref<LoadingIndicatorInstance | null>
}

export interface UseLayoutLoadingReturn {
  isFallbackStateActive: Ref<boolean>
}

/**
 * WHY: Layout Loading Composable

WHY: Extracts loading indicator watcher from ...
 */
export function useLayoutLoading(
  options: UseLayoutLoadingOptions
): UseLayoutLoadingReturn {
  const { refLoadingIndicator } = options
  
  const isFallbackStateActive = ref(false)

  /**
   * WHY: /**
LEARNING: Watch fallback state and loading indicator ref
WHY: Calls ...
   */
  watch([isFallbackStateActive, refLoadingIndicator], () => {
    if (isFallbackStateActive.value && refLoadingIndicator.value)
      refLoadingIndicator.value.fallbackHandle()

    if (!isFallbackStateActive.value && refLoadingIndicator.value)
      refLoadingIndicator.value.resolveHandle()
  }, { immediate: true })

  return {
    isFallbackStateActive
  }
}

