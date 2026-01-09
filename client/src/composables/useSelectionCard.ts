/**
 * useSelectionCard (facade)
 *
 * WHY: Keep existing import path stable while placing booking-specific composable under `src/composables/booking/`.
 */

export type {
  UseSelectionCardOptions,
  UseSelectionCardReturn,
  UseSelectionCardGroupOptions,
  UseSelectionCardGroupReturn,
} from '@/composables/booking/useSelectionCard'

export { useSelectionCard, useSelectionCardGroup } from '@/composables/booking/useSelectionCard'

