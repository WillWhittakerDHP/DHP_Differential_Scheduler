/**
 * WHY: Wizard state field configuration
WHY: Wizard state plugin has repeated s...
 */
import type { WizardStateField, WizardFieldConfig } from '@/types/wizardStateFieldConfig'

export type { WizardInstance, WizardStateField, WizardFieldConfig } from '@/types/wizardStateFieldConfig'

/**
 * WHY: Eliminates switch statements, makes field logic extensible
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
    getSelectedArray: (wizard) => wizard.selectedServiceTypeBlocks.value,
    getSelectedValue: () => null,
    toggleInArray: (wizard, block) => wizard.toggleServiceTypeBlock(block),
    setSelectedValue: () => {},
    watchSource: (wizard) => wizard.selectedServiceTypeBlocks,
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
