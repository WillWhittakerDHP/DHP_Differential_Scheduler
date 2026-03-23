/**
 * WHY: Pure selection read/write for wizard selection cards — keeps plugin inject-only.
 */

import type { BookingBlockInstance } from '@/utils/transformers/globalToBookingTransformer'
import type { WizardFieldConfig, WizardInstance } from '@/types/wizardStateFieldConfig'
import { shouldToggleWizardMultiSelectArray } from '@/utils/booking/wizardStateSetValue'

interface WizardPluginSelectionContext {
  fieldConfig: WizardFieldConfig
  wizard: WizardInstance
}

export function wizardPluginGetItemSelected(ctx: WizardPluginSelectionContext, itemId: string): boolean {
  if (ctx.fieldConfig.isArray) {
    const selectedArray = ctx.fieldConfig.getSelectedArray(ctx.wizard)
    return selectedArray.some((b) => b.id === itemId)
  }
  const selected = ctx.fieldConfig.getSelectedValue(ctx.wizard)
  return selected?.id === itemId
}

export function wizardPluginApplySetValue(
  ctx: WizardPluginSelectionContext,
  block: BookingBlockInstance,
  itemId: string,
  value: boolean | string | null
): void {
  const { fieldConfig, wizard } = ctx
  if (!fieldConfig.isArray) {
    if (value === true || value === itemId) {
      fieldConfig.setSelectedValue(wizard, block)
    } else {
      fieldConfig.setSelectedValue(wizard, null)
    }
    return
  }
  if (fieldConfig.singleSelectUI) {
    fieldConfig.toggleInArray(wizard, block)
    return
  }
  const selectedArray = fieldConfig.getSelectedArray(wizard)
  if (shouldToggleWizardMultiSelectArray(selectedArray, itemId, value)) {
    fieldConfig.toggleInArray(wizard, block)
  }
}
