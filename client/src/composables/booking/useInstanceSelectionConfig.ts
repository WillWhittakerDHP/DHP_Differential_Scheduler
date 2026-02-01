/**
 * useInstanceSelectionConfig Composable
 * 
 * LEARNING: Generic selection configs for any block instance type
 * WHY: Not service-specific - works with any block shape selection (user type, service, property, option)
 * PATTERN: Composable that provides row and stack selection configs with wizard state plugins
 * 
 * Features:
 * - Build row selection config (horizontal grid layout)
 * - Build stack selection config (vertical stack layout)
 * - Create wizard state plugins for any selection type
 * - Expose configWithDefaults
 * 
 * Session: Generic SelectionCard Refactor (2026-01-09)
 * NOTE: Renamed from useServiceSelectionConfig to useInstanceSelectionConfig for generic usage
 */

import { computed, type ComputedRef } from 'vue'
import { createWizardStatePlugin, type WizardStateField } from '@/components/booking/plugins/wizardStatePlugin'
import type { SelectionCardConfig } from '@/components/booking/types/selectionCardTypes'
import { buildServicesStackSelectionConfig, buildUserTypeBlockRowSelectionConfig } from '@/utils/booking/serviceSelectionConfigBuilders'

export interface UseInstanceSelectionConfigOptions {
  selectionType?: 'row' | 'stack'
  
  /**
   * Wizard state field for state plugin
   * LEARNING: Maps to wizard selection arrays (userTypeBlock, services, propertyTypeBlocks, optionTypeBlocks)
   */
  stateField?: WizardStateField
  
  /**
   * Selected value (for reactivity tracking)
   * LEARNING: Computed value that triggers config recalculation
   */
  selectedValue?: ComputedRef<unknown>
}

export interface UseInstanceSelectionConfigReturn {
  selectionConfig: ComputedRef<SelectionCardConfig>
  
  statePlugin: ReturnType<typeof createWizardStatePlugin>
}

/**
 * useInstanceSelectionConfig composable
 * 
 * LEARNING: Generic selection config for any block instance type
 * WHY: Decoupled from service-specific naming for broader reuse
 * PATTERN: Composable that returns computed configs based on selection type
 * 
 * @example
 * ```ts
 * // Row layout for user types
 * const { selectionConfig, statePlugin } = useInstanceSelectionConfig({
 *   selectionType: 'row',
 *   stateField: 'userTypeBlock',
 *   selectedValue: computed(() => wizard.selectedUserTypeBlock.value)
 * })
 * 
 * // Stack layout for services
 * const { selectionConfig, statePlugin } = useInstanceSelectionConfig({
 *   selectionType: 'stack',
 *   stateField: 'services',
 *   selectedValue: computed(() => wizard.selectedServiceTypeBlocks.value)
 * })
 * ```
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
   * Create wizard state plugin for the selection
   * LEARNING: Plugin enables SelectionCard to use wizard state directly
   * WHY: Decouples SelectionCard from specific wizard implementation
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

