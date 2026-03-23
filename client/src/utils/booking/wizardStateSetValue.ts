/**
 * WHY: Pure rules for wizard selection-card array toggling (plugin stays thin).
 */

import type { BookingBlockInstance } from '@/utils/transformers/globalToBookingTransformer'

export function shouldToggleWizardMultiSelectArray(
  selectedArray: BookingBlockInstance[],
  itemId: string,
  value: boolean | string | null
): boolean {
  const isCurrentlySelected = selectedArray.some((b) => b.id === itemId)
  if ((value === true || value === itemId) && !isCurrentlySelected) {
    return true
  }
  if ((value === false || value === null) && isCurrentlySelected) {
    return true
  }
  return false
}
