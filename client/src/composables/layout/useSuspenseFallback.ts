import type { LoadingIndicatorInstance } from '@/types/loadingIndicator'
/**
 */
import { ref, watch } from 'vue'
import type { Ref } from 'vue'

export function useSuspenseFallback(): {
  isFallbackStateActive: Ref<boolean>
  refLoadingIndicator: Ref<LoadingIndicatorInstance | null>
} {
  const isFallbackStateActive = ref(false)
  const refLoadingIndicator = ref<LoadingIndicatorInstance | null>(null)

  watch(
    [isFallbackStateActive, refLoadingIndicator],
    () => {
      if (isFallbackStateActive.value && refLoadingIndicator.value) {
        refLoadingIndicator.value.fallbackHandle()
      }
      if (!isFallbackStateActive.value && refLoadingIndicator.value) {
        refLoadingIndicator.value.resolveHandle()
      }
    },
    { immediate: true }
  )

  return { isFallbackStateActive, refLoadingIndicator }
}
