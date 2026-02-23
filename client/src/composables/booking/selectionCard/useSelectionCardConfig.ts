/**
 * WHY: useSelectionCardConfig Composable

WHY: Moves config default merging log...
 */
import { computed, unref, type ComputedRef } from 'vue'
import type { SelectionCardConfig } from '@/components/booking/types/selectionCardTypes'
import { mergeSelectionCardConfigWithDefaults } from '@/utils/booking/selectionCardConfig'
import type { ReadonlyVueRef } from '@/types/vueRefTypes'

export interface UseSelectionCardConfigParams {
  config: ReadonlyVueRef<SelectionCardConfig | undefined>
}

export interface UseSelectionCardConfigReturn {
  configWithDefaults: ComputedRef<SelectionCardConfig>
}

/**
 * WHY: useSelectionCardConfig composable

WHY: Extracts config merging logic fr...
 */
export function useSelectionCardConfig(params: UseSelectionCardConfigParams): UseSelectionCardConfigReturn {
  const { config } = params

  const configWithDefaults = computed<SelectionCardConfig>(() => {
    return mergeSelectionCardConfigWithDefaults(unref(config))
  })

  return {
    configWithDefaults
  }
}


