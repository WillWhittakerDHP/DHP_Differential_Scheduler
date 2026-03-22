import { computed, type ComputedRef, type Ref, unref } from 'vue'
import { ANNOTATION_UI_SLOTS, type AnnotationUiSlot } from '@shared/constants/annotationSlots'
import type { BookingBlockAnnotationUi } from '@/types/transformers/bookingData'
import { resolveBookingAnnotationSlotText } from '@/utils/booking/resolveBookingAnnotationSlotText'

export interface UseAnnotationContentReturn {
  cardDescription: ComputedRef<string>
  cardTooltip: ComputedRef<string>
  gridOverlay: ComputedRef<string>
  textForSlot: (slot: AnnotationUiSlot) => string
}

/**
 * Resolve wizard annotation copy for known UI slots using assignment filters + content rows.
 */
export function useAnnotationContent(
  annotationUi: Ref<BookingBlockAnnotationUi | undefined> | ComputedRef<BookingBlockAnnotationUi | undefined>,
  selectedUserTypeBlockInstanceId: Ref<string | null | undefined>
): UseAnnotationContentReturn {
  function textForSlot(slot: AnnotationUiSlot): string {
    return resolveBookingAnnotationSlotText(
      unref(annotationUi),
      slot,
      unref(selectedUserTypeBlockInstanceId) ?? null
    )
  }

  return {
    cardDescription: computed(() => textForSlot(ANNOTATION_UI_SLOTS.CARD_DESCRIPTION)),
    cardTooltip: computed(() => textForSlot(ANNOTATION_UI_SLOTS.CARD_TOOLTIP)),
    gridOverlay: computed(() => textForSlot(ANNOTATION_UI_SLOTS.GRID_OVERLAY)),
    textForSlot,
  }
}
