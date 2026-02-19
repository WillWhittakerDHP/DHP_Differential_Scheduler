/**
 * Layout Loading Composable
 * 
 * LEARNING: Extracts loading indicator watcher from default layout
 * WHY: Moves loading indicator watcher logic out of layout component into reusable composable
 * PATTERN: Composable that manages loading indicator state and watchers
 * 
 * Component-Composable Alignment: Extracted from layouts/Default.vue
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
 * Layout Loading Composable
 * 
 * LEARNING: Manages loading indicator state and watchers for layout
 * WHY: Extracts loading indicator watcher from layout component to composable
 * PATTERN: Composable with ref for fallback state and watcher for loading indicator
 */
export function useLayoutLoading(
  options: UseLayoutLoadingOptions
): UseLayoutLoadingReturn {
  const { refLoadingIndicator } = options
  
  const isFallbackStateActive = ref(false)

  /**
   * LEARNING: Watch fallback state and loading indicator ref
   * WHY: Calls loading indicator handlers when fallback state changes
   * PATTERN: Watch both isFallbackStateActive and refLoadingIndicator, call appropriate handler
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

