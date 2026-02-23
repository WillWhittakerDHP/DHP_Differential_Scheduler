
import { ref, watch, type Ref } from 'vue'

export interface UseLoadingIndicatorReturn {
  bufferValue: Ref<number>
  progressValue: Ref<number>
  isFallbackState: Ref<boolean>
  showProgress: Ref<boolean>
  fallbackHandle: () => void
  resolveHandle: () => void
}

/** Subset of return type used by layout/blank for ref template; single source of truth. */
export type LoadingIndicatorInstance = Pick<UseLoadingIndicatorReturn, 'fallbackHandle' | 'resolveHandle'>

export function useLoadingIndicator(): UseLoadingIndicatorReturn {
  const bufferValue = ref(20)
  const progressValue = ref(10)
  const isFallbackState = ref(false)
  const showProgress = ref(false)
  const interval = ref<ReturnType<typeof setInterval>>()

  /**
   */
  function startBuffer(): void {
    clearInterval(interval.value)
    interval.value = setInterval(() => {
      progressValue.value += Math.random() * (15 - 5) + 5
      bufferValue.value += Math.random() * (15 - 5) + 6
    }, 800)
  }

  /**
   * WHY: /**
LEARNING: Watch progress and fallback state
WHY: Adjusts progress wh...
   */
  watch([progressValue, isFallbackState], () => {
    if (progressValue.value > 80 && isFallbackState.value)
      progressValue.value = 82

    startBuffer()
  })

  /**
   * PATTERN: Set showProgress to true, reset progress, set fallback state, start buffer
   */
  const fallbackHandle = (): void => {
    showProgress.value = true
    progressValue.value = 10
    isFallbackState.value = true
    startBuffer()
  }

  /**
   * WHY: /**
WHY: Hides loading indicator and resets progress state
PATTERN: Set ...
   */
  const resolveHandle = (): void => {
    isFallbackState.value = false
    progressValue.value = 100

    setTimeout(() => {
      clearInterval(interval.value)
      progressValue.value = 0
      bufferValue.value = 20
      showProgress.value = false
    }, 300)
  }

  return {
    bufferValue,
    progressValue,
    isFallbackState,
    showProgress,
    fallbackHandle,
    resolveHandle
  }
}

