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

/**
 * useInstanceSelectionConfig composable options
 */
export interface UseInstanceSelectionConfigOptions {
  /**
   * Selection type for determining layout and behavior
   * LEARNING: 'row' for horizontal grids (user types), 'stack' for vertical lists (services)
   */
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

/**
 * Return type for useInstanceSelectionConfig
 */
export interface UseInstanceSelectionConfigReturn {
  /**
   * Selection config for the specified type
   */
  selectionConfig: ComputedRef<SelectionCardConfig>
  
  /**
   * Wizard state plugin for the selection
   */
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
 *   selectedValue: computed(() => wizard.selectedServices.value)
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

  /**
   * Selection config based on type
   * LEARNING: Row layout for grid, stack for vertical list
   * WHY: Different block shapes need different visual layouts
   */
  const selectionConfig = computed<SelectionCardConfig>(() => {
    // Access selected value to make computed reactive
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

// Re-export legacy interface names for backward compatibility
export type UseServiceSelectionConfigOptions = {
  selectedUserTypeBlock: ComputedRef<unknown>
  selectedServices: ComputedRef<unknown[]>
}

/**
 * Legacy export for backward compatibility
 * @deprecated Use useInstanceSelectionConfig instead
 */
export function useServiceSelectionConfig(options: UseServiceSelectionConfigOptions) {
  const { selectedUserTypeBlock, selectedServices } = options

  const userTypeBlockStatePlugin = createWizardStatePlugin('userTypeBlock')
  const servicesStatePlugin = createWizardStatePlugin('services')

  const rowSelectionConfig = computed<SelectionCardConfig>(() => {
    void selectedUserTypeBlock.value
    return buildUserTypeBlockRowSelectionConfig({ statePlugin: userTypeBlockStatePlugin })
  })

  const stackSelectionConfig = computed<SelectionCardConfig>(() => {
    void selectedServices.value
    return buildServicesStackSelectionConfig({ statePlugin: servicesStatePlugin })
  })

  return {
    rowSelectionConfig,
    stackSelectionConfig,
    userTypeBlockStatePlugin,
    servicesStatePlugin,
  }
}

