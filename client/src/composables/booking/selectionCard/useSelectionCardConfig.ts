/**
 * useSelectionCardConfig Composable
 * 
 * LEARNING: Extracts config merging logic from SelectionCard and SelectionCardGroup components
 * WHY: Moves config default merging logic to composable
 * PATTERN: Composable that provides config with defaults
 */

import { computed, unref, type ComputedRef } from 'vue'
import type { SelectionCardConfig } from '@/components/booking/types/selectionCardTypes'
import { mergeSelectionCardConfigWithDefaults } from '@/utils/booking/selectionCardConfig'
import type { ReadonlyVueRef } from '@/types/vueRefTypes'

/**
 * useSelectionCardConfig composable parameters
 */
export interface UseSelectionCardConfigParams {
  config: ReadonlyVueRef<SelectionCardConfig | undefined>
}

/**
 * useSelectionCardConfig composable return type
 */
export interface UseSelectionCardConfigReturn {
  configWithDefaults: ComputedRef<SelectionCardConfig>
}

/**
 * useSelectionCardConfig composable
 * 
 * LEARNING: Provides config with defaults merged
 * WHY: Extracts config merging logic from component to composable
 * PATTERN: Composable that returns reactive computed config
 */
export function useSelectionCardConfig(params: UseSelectionCardConfigParams): UseSelectionCardConfigReturn {
  const { config } = params

  /**
   * LEARNING: Config with defaults for backward compatibility
   * WHY: Ensures existing configs work without modification
   * PATTERN: Merge user config with defaults
   */
  const configWithDefaults = computed<SelectionCardConfig>(() => {
    return mergeSelectionCardConfigWithDefaults(unref(config))
  })

  return {
    configWithDefaults
  }
}


