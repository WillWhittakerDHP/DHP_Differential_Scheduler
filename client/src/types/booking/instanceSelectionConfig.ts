import type { ComputedRef } from 'vue'
import type { SelectionCardConfig } from '@/components/booking/types/selectionCardTypes'
import type { WizardStateField } from '@/components/booking/plugins/wizardStatePlugin'
import type { StatePlugin } from '@/components/booking/types/selectionCardTypes'

export interface UseInstanceSelectionConfigOptions {
  selectionType?: 'row' | 'stack'
  stateField?: WizardStateField
  selectedValue?: ComputedRef<unknown>
}

export interface UseInstanceSelectionConfigReturn {
  selectionConfig: ComputedRef<SelectionCardConfig>
  statePlugin: StatePlugin | null
}
