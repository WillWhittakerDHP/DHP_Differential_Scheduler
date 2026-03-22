import { computed, inject, ref, type ComputedRef, type Ref } from 'vue'
import type { DevPanelButtonsContext } from '@/types/booking/devPanelButtonsContext'
import { devPanelButtonsKey } from '@/composables/booking/injectionKeys'

/**
 * Shared inject + unwrap for dev panel buttons context.
 * WHY: Deduplicates identical inject/computed pattern from DevPanelsContainer.vue and DevPanelButtons.vue.
 */
export function useDevPanelButtonsInject(): {
  devPanelButtons: ComputedRef<DevPanelButtonsContext | null>
} {
  const devPanelButtonsRef = inject<Ref<DevPanelButtonsContext | null>>(devPanelButtonsKey, ref(null))
  const devPanelButtons = computed(() => {
    if (!devPanelButtonsRef || !devPanelButtonsRef.value) {
      return null
    }
    return devPanelButtonsRef.value
  })
  return { devPanelButtons }
}
