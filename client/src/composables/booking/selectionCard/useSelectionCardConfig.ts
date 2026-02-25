/**
 * WHY: useSelectionCardConfig Composable

WHY: Moves config default merging log...
 */
import { computed, unref } from 'vue'
import type { SelectionCardConfig } from '@/components/booking/types/selectionCardTypes'
import { mergeSelectionCardConfigWithDefaults } from '@/utils/booking/selectionCardConfig'
import type { UseSelectionCardConfigParams, UseSelectionCardConfigReturn } from '@/types/booking/selectionCard/selectionCardConfig'

export type { UseSelectionCardConfigParams, UseSelectionCardConfigReturn } from '@/types/booking/selectionCard/selectionCardConfig'

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


