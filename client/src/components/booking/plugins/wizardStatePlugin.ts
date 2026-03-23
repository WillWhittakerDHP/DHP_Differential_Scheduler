/**

 */
import { inject } from 'vue'
import type { StatePlugin, SelectionCardItem } from '../types/selectionCardTypes'
import type { BookingBlockInstance } from '@/utils/transformers/globalToBookingTransformer'
import { FIELD_NAMES } from '@/constants/entityFieldConstants'
import { WIZARD_FIELD_CONFIGS, type WizardStateField } from '@/utils/wizardStateFieldConfig'
import { wizardKey } from '@/keys/bookingInjectionKeys'
import { createLogger } from '@/utils/logger'
import {
  wizardPluginApplySetValue,
  wizardPluginGetItemSelected,
} from '@/utils/booking/wizardStatePluginCore'

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
  const fieldConfig = WIZARD_FIELD_CONFIGS[field]
  const ctx = { fieldConfig, wizard }

  return {
    name: `wizardState-${field}`,
    getValue: (item: SelectionCardItem): boolean => wizardPluginGetItemSelected(ctx, item.id),
    setValue: (item: SelectionCardItem, value: boolean | string | null): void => {
      if (!isBookingBlockInstance(item)) {
        logger.error('wizardStatePlugin.setValue: item is not a BookingBlockInstance', { item })
        return
      }
      wizardPluginApplySetValue(ctx, item, item.id, value)
    },
    watchSource: () => fieldConfig.watchSource(wizard),
  }
}
