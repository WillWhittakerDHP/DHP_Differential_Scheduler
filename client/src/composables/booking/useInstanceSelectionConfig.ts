/**
 * PATTERN: useInstanceSelectionConfig Composable

PATTERN: Composable that provides...
 */
import { computed } from 'vue'
import { createWizardStatePlugin } from '@/components/booking/plugins/wizardStatePlugin'
import type { SelectionCardConfig } from '@/components/booking/types/selectionCardTypes'
import { buildServicesStackSelectionConfig, buildUserTypeBlockRowSelectionConfig } from '@/utils/booking/serviceSelectionConfigBuilders'
import type { UseInstanceSelectionConfigOptions, UseInstanceSelectionConfigReturn } from '@/types/booking/instanceSelectionConfig'

export type { UseInstanceSelectionConfigOptions, UseInstanceSelectionConfigReturn } from '@/types/booking/instanceSelectionConfig'

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

