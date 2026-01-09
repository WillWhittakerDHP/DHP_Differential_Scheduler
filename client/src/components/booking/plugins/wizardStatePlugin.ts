/**
 * Wizard State Plugin
 * 
 * LEARNING: State plugin for wizard composable state management
 * WHY: Allows SelectionCard to work with wizard state (useBookingWizard)
 * PATTERN: Plugin that reads/writes to wizard composable
 */

import { inject, type ComputedRef } from 'vue'
import type { StatePlugin, SelectionCardItem } from '../types/selectionCardTypes'
import type { BookingBlockInstance } from '@/utils/transformers/globalToBookingTransformer'

/**
 * Wizard composable return type
 * LEARNING: Type for useBookingWizard return value
 * WHY: Type-safe access to wizard methods and state
 * Session 1.3.9.3: Updated to use arrays for multi-select
 */
type WizardInstance = {
  selectedUserTypeBlock: ComputedRef<BookingBlockInstance | null>
  selectedServices: ComputedRef<BookingBlockInstance[]>
  selectedPropertyTypeBlocks: ComputedRef<BookingBlockInstance[]>
  selectedOptionTypeBlocks: ComputedRef<BookingBlockInstance[]>
  selectUserTypeBlock: (block: BookingBlockInstance | null) => void
  toggleService: (block: BookingBlockInstance) => void
  togglePropertyTypeBlock: (block: BookingBlockInstance) => void
  toggleOptionTypeBlock: (block: BookingBlockInstance) => void
}

/**
 * Wizard state field type
 * LEARNING: Which wizard field to use for state
 * WHY: Allows plugin to work with different wizard fields
 * Session 1.3.9.3: Updated field names for multi-select
 */
export type WizardStateField = 'userTypeBlock' | 'services' | 'propertyTypeBlocks' | 'optionTypeBlocks'

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
  
  // Get the appropriate wizard field based on field parameter
  // Session 1.3.9.3: Updated to handle arrays for multi-select fields
  const getSelectedArray = (): BookingBlockInstance[] => {
    switch (field) {
      case 'services':
        return wizard.selectedServices.value
      case 'propertyTypeBlocks':
        return wizard.selectedPropertyTypeBlocks.value
      case 'optionTypeBlocks':
        return wizard.selectedOptionTypeBlocks.value
      default:
        return []
    }
  }
  
  const getSelectedValue = (): BookingBlockInstance | null => {
    if (field === 'userTypeBlock') {
      return wizard.selectedUserTypeBlock.value
    }
    return null // Array fields handled separately
  }
  
  const toggleInArray = (block: BookingBlockInstance): void => {
    switch (field) {
      case 'services':
        wizard.toggleService(block)
        break
      case 'propertyTypeBlocks':
        wizard.togglePropertyTypeBlock(block)
        break
      case 'optionTypeBlocks':
        wizard.toggleOptionTypeBlock(block)
        break
    }
  }
  
  const setSelectedValue = (block: BookingBlockInstance | null): void => {
    if (field === 'userTypeBlock') {
      wizard.selectUserTypeBlock(block)
    }
    // Array fields use toggle methods, not set methods
  }
  
  const watchSource = (): ComputedRef<BookingBlockInstance[] | BookingBlockInstance | null> => {
    switch (field) {
      case 'userTypeBlock':
        return wizard.selectedUserTypeBlock
      case 'services':
        return wizard.selectedServices
      case 'propertyTypeBlocks':
        return wizard.selectedPropertyTypeBlocks
      case 'optionTypeBlocks':
        return wizard.selectedOptionTypeBlocks
    }
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
      if (field === 'userTypeBlock') {
        const selected = getSelectedValue()
        return selected?.id === item.id
      } else {
        // Array fields: check if item.id is in the array
        const selectedArray = getSelectedArray()
        return selectedArray.some(b => b.id === item.id)
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
      
      if (field === 'userTypeBlock') {
        // Single-select: set or clear
        if (value === true || value === item.id) {
          setSelectedValue(blockInstance)
        } else {
          setSelectedValue(null)
        }
      } else if (field === 'services' || field === 'propertyTypeBlocks') {
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

