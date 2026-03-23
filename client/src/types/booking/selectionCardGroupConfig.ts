import type { ComputedRef } from 'vue'
import type { SelectionCardConfig } from '@/components/booking/types/selectionCardTypes'
export interface UseSelectionCardGroupConfigReturn {
  configWithDefaults: ComputedRef<SelectionCardConfig>
  useGroupWrapper: ComputedRef<boolean>
  groupComponentName: ComputedRef<string>
  gridColumnProps: ComputedRef<Record<string, string | number>>
}
