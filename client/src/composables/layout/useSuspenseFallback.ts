/**
 * WHY: Component-logic audit - move watch out of blank.vue.
 */
import { ref, watch } from 'vue'
import type { LoadingIndicatorInstance } from '@/composables/useLoadingIndicator'

export function useSuspenseFallback(): {
  isFallbackStateActive: ReturnType<typeof ref<boolean>>
  refLoadingIndicator: ReturnType<typeof ref<LoadingIndicatorInstance | null>>
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
