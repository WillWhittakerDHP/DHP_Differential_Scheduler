/**
 * WHY: useWizardNumberUpdate Composable

WHY: Wizard state stores arrays of Boo...
 */
import { inject } from 'vue'
import type { BookingBlockInstance } from '@/utils/transformers/globalToBookingTransformer'

/**
 * WHY: Wizard composable return type
WHY: Type-safe access to wizard state
NOTE...
 */
type WizardInstance = {
  selectedServiceTypeBlocks: { value: BookingBlockInstance[] }
  selectedPropertyTypeBlocks: { value: BookingBlockInstance[] }
  selectedOptionTypeBlocks: { value: BookingBlockInstance[] }
}

export interface UseWizardNumberUpdateReturn {
  updateNumber: (blockInstanceId: string, number: number | null) => void
}

/**
 * PATTERN: useWizardNumberUpdate composable
PATTERN: Composable that injects wizard...
 */
export function useWizardNumberUpdate(): UseWizardNumberUpdateReturn {
  const wizard = inject<WizardInstance | undefined>('wizard')
  
  /**
Update number field for a block instance
WHY: Wizard state stores ar...
   */
  const updateNumber = (blockInstanceId: string, number: number | null) => {
    if (!wizard) return
    
    const serviceIndex = wizard.selectedServiceTypeBlocks.value.findIndex(s => s.id === blockInstanceId)
    if (serviceIndex !== -1) {
      wizard.selectedServiceTypeBlocks.value[serviceIndex] = {
        ...wizard.selectedServiceTypeBlocks.value[serviceIndex],
        number
      }
      return
    }
    
    const adjustmentIndex = wizard.selectedPropertyTypeBlocks.value.findIndex(a => a.id === blockInstanceId)
    if (adjustmentIndex !== -1) {
      wizard.selectedPropertyTypeBlocks.value[adjustmentIndex] = {
        ...wizard.selectedPropertyTypeBlocks.value[adjustmentIndex],
        number
      }
      return
    }
    
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

