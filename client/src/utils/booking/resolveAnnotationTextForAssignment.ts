/**
 * WHY: Mirror server `annotationTextResolution` for booking wizard (per-user-type copy from content rows).
 */
import type { AnnotationContentRow } from '@/types/admin/annotationContentRow'

export interface AnnotationWithContentPlain {
  text: string
  contentRows?: ReadonlyArray<AnnotationContentRow> | AnnotationContentRow[] | null
}

export function resolveAnnotationTextForAssignment(
  annotation: AnnotationWithContentPlain,
  selectedUserTypeBlockInstanceId: string | null | undefined
): string {
  const rows = annotation.contentRows
  const selectedUt = selectedUserTypeBlockInstanceId ?? null
  if (rows && rows.length > 0) {
    if (selectedUt != null) {
      const typed = rows.find((r) => r.userTypeBlockInstanceId === selectedUt)
      if (typed) {
        return typed.text
      }
    }
    const generic = rows.find((r) => r.userTypeBlockInstanceId == null)
    if (generic) {
      return generic.text
    }
  }
  return annotation.text
}
