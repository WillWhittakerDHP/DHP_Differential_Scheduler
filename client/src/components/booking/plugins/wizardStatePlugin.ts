/**

LEARNING: State plugin for wizard composable state ...
 */
import { inject } from 'vue'
import type { StatePlugin, SelectionCardItem } from '../types/selectionCardTypes'
import type { BookingBlockInstance } from '@/utils/transformers/globalToBookingTransformer'
import { FIELD_NAMES } from '@/constants/entityFieldConstants'
import { WIZARD_FIELD_CONFIGS, type WizardStateField } from '@/utils/wizardStateFieldConfig'
import { wizardKey } from '@/composables/booking/injectionKeys'
import { createLogger } from '@/utils/logger'

const logger = createLogger('wizardStatePlugin')

function isBookingBlockInstance(item: SelectionCardItem): item is BookingBlockInstance {
  return FIELD_NAMES.ENTITY_KEY in item && (item as Record<string, unknown>)[FIELD_NAMES.ENTITY_KEY] === 'blockInstance'
}

export type { WizardStateField }

export function createWizardStatePlugin(field: WizardStateField): StatePlugin | null {
  const wizard = inject(wizardKey)
  
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
    
    getValue: (item: SelectionCardItem): boolean => {
      if (fieldConfig.isArray) {
        const selectedArray = getSelectedArray()
        return selectedArray.some(b => b.id === item.id)
      } else {
        const selected = getSelectedValue()
        return selected?.id === item.id
      }
    },
    
    /**
     * Set value for an item
     * Session 1.3.9.3: Updated to handle arrays for multi-select fields
     */
    setValue: (item: SelectionCardItem, value: boolean | string | null): void => {
      if (!isBookingBlockInstance(item)) {
        logger.error('wizardStatePlugin.setValue: item is not a BookingBlockInstance', { item })
        return
      }
      const blockInstance = item

      if (!fieldConfig.isArray) {
        if (value === true || value === item.id) {
          setSelectedValue(blockInstance)
        } else {
          setSelectedValue(null)
        }
      } else if (fieldConfig.singleSelectUI) {
        // FIX: Use config-driven single-select UI behavior instead of hardcoded field checks
        if (value === true || value === item.id) {
          const selectedArray = getSelectedArray()
          const isCurrentlySelected = selectedArray.length === 1 && selectedArray[0]?.id === item.id
          if (isCurrentlySelected) {
            toggleInArray(blockInstance)
          } else {
            toggleInArray(blockInstance)
          }
        } else {
          toggleInArray(blockInstance)
        }
      } else {
        const selectedArray = getSelectedArray()
        const isCurrentlySelected = selectedArray.some(b => b.id === item.id)
        if ((value === true || value === item.id) && !isCurrentlySelected) {
          toggleInArray(blockInstance)
        } else if ((value === false || value === null) && isCurrentlySelected) {
          toggleInArray(blockInstance)
        }
      }
    },
    
    /**
Watch source for reactivity
WHY: Enables SelectionCard to react to w...
     */
    watchSource: () => {
      return watchSource()
    }
  }
}

