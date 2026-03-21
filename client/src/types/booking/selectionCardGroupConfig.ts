import type { ComputedRef } from 'vue'
import type { SelectionCardConfig } from '@/components/booking/types/selectionCardTypes'
import type { UseSelectionCardConfigParams } from '@/types/booking/selectionCard/selectionCardConfig'

/** Same shape as UseSelectionCardConfigParams; use for group context. */
export type UseSelectionCardGroupConfigParams = UseSelectionCardConfigParams

export interface UseSelectionCardGroupConfigReturn {
  configWithDefaults: ComputedRef<SelectionCardConfig>
  useGroupWrapper: ComputedRef<boolean>
  groupComponentName: ComputedRef<string>
  gridColumnProps: ComputedRef<Record<string, string | number>>
}
