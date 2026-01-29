/**
 * LEARNING: Wizard state field configuration
 * WHY: Wizard state plugin has repeated switch statements with field checks
 * PATTERN: Config-driven approach using field configuration maps
 * 
 * Used by:
 * - wizardStatePlugin.ts
 */

import type { ComputedRef } from 'vue'
import type { BookingBlockInstance } from '@/utils/transformers/globalToBookingTransformer'

/**
 * LEARNING: Wizard instance type
 * WHY: Type-safe access to wizard methods and state
 */
export type WizardInstance = {
  selectedUserTypeBlock: ComputedRef<BookingBlockInstance | null>
  selectedServices: ComputedRef<BookingBlockInstance[]>
  selectedPropertyTypeBlocks: ComputedRef<BookingBlockInstance[]>
  selectedOptionTypeBlocks: ComputedRef<BookingBlockInstance[]>
  selectedLineItemBlocks: ComputedRef<BookingBlockInstance[]>
  selectUserTypeBlock: (block: BookingBlockInstance | null) => void
  toggleService: (block: BookingBlockInstance) => void
  togglePropertyTypeBlock: (block: BookingBlockInstance) => void
  toggleOptionTypeBlock: (block: BookingBlockInstance) => void
  toggleLineItemBlock: (block: BookingBlockInstance) => void
}

/**
 * LEARNING: Wizard state field type
 * WHY: Type-safe field names for wizard state
 */
export type WizardStateField = 'userTypeBlock' | 'services' | 'propertyTypeBlocks' | 'optionTypeBlocks' | 'lineItemBlocks'

/**
 * LEARNING: Field configuration for wizard state fields
 * WHY: Encapsulates field-specific logic in a config-driven way
 */
export interface WizardFieldConfig {
  isArray: boolean
  /**
   * LEARNING: Whether this field uses single-select UI behavior
   * WHY: Some array fields (services, propertyTypeBlocks) behave like single-select in UI
   *      even though they're stored as arrays
   */
  singleSelectUI: boolean
  getSelectedArray: (wizard: WizardInstance) => BookingBlockInstance[]
  getSelectedValue: (wizard: WizardInstance) => BookingBlockInstance | null
  toggleInArray: (wizard: WizardInstance, block: BookingBlockInstance) => void
  setSelectedValue: (wizard: WizardInstance, block: BookingBlockInstance | null) => void
  watchSource: (wizard: WizardInstance) => ComputedRef<BookingBlockInstance[] | BookingBlockInstance | null>
}

/**
 * LEARNING: Config-driven field configuration map
 * WHY: Eliminates switch statements, makes field logic extensible
 * PATTERN: Map field names to configuration objects
 */
export const WIZARD_FIELD_CONFIGS: Record<WizardStateField, WizardFieldConfig> = {
  userTypeBlock: {
    isArray: false,
    singleSelectUI: true,
    getSelectedArray: () => [],
    getSelectedValue: (wizard) => wizard.selectedUserTypeBlock.value,
    toggleInArray: () => {},
    setSelectedValue: (wizard, block) => wizard.selectUserTypeBlock(block),
    watchSource: (wizard) => wizard.selectedUserTypeBlock,
  },
  services: {
    isArray: true,
    singleSelectUI: true, // Services use single-select UI behavior
    getSelectedArray: (wizard) => wizard.selectedServices.value,
    getSelectedValue: () => null,
    toggleInArray: (wizard, block) => wizard.toggleService(block),
    setSelectedValue: () => {},
    watchSource: (wizard) => wizard.selectedServices,
  },
  propertyTypeBlocks: {
    isArray: true,
    singleSelectUI: true, // PropertyTypeBlocks use single-select UI behavior (radio)
    getSelectedArray: (wizard) => wizard.selectedPropertyTypeBlocks.value,
    getSelectedValue: () => null,
    toggleInArray: (wizard, block) => wizard.togglePropertyTypeBlock(block),
    setSelectedValue: () => {},
    watchSource: (wizard) => wizard.selectedPropertyTypeBlocks,
  },
  optionTypeBlocks: {
    isArray: true,
    singleSelectUI: false, // OptionTypeBlocks use true multi-select behavior
    getSelectedArray: (wizard) => wizard.selectedOptionTypeBlocks.value,
    getSelectedValue: () => null,
    toggleInArray: (wizard, block) => wizard.toggleOptionTypeBlock(block),
    setSelectedValue: () => {},
    watchSource: (wizard) => wizard.selectedOptionTypeBlocks,
  },
  lineItemBlocks: {
    isArray: true,
    singleSelectUI: false, // LineItemBlocks use true multi-select behavior
    getSelectedArray: (wizard) => wizard.selectedLineItemBlocks.value,
    getSelectedValue: () => null,
    toggleInArray: (wizard, block) => wizard.toggleLineItemBlock(block),
    setSelectedValue: () => {},
    watchSource: (wizard) => wizard.selectedLineItemBlocks,
  },
}
