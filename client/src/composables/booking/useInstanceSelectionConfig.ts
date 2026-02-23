/**
 * PATTERN: useInstanceSelectionConfig Composable

PATTERN: Composable that provides...
 */
import { computed, type ComputedRef } from 'vue'
import { createWizardStatePlugin, type WizardStateField } from '@/components/booking/plugins/wizardStatePlugin'
import type { SelectionCardConfig } from '@/components/booking/types/selectionCardTypes'
import { buildServicesStackSelectionConfig, buildUserTypeBlockRowSelectionConfig } from '@/utils/booking/serviceSelectionConfigBuilders'

export interface UseInstanceSelectionConfigOptions {
  selectionType?: 'row' | 'stack'
  
  /**
   * Wizard state field for state plugin
   */
  stateField?: WizardStateField
  
  /**
   * Selected value (for reactivity tracking)
   */
  selectedValue?: ComputedRef<unknown>
}

export interface UseInstanceSelectionConfigReturn {
  selectionConfig: ComputedRef<SelectionCardConfig>
  
  statePlugin: ReturnType<typeof createWizardStatePlugin>
}

/**
 * PATTERN: useInstanceSelectionConfig composable

PATTERN: Composable that returns ...
 */
export function useInstanceSelectionConfig(
  options: UseInstanceSelectionConfigOptions = {}
): UseInstanceSelectionConfigReturn {
  const { 
    selectionType = 'stack', 
    stateField = 'services',
    selectedValue 
  } = options

  /**
Create wizard state plugin for the selection
LEARNING: Plugin enable...
   */
  const statePlugin = createWizardStatePlugin(stateField)

  const selectionConfig = computed<SelectionCardConfig>(() => {
    if (selectedValue) {
      void selectedValue.value
    }

    if (selectionType === 'row') {
      return buildUserTypeBlockRowSelectionConfig({ statePlugin })
    } else {
      return buildServicesStackSelectionConfig({ statePlugin })
    }
  })

  return {
    selectionConfig,
    statePlugin,
  }
}

