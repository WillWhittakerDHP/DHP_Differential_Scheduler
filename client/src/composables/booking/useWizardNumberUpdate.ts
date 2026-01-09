/**
 * useWizardNumberUpdate Composable
 * 
 * LEARNING: Provides method to update number field for block instances in wizard state
 * WHY: Wizard state stores arrays of BookingBlockInstance, need to find and update specific instance
 * PATTERN: Composable that injects wizard and provides update method
 */

import { inject } from 'vue'
import type { BookingBlockInstance } from '@/utils/transformers/globalToBookingTransformer'

/**
 * Wizard composable return type
 * LEARNING: Type for useBookingWizard return value
 * WHY: Type-safe access to wizard state
 * NOTE: Wizard state uses ref(), so we access .value property
 */
type WizardInstance = {
  selectedServices: { value: BookingBlockInstance[] }
  selectedPropertyTypeBlocks: { value: BookingBlockInstance[] }
  selectedOptionTypeBlocks: { value: BookingBlockInstance[] }
}

/**
 * useWizardNumberUpdate composable
 * LEARNING: Provides method to update number field for a block instance in wizard state
 * WHY: Finds the instance in the appropriate wizard array and updates its number property
 * PATTERN: Composable that injects wizard and provides update method
 */
export function useWizardNumberUpdate() {
  const wizard = inject<WizardInstance | undefined>('wizard')
  
  /**
   * Update number field for a block instance
   * LEARNING: Finds instance in wizard arrays and updates its number property
   * WHY: Wizard state stores arrays, need to find and update specific instance
   * PATTERN: Check each wizard array, find by ID, update with spread operator for reactivity
   */
  const updateNumber = (blockInstanceId: string, number: number | null) => {
    if (!wizard) return
    
    // Update in selectedServices
    const serviceIndex = wizard.selectedServices.value.findIndex(s => s.id === blockInstanceId)
    if (serviceIndex !== -1) {
      wizard.selectedServices.value[serviceIndex] = {
        ...wizard.selectedServices.value[serviceIndex],
        number
      }
      return
    }
    
    // Update in selectedPropertyTypeBlocks
    const adjustmentIndex = wizard.selectedPropertyTypeBlocks.value.findIndex(a => a.id === blockInstanceId)
    if (adjustmentIndex !== -1) {
      wizard.selectedPropertyTypeBlocks.value[adjustmentIndex] = {
        ...wizard.selectedPropertyTypeBlocks.value[adjustmentIndex],
        number
      }
      return
    }
    
    // Update in selectedOptionTypeBlocks
    const optionIndex = wizard.selectedOptionTypeBlocks.value.findIndex(o => o.id === blockInstanceId)
    if (optionIndex !== -1) {
      wizard.selectedOptionTypeBlocks.value[optionIndex] = {
        ...wizard.selectedOptionTypeBlocks.value[optionIndex],
        number
      }
    }
  }
  
  return { updateNumber }
}

