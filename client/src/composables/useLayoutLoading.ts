/**
 * WHY: Layout Loading Composable

WHY: Moves loading indicator watcher logic ou...
 */
import { ref, watch } from 'vue'
import type { UseLayoutLoadingOptions, UseLayoutLoadingReturn } from '@/types/layoutLoading'

/**
 * WHY: Layout Loading Composable

WHY: Extracts loading indicator watcher from ...
 */
export function useLayoutLoading(
  options: UseLayoutLoadingOptions
): UseLayoutLoadingReturn {
  const { refLoadingIndicator } = options
  
  const isFallbackStateActive = ref(false)

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
