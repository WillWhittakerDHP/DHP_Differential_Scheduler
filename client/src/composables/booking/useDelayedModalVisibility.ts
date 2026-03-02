/**
 * WHY: Extracts delayed modal visibility (watch + DOM timer) from RequiredConfirmationModal so SFC has no Tier1 hotspots.
 */
import type { Ref, ComputedRef, WritableComputedRef } from 'vue'
import { ref, computed, watch } from 'vue'

const OPEN_DELAY_MS = 400

export interface UseDelayedModalVisibilityParams {
  /** Current open state (v-model source). */
  source: Ref<boolean> | ComputedRef<boolean>
  /** When delayed visibility is set to false, call to sync parent (e.g. emit 'update:modelValue', false). */
  onClose?: () => void
}

export interface UseDelayedModalVisibilityReturn {
  /** Delayed visibility: true only after OPEN_DELAY_MS when source becomes true; writable to close and sync. */
  showModalDelayed: WritableComputedRef<boolean>
}

/**
 * Returns a writable computed that lags the source by OPEN_DELAY_MS on open, and clears immediately on close.
 * Timer logic runs in composable (not in component) for component-logic audit.
 */
export function useDelayedModalVisibility(
  params: UseDelayedModalVisibilityParams
): UseDelayedModalVisibilityReturn {
  const { source, onClose } = params
  const showModalDelayedInner = ref(false)
  let openTimeoutId: ReturnType<typeof setTimeout> | null = null

  watch(
    source,
    (val) => {
      if (openTimeoutId !== null) {
        clearTimeout(openTimeoutId)
        openTimeoutId = null
      }
      if (val) {
        openTimeoutId = setTimeout(() => {
          showModalDelayedInner.value = true
          openTimeoutId = null
        }, OPEN_DELAY_MS)
      } else {
        showModalDelayedInner.value = false
      }
    },
    { immediate: true }
  )

  const showModalDelayed = computed({
    get: () => showModalDelayedInner.value,
    set: (value: boolean) => {
      showModalDelayedInner.value = value
      if (!value && onClose) onClose()
    },
  })

  return { showModalDelayed }
}
