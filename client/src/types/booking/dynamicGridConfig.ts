import type { ComputedRef } from 'vue'
import type { SelectionCardConfig } from '@/components/booking/types/selectionCardTypes'

export interface UseDynamicGridConfigOptions {
  baseConfig: ComputedRef<SelectionCardConfig>
  itemCount: ComputedRef<number>
}

export interface UseDynamicGridConfigReturn {
  dynamicConfig: ComputedRef<SelectionCardConfig>
}
