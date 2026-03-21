import type { ComputedRef } from 'vue'
import type { SelectionCardConfig } from '@/components/booking/types/selectionCardTypes'
import type { ReadonlyVueRef } from '@/types/vueRefTypes'

export interface UseSelectionCardConfigParams {
  config: ReadonlyVueRef<SelectionCardConfig | undefined>
}

export interface UseSelectionCardConfigReturn {
  configWithDefaults: ComputedRef<SelectionCardConfig>
}
