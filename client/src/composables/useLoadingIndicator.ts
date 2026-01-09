/**
 * Loading Indicator Composable
 * 
 * LEARNING: Extracts loading indicator logic from AppLoadingIndicator component
 * WHY: Moves progress animation state and logic out of component into reusable composable
 * PATTERN: Composable that manages progress state, buffer animation, and handlers
 * 
 * Component-Composable Alignment: Extracted from AppLoadingIndicator.vue
 */

import { ref, watch, type Ref } from 'vue'

/**
 * Loading Indicator Composable Return Type
 */
export interface UseLoadingIndicatorReturn {
  // Progress state
  bufferValue: Ref<number>
  progressValue: Ref<number>
  isFallbackState: Ref<boolean>
  showProgress: Ref<boolean>
  
  // Handlers
  fallbackHandle: () => void
  resolveHandle: () => void
}

/**
 * Loading Indicator Composable
 * 
 * LEARNING: Manages loading indicator progress animation state
 * WHY: Extracts progress animation logic from component to composable
 * PATTERN: Composable with refs for progress state and handlers for fallback/resolve
 */
export function useLoadingIndicator(): UseLoadingIndicatorReturn {
  const bufferValue = ref(20)
  const progressValue = ref(10)
  const isFallbackState = ref(false)
  const showProgress = ref(false)
  const interval = ref<ReturnType<typeof setInterval>>()

  /**
   * LEARNING: Start buffer animation
   * WHY: Incrementally increases progress and buffer values to simulate loading
   * PATTERN: Set interval that updates progress and buffer values randomly
   */
  function startBuffer(): void {
    clearInterval(interval.value)
    interval.value = setInterval(() => {
      progressValue.value += Math.random() * (15 - 5) + 5
      bufferValue.value += Math.random() * (15 - 5) + 6
    }, 800)
  }

  /**
   * LEARNING: Watch progress and fallback state
   * WHY: Adjusts progress when fallback state is active and progress is high
   * PATTERN: Watch both progressValue and isFallbackState, start buffer animation
   */
  watch([progressValue, isFallbackState], () => {
    if (progressValue.value > 80 && isFallbackState.value)
      progressValue.value = 82

    startBuffer()
  })

  /**
   * LEARNING: Fallback handler
   * WHY: Shows loading indicator and starts progress animation
   * PATTERN: Set showProgress to true, reset progress, set fallback state, start buffer
   */
  const fallbackHandle = (): void => {
    showProgress.value = true
    progressValue.value = 10
    isFallbackState.value = true
    startBuffer()
  }

  /**
   * LEARNING: Resolve handler
   * WHY: Hides loading indicator and resets progress state
   * PATTERN: Set fallback state to false, complete progress, clear interval, reset values
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

