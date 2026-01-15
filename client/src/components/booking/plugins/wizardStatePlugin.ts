/**
 * Wizard State Plugin
 * 
 * LEARNING: State plugin for wizard composable state management
 * WHY: Allows SelectionCard to work with wizard state (useBookingWizard)
 * PATTERN: Plugin that reads/writes to wizard composable
 */

import { inject } from 'vue'
import type { StatePlugin, SelectionCardItem } from '../types/selectionCardTypes'
import type { BookingBlockInstance } from '@/utils/transformers/globalToBookingTransformer'
import { WIZARD_FIELD_CONFIGS, type WizardInstance, type WizardStateField } from '@/utils/wizardStateFieldConfig'

// Re-export WizardStateField for external use
export type { WizardStateField }

/**
 * Create a wizard state plugin
 * LEARNING: Factory function that creates a state plugin for wizard state
 * WHY: Allows SelectionCard to work with wizard composable state
 * PATTERN: Returns StatePlugin interface implementation
 * 
 * @param field - Which wizard field to use (userTypeBlock, baseService, propertyTypeBlock)
 * @returns StatePlugin instance or null if wizard not available
 */
export function createWizardStatePlugin(field: WizardStateField): StatePlugin | null {
  // Inject wizard instance
  const wizard = inject<WizardInstance | undefined>('wizard')
  
  if (!wizard) {
    return null
  }
  
  // FIX: Use config-driven field configuration instead of switch statements
  const fieldConfig = WIZARD_FIELD_CONFIGS[field]
  
  const getSelectedArray = (): BookingBlockInstance[] => {
    return fieldConfig.getSelectedArray(wizard)
  }
  
  const getSelectedValue = (): BookingBlockInstance | null => {
    return fieldConfig.getSelectedValue(wizard)
  }
  
  const toggleInArray = (block: BookingBlockInstance): void => {
    fieldConfig.toggleInArray(wizard, block)
  }
  
  const setSelectedValue = (block: BookingBlockInstance | null): void => {
    fieldConfig.setSelectedValue(wizard, block)
  }
  
  const watchSource = () => {
    return fieldConfig.watchSource(wizard)
  }
  
  return {
    name: `wizardState-${field}`,
    
    /**
     * Get current value for an item
     * LEARNING: Returns true if item.id is in selected array (or matches single value for userTypeBlock)
     * WHY: Determines if item is selected in wizard
     * Session 1.3.9.3: Updated to handle arrays for multi-select fields
     */
    getValue: (item: SelectionCardItem): boolean => {
      if (fieldConfig.isArray) {
        // Array fields: check if item.id is in the array
        const selectedArray = getSelectedArray()
        return selectedArray.some(b => b.id === item.id)
      } else {
        // Single-select field: check if item.id matches selected value
        const selected = getSelectedValue()
        return selected?.id === item.id
      }
    },
    
    /**
     * Set value for an item
     * LEARNING: Toggles item in array (for multi-select) or sets single value (for userTypeBlock)
     * WHY: Updates wizard selection state
     * Session 1.3.9.3: Updated to handle arrays for multi-select fields
     */
    setValue: (item: SelectionCardItem, value: boolean | string | null): void => {
      const blockInstance = item as unknown as BookingBlockInstance
      
      if (!fieldConfig.isArray) {
        // Single-select: set or clear
        if (value === true || value === item.id) {
          setSelectedValue(blockInstance)
        } else {
          setSelectedValue(null)
        }
      } else if (fieldConfig.singleSelectUI) {
        // FIX: Use config-driven single-select UI behavior instead of hardcoded field checks
        // Services: single-select UI (replace array, not toggle)
        // PropertyTypeBlocks: single-select UI (radio behavior)
        // If selecting the same service, deselect it (empty array)
        // Otherwise, replace array with new selection
        if (value === true || value === item.id) {
          const selectedArray = getSelectedArray()
          const isCurrentlySelected = selectedArray.length === 1 && selectedArray[0]?.id === item.id
          if (isCurrentlySelected) {
            // Deselect if already selected (empty array)
            toggleInArray(blockInstance)
          } else {
            // Replace with new selection
            toggleInArray(blockInstance)
          }
        } else {
          // Deselect (empty array)
          toggleInArray(blockInstance)
        }
      } else {
        // Other multi-select fields: toggle based on value
        const selectedArray = getSelectedArray()
        const isCurrentlySelected = selectedArray.some(b => b.id === item.id)
        if ((value === true || value === item.id) && !isCurrentlySelected) {
          // Add if not selected
          toggleInArray(blockInstance)
        } else if ((value === false || value === null) && isCurrentlySelected) {
          // Remove if selected
          toggleInArray(blockInstance)
        }
      }
    },
    
    /**
     * Watch source for reactivity
     * LEARNING: Returns computed that tracks wizard field changes
     * WHY: Enables SelectionCard to react to wizard state changes
     */
    watchSource: () => {
      return watchSource()
    }
  }
}

