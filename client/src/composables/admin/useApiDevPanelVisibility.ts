/**
 * WHY: Component-logic audit - move watch(visible) out of ApiDevPanel.
 */
import { watch } from 'vue'

export interface UseApiDevPanelVisibilityOptions {
  visible: () => boolean
  isDevMode: boolean
  shouldFetch: () => boolean
  fetch: () => void
}

export function useApiDevPanelVisibility(options: UseApiDevPanelVisibilityOptions): void {
  const { visible, isDevMode, shouldFetch, fetch } = options
  watch(
    visible,
    (isVisible) => {
      if (isVisible && isDevMode && shouldFetch()) {
        fetch()
      }
    },
    { immediate: false }
  )
}
