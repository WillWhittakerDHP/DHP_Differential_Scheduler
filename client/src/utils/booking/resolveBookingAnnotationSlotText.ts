import type { AnnotationUiSlot } from '@shared/constants/annotationSlots'
import type { BookingBlockAnnotationUi } from '@/types/transformers/bookingData'
import { resolveAnnotationTextForAssignment } from '@/utils/booking/resolveAnnotationTextForAssignment'

/**
 * Resolve wizard copy for a UI slot from precomputed `annotationUi` candidates.
 */
export function resolveBookingAnnotationSlotText(
  annotationUi: BookingBlockAnnotationUi | undefined,
  slot: AnnotationUiSlot,
  selectedUserTypeBlockInstanceId: string | null | undefined
): string {
  if (!annotationUi?.candidates?.length) {
    return ''
  }
  const selectedUt = selectedUserTypeBlockInstanceId ?? null
  const matching = annotationUi.candidates.filter((c) => {
    if (c.uiSlot !== slot) {
      return false
    }
    if (c.assignmentUserTypeFilter !== null && c.assignmentUserTypeFilter !== selectedUt) {
      return false
    }
    return true
  })
  if (matching.length === 0) {
    return ''
  }
  const best = matching.reduce((a, b) => (a.orderIndex >= b.orderIndex ? a : b))
  const text = best.text
  const contentRows = best.contentRows
  return resolveAnnotationTextForAssignment({ text, contentRows }, selectedUt)
}
